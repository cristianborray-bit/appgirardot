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
  preload,
  onAbrir,
}: {
  foto: Foto;
  indice: number;
  span: string;
  preload?: boolean;
  onAbrir: (indice: number, trigger: HTMLButtonElement) => void;
}) {
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
        <Image
          src={fotoUrl(foto.archivo)}
          alt={foto.titulo}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          preload={preload}
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-magdalena/0 transition-colors group-hover:bg-magdalena/10" />
        <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-magdalena opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ExpandirIcono />
        </span>
      </button>
    </li>
  );
}

export function Galeria() {
  const [abierta, setAbierta] = useState<number | null>(null);
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
          <FotoTile foto={hero} indice={0} span="col-span-2 row-span-2" preload onAbrir={abrir} />
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

        {resto.map((foto, i) => (
          <FotoTile
            key={foto.archivo}
            foto={foto}
            indice={i + 1}
            span={PATRON_MOSAICO[i % PATRON_MOSAICO.length]}
            onAbrir={abrir}
          />
        ))}
      </ul>

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
            className="flex max-h-full max-w-full flex-col items-center"
          >
            <Image
              src={fotoUrl(fotoAbierta.archivo)}
              alt={fotoAbierta.titulo}
              width={1200}
              height={1600}
              sizes="90vw"
              className="h-auto max-h-[78vh] w-auto max-w-[90vw] rounded-xl object-contain"
            />
            <p className="mt-3 text-center text-white">
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
