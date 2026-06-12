import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  plantillaAlertaHot,
  plantillaBienvenidaHot,
  plantillaBienvenidaWarm,
  plantillaBienvenidaCold,
  plantillaSeguimientoD1,
  plantillaSeguimientoD3,
  plantillaSeguimientoD7,
  type DatosLeadEmail,
  type Plantilla,
} from "@/lib/email-templates";

// Emails de Fase 4 con Resend. Reglas de oro:
// - Cada email queda registrado en email_log con candado único (lead + tipo):
//   es imposible enviar dos veces el mismo email al mismo lead.
// - Las alertas a Cristian funcionan desde ya (onboarding@resend.dev solo
//   puede escribirle al dueño de la cuenta Resend — justo lo que necesitamos).
// - Los emails a leads se activan SOLOS cuando EMAIL_FROM use el dominio
//   propio verificado en Resend (mientras sea resend.dev, no se intentan).
// - Un fallo de email JAMÁS rompe el guardado del lead ni el chat: todo va
//   en try/catch y el cron diario reintenta lo que quedó pendiente.

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "cristianborray@gmail.com";
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "CristianBot <onboarding@resend.dev>";
const SITE_URL = process.env.SITE_URL ?? "https://appgirardot.vercel.app";

export type TipoEmail =
  | "owner_hot_alert"
  | "welcome_hot"
  | "welcome_warm"
  | "welcome_cold"
  | "followup_d1"
  | "followup_d3"
  | "followup_d7";

function puedeEnviarALeads(): boolean {
  // El remitente de prueba de Resend solo entrega al dueño de la cuenta.
  return !EMAIL_FROM.includes("resend.dev");
}

type ResultadoEnvio = { ok: true; id: string } | { ok: false; error: string };

async function enviarEmail(args: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<ResultadoEnvio> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY no configurada" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        // Versión en texto plano: mejora la entregabilidad y los clientes
        // de correo viejos. Se deriva del HTML quitando las etiquetas.
        text: args.html
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
        ...(args.replyTo ? { reply_to: [args.replyTo] } : {}),
      }),
    });
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        error: `Resend ${res.status}: ${JSON.stringify(data).slice(0, 300)}`,
      };
    }
    const id =
      data && typeof data === "object" && "id" in data
        ? String((data as { id: unknown }).id)
        : "";
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "fallo de red al enviar",
    };
  }
}

// Envío idempotente: primero toma el candado en email_log (si ya existe un
// registro de este tipo para este lead, no hace nada) y luego envía.
// Si el envío falla, el registro queda en 'error' y el cron lo reintenta.
async function enviarConCandado(
  supabase: SupabaseClient,
  leadId: number,
  tipo: TipoEmail,
  destinatario: string,
  plantilla: Plantilla,
  replyTo?: string,
): Promise<boolean> {
  const { data: candado, error: errorCandado } = await supabase
    .from("email_log")
    .upsert(
      { lead_id: leadId, email_type: tipo, status: "pending" },
      { onConflict: "lead_id,email_type", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();

  if (errorCandado) {
    console.error(`[email] Error tomando candado ${tipo}:`, errorCandado.message);
    return false;
  }
  if (!candado) return false; // ya se envió (o se está enviando) antes

  const resultado = await enviarEmail({ to: destinatario, replyTo, ...plantilla });
  await actualizarRegistro(supabase, candado.id, resultado);
  if (!resultado.ok) {
    console.error(`[email] Fallo enviando ${tipo} al lead ${leadId}:`, resultado.error);
  }
  return resultado.ok;
}

async function actualizarRegistro(
  supabase: SupabaseClient,
  registroId: number,
  resultado: ResultadoEnvio,
) {
  const { error } = await supabase
    .from("email_log")
    .update(
      resultado.ok
        ? {
            status: "sent",
            resend_id: resultado.id,
            error: null,
            sent_at: new Date().toISOString(),
          }
        : { status: "error", error: resultado.error },
    )
    .eq("id", registroId);
  if (error) {
    console.error("[email] Error actualizando email_log:", error.message);
  }
}

// ——— Carga de datos ———

type FilaLead = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  timeline: string | null;
  financing: string | null;
  score: number;
  category: string | null;
  conversations: {
    message_count: number;
    suspicious_level: number;
    suspicious_reason: string | null;
  } | null;
};

async function cargarLead(
  supabase: SupabaseClient,
  leadId: number,
): Promise<DatosLeadEmail | null> {
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, name, email, phone, budget, timeline, financing, score, category, conversations(message_count, suspicious_level, suspicious_reason)",
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[email] Error cargando lead:", error.message);
    return null;
  }
  const fila = data as unknown as FilaLead;
  return {
    id: fila.id,
    name: fila.name,
    email: fila.email,
    phone: fila.phone,
    budget: fila.budget,
    timeline: fila.timeline,
    financing: fila.financing,
    score: fila.score,
    category: fila.category,
    messageCount: fila.conversations?.message_count ?? 0,
    suspiciousLevel: fila.conversations?.suspicious_level ?? 0,
    suspiciousReason: fila.conversations?.suspicious_reason ?? null,
  };
}

function plantillaPara(tipo: TipoEmail, lead: DatosLeadEmail): Plantilla {
  switch (tipo) {
    case "owner_hot_alert":
      return plantillaAlertaHot(lead, `${SITE_URL}/admin/lead/${lead.id}`);
    case "welcome_hot":
      // Regla de seguridad del proyecto: el teléfono de Cristian SOLO se
      // revela vía servidor a leads que calificaron HOT.
      return plantillaBienvenidaHot(lead, SITE_URL, process.env.CRISTIAN_PHONE);
    case "welcome_warm":
      return plantillaBienvenidaWarm(lead, SITE_URL);
    case "welcome_cold":
      return plantillaBienvenidaCold(lead, SITE_URL);
    case "followup_d1":
      return plantillaSeguimientoD1(lead, SITE_URL);
    case "followup_d3":
      return plantillaSeguimientoD3(lead, SITE_URL);
    case "followup_d7":
      return plantillaSeguimientoD7(lead, SITE_URL);
  }
}

