// Plantillas de los emails de Fase 4, en español cálido y cortas.
// Son funciones puras: reciben datos, devuelven { subject, html }.
// El teléfono de Cristian SOLO entra aquí vía servidor (welcome_hot);
// jamás aparece en código cliente ni en el prompt del bot.

import "server-only";
import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  FINANCING_OPTIONS,
  labelDe,
} from "@/lib/lead-content";

export type Plantilla = { subject: string; html: string };

export type DatosLeadEmail = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  timeline: string | null;
  financing: string | null;
  score: number;
  category: string | null;
  messageCount: number;
  suspiciousLevel: number;
  suspiciousReason: string | null;
};

const ESTILO_BASE =
  "margin:0;padding:24px;background:#f2f7f8;font-family:Arial,Helvetica,sans-serif;color:#16334f;line-height:1.6;";
const ESTILO_TARJETA =
  "max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;";
const ESTILO_BOTON =
  "display:inline-block;background:#c45c10;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:12px;";

function envoltura(contenido: string, conAvisoSeguridad: boolean): string {
  const aviso = conAvisoSeguridad
    ? `<p style="margin-top:28px;padding:12px 16px;background:#fdf3e7;border-radius:12px;font-size:14px;">🛡️ <strong>Seguridad:</strong> nunca te pediremos anticipos, consignaciones ni datos bancarios para agendar una visita.</p>`
    : "";
  return `<!doctype html><html lang="es"><body style="${ESTILO_BASE}"><div style="${ESTILO_TARJETA}">${contenido}${aviso}<p style="margin-top:28px;font-size:12px;color:#6b7f93;">Apartamento en Aqualina Orange · Girardot, Colombia</p></div></body></html>`;
}

