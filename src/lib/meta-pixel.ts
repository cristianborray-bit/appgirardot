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