async function alertarACristian(supabase: SupabaseClient, lead: DatosLeadEmail) {
  await enviarConCandado(
    supabase,
    lead.id,
    "owner_hot_alert",
    NOTIFY_EMAIL,
    plantillaPara("owner_hot_alert", lead),
  );
}

async function enviarBienvenida(supabase: SupabaseClient, lead: DatosLeadEmail) {
  if (!puedeEnviarALeads()) return;
  const tipo: TipoEmail =
    lead.category === "hot"
      ? "welcome_hot"
      : lead.category === "warm"
        ? "welcome_warm"
        : "welcome_cold";
  const ok = await enviarConCandado(
    supabase,
    lead.id,
    tipo,
    lead.email,
    plantillaPara(tipo, lead),
    NOTIFY_EMAIL,
  );
  if (ok && tipo === "welcome_hot" && process.env.CRISTIAN_PHONE) {
    await supabase
      .from("leads")
      .update({ phone_revealed: true })
      .eq("id", lead.id);
  }
}

// ——— Puntos de entrada ———

// Al registrarse un lead (formulario del chat): alerta a Cristian si es HOT
// y bienvenida al lead según su categoría. Nunca lanza: corre en after().
export async function notificarLeadNuevo(leadId: number) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;
    const lead = await cargarLead(supabase, leadId);
    if (!lead) return;
    if (lead.category === "hot") await alertarACristian(supabase, lead);
    await enviarBienvenida(supabase, lead);
  } catch (e) {
    console.error("[email] Error notificando lead nuevo:", e);
  }
}

// Cuando la charla sube el puntaje hasta HOT después de registrado:
// Cristian se entera igual (el candado evita avisos repetidos).
export async function notificarSiCalentoAHot(leadId: number) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;
    const lead = await cargarLead(supabase, leadId);
    if (lead?.category === "hot") await alertarACristian(supabase, lead);
  } catch (e) {
    console.error("[email] Error notificando lead caliente:", e);
  }
}

// ——— Cron diario: reintentos + seguimientos día 1/3/7 ———

const VENTANAS_SEGUIMIENTO = [
  { tipo: "followup_d7" as const, minDias: 7, maxDias: 14 },
  { tipo: "followup_d3" as const, minDias: 3, maxDias: 7 },
  { tipo: "followup_d1" as const, minDias: 1, maxDias: 3 },
];

async function reintentarFallidos(supabase: SupabaseClient): Promise<number> {
  // Reintenta errores y envíos "colgados" (pending viejo = el proceso murió
  // a mitad de camino). Los 15 minutos de gracia evitan pisar uno en curso.
  const hace15Min = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("email_log")
    .select("id, lead_id, email_type, status, sent_at")
    .or(`status.eq.error,and(status.eq.pending,sent_at.lt.${hace15Min})`)
    .limit(50);

  if (error) {
    console.error("[cron] Error buscando emails fallidos:", error.message);
    return 0;
  }

  let reintentados = 0;
  for (const fila of data ?? []) {
    const tipo = fila.email_type as TipoEmail;
    const esParaCristian = tipo === "owner_hot_alert";
    if (!esParaCristian && !puedeEnviarALeads()) continue;

    const lead = await cargarLead(supabase, fila.lead_id);
    if (!lead) continue;

    const resultado = await enviarEmail({
      to: esParaCristian ? NOTIFY_EMAIL : lead.email,
      replyTo: esParaCristian ? undefined : NOTIFY_EMAIL,
      ...plantillaPara(tipo, lead),
    });
    await actualizarRegistro(supabase, fila.id, resultado);
    if (resultado.ok) reintentados += 1;
  }
  return reintentados;
}

async function enviarSeguimientos(supabase: SupabaseClient): Promise<number> {
  // Seguimientos solo para leads WARM aún no contactados por Cristian.
  // La ventana de cada email evita molestar tarde: pasados 14 días, silencio.
  if (!puedeEnviarALeads()) return 0;

  const hace14Dias = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("leads")
    .select("id, created_at")
    .eq("category", "warm")
    .eq("status", "new")
    .gte("created_at", hace14Dias);

  if (error) {
    console.error("[cron] Error buscando leads para seguimiento:", error.message);
    return 0;
  }

  let enviados = 0;
  for (const fila of data ?? []) {
    const edadDias =
      (Date.now() - new Date(fila.created_at).getTime()) / (24 * 60 * 60 * 1000);
    const ventana = VENTANAS_SEGUIMIENTO.find(
      (v) => edadDias >= v.minDias && edadDias < v.maxDias,
    );
    if (!ventana) continue;

    const lead = await cargarLead(supabase, fila.id);
    if (!lead) continue;
    const ok = await enviarConCandado(
      supabase,
      lead.id,
      ventana.tipo,
      lead.email,
      plantillaPara(ventana.tipo, lead),
      NOTIFY_EMAIL,
    );
    if (ok) enviados += 1;
  }
  return enviados;
}

export async function correrCronDeEmails() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "base de datos no configurada" };
  const reintentados = await reintentarFallidos(supabase);
  const seguimientos = await enviarSeguimientos(supabase);
  return { reintentados, seguimientos };
}
