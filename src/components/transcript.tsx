import type { UIMessage } from "ai";
import { messageText } from "@/lib/chat-content";

// Transcripción de una conversación para el panel de Cristian (solo
// lectura, renderizada en el servidor — sin JavaScript en el navegador).
export function Transcript({ messages }: { messages: UIMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="rounded-2xl border border-agua-borde bg-white px-4 py-3 text-magdalena-suave">
        Esta sesión no tiene mensajes de chat (dejó sus datos sin conversar).
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-agua-borde bg-agua p-4">
      {messages.map((message) => {
        const own = message.role === "user";
        const texto = messageText(message);
        if (!texto) return null;
        return (
          <div
            key={message.id}
            className={own ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl border px-4 py-2.5 leading-relaxed ${
                own
                  ? "rounded-br-md border-mango/30 bg-mango-suave"
                  : "rounded-bl-md border-agua-borde bg-white"
              }`}
            >
              <p className="mb-0.5 text-xs font-bold uppercase tracking-wide text-magdalena-suave">
                {own ? "Visitante" : "Bot"}
              </p>
              {texto}
            </div>
          </div>
        );
      })}
    </div>
  );
}
