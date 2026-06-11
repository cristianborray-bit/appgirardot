import type { UIMessage } from "ai";

// Contenido y utilidades del chat compartidos entre cliente y servidor
// (sin dependencias de Node: seguro para componentes de cliente).

// Contrato único de la clave de sesión: el cliente la genera y el servidor
// la valida con el MISMO patrón para que no puedan divergir.
export const SESSION_KEY_PATTERN = /^[\w-]{8,64}$/;

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
