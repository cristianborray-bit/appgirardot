import type { UIMessage } from "ai";

// Contenido y utilidades del chat compartidos entre cliente y servidor
// (sin dependencias de Node: seguro para componentes de cliente).

// Contrato único de la clave de sesión: el cliente la genera y el servidor
// la valida con el MISMO patrón para que no puedan divergir.
export const SESSION_KEY_PATTERN = /^[\w-]{8,64}$/;

// La misma clave la usan el chat y el formulario de contacto: así el lead
// queda ligado a su conversación. Vive en localStorage del navegador.
export function getSessionKey(): string {
  if (typeof window === "undefined") return "";
  const stored = window.localStorage.getItem("cb_session");
  if (stored && SESSION_KEY_PATTERN.test(stored)) return stored;
  const fresh = crypto.randomUUID();
  window.localStorage.setItem("cb_session", fresh);
  return fresh;
}

// Origen del visitante (utm_source/medium/campaign del anuncio que clickeó).
// Mismo patrón de "primer toque" que cb_session: se fija una vez por
// navegador y no se pisa en visitas posteriores sin esos parámetros.
export const UTM_PATTERN = /^[\w.-]{1,100}$/;

export type UtmParams = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

function utmLimpio(valor: string | null): string | null {
  return valor && UTM_PATTERN.test(valor) ? valor : null;
}

export function getUtmParams(): UtmParams {
  const vacio: UtmParams = { utmSource: null, utmMedium: null, utmCampaign: null };
  if (typeof window === "undefined") return vacio;

  const params = new URLSearchParams(window.location.search);
  const deUrl: UtmParams = {
    utmSource: utmLimpio(params.get("utm_source")),
    utmMedium: utmLimpio(params.get("utm_medium")),
    utmCampaign: utmLimpio(params.get("utm_campaign")),
  };
  if (deUrl.utmSource) {
    window.localStorage.setItem("cb_utm", JSON.stringify(deUrl));
    return deUrl;
  }

  const guardado = window.localStorage.getItem("cb_utm");
  if (!guardado) return vacio;
  try {
    return { ...vacio, ...(JSON.parse(guardado) as Partial<UtmParams>) };
  } catch {
    return vacio;
  }
}

// "¿Ya dejó sus datos?" como mini-store sobre localStorage, para leerlo con
// useSyncExternalStore (seguro en SSR y sin setState dentro de efectos).
let leadListeners: Array<() => void> = [];

export function marcarLeadEnviado(nombre: string) {
  window.localStorage.setItem("cb_lead", nombre);
  for (const avisar of leadListeners) avisar();
}

export function suscribirLeadEnviado(listener: () => void) {
  leadListeners.push(listener);
  return () => {
    leadListeners = leadListeners.filter((l) => l !== listener);
  };
}

export function leadEnviadoSnapshot(): boolean {
  return window.localStorage.getItem("cb_lead") !== null;
}

export function leadEnviadoServerSnapshot(): boolean {
  return false;
}

export function messageText(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

// Mensaje de bienvenida fijo (no lo genera el modelo: es idéntico para todos
// y deja la transparencia establecida desde el primer segundo).
export const WELCOME_MESSAGE = `¡Hola! 👋 Soy el asistente virtual que Cristian creó para su apartamento en Aqualina Orange, Girardot.

Te lo digo de frente: soy una inteligencia artificial. Cristian me configuró para darte toda la información al instante, a cualquier hora. Él es real, es el único dueño, y si te interesa en serio vas a hablar directamente con él.

¿Dudas de que sea real? Busca "Aqualina Orange" en Google Maps o pregunta en la portería del conjunto.

Toca un botón o escríbeme lo que quieras 👇`;

export const QUICK_REPLIES = [
  { emoji: "🏠", label: "Cuéntame del apartamento" },
  { emoji: "💰", label: "¿Cuánto vale?" },
  { emoji: "📍", label: "¿Dónde queda?" },
  { emoji: "🏊", label: "¿Qué zonas comunes tiene?" },
] as const;
