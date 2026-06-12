import "server-only";
import type { UIMessage } from "ai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { messageText } from "@/lib/chat-content";
import { calcularScore, detectarSospecha } from "@/lib/scoring";
import { notificarSiCalentoAHot } from "@/lib/emails";

// El servidor es el único dueño del historial: lo lee y lo escribe en
// Supabase y no acepta mensajes construidos por el navegador. Sin base de
// datos configurada el chat sigue vivo, pero responde cada mensaje sin
// memoria de los anteriores (solo ocurre en entornos mal configurados).

function isUIMessageArray(value: unknown): value is UIMessage[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    const message = item as UIMessage;
    return (
      typeof message === "object" &&
      message !== null &&
      typeof message.id === "string" &&
      (message.role === "user" ||
        message.role === "assistant" ||
        message.role === "system") &&
      Array.isArray(message.parts)
    );
  });
}

export async function loadConversation(
  sessionKey: string,
): Promise<UIMessage[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select("messages")
    .eq("session_key", sessionKey)
    .maybeSingle();

  if (error) {
    console.error("[chat] Error cargando conversación:", error.message);
    return [];
  }
  return isUIMessageArray(data?.messages) ? data.messages : [];
}

export async function saveConversation(
  sessionKey: string,
  messages: UIMessage[],
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { data: conversation, error } = await supabase
    .from("conversations")
    .upsert(
      {
        session_key: sessionKey,
        messages,
        message_count: messages.length,
      },
      { onConflict: "session_key" },
    )
    .select("id, suspicious_level")
    .single();

  if (error || !conversation) {
    console.error("[chat] Error guardando conversación:", error?.message);
    return;
  }

  // Detección anti-estafa sobre lo que escribió el visitante. Solo escala
  // (nunca baja un nivel ya marcado) y jamás bloquea la conversación.
  const textosVisitante = messages
    .filter((m) => m.role === "user")
    .map(messageText);
  const sospecha = detectarSospecha(textosVisitante);
  if (sospecha && sospecha.nivel > (conversation.suspicious_level ?? 0)) {
    const { error: errorSospecha } = await supabase
      .from("conversations")
      .update({
        suspicious_level: sospecha.nivel,
        suspicious_reason: sospecha.motivo,
      })
      .eq("id", conversation.id);
    if (errorSospecha) {
      console.error("[chat] Error marcando sospecha:", errorSospecha.message);
    }
  }

  // Si esta conversación ya tiene lead, su puntaje de interacción crece
  // con la charla: se recalcula para que las alertas de Fase 4 sean fieles.
  const { data: lead } = await supabase
    .from("leads")
    .select("id, budget, timeline, financing")
    .eq("conversation_id", conversation.id)
    .maybeSingle();

  if (lead) {
    const { score, category } = calcularScore({
      budget: lead.budget,
      timeline: lead.timeline,
      financing: lead.financing,
      messageCount: messages.length,
    });
    const { error: errorScore } = await supabase
      .from("leads")
      .update({ score, category })
      .eq("id", lead.id);
    if (errorScore) {
      console.error("[chat] Error actualizando score:", errorScore.message);
    } else if (category === "hot") {
      // Si la charla lo calentó hasta HOT, Cristian se entera ya mismo
      // (el candado de email_log evita alertas repetidas).
      await notificarSiCalentoAHot(lead.id);
    }
  }
}
