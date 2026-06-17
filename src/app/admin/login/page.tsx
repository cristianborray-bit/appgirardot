"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserAuthClient } from "@/lib/supabase-browser";

export default function LoginAdmin() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserAuthClient());
  // Si llega de un link de recuperación vencido o ya usado, Supabase agrega
  // #error=... a la URL (nunca llega al servidor: solo se puede leer aquí).
  const [error, setError] = useState<string | null>(() =>
    typeof window !== "undefined" && window.location.hash.includes("error=")
      ? "Ese link de recuperación ya venció o ya se usó. Pide uno nuevo desde Supabase y ábrelo apenas te llegue."
      : null,
  );
  const [enviando, setEnviando] = useState(false);
  const [modoRecuperacion, setModoRecuperacion] = useState(false);

  // Al volver de un link de "recuperar contraseña" válido, Supabase dispara
  // el evento PASSWORD_RECOVERY y se muestra el formulario de clave nueva.
  useEffect(() => {
    if (window.location.hash.includes("error=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        window.history.replaceState(null, "", window.location.pathname);
        setError(null);
        setModoRecuperacion(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(datos.get("correo") ?? "").trim(),
      password: String(datos.get("clave") ?? ""),
    });

    if (authError) {
      setError("Correo o contraseña incorrectos. Inténtalo de nuevo.");
      setEnviando(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function guardarClaveNueva(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    setError(null);

    const { error: authError } = await supabase.auth.updateUser({
      password: String(datos.get("clave-nueva") ?? ""),
    });

    if (authError) {
      setError("No se pudo guardar la contraseña. Inténtalo de nuevo.");
      setEnviando(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  if (modoRecuperacion) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
        <form
          onSubmit={guardarClaveNueva}
          className="space-y-5 rounded-3xl border border-agua-borde bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="text-center">
            <p aria-hidden="true" className="text-4xl">
              🔑
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold">
              Pon tu contraseña nueva
            </h1>
            <p className="mt-1 text-magdalena-suave">
              La vas a usar para entrar de ahora en adelante.
            </p>
          </div>

          <div>
            <label htmlFor="login-clave-nueva" className="font-bold">
              Contraseña nueva
            </label>
            <input
              id="login-clave-nueva"
              name="clave-nueva"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1.5 h-12 w-full rounded-xl border border-agua-borde px-4 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mango-oscuro"
            />
          </div>

          {error && (
            <p
              role="status"
              className="rounded-2xl border border-mango/40 bg-mango-suave px-4 py-3"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="h-12 w-full rounded-xl bg-mango-oscuro px-5 font-bold text-white hover:bg-magdalena disabled:opacity-50 disabled:hover:bg-mango-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro"
          >
            {enviando ? "Guardando…" : "Guardar y entrar"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <form
        onSubmit={entrar}
        className="space-y-5 rounded-3xl border border-agua-borde bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="text-center">
          <p aria-hidden="true" className="text-4xl">
            🔐
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Panel de Cristian
          </h1>
          <p className="mt-1 text-magdalena-suave">
            Solo para el dueño del apartamento.
          </p>
        </div>

        <div>
          <label htmlFor="login-correo" className="font-bold">
            Tu correo
          </label>
          <input
            id="login-correo"
            name="correo"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 h-12 w-full rounded-xl border border-agua-borde px-4 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mango-oscuro"
          />
        </div>
        <div>
          <label htmlFor="login-clave" className="font-bold">
            Tu contraseña
          </label>
          <input
            id="login-clave"
            name="clave"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1.5 h-12 w-full rounded-xl border border-agua-borde px-4 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mango-oscuro"
          />
        </div>

        {error && (
          <p
            role="status"
            className="rounded-2xl border border-mango/40 bg-mango-suave px-4 py-3"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="h-12 w-full rounded-xl bg-mango-oscuro px-5 font-bold text-white hover:bg-magdalena disabled:opacity-50 disabled:hover:bg-mango-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
