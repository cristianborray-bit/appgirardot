import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
} from "@/lib/supabase-public";

// El único administrador permitido. La cuenta de auth existe solo para él,
// pero esta verificación explícita es defensa en profundidad.
export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "cristianborray@gmail.com";

// Cliente de auth con cookies (patrón oficial @supabase/ssr para App Router).
export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Llamado desde un Server Component: lo ignora porque el proxy
          // se encarga de refrescar la sesión.
        }
      },
    },
  });
}

// getClaims valida la firma del token contra las llaves públicas del
// proyecto en cada request (lo que la doc exige para proteger páginas).
// Devuelve los claims SOLO si es el administrador.
export async function getAdminClaims() {
  const supabase = await createAuthClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims || claims.email !== ADMIN_EMAIL) return null;
  return claims;
}
