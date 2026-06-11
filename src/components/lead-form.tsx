"use client";

import { useState } from "react";
import { getSessionKey } from "@/lib/chat-content";
import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  FINANCING_OPTIONS,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
} from "@/lib/lead-content";

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
        <span className="font-normal text-magdalena-suave">(opcional)</span>
      </legend>
      <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map(({ value, label }) => {
          const active = selected === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : value)}
              className={`min-h-12 rounded-xl border px-3 py-2.5 text-left text-[15px] leading-snug focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro ${
                active
                  ? "border-mango-oscuro bg-mango-suave font-bold"
                  : "border-agua-borde bg-white hover:border-mango"
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

export function LeadForm() {
  const [estado, setEstado] = useState<Estado>({ fase: "formulario" });
  const [budget, setBudget] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [financing, setFinancing] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const datos = new FormData(form);
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
      setEstado({ fase: "listo", nombre });
    } catch {
      setEstado({
        fase: "formulario",
        error: "No pude guardar tus datos 🙏. Revisa tu conexión e inténtalo de nuevo.",
      });
    }
  }

  if (estado.fase === "listo") {
    return (
      <div
        role="status"
        className="rounded-3xl border border-agua-borde bg-white p-6 text-center sm:p-8"
      >
        <p aria-hidden="true" className="text-4xl">
          🤝
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold">
          ¡Listo, {estado.nombre}!
        </h3>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-magdalena-suave">
          Cristian recibió tus datos y te va a escribir al correo. Mientras
          tanto, el asistente de arriba te responde cualquier duda al instante.
        </p>
      </div>
    );
  }

  const enviando = estado.fase === "enviando";

  return (
    <form
      onSubmit={enviar}
      className="space-y-6 rounded-3xl border border-agua-borde bg-white p-5 sm:p-8"
    >
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

      <div className="grid gap-4 border-t border-agua-borde pt-6 sm:grid-cols-2">
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
            className="mt-1.5 h-12 w-full rounded-xl border border-agua-borde px-4 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mango-oscuro"
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
            className="mt-1.5 h-12 w-full rounded-xl border border-agua-borde px-4 text-[16px] placeholder:text-magdalena-suave/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mango-oscuro"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="lead-celular" className="font-bold">
            Tu celular{" "}
            <span className="font-normal text-magdalena-suave">(opcional)</span>
          </label>
          <input
            id="lead-celular"
            name="celular"
            type="tel"
            maxLength={MAX_PHONE_LENGTH}
            autoComplete="tel"
            placeholder="300 123 4567"
            className="mt-1.5 h-12 w-full rounded-xl border border-agua-borde px-4 text-[16px] placeholder:text-magdalena-suave/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mango-oscuro"
          />
        </div>
      </div>

      {/* Campo trampa para bots: las personas no lo ven ni lo llenan. */}
      <div className="hidden" aria-hidden="true">
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
          className="rounded-2xl border border-mango/40 bg-mango-suave px-4 py-3"
        >
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="h-14 w-full rounded-xl bg-mango-oscuro px-6 text-lg font-bold text-white hover:bg-magdalena disabled:opacity-50 disabled:hover:bg-mango-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro"
      >
        {enviando ? "Enviando…" : "Enviar mis datos a Cristian"}
      </button>

      <p className="text-center text-sm leading-6 text-magdalena-suave">
        Tus datos solo los ve Cristian, el dueño. Sin spam y sin compartirlos
        con nadie.
      </p>
    </form>
  );
}
