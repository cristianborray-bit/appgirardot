"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import galeria from "../../content/galeria.json";

// Galería y video tour. El contenido viene de content/galeria.json (editable
// por Cristian); las fotos viven en el bucket público `galeria` de Supabase
// Storage. Mientras no haya material, la sección entera desaparece.
//
// Firma visual: mosaico "bento" con la primera foto destacada en grande y el
// video como una pieza más del mosaico. Cada foto se toca para verla en
// grande en un lightbox con navegación (igual en mobile y desktop).

type Foto = { archivo: string; titulo: string };

const FOTOS = galeria.fotos as Foto[];
const VIDEO_ID = galeria.video_youtube_id;

// Ritmo de tamaños para que el mosaico no se vea como una grilla plana.
const PATRON_MOSAICO = ["row-span-2", "", "", "sm:col-span-2", "", ""];

// Cuántas fotos del mosaico (sin contar la destacada ni el video) se muestran
// de entrada. En datos móviles, mostrar las 20 de una dispara demasiadas
// descargas a la vez y la página se siente lenta o congelada; con "ver más"
// el resto se pide solo cuando el visitante lo pide.
const LIMITE_INICIAL = 6;

function fotoUrl(archivo: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/galeria/${encodeURIComponent(archivo)}`;
}

function ExpandirIcono() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlechaIcono({ direccion }: { direccion: "izquierda" | "derecha" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d={direccion === "izquierda" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CerrarIcono() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FotoTile({
  foto,
  indice,
  span,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  preload,
  onAbrir,
}: {
  foto: Foto;
  indice: number;
  span: string;
  sizes?: string;
  preload?: boolean;
  onAbrir: (indice: number, trigger: HTMLButtonElement) => void;
}) {
  const [error, setError] = useState(false);

  return (
    <li
      className={`relative overflow-hidden rounded-2xl border border-agua-borde bg-agua ${span}`}
    >
      <button
        type="button"
        onClick={(e) => onAbrir(indice, e.currentTarget)}
        aria-label={`Ver foto en grande: ${foto.titulo}`}
        className="group absolute inset-0 h-full w-full"
      >
        {error ? (
          <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-sm text-magdalena-suave">
            No se pudo cargar
          </span>
        ) : (
          <Image
            src={fotoUrl(foto.archivo)}
            alt={foto.titulo}
            fill
            sizes={sizes}
            preload={preload}
            onError={() => setError(true)}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        )}
        <span className="absolute inset-0 bg-magdalena/0 transition-colors group-hover:bg-magdalena/10" />
        {!error && (
          <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-magdalena opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <ExpandirIcono />
          </span>
        )}
      </button>
    </li>
  );
}

export function Galeria() {
  const [abierta, setAbierta] = useState<number | null>(null);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  // Índice de la foto que falló al cargar en el lightbox (o null si ninguna).
  // Se guarda el índice, no un booleano, para no necesitar un efecto que
  // "reinicie" el error al cambiar de foto: simplemente se compara con
  // `abierta` al renderizar.
  const [errorGrande, setErrorGrande] = useState<number | null>(null);
  const ultimoTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogoRef = useRef<HTMLDivElement>(null);

  const cerrar = useCallback(() => {
    setAbierta(null);
    ultimoTriggerRef.current?.focus();
  }, []);

  const anterior = useCallback(() => {
    setAbierta((i) => (i === null ? null : (i - 1 + FOTOS.length) % FOTOS.length));
  }, []);

  const siguiente = useCallback(() => {
    setAbierta((i) => (i === null ? null : (i + 1) % FOTOS.length));
  }, []);

  const abrir = useCallback((indice: number, trigger: HTMLButtonElement) => {
    ultimoTriggerRef.current = trigger;
    setAbierta(indice);
  }, []);

  useEffect(() => {
    if (abierta === null) return;

    // La página de atrás queda congelada: un solo scroll, el del lightbox.
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    dialogoRef.current?.focus();

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") siguiente();
    };
    window.addEventListener("keydown", alTeclear);

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierta, cerrar, anterior, siguiente]);

  if (FOTOS.length === 0 && !VIDEO_ID) return null;

  const [hero, ...resto] = FOTOS;
  const restoVisible = mostrarTodas ? resto : resto.slice(0, LIMITE_INICIAL);
  const restantes = resto.length - restoVisible.length;
  const fotoAbierta = abierta !== null ? FOTOS[abierta] : null;

  return (
    <section
      aria-label="Fotos y video del apartamento"
      className="mx-auto w-full max-w-6xl px-4 py-10"
    >
      <p className="text-sm font-bold uppercase tracking-widest text-mango-oscuro">
        Fotos y video
      </p>
      <h2 className="text-balance font-display text-3xl font-semibold">
        Conócelo por dentro
      </h2>
      {FOTOS.length > 0 && (
        <p className="mt-1 text-magdalena-suave">
          Toca cualquier foto para verla en grande.
        </p>
      )}

      <ul className="mt-6 grid grid-cols-2 auto-rows-[150px] grid-flow-row-dense gap-3 sm:grid-cols-3 sm:auto-rows-[170px] lg:grid-cols-4 lg:auto-rows-[190px]">
        {hero && (
          <FotoTile
            foto={hero}
            indice={0}
            span="col-span-2 row-span-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
            preload
            onAbrir={abrir}
          />
        )}

        {VIDEO_ID && (
          <li className="relative row-span-2 overflow-hidden rounded-2xl border border-agua-borde bg-magdalena">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
              title="Video tour del apartamento"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </li>
        )}

        {restoVisible.map((foto, i) => (
          <FotoTile
            key={foto.archivo}
            foto={foto}
            indice={i + 1}
            span={PATRON_MOSAICO[i % PATRON_MOSAICO.length]}
            onAbrir={abrir}
          />
        ))}
      </ul>

      {restantes > 0 && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setMostrarTodas(true)}
            className="h-12 rounded-xl bg-mango-oscuro px-6 font-bold text-white hover:bg-magdalena focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mango-oscuro"
          >
            Ver {restantes} fotos más
          </button>
        </div>
      )}

      {fotoAbierta && abierta !== null && (
        <div
          ref={dialogoRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={fotoAbierta.titulo}
          onClick={cerrar}
          className="lightbox-fondo fixed inset-0 z-50 flex items-center justify-center bg-magdalena/95 p-4 outline-none backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <CerrarIcono />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              anterior();
            }}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-4"
          >
            <FlechaIcono direccion="izquierda" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative h-[78vh] w-[90vw]">
              {errorGrande === abierta ? (
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/10 text-center text-white">
                  No se pudo cargar esta foto.
                </div>
              ) : (
                <Image
                  src={fotoUrl(fotoAbierta.archivo)}
                  alt={fotoAbierta.titulo}
                  fill
                  sizes="90vw"
                  quality={90}
                  onError={() => setErrorGrande(abierta)}
                  className="rounded-xl object-contain"
                />
              )}
            </div>
            <p className="text-center text-white">
              {fotoAbierta.titulo}
              <span className="ml-2 text-white/60">
                {abierta + 1} / {FOTOS.length}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              siguiente();
            }}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4"
          >
            <FlechaIcono direccion="derecha" />
          </button>
        </div>
      )}
    </section>
  );
}