// Lo que escribió el visitante (nombre, correo, celular) se escapa SIEMPRE
// antes de entrar al HTML: sin esto, un "nombre" malicioso podría inyectar
// enlaces falsos en el email que le llega a Cristian.
function escapar(texto: string): string {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function primerNombre(name: string): string {
  return escapar(name.trim().split(/\s+/)[0]);
}

// ——— Para Cristian: alerta inmediata de lead caliente ———

export function plantillaAlertaHot(
  lead: DatosLeadEmail,
  urlPanel: string,
): Plantilla {
  const alerta =
    lead.suspiciousLevel > 0
      ? `<p style="padding:12px 16px;background:#fdf3e7;border:1px solid #e8b27d;border-radius:12px;">🚩 <strong>Señales de alerta:</strong> ${escapar(lead.suspiciousReason ?? "revisar la conversación con cuidado")}</p>`
      : "";
  return {
    subject: `🔥 Lead caliente: ${lead.name} — ${lead.score} puntos`,
    html: envoltura(
      `<h1 style="font-size:22px;margin:0 0 16px;">🔥 Nuevo interesado caliente</h1>
<p style="font-size:18px;margin:0 0 4px;"><strong>${escapar(lead.name)}</strong></p>
<p style="margin:0 0 16px;">✉️ ${escapar(lead.email)}${lead.phone ? `<br>📱 ${escapar(lead.phone)}` : "<br>📱 No dejó celular"}</p>
<table cellpadding="0" cellspacing="0" style="font-size:15px;">
<tr><td style="padding:4px 12px 4px 0;">💰 Presupuesto:</td><td><strong>${labelDe(BUDGET_OPTIONS, lead.budget)}</strong></td></tr>
<tr><td style="padding:4px 12px 4px 0;">📅 Cuándo compra:</td><td><strong>${labelDe(TIMELINE_OPTIONS, lead.timeline)}</strong></td></tr>
<tr><td style="padding:4px 12px 4px 0;">🏦 Cómo paga:</td><td><strong>${labelDe(FINANCING_OPTIONS, lead.financing)}</strong></td></tr>
<tr><td style="padding:4px 12px 4px 0;">💬 Conversación:</td><td><strong>${lead.messageCount} mensajes</strong></td></tr>
</table>
${alerta}
<p style="margin:24px 0;"><a href="${urlPanel}" style="${ESTILO_BOTON}">Ver su ficha y conversación →</a></p>
<p style="font-size:14px;color:#6b7f93;">Respóndele pronto: los compradores calientes se enfrían rápido 🍊</p>`,
      false,
    ),
  };
}

// ——— Para el lead: bienvenida según su categoría ———

export function plantillaBienvenidaHot(
  lead: DatosLeadEmail,
  urlSitio: string,
  telefonoCristian: string | undefined,
): Plantilla {
  const lineaTelefono = telefonoCristian
    ? `<p>¿Prefieres no esperar? Escríbele directo por WhatsApp: <strong>${telefonoCristian}</strong></p>`
    : "";
  return {
    subject: `¡Gracias, ${primerNombre(lead.name)}! Hablemos del apartamento en Aqualina Orange 🍊`,
    html: envoltura(
      `<h1 style="font-size:22px;margin:0 0 16px;">¡Hola, ${primerNombre(lead.name)}!</h1>
<p>Gracias por tu interés en el apartamento de <strong>Aqualina Orange</strong> en Girardot. Cristian, el dueño, ya recibió tus datos y <strong>te contactará muy pronto</strong>.</p>
${lineaTelefono}
<p>Mientras tanto, puedes seguir preguntando lo que quieras en el chat:</p>
<p style="margin:24px 0;"><a href="${urlSitio}" style="${ESTILO_BOTON}">Volver al chat 💬</a></p>
<p style="font-size:14px;color:#6b7f93;">Si respondes este correo, le llega directo a Cristian.</p>`,
      true,
    ),
  };
}

export function plantillaBienvenidaWarm(
  lead: DatosLeadEmail,
  urlSitio: string,
): Plantilla {
  return {
    subject: "Recibimos tus datos — apartamento en Aqualina Orange 🍊",
    html: envoltura(
      `<h1 style="font-size:22px;margin:0 0 16px;">¡Hola, ${primerNombre(lead.name)}!</h1>
<p>Gracias por tu interés en el apartamento de <strong>Aqualina Orange</strong> en Girardot. Cristian revisará tus datos y te escribirá pronto.</p>
<p>Si te queda alguna duda mientras tanto, el asistente está disponible a toda hora:</p>
<p style="margin:24px 0;"><a href="${urlSitio}" style="${ESTILO_BOTON}">Volver al chat 💬</a></p>
<p style="font-size:14px;color:#6b7f93;">Si respondes este correo, le llega directo a Cristian.</p>`,
      true,
    ),
  };
}

export function plantillaBienvenidaCold(
  lead: DatosLeadEmail,
  urlSitio: string,
): Plantilla {
  return {
    subject: "Gracias por tu interés en el apartamento de Girardot 🍊",
    html: envoltura(
      `<h1 style="font-size:22px;margin:0 0 16px;">¡Hola, ${primerNombre(lead.name)}!</h1>
<p>Gracias por dejarnos tus datos. Sabemos que comprar apartamento es una decisión que toma su tiempo: cuando sea tu momento, aquí estaremos.</p>
<p>Guarda este correo — el asistente responde tus preguntas a cualquier hora:</p>
<p style="margin:24px 0;"><a href="${urlSitio}" style="${ESTILO_BOTON}">Ver el apartamento 🍊</a></p>
<p style="font-size:14px;color:#6b7f93;">Si respondes este correo, le llega directo a Cristian.</p>`,
      true,
    ),
  };
}

// ——— Para el lead WARM: seguimientos día 1 / 3 / 7 ———

export function plantillaSeguimientoD1(
  lead: DatosLeadEmail,
  urlSitio: string,
): Plantilla {
  return {
    subject: "¿Quedaste con alguna duda del apartamento? 🍊",
    html: envoltura(
      `<p>¡Hola, ${primerNombre(lead.name)}!</p>
<p>Ayer nos dejaste tus datos por el apartamento de <strong>Aqualina Orange</strong> en Girardot. Si te quedó alguna pregunta — precio, financiación, cómo es el conjunto — respóndenos este correo (le llega directo a Cristian) o pregúntale al asistente:</p>
<p style="margin:24px 0;"><a href="${urlSitio}" style="${ESTILO_BOTON}">Preguntar en el chat 💬</a></p>`,
      true,
    ),
  };
}

export function plantillaSeguimientoD3(
  lead: DatosLeadEmail,
  urlSitio: string,
): Plantilla {
  return {
    subject: "Girardot: sol todo el año y una buena inversión 🌴",
    html: envoltura(
      `<p>¡Hola, ${primerNombre(lead.name)}!</p>
<p>El apartamento de <strong>Aqualina Orange</strong> sigue disponible. Girardot tiene clima cálido todo el año y cada vez más gente lo elige para vivir o invertir.</p>
<p>Si quieres retomar la conversación, el asistente te responde al instante — y si respondes este correo, te contesta Cristian en persona.</p>
<p style="margin:24px 0;"><a href="${urlSitio}" style="${ESTILO_BOTON}">Ver el apartamento 🍊</a></p>`,
      true,
    ),
  };
}

export function plantillaSeguimientoD7(
  lead: DatosLeadEmail,
  urlSitio: string,
): Plantilla {
  return {
    subject: "Última notita sobre el apartamento 🍊",
    html: envoltura(
      `<p>¡Hola, ${primerNombre(lead.name)}!</p>
<p>No queremos llenarte el correo: este es el <strong>último mensaje automático</strong> que te enviamos.</p>
<p>El apartamento de Aqualina Orange sigue aquí, y Cristian con gusto te atiende si retomas el contacto. Si ya no estás buscando, ignora este correo y listo. Un abrazo desde Girardot 🌴</p>
<p style="margin:24px 0;"><a href="${urlSitio}" style="${ESTILO_BOTON}">Ver el apartamento 🍊</a></p>`,
      true,
    ),
  };
}
