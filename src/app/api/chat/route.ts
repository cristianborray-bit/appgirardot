import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { getSystemPrompt } from "@/lib/prompt";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isRateLimited } from "@/lib/rate-limit";
import { SESSION_KEY_PATTERN, messageText } from "@/lib/chat-content";

export const maxDuration = 60;

const DEFAULT_MODEL = "gpt-5-mini"; // económico; se cambia con OPENAI_MODEL en Vercel

// Topes sobre el historial que envía el cliente. El array de mensajes es
// forjable (no se reconstruye del servidor todavía); estos límites + el rate
// limit por IP acotan el costo. Endurecimiento definitivo: Fase 5.
const MAX_MESSAGES = 40;
const MAX_TEXT_LENGTH = 1_000;
const MAX_TOTAL_TEXT = 12_000;

async function saveConversation(sessionKey: string, messages: UIMessage[]) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase.from("conversations").upsert(
    {
      session_key: sessionKey,
      messages,
      message_count: messages.length,
    },
    { onConflict: "session_key" },
  );
  if (error) console.error("[chat] Error guardando conversación:", error.message);
}

export async function POST(req: Request) {
  let body: { messages?: UIMessage[]; sessionKey?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Solicitud inválida.", { status: 400 });
  }

  const { messages, sessionKey } = body;

  if (!sessionKey || !SESSION_KEY_PATTERN.test(sessionKey)) {
    return new Response("Sesión inválida. Recarga la página, por favor.", {
      status: 400,
    });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Escríbeme algo y con gusto te respondo.", {
      status: 400,
    });
  }
  if (messages.length > MAX_MESSAGES) {
    return new Response(
      "Llevamos una conversación larga 😊. Para seguir, lo mejor es que Cristian te atienda en persona: déjame tu nombre y correo.",
      { status: 400 },
    );
  }

  let totalText = 0;
  for (const message of messages) {
    const length = messageText(message).length;
    totalText += length;
    if (length > MAX_TEXT_LENGTH || totalText > MAX_TOTAL_TEXT) {
      return new Response(
        "Tu mensaje es muy largo. ¿Me lo cuentas en pocas palabras?",
        { status: 400 },
      );
    }
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
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
    onFinish: async ({ messages: finalMessages }) => {
      await saveConversation(sessionKey, finalMessages);
    },
  });
}
