// Límite de velocidad en memoria por instancia serverless. No es perfecto
// (cada instancia tiene su propio mapa), pero corta el abuso básico y protege
// la cuota de OpenAI sin servicios extra. Límites estrictos llegan en Fase 5.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Evita crecimiento sin límite del mapa en instancias longevas
  if (hits.size > 5_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => t <= windowStart)) hits.delete(k);
    }
  }

  return false;
}
