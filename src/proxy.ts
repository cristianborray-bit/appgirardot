import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
} from "@/lib/supabase-public";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "cristianborray@gmail.com";

// Portero del panel /admin (convención proxy.ts de Next 16, antes
// "middleware"): refresca la sesión en cada request y redirige al login a
// quien no esté autenticado. El chequeo fino de email se repite en el
// layout del panel y en cada server action (defensa en profundidad).
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // No poner código entre createServerClient y getClaims (doc oficial):
  // getClaims valida la firma del token y refresca la sesión si toca.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const esAdmin = claims?.email === ADMIN_EMAIL;
  const enLogin = request.nextUrl.pathname.startsWith("/admin/login");

  if (!claims && !enLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // C-1: usuario con sesión activa pero que NO es el admin → fuera.
  // Sin esto, cualquier cuenta de Supabase podría llegar a /admin y
  // depender únicamente del layout/actions como barrera (no es suficiente).
  if (claims && !esAdmin && !enLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (esAdmin && enLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: "/admin/:path*",
};
