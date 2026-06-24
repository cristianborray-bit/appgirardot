"use client";

import { useEffect, useRef, useState } from "react";
import { Chat } from "@/components/chat";
import { trackChatAbierto, trackClicWhatsApp } from "@/lib/meta-pixel";

// En computador el chat vive incrustado junto al título, como siempre.
// En celular se ve una tarjeta de invitación; al tocarla, el MISMO chat
// (no se desmonta: una respuesta a medias no se corta) se toma toda la
// pantalla, estilo WhatsApp: un solo scroll, cajita fija abajo.

export function ChatSection() {
  const [abierto, setAbierto] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const abrirRef = useRef<HTMLButtonElement>(null);
  // Solo en celular existe un paso real de "abrir": en computador el chat
  // ya está visible desde que carga la página. Se marca una sola vez por
  // visita aunque la persona cierre y vuelva a abrir el chat.
  const chatAbiertoRef = useRef(false);

  function abrir() {
    if (!chatAbiertoRef.current) {
      chatAbiertoRef.current = true;
      trackChatAbierto();
    }
    setAbierto(true);
  }

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
        <div className="rounded-arena-lg border border-arena-border bg-arena-surface p-5 shadow-arena-owner font-arena-body text-arena-text lg:hidden">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-arena-surface-warm text-2xl"
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
          <p className="mt-3 leading-relaxed text-arena-text-mid">
            Pregúntale lo que quieras del apartamento: precios, visitas, zonas
            comunes. Te contesta al momento, a cualquier hora.
          </p>
          <button
            ref={abrirRef}
            type="button"
            onClick={abrir}
            className="mt-4 h-14 w-full rounded-arena-sm bg-arena-dark px-6 text-lg font-bold text-arena-bg hover:bg-arena-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-accent"
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
          className="h-dvh lg:h-[620px] lg:rounded-arena-lg lg:border lg:border-arena-border lg:shadow-arena-owner"
        />
      </div>

      {/* Botón flotante estilo WhatsApp: aparece al recorrer la página */}
      {!abierto && (
        <button
          type="button"
          onClick={abrir}
          aria-label="Abrir el chat"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-arena-dark text-2xl text-arena-bg shadow-arena-float hover:bg-arena-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-accent lg:hidden"
        >
          💬
        </button>
      )}

      {/* Botón flotante de WhatsApp directo con Cristian */}
      {!abierto && (
        <a
          href={`https://wa.me/573007609776?text=${encodeURIComponent(
            "Deseo más información o tengo preguntas sobre la venta del apartamento de Girardot."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackClicWhatsApp}
          aria-label="Contactar a Cristian por WhatsApp"
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-arena-surface shadow-arena-float hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-accent lg:bottom-5"
        >
          <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" className="h-7 w-7">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 110.8L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.6-66-5.7-9.9 5.7-9.2 16.3-30.5 1.8-3.7.9-6.9-.6-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.6 1.4-14.7 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 38.7 59.1 95.6 80.4 47.5 17.8 57 14.3 67.5 13.5 10.4-.9 33.4-13.6 38.1-26.9 4.7-13.3 4.7-24.7 3.2-26.9-1.4-2-5-3.2-10.4-5.7z" />
          </svg>
        </a>
      )}
    </>
  );
}
