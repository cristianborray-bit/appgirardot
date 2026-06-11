import Image from "next/image";
import galeria from "../../content/galeria.json";

// Galería y video tour. El contenido viene de content/galeria.json (editable
// por Cristian); las fotos viven en el bucket público `galeria` de Supabase
// Storage. Mientras no haya material, la sección entera desaparece.

type Foto = { archivo: string; titulo: string };

const FOTOS = galeria.fotos as Foto[];
const VIDEO_ID = galeria.video_youtube_id;

function fotoUrl(archivo: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/galeria/${archivo}`;
}

export function Galeria() {
  if (FOTOS.length === 0 && !VIDEO_ID) return null;

  return (
    <section
      aria-label="Fotos y video del apartamento"
      className="mx-auto w-full max-w-6xl px-4 py-10"
    >
      <h2 className="text-balance font-display text-3xl font-semibold">
        Conócelo por dentro
      </h2>

      {FOTOS.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FOTOS.map(({ archivo, titulo }) => (
            <li
              key={archivo}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-agua-borde bg-agua"
            >
              <Image
                src={fotoUrl(archivo)}
                alt={titulo}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}

      {VIDEO_ID && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl border border-agua-borde bg-magdalena">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
            title="Video tour del apartamento"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      )}
    </section>
  );
}
