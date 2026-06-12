// Opciones de calificación del lead, compartidas entre el formulario (cliente)
// y la API (servidor). Los `value` son EXACTAMENTE los valores que aceptan los
// check constraints de la tabla `leads` en Supabase: no cambiarlos sin migrar.

export const BUDGET_OPTIONS = [
  { value: "200-250M", label: "Entre $200 y $250 millones" },
  { value: "250-300M", label: "Entre $250 y $300 millones" },
  { value: "300-350M", label: "Entre $300 y $350 millones" },
  { value: "350M+", label: "Más de $350 millones" },
] as const;

export const TIMELINE_OPTIONS = [
  { value: "1-3m", label: "En 1 a 3 meses" },
  { value: "3-6m", label: "En 3 a 6 meses" },
  { value: "6-12m", label: "En 6 a 12 meses" },
  { value: "sin_prisa", label: "Sin prisa, estoy mirando" },
] as const;

export const FINANCING_OPTIONS = [
  { value: "contado", label: "De contado" },
  { value: "credito_aprobado", label: "Crédito ya aprobado" },
  { value: "buscando_credito", label: "Voy a pedir crédito" },
  { value: "no_sabe", label: "Aún no lo sé" },
] as const;

export type BudgetValue = (typeof BUDGET_OPTIONS)[number]["value"];
export type TimelineValue = (typeof TIMELINE_OPTIONS)[number]["value"];
export type FinancingValue = (typeof FINANCING_OPTIONS)[number]["value"];

// Estados del lead en el embudo de Cristian (mismos valores del check
// constraint de la tabla `leads`).
export const ESTADO_OPTIONS = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "visited", label: "Visitó" },
  { value: "offer", label: "Oferta" },
  { value: "lost", label: "Perdido" },
] as const;

export function labelDe(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export const MAX_NAME_LENGTH = 80;
export const MAX_EMAIL_LENGTH = 120;
export const MAX_PHONE_LENGTH = 20;

// Suficiente para distinguir un correo razonable; la verificación real
// llegará sola cuando Cristian le escriba.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_PATTERN = /^[\d\s()+-]{7,20}$/;
