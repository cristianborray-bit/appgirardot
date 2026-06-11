import "server-only";

// Cerebro de calificación (Fase 3). Pesos del plan V5.1 de Cristian:
// presupuesto 40 + urgencia 30 + financiación 20 + interacción 10 = 100.
// El detalle por opción es ajustable aquí sin tocar nada más.

const PUNTOS_PRESUPUESTO: Record<string, number> = {
  "300-350M": 40, // el rango del apto ($320-350M)
  "350M+": 40,
  "250-300M": 20,
  "200-250M": 5,
};

const PUNTOS_URGENCIA: Record<string, number> = {
  "1-3m": 30,
  "3-6m": 20,
  "6-12m": 10,
  sin_prisa: 0,
};

const PUNTOS_FINANCIACION: Record<string, number> = {
  contado: 20,
  credito_aprobado: 15,
  buscando_credito: 8,
  no_sabe: 0,
};

function puntosInteraccion(messageCount: number): number {
  if (messageCount >= 10) return 10;
  if (messageCount >= 4) return 7;
  if (messageCount >= 1) return 4;
  return 0;
}

export function calcularScore({
  budget,
  timeline,
  financing,
  messageCount,
}: {
  budget: string | null;
  timeline: string | null;
  financing: string | null;
  messageCount: number;
}): { score: number; category: "hot" | "warm" | "cold" } {
  const score =
    (budget ? (PUNTOS_PRESUPUESTO[budget] ?? 0) : 0) +
    (timeline ? (PUNTOS_URGENCIA[timeline] ?? 0) : 0) +
    (financing ? (PUNTOS_FINANCIACION[financing] ?? 0) : 0) +
    puntosInteraccion(messageCount);

  const category = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";
  return { score, category };
}

// Detección anti-estafa por patrones (los timos típicos de venta de
// inmuebles en Colombia). NUNCA bloquea: solo marca la conversación para
// que Cristian la revise con ojo. Nivel 1 = revisar; nivel 2 = alerta.

const PATRONES_SOSPECHA: Array<{ patron: RegExp; motivo: string; nivel: 1 | 2 }> = [
  { patron: /anticip|adelant[oa]|separ(ar|o|e).{0,20}(apto|apartamento|negocio)|reserv(ar|a).{0,15}(con|por).{0,15}(plata|dinero|pago)/i, motivo: "habla de anticipos o separación con dinero", nivel: 2 },
  { patron: /consign|transfer[ei]|giro|nequi|daviplata|western union|moneygram/i, motivo: "menciona medios de pago a distancia", nivel: 2 },
  { patron: /sin (ir a )?(visitar|verlo|ver el|conocerlo)|compro.{0,25}sin ver/i, motivo: "quiere comprar sin visitar", nivel: 2 },
  { patron: /(estoy|vivo|trabajo).{0,20}(exterior|extranjero|fuera del pa[ií]s)/i, motivo: "dice estar fuera del país", nivel: 1 },
  { patron: /mi (agente|representante|abogado|asistente).{0,30}(recoge|pasa|lleva|entrega)/i, motivo: "ofrece enviar un tercero", nivel: 2 },
  { patron: /cheque|sobreprecio|te pago de m[aá]s|comisi[oó]n.{0,15}(devuelv|reembols)/i, motivo: "patrón de sobrepago/reembolso", nivel: 2 },
  { patron: /datos bancarios|n[uú]mero de cuenta|tarjeta de cr[eé]dito/i, motivo: "pide datos bancarios", nivel: 2 },
];

export function detectarSospecha(
  textosDelVisitante: string[],
): { nivel: 1 | 2; motivo: string } | null {
  const texto = textosDelVisitante.join("\n");
  let nivel: 0 | 1 | 2 = 0;
  const motivos: string[] = [];

  for (const { patron, motivo, nivel: n } of PATRONES_SOSPECHA) {
    if (patron.test(texto)) {
      nivel = Math.max(nivel, n) as 1 | 2;
      motivos.push(motivo);
    }
  }

  if (nivel === 0) return null;
  // Varias señales leves juntas también son alerta.
  if (motivos.length >= 2) nivel = 2;
  return { nivel, motivo: motivos.join("; ") };
}
