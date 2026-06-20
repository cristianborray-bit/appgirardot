// ID público del píxel de Meta para Aqualina Orange (no el de pinturas).
// Si no está configurado, el sitio sigue igual: el píxel simplemente no carga.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Se llama solo cuando el formulario "Que Cristian me contacte" se envió
// con éxito (no en cada clic): es la señal que Meta usa para encontrar más
// visitantes parecidos a un comprador real.
export function trackLead() {
  window.fbq?.("track", "Lead");
}

// Se llama UNA vez por visita, cuando la persona envía su PRIMER mensaje al
// bot. Es el eslabón que faltaba en el embudo: distingue a quien de verdad
// inició una conversación de quien solo entró y se fue (PageView). Sirve para
// medir dónde se cae la gente y para que Meta pueda optimizar por visitantes
// que conversan, no por el clic más barato. Evento personalizado: aparece solo
// en Events Manager y desde ahí se puede crear una conversión para la pauta.
export function trackIniciaChat() {
  window.fbq?.("trackCustom", "IniciaChat");
}
