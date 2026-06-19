"use client";

import { useState } from "react";
import { getSessionKey } from "@/lib/chat-content";
import { trackLead } from "@/lib/meta-pixel";
import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  FINANCING_OPTIONS,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
} from "@/lib/lead-content";

// Widget de captura que vive DENTRO del chat, como una burbuja más de la
// conversación: el visitante deja sus datos sin salir de la pantalla.

type Estado =
  | { fase: "formulario"; error?: string }
  | { fase: "enviando" }
  | { fase: "listo"; nombre: string };

function Pregunta({
  titulo,
  options,
  selected,
  onSelect,
}: {
  titulo: string;
  options: readonly { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}) {
  return (
    <fieldset>
      <legend className="font-bold">
        {titulo}{" "}
        <span className="font-normal text-arena-text-mid">(opcional)</span>
      </legend>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map(({ value, label }) => {
          const active = selected === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : value)}
              className={`min-h-12 rounded-arena-sm border px-3 py-2.5 text-left text-[15px] leading-snug focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-accent ${
                active
                  ? "border-arena-accent bg-arena-surface-warm font-bold"
                  : "border-arena-border bg-arena-surface hover:border-arena-accent"
              }`}
            >
              {active ? "✓ " : ""}
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CapturaLead({
  onListo,
  onCerrar,
}: {
  onListo: (nombre: string) => void;
  onCerrar: () => void;
}) {
  const [estado, setEstado] = useState<Estado>({ fase: "formulario" });
  const [budget, setBudget] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [financing, setFinancing] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const nombre = String(datos.get("nombre") ?? "").trim();

    setEstado({ fase: "enviando" });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionKey: getSessionKey(),
          name: nombre,
          email: String(datos.get("correo") ?? ""),
          phone: String(datos.get("celular") ?? ""),
          budget,
          timeline,
          financing,
          sitio_web: String(datos.get("sitio_web") ?? ""),
        }),
      });
      if (!res.ok) {
        const texto = (await res.text()).trim();
        const amigable =
          texto.length > 0 && texto.length <= 200 && !/[<>{}]/.test(texto)
            ? texto
            : "No pude guardar tus datos 🙏. Inténtalo de nuevo en un momento.";
        setEstado({ fase: "formulario", error: amigable });
        return;
      }
      trackLead();
      setEstado({ fase: "listo", nombre });
      onListo(nombre);
    } catch {
      setEstado({
        fase: "formulario",
        error:
          "No pude guardar tus datos 🙏. Revisa tu conexión e inténtalo de nuevo.",
      });
    }
  }

  if (estado.fase === "listo") {
    return (
      <div
        role="status"
        className="rounded-arena-sm rounded-bl-md border border-arena-border bg-arena-surface px-4 py-4 text-center"
      >
        <p aria-hidden="true" className="text-3xl">
          🤝
        </p>
        <p className="mt-2 font-bold">¡Listo, {estado.nombre}!</p>
        <p className="mt-1 leading-relaxed text-arena-text-mid">
          Cristian recibió tus datos y te escribirá al correo. Si tienes más
          preguntas, aquí sigo.
        </p>
      </div>
    );
  }

  const enviando = estado.fase === "enviando";

  return (
    <form
      onSubmit={enviar}
      className="space-y-5 rounded-arena-sm rounded-bl-md border border-arena-border bg-arena-surface p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold leading-snug">
          📝 Que Cristian te contacte
          <span className="block text-sm font-normal text-arena-text-mid">
            Solo nombre y correo. Lo demás es opcional.
          </span>
        </p>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Ahora no, cerrar formulario"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-arena-text-muted hover:bg-arena-bg focus-visible:outline-2 focus-visible:outline-arena-accent"
        >
          ✕
        </button>
      </div>

      <Pregunta
        titulo="¿Cuál es tu presupuesto?"
        options={BUDGET_OPTIONS}
        selected={budget}
        onSelect={setBudget}
      />
      <Pregunta
        titulo="¿Para cuándo comprarías?"
        options={TIMELINE_OPTIONS}
        selected={timeline}
        onSelect={setTimeline}
      />
      <Pregunta
        titulo="¿Cómo pagarías?"
        options={FINANCING_OPTIONS}
        selected={financing}
        onSelect={setFinancing}
      />

      <div className="space-y-4 border-t border-arena-border pt-4">
        <div>
          <label htmlFor="lead-nombre" className="font-bold">
            Tu nombre
          </label>
          <input
            id="lead-nombre"
            name="nombre"
            required
            minLength={2}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="name"
            className="mt-1.5 h-12 w-full rounded-arena-xs border border-arena-border px-4 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-arena-accent"
          />
        </div>
        <div>
          <label htmlFor="lead-correo" className="font-bold">
            Tu correo
          </label>
          <input
            id="lead-correo"
            name="correo"
            type="email"
            required
            autoComplete="email"
            placeholder="nombre@gmail.com"
            className="mt-1.5 h-12 w-full rounded-arena-xs border border-arena-border px-4 text-[16px] placeholder:text-arena-text-muted/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-arena-accent"
          />
        </div>
        <div>
          <label htmlFor="lead-celular" className="font-bold">
            Tu celular{" "}
            <span className="font-normal text-arena-text-mid">(opcional)</span>
          </label>
          <input
            id="lead-celular"
            name="celular"
            type="tel"
            maxLength={MAX_PHONE_LENGTH}
            autoComplete="tel"
            placeholder="300 123 4567"
            className="mt-1.5 h-12 w-full rounded-arena-xs border border-arena-border px-4 text-[16px] placeholder:text-arena-text-muted/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-arena-accent"
          />
        </div>
      </div>

      {/* Campo trampa para bots: las personas no lo ven ni lo llenan.
          CSS posicional (no display:none) para que bots avanzados no lo detecten. */}
      <div
        className="absolute overflow-hidden opacity-0 pointer-events-none"
        style={{ top: "-9999px", left: "-9999px", height: 0, width: 0 }}
        aria-hidden="true"
      >
        <label htmlFor="lead-sitio-web">Sitio web</label>
        <input
          id="lead-sitio-web"
          name="sitio_web"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {estado.fase === "formulario" && estado.error && (
        <p
          role="status"
          className="rounded-arena-sm border border-arena-accent/40 bg-arena-surface-warm px-4 py-3"
        >
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="h-12 w-full rounded-arena-sm bg-arena-dark px-5 font-bold text-arena-bg hover:bg-arena-accent disabled:opacity-50 disabled:hover:bg-arena-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-accent"
      >
        {enviando ? "Enviando…" : "Enviar mis datos a Cristian"}
      </button>

      <p className="text-center text-sm leading-6 text-arena-text-mid">
        Tus datos solo los ve Cristian, el dueño. Sin spam.
      </p>
    </form>
  );
}
