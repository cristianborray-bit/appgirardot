import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de servidor con la secret key (bypasea RLS). NUNCA importar desde
// componentes de cliente: la clave solo existe como env var del servidor.
let client: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    // Sin credenciales el chat sigue funcionando; solo se pierde la
    // persistencia. Se registra una vez para diagnóstico en Vercel.
    console.warn("[supabase] Variables no configuradas: no se guardarán conversaciones");
    client = null;
    return client;
  }

  client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
