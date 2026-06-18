import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  FINANCING_OPTIONS,
  ESTADO_OPTIONS,
  labelDe,
} from "@/lib/lead-content";
import { semaforo, fecha } from "@/lib/admin-format";

export const dynamic = "force-dynamic";

type LeadRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  timeline: string | null;
  financing: string | null;
  score: number;
  category: string | null;
  status: string;
  created_at: string;
  conversations: {
    message_count: number;
    suspicious_level: number;
    utm_source: string | null;
  } | null;
};

type ConversationRow = {
  id: number;
  session_key: string;
  message_count: number;
  suspicious_level: number;
  suspicious_reason: string | null;
  utm_source: string | null;
  updated_at: string;
  leads: { id: number; name: string }[];
};

export default async function PanelPrincipal() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <p className="rounded-2xl border border-mango/40 bg-mango-suave px-4 py-3">
        La base de datos no está configurada en este entorno.
      </p>
    );
  }

  const [{ data: leads }, { data: conversaciones }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id, name, email, phone, budget, timeline, financing, score, category, status, created_at, conversations(message_count, suspicious_level, utm_source)",
      )
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("conversations")
      .select(
        "id, session_key, message_count, suspicious_level, suspicious_reason, utm_source, updated_at, leads(id, name)",
      )
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  const listaLeads = (leads ?? []) as unknown as LeadRow[];
  const listaConversaciones = (conversaciones ?? []) as unknown as ConversationRow[];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-2xl font-semibold">
          Interesados ({listaLeads.length})
        </h1>

        {listaLeads.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-agua-borde bg-white px-4 py-6 text-center text-magdalena-suave">
            Aún no hay interesados registrados. Cuando alguien deje sus datos
            en el chat, aparece aquí con su semáforo.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {listaLeads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/admin/lead/${lead.id}`}
                  className="block rounded-2xl border border-agua-borde bg-white p-4 hover:border-mango focus-visible:outline-2 focus-visible:outline-mango-oscuro"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-bold">
                      {semaforo(lead.category, lead.score)} {lead.name}
                      {(lead.conversations?.suspicious_level ?? 0) > 0 && (
                        <span title="Conversación con señales de alerta"> 🚩</span>
                      )}
                      {lead.conversations?.utm_source && (
                        <span
                          title={`Llegó por un anuncio (${lead.conversations.utm_source})`}
                          className="ml-2 rounded-full border border-mango/40 bg-mango-suave px-2 py-0.5 text-xs font-bold"
                        >
                          📣 {lead.conversations.utm_source}
                        </span>
                      )}
                    </p>
                    <span className="rounded-full border border-agua-borde bg-agua px-3 py-1 text-sm font-bold">
                      {labelDe(ESTADO_OPTIONS, lead.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-magdalena-suave">
                    {lead.email}
                    {lead.phone ? ` · ${lead.phone}` : ""} · {fecha(lead.created_at)}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span>💰 {labelDe(BUDGET_OPTIONS, lead.budget)}</span>
                    <span>📅 {labelDe(TIMELINE_OPTIONS, lead.timeline)}</span>
                    <span>🏦 {labelDe(FINANCING_OPTIONS, lead.financing)}</span>
                    <span>
                      💬 {lead.conversations?.message_count ?? 0} mensajes
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">
          Conversaciones recientes
        </h2>
        {listaConversaciones.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-agua-borde bg-white px-4 py-6 text-center text-magdalena-suave">
            Todavía no hay conversaciones.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {listaConversaciones.map((conv) => (
              <li key={conv.id}>
                <Link
                  href={`/admin/conversacion/${conv.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-agua-borde bg-white px-4 py-3 hover:border-mango focus-visible:outline-2 focus-visible:outline-mango-oscuro"
                >
                  <span className="font-bold">
                    {conv.suspicious_level > 0 ? "🚩 " : "💬 "}
                    {conv.leads.length > 0
                      ? conv.leads[0].name
                      : "Visitante sin datos"}
                    {conv.utm_source && (
                      <span className="ml-2 rounded-full border border-mango/40 bg-mango-suave px-2 py-0.5 text-xs font-bold">
                        📣 {conv.utm_source}
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-magdalena-suave">
                    {conv.message_count} mensajes · {fecha(conv.updated_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
