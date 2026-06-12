import { after } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isRateLimited } from "@/lib/rate-limit";
import { SESSION_KEY_PATTERN } from "@/lib/chat-content";
import { calcularScore } from "@/lib/scoring";
import { notificarLeadNuevo } from "@/lib/emails";
import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  FINANCING_OPTIONS,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
  EMAIL_PATTERN,
  PHONE_PATTERN,
} from "@/lib/lead-content";

// Captura de interesados: nombre + correo obligatorios, lo demás opcional.
// El lead queda ligado a la conversación de su sesión de chat (si no chateó,
// se crea la conversación vacía igual: así Fase 3 puede medir interacción).
// Reenviar el formulario ACTUALIZA el lead de esa conversación, no duplica.

const MAINTENANCE =
  "No pude guardar tus datos en este momento 🙏. Inténtalo de nuevo en unos minutos, por favor.";

// Valor de opción: null si no respondió (los tres grupos son opcionales),
// INVALID si llegó algo que no está en la lista (request manipulado).
const INVALID = Symbol("invalid");

function parseOption(
  options: readonly { value: string }[],
  raw: unknown,
): string | null | typeof INVALID {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "string" && options.some((option) => option.value === raw)) {
    return raw;
  }
  return INVALID;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response("Solicitud inválida.", { status: 400 });
  }
  // JSON.parse("null") es válido: sin este guard, desestructurar explota.
  if (body === null || typeof body !== "object") {
    return new Response("Solicitud inválida.", { status: 400 });
  }

  const { sessionKey, name, email, phone, budget, timeline, financing } = body;

  // Campo trampa anti-bots: es invisible para personas; si viene lleno,
  // respondemos "todo bien" sin guardar nada para no darle pistas al bot.
  if (typeof body.sitio_web === "string" && body.sitio_web.length > 0) {
    return Response.json({ ok: true });
  }

  if (typeof sessionKey !== "string" || !SESSION_KEY_PATTERN.test(sessionKey)) {
    return new Response("Sesión inválida. Recarga la página, por favor.", {
      status: 400,
    });
  }

  const cleanName = typeof name === "string" ? name.trim() : "";
  if (cleanName.length < 2 || cleanName.length > MAX_NAME_LENGTH) {
    return new Response("Cuéntame tu nombre, por favor.", { status: 400 });
  }

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (
    cleanEmail.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(cleanEmail)
  ) {
    return new Response(
      "Ese correo no se ve completo. ¿Lo revisas? (ejemplo: nombre@gmail.com)",
      { status: 400 },
    );
  }

  const cleanPhone = typeof phone === "string" ? phone.trim() : "";
  if (cleanPhone.length > 0) {
    const digits = cleanPhone.match(/\d/g)?.length ?? 0;
    if (
      cleanPhone.length > MAX_PHONE_LENGTH ||
      !PHONE_PATTERN.test(cleanPhone) ||
      digits < 7
    ) {
      return new Response(
        "Ese celular no se ve bien. Solo números, por favor (o déjalo vacío).",
        { status: 400 },
      );
    }
  }

  const cleanBudget = parseOption(BUDGET_OPTIONS, budget);
  const cleanTimeline = parseOption(TIMELINE_OPTIONS, timeline);
  const cleanFinancing = parseOption(FINANCING_OPTIONS, financing);
  if (
    cleanBudget === INVALID ||
    cleanTimeline === INVALID ||
    cleanFinancing === INVALID
  ) {
    return new Response("Solicitud inválida.", { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`lead-ip:${ip}`) || isRateLimited(`lead-session:${sessionKey}`)) {
    return new Response(
      "Vas muy rápido 😅. Espera un momentico y vuelve a intentar.",
      { status: 429 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return new Response(MAINTENANCE, { status: 503 });
  }

  // Asegura la conversación de esta sesión y obtiene su id. El upsert solo
  // toca session_key: si la conversación ya existe, sus mensajes no se tocan.
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .upsert({ session_key: sessionKey }, { onConflict: "session_key" })
    .select("id, message_count")
    .single();

  if (convError || !conversation) {
    console.error("[lead] Error asegurando conversación:", convError?.message);
    return new Response(MAINTENANCE, { status: 503 });
  }

  const { score, category } = calcularScore({
    budget: cleanBudget,
    timeline: cleanTimeline,
    financing: cleanFinancing,
    messageCount: conversation.message_count ?? 0,
  });

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .upsert(
      {
        conversation_id: conversation.id,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        budget: cleanBudget,
        timeline: cleanTimeline,
        financing: cleanFinancing,
        wants_contact: true,
        score,
        category,
      },
      { onConflict: "conversation_id" },
    )
    .select("id")
    .single();

  if (leadError || !lead) {
    console.error("[lead] Error guardando lead:", leadError?.message);
    return new Response(MAINTENANCE, { status: 503 });
  }

  // Los emails (alerta HOT a Cristian + bienvenida) salen DESPUÉS de
  // responder: el visitante ve su confirmación al instante.
  after(() => notificarLeadNuevo(lead.id));

  return Response.json({ ok: true });
}
