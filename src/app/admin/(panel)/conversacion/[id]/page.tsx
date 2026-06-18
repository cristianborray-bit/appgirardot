import Link from "next/link";
import { notFound } from "next/navigation";
import type { UIMessage } from "ai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fecha } from "@/lib/admin-format";
import { Transcript } from "@/components/transcript";

export const dynamic = "force-dynamic";

export default async function DetalleConversacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const convId = Number.parseInt(id, 10);
  if (Number.isNaN(convId)) notFound();

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: conv } = await supabase
    .from("conversations")
    .select(
      "id, messages, message_count, suspicious_level, suspicious_reason, utm_source, utm_medium, utm_campaign, updated_at, leads(id, name)",
    )
    .eq("id", convId)
    .maybeSingle();

  if (!conv) notFound();

  const leads = (conv.leads ?? []) as { id: number; name: string }[];

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
          {conv.suspicious_level > 0 ? "🚩 " : "💬 "}
          {leads.length > 0 ? leads[0].name : "Visitante sin datos"}
        </h1>
        <p className="mt-1 text-magdalena-suave">
          {conv.message_count} mensajes · última actividad {fecha(conv.updated_at)}
        </p>
        {conv.utm_source && (
          <p className="mt-2 text-sm">
            📣 Llegó por un anuncio · origen <strong>{conv.utm_source}</strong>
            {conv.utm_medium ? ` · ${conv.utm_medium}` : ""}
            {conv.utm_campaign ? ` · campaña ${conv.utm_campaign}` : ""}
          </p>
        )}
        {conv.suspicious_level > 0 && (
          <p className="mt-3 rounded-xl border border-mango/40 bg-mango-suave px-4 py-3">
            🚩 <strong>Señales de alerta:</strong>{" "}
            {conv.suspicious_reason ?? "revisar con cuidado"}
          </p>
        )}
        {leads.length > 0 && (
          <p className="mt-3">
            <Link
              href={`/admin/lead/${leads[0].id}`}
              className="font-bold text-mango-oscuro hover:underline"
            >
              Ver su ficha de interesado →
            </Link>
          </p>
        )}
      </section>

      <Transcript messages={(conv.messages ?? []) as UIMessage[]} />
    </div>
  );
}
