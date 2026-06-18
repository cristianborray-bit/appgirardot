import Link from "next/link";
import { notFound } from "next/navigation";
import type { UIMessage } from "ai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  FINANCING_OPTIONS,
  ESTADO_OPTIONS,
  labelDe,
} from "@/lib/lead-content";
import { semaforo, fecha } from "@/lib/admin-format";
import { Transcript } from "@/components/transcript";
import { cambiarEstado, guardarNotas } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function DetalleLead({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const leadId = Number.parseInt(id, 10);
  if (Number.isNaN(leadId)) notFound();

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: lead } = await supabase
    .from("leads")
    .select(
      "id, name, email, phone, budget, timeline, financing, score, category, status, notes, created_at, conversations(id, messages, message_count, suspicious_level, suspicious_reason, utm_source, utm_medium, utm_campaign)",
    )
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) notFound();

  const conversacion = lead.conversations as unknown as {
    id: number;
    messages: UIMessage[];
    message_count: number;
    suspicious_level: number;
    suspicious_reason: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
  } | null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-block font-bold text-magdalena-suave hover:text-magdalena"
      >
        ← Volver al panel
      </Link>

      <section className="rounded-2xl border border-agua-borde bg-white p-5">
        <h1 className="font-display text-2xl font-semibold">
          {semaforo(lead.category, lead.score)} {lead.name}
        </h1>
        <p className="mt-1 text-magdalena-suave">
          {lead.email}
          {lead.phone ? ` · ${lead.phone}` : ""} · llegó el {fecha(lead.created_at)}
        </p>
        {conversacion?.utm_source && (
          <p className="mt-2 text-sm">
            📣 Llegó por un anuncio · origen <strong>{conversacion.utm_source}</strong>
            {conversacion.utm_medium ? ` · ${conversacion.utm_medium}` : ""}
            {conversacion.utm_campaign ? ` · campaña ${conversacion.utm_campaign}` : ""}
          </p>
        )}
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          <li className="rounded-xl border border-agua-borde bg-agua px-3 py-2">
            💰 <strong>{labelDe(BUDGET_OPTIONS, lead.budget)}</strong>
          </li>
          <li className="rounded-xl border border-agua-borde bg-agua px-3 py-2">
            📅 <strong>{labelDe(TIMELINE_OPTIONS, lead.timeline)}</strong>
          </li>
          <li className="rounded-xl border border-agua-borde bg-agua px-3 py-2">
            🏦 <strong>{labelDe(FINANCING_OPTIONS, lead.financing)}</strong>
          </li>
        </ul>

        {(conversacion?.suspicious_level ?? 0) > 0 && (
          <p className="mt-4 rounded-xl border border-mango/40 bg-mango-suave px-4 py-3">
            🚩 <strong>Señales de alerta en la conversación:</strong>{" "}
            {conversacion?.suspicious_reason ?? "revisar con cuidado"}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-agua-borde bg-white p-5">
        <h2 className="font-bold">Estado</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ESTADO_OPTIONS.map(({ value, label }) => {
            const activo = lead.status === value;
            const accion = cambiarEstado.bind(null, lead.id, value);
            return (
              <form key={value} action={accion}>
                <button
                  type="submit"
                  disabled={activo}
                  className={`min-h-11 rounded-xl border px-4 font-bold focus-visible:outline-2 focus-visible:outline-mango-oscuro ${
                    activo
                      ? "border-mango-oscuro bg-mango-suave"
                      : "border-agua-borde bg-white hover:border-mango"
                  }`}
                >
                  {activo ? "✓ " : ""}
                  {label}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-agua-borde bg-white p-5">
        <h2 className="font-bold">Tus notas</h2>
        <form action={guardarNotas.bind(null, lead.id)} className="mt-3 space-y-3">
          <label htmlFor="notas" className="sr-only">
            Notas sobre este interesado
          </label>
          <textarea
            id="notas"
            name="notas"
            rows={4}
            maxLength={4000}
            defaultValue={lead.notes ?? ""}
            placeholder="Ej.: Quedamos en hablar el sábado. Le interesa amoblado."
            className="w-full rounded-xl border border-agua-borde px-4 py-3 text-[16px] placeholder:text-magdalena-suave/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mango-oscuro"
          />
          <button
            type="submit"
            className="h-11 rounded-xl bg-mango-oscuro px-5 font-bold text-white hover:bg-magdalena focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro"
          >
            Guardar notas
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          Su conversación con el bot
        </h2>
        <div className="mt-3">
          <Transcript messages={conversacion?.messages ?? []} />
        </div>
      </section>
    </div>
  );
}
