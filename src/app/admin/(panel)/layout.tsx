import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminClaims } from "@/lib/supabase-auth";
import { cerrarSesion } from "@/app/admin/actions";

// Guard del panel: sin sesión válida del administrador no se renderiza
// nada. El proxy ya filtró, pero esta capa no confía en nadie.
export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const claims = await getAdminClaims();
  if (!claims) redirect("/admin/login");

  return (
    <>
      <header className="border-b border-agua-borde bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="font-display text-xl font-semibold">
            Panel de Cristian
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-bold text-magdalena-suave hover:text-magdalena"
            >
              Ver la página
            </Link>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="h-10 rounded-xl border border-agua-borde px-4 text-sm font-bold hover:bg-agua focus-visible:outline-2 focus-visible:outline-mango-oscuro"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </>
  );
}
