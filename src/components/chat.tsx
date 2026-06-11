"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  QUICK_REPLIES,
  WELCOME_MESSAGE,
  SESSION_KEY_PATTERN,
  messageText,
} from "@/lib/chat-content";

function newSessionKey(): string {
  if (typeof window === "undefined") return "";
  const stored = window.localStorage.getItem("cb_session");
  if (stored && SESSION_KEY_PATTERN.test(stored)) return stored;
  const fresh = crypto.randomUUID();
  window.localStorage.setItem("cb_session", fresh);
  return fresh;
}

// El servidor responde errores con textos amigables en español; se muestran
// tal cual cuando parecen eso (cortos y sin restos técnicos).
function friendlyError(error: Error): string {
  const message = error.message?.trim() ?? "";
  const looksFriendly =
    message.length > 0 &&
    message.length <= 200 &&
    !/[<>{}]|fetch|network|http/i.test(message);
  return looksFriendly
    ? message
    : "No pude responder en este momento 🙏. Espera un momentico y vuelve a intentarlo.";
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
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl border px-4 py-3 leading-relaxed ${
          own
            ? "rounded-br-md border-mango/30 bg-mango-suave"
            : "rounded-bl-md border-agua-borde bg-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function Chat() {
  const [sessionKey] = useState(newSessionKey);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ sessionKey }),
      }),
    [sessionKey],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const busy = status === "submitted" || status === "streaming";
  const hasUserMessage = messages.some((m) => m.role === "user");

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className="flex h-[72dvh] min-h-[480px] flex-col overflow-hidden rounded-3xl border border-agua-borde bg-white shadow-sm sm:h-[620px]">
      <div className="flex items-center gap-3 border-b border-agua-borde px-4 py-3">
        <div
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mango-suave text-xl"
        >
          🤖
        </div>
        <div>
          <p className="font-bold leading-tight">Asistente de Cristian</p>
          <p className="text-sm text-magdalena-suave">
            Inteligencia artificial · Responde al instante
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Conversación con el asistente"
        className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-agua px-4 py-5"
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

        {status === "submitted" && (
          <div className="flex justify-start">
            <div
              className="escribiendo rounded-2xl rounded-bl-md border border-agua-borde bg-white px-4 py-3 text-xl leading-none text-magdalena-suave"
              aria-label="El asistente está escribiendo"
            >
              <span>●</span> <span>●</span> <span>●</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
            {friendlyError(error)}
          </div>
        )}
      </div>

      {!hasUserMessage && (
        <div className="grid grid-cols-2 gap-2 border-t border-agua-borde px-3 pt-3">
          {QUICK_REPLIES.map(({ emoji, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => send(label)}
              className="min-h-12 rounded-xl border border-mango bg-white px-3 py-2.5 text-[15px] font-bold leading-snug hover:bg-mango-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro"
            >
              <span aria-hidden="true">{emoji}</span> {label}
            </button>
          ))}
        </div>
      )}

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
          className="h-12 min-w-0 flex-1 rounded-xl border border-agua-borde px-4 text-[16px] placeholder:text-magdalena-suave/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mango-oscuro"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length === 0}
          className="h-12 shrink-0 rounded-xl bg-mango-oscuro px-5 font-bold text-white hover:bg-magdalena disabled:opacity-50 disabled:hover:bg-mango-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
