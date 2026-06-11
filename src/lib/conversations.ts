import "server-only";
import type { UIMessage } from "ai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
