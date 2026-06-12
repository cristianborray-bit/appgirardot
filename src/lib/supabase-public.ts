// Identificadores PÚBLICOS del proyecto Supabase (la URL y la publishable
// key están diseñadas para viajar al navegador; la seguridad real la dan
// RLS y la validación de sesión en el servidor). El env de Vercel manda;
// estos valores son el respaldo para no exigir más configuración manual.

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://umqotxoixboqkgerlupy.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_fuME1x8iQvwRCtlXDOMSqw_XGybHzFC";
