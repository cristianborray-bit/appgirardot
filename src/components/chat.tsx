"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  QUICK_REPLIES,
  WELCOME_MESSAGE,
  getSessionKey,
  getUtmParams,
  messageText,
  marcarLeadEnviado,
  suscribirLeadEnviado,
  leadEnviadoSnapshot,
  leadEnviadoServerSnapshot,
} from "@/lib/chat-content";
import { CapturaLead } from "@/components/lead-form";

// El servidor responde sus límites con textos amigables en español; cuando el
// mensaje parece eso (corto y sin restos técnicos) se muestra tal cual como
// aviso tranquilo. La alarma roja queda solo para fallas de verdad.
function friendlyError(error: Error): { text: string; isNotice: boolean } {
  const message = error.message?.trim() ?? "";
  const looksFriendly =
    message.length > 0 &&
    message.length <= 200 &&
    !/[<>{}]|fetch|network|http/i.test(message);
  return looksFriendly
    ? { text: message, isNotice: true }
    : {
        text: "No pude responder en este momento 🙏. Espera un momentico y vuelve a intentarlo.",
        isNotice: false,
      };
}

function Burbuja({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const own = role === "user";
  return (
    <div className={own ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-arena-sm border px-4 py-3 leading-relaxed ${
          own
            ? "rounded-br-md border-arena-accent/30 bg-arena-surface-warm"
            : "rounded-bl-md border-arena-border bg-arena-surface"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function Chat({
  className = "",
  onCerrar,
}: {
  className?: string;
  // En celular el chat se abre a pantalla completa; este callback es el
  // botón "← Volver" de la barra superior (oculto en computador).
  onCerrar?: () => void;
}) {
  const [sessionKey] = useState(getSessionKey);
  const [utm] = useState(getUtmParams);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Captura de datos dentro del chat: el widget aparece como una burbuja
  // más de la conversación. localStorage recuerda que ya dejó sus datos.
  const [mostrarCaptura, setMostrarCaptura] = useState(false);
  // Largo de la conversación al enviar los datos: la tarjeta "¡Listo!" se
  // muestra hasta que la conversación continúe (estado derivado, sin efectos).
  const [lenAlEnviar, setLenAlEnviar] = useState<number | null>(null);
  const yaEnviado = useSyncExternalStore(
    suscribirLeadEnviado,
    leadEnviadoSnapshot,
    leadEnviadoServerSnapshot,
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        // Solo viaja el texto nuevo: el historial vive en Supabase y lo
        // reconstruye el servidor (el navegador no puede inventarlo).
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            sessionKey,
            text: messageText(messages[messages.length - 1]),
            utmSource: utm.utmSource,
            utmMedium: utm.utmMedium,
            utmCampaign: utm.utmCampaign,
          },
        }),
      }),
    [sessionKey, utm],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
  });

  // Si esta sesión ya tenía conversación (p. ej. recargó la página), se
  // retoma desde el servidor para que vea lo que ya habían hablado. El ref
  // garantiza UNA sola carga aunque el efecto se re-ejecute.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || !sessionKey) return;
    hydratedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/chat?session=${encodeURIComponent(sessionKey)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: UIMessage[] };
        const previous = data.messages;
        if (cancelled || !previous || previous.length === 0) return;
        // Solo si aún no escribió nada: jamás pisar mensajes en curso.
        setMessages((current) => (current.length === 0 ? previous : current));
      } catch {
        // Sin historial no pasa nada: el chat arranca desde la bienvenida.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionKey, setMessages]);

  const busy = status === "submitted" || status === "streaming";
  const hasUserMessage = messages.some((m) => m.role === "user");
  const notice = error ? friendlyError(error) : null;

  function capturaLista(nombre: string) {
    marcarLeadEnviado(nombre);
    setLenAlEnviar(messages.length);
  }

  // El widget se ve mientras esté abierto; tras enviar, su tarjeta "¡Listo!"
  // se despide sola cuando la conversación continúa.
  const capturaVisible =
    mostrarCaptura && (lenAlEnviar === null || lenAlEnviar === messages.length);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status, capturaVisible]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className={`flex flex-col overflow-hidden bg-arena-surface font-arena-body text-arena-text ${className}`}>
      <div className="flex items-center gap-2 border-b border-arena-border px-3 py-3 sm:px-4">
        {onCerrar && (
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Volver a la página"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl hover:bg-arena-bg focus-visible:outline-2 focus-visible:outline-arena-accent lg:hidden"
          >
            ←
          </button>
        )}
        <div
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-arena-surface-warm text-xl"
        >
          🤖
        </div>
        <div>
          <p className="font-bold leading-tight">Asistente de Cristian</p>
          <p className="text-sm text-arena-text-mid">
            Inteligencia artificial · Responde al instante
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Conversación con el asistente"
        className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-arena-bg px-4 py-5"
      >
        <Burbuja role="assistant">{WELCOME_MESSAGE}</Burbuja>

        {messages.map((message) => (
          <Burbuja
            key={message.id}
            role={message.role === "user" ? "user" : "assistant"}
          >
            {messageText(message)}
          </Burbuja>
        ))}

        {capturaVisible && (
          <div className="flex justify-start">
            <div className="w-full max-w-[92%]">
              <CapturaLead
                onListo={capturaLista}
                onCerrar={() => setMostrarCaptura(false)}
              />
            </div>
          </div>
        )}

        {status === "submitted" && (
          <div className="flex justify-start">
            <div
              className="escribiendo rounded-arena-sm rounded-bl-md border border-arena-border bg-arena-surface px-4 py-3 text-xl leading-none text-arena-text-muted"
              aria-label="El asistente está escribiendo"
            >
              <span>●</span> <span>●</span> <span>●</span>
            </div>
          </div>
        )}

        {notice && (
          <div
            className={
              notice.isNotice
                ? "rounded-arena-sm border border-arena-accent/40 bg-arena-surface-warm px-4 py-3"
                : "rounded-arena-sm border border-red-200 bg-red-50 px-4 py-3 text-red-900"
            }
          >
            {notice.text}
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-arena-border px-3 pt-3">
        {!hasUserMessage && (
          <div className="grid grid-cols-2 gap-2">
            {QUICK_REPLIES.map(({ emoji, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => send(label)}
                className="min-h-12 rounded-arena-sm border border-arena-accent bg-arena-surface px-3 py-2.5 text-[15px] font-bold leading-snug hover:bg-arena-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-accent"
              >
                <span aria-hidden="true">{emoji}</span> {label}
              </button>
            ))}
          </div>
        )}

        {!capturaVisible &&
          (yaEnviado ? (
            <p className="flex min-h-12 items-center justify-center rounded-arena-sm border border-arena-border bg-arena-bg px-3 text-[15px] font-bold text-arena-text-mid">
              ✓ Cristian te contactará pronto
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarCaptura(true)}
              className="min-h-12 w-full rounded-arena-sm border-2 border-arena-accent bg-arena-surface px-3 text-[15px] font-bold hover:bg-arena-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-accent"
            >
              📝 Que Cristian me contacte
            </button>
          ))}
      </div>

      <form
        className="flex gap-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Escribe tu pregunta
        </label>
        <input
          id="chat-input"
          name="pregunta"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          autoComplete="off"
          maxLength={1000}
          className="h-12 min-w-0 flex-1 rounded-arena-xs border border-arena-border px-4 text-[16px] placeholder:text-arena-text-muted/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-arena-accent"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length === 0}
          className="h-12 shrink-0 rounded-arena-xs bg-arena-dark px-5 font-bold text-arena-bg hover:bg-arena-accent disabled:opacity-50 disabled:hover:bg-arena-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-accent"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
