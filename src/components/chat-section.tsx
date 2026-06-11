"use client";

import { useEffect, useRef, useState } from "react";
import { Chat } from "@/components/chat";

// En computador el chat vive incrustado junto al título, como siempre.
// En celular se ve una tarjeta de invitación; al tocarla, el MISMO chat
// (no se desmonta: una respuesta a medias no se corta) se toma toda la
// pantalla, estilo WhatsApp: un solo scroll, cajita fija abajo.

export function ChatSection() {
  const [abierto, setAbierto] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const abrirRef = useRef<HTMLButtonElement>(null);

  function cerrar() {
    setAbierto(false);
    abrirRef.current?.focus();
  }

  useEffect(() => {
    if (!abierto) return;

    // La página de atrás queda congelada: un solo scroll, el del chat.
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    overlayRef.current?.focus();

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alTeclear);

    // Si la ventana crece a tamaño de computador, el modo overlay sobra.
    const mq = window.matchMedia("(min-width: 1024px)");
    const alCambiar = () => {
      if (mq.matches) setAbierto(false);
    };
    mq.addEventListener("change", alCambiar);

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      window.removeEventListener("keydown", alTeclear);
      mq.removeEventListener("change", alCambiar);
    };
  }, [abierto]);

  return (
    <>
      {/* Tarjeta de invitación: solo en celular, mientras el chat está cerrado */}
      {!abierto && (
        <div className="rounded-3xl border border-agua-borde bg-white p-5 shadow-sm lg:hidden">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mango-suave text-2xl"
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
          <p className="mt-3 leading-relaxed text-magdalena-suave">
            Pregúntale lo que quieras del apartamento: precios, visitas, zonas
            comunes. Te contesta al momento, a cualquier hora.
          </p>
          <button
            ref={abrirRef}
            type="button"
            onClick={() => setAbierto(true)}
            className="mt-4 h-14 w-full rounded-xl bg-mango-oscuro px-6 text-lg font-bold text-white hover:bg-magdalena focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro"
          >
            💬 Abrir el chat
          </button>
        </div>
      )}

      {/* El chat: incrustado en computador, pantalla completa en celular */}
      <div
        ref={overlayRef}
        tabIndex={-1}
        {...(abierto
          ? { role: "dialog", "aria-modal": true, "aria-label": "Chat con el asistente" }
          : {})}
        className={
          abierto
            ? "fixed inset-0 z-50 outline-none lg:static lg:z-auto"
            : "hidden lg:block"
        }
      >
        <Chat
          onCerrar={cerrar}
          className="h-dvh lg:h-[620px] lg:rounded-3xl lg:border lg:border-agua-borde lg:shadow-sm"
        />
      </div>

      {/* Botón flotante estilo WhatsApp: aparece al recorrer la página */}
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir el chat"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-mango-oscuro text-2xl text-white shadow-lg hover:bg-magdalena focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro lg:hidden"
        >
          💬
        </button>
      )}
    </>
  );
}
