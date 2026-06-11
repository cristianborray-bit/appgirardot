import {
  streamText,
  convertToModelMessages,
  createIdGenerator,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { getSystemPrompt } from "@/lib/prompt";
import { loadConversation, saveConversation } from "@/lib/conversations";
import { isRateLimited } from "@/lib/rate-limit";
import { SESSION_KEY_PATTERN } from "@/lib/chat-content";

export const maxDuration = 60;

const DEFAULT_MODEL = "gpt-5-mini"; // económico; se cambia con OPENAI_MODEL en Vercel

// El navegador solo envía { sessionKey, text }: el historial vive en Supabase
// y lo reconstruye el servidor, así que no se puede forjar ni inflar desde el
// cliente. Topes restantes: longitud del mensaje nuevo (igual al maxLength de
// la cajita del chat) y total de mensajes por conversación.
const MAX_MESSAGES = 40;
const MAX_TEXT_LENGTH = 1_000;

// IDs generados en el servidor (recomendación del AI SDK para persistencia:
// evita choques con los IDs que inventa cada navegador).
const newMessageId = createIdGenerator({ prefix: "msg", size: 16 });

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// Historial de la sesión, para retomar la conversación al recargar la página.
// La clave de sesión actúa como llave: es un UUID aleatorio imposible de
// adivinar que solo existe en el navegador que inició la conversación.
export async function GET(req: Request) {
  const sessionKey = new URL(req.url).searchParams.get("session") ?? "";
  if (!SESSION_KEY_PATTERN.test(sessionKey)) {
    return Response.json({ messages: [] });
  }
  if (isRateLimited(`ip:${clientIp(req)}`)) {
    return Response.json({ messages: [] }, { status: 429 });
  }
  return Response.json({ messages: await loadConversation(sessionKey) });
}

export async function POST(req: Request) {
  let body: { sessionKey?: unknown; text?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Solicitud inválida.", { status: 400 });
  }

  const { sessionKey, text } = body;

  if (typeof sessionKey !== "string" || !SESSION_KEY_PATTERN.test(sessionKey)) {
    return new Response("Sesión inválida. Recarga la página, por favor.", {
      status: 400,
    });
  }
  if (typeof text !== "string" || text.trim().length === 0) {
    return new Response("Escríbeme algo y con gusto te respondo.", {
      status: 400,
    });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return new Response(
      "Tu mensaje es muy largo. ¿Me lo cuentas en pocas palabras?",
      { status: 400 },
    );
  }

  const ip = clientIp(req);
  if (isRateLimited(`ip:${ip}`) || isRateLimited(`session:${sessionKey}`)) {
    return new Response(
      "Vas muy rápido 😅. Espera un momentico y vuelve a intentar.",
      { status: 429 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      "El asistente está en mantenimiento. Vuelve a intentarlo en unos minutos, por favor 🙏",
      { status: 503 },
    );
  }

  let system: string;
  try {
    system = getSystemPrompt();
  } catch (error) {
    console.error("[chat] No se pudo cargar la ficha del apartamento:", error);
    return new Response(
      "El asistente está en mantenimiento. Vuelve a intentarlo en unos minutos, por favor 🙏",
      { status: 503 },
    );
  }

  const history = await loadConversation(sessionKey);
  if (history.length >= MAX_MESSAGES) {
    return new Response(
      "Llevamos una conversación larga 😊. Para seguir, lo mejor es que Cristian te atienda en persona: déjame tu nombre y correo.",
      { status: 400 },
    );
  }

  // El mensaje del usuario se construye aquí: del navegador solo se acepta
  // texto plano, nunca estructuras de mensaje.
  const userMessage: UIMessage = {
    id: newMessageId(),
    role: "user",
    parts: [{ type: "text", text: text.trim() }],
  };
  const messages = [...history, userMessage];

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL ?? DEFAULT_MODEL),
    system,
    messages: await convertToModelMessages(messages),
    // Los gpt-5 son modelos razonadores: el presupuesto de tokens cubre
    // también su razonamiento interno. Con 600 se quedaba mudo (length).
    maxOutputTokens: 2_500,
    providerOptions: {
      openai: {
        reasoningEffort: "minimal",
        textVerbosity: "low",
      },
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: newMessageId,
    // Sin esto, un fallo del modelo a mitad de stream muestra el default del
    // SDK en inglés ("An error occurred.") dentro del chat.
    onError: (error) => {
      console.error("[chat] Error del modelo durante el stream:", error);
      return "No pude responder en este momento 🙏. Espera un momentico y vuelve a intentarlo.";
    },
    onFinish: async ({ messages: finalMessages }) => {
      await saveConversation(sessionKey, finalMessages);
    },
  });
}
