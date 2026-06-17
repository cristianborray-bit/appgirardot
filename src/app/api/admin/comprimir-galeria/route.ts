import sharp from "sharp";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Herramienta de UN SOLO USO: baja de peso las 5 fotos de cámara sin
// comprimir que causaban la carga lenta/bloqueo en mobile (diagnosticado
// consultando los tamaños reales en Supabase Storage). Pensada para borrarse
// del código en cuanto termine el trabajo — no es una funcionalidad
// permanente del sitio.
//
// Requiere Node.js (no Edge): sharp usa bindings nativos.
export const runtime = "nodejs";
export const maxDuration = 60;

// Token de un solo uso, generado para esta tarea puntual. No protege nada
// de larga duración (a diferencia de CRON_SECRET) y deja de tener efecto en
// cuanto se borre este archivo.
const TOKEN = "f12653acbc91bdbc9d484869c1e124f7";

const ARCHIVOS = [
  "IMG_0648.JPG",
  "IMG_0650.JPG",
  "IMG_0656.JPG",
  "IMG_0659.JPG",
  "IMG_0667.JPG",
];

// Antes de sobrescribir cualquier foto se guarda el original aquí. Esta
// carpeta nunca aparece en la galería: el sitio solo muestra los archivos
// listados por nombre en content/galeria.json.
const CARPETA_RESPALDO = "_original_backup";

// Si el archivo ya pesa menos que esto, asumimos que una corrida anterior ya
// lo comprimió: evita recomprimir (pérdida de calidad) si el endpoint se
// llama dos veces por error.
const YA_LIVIANO = 800_000;

type Resultado = {
  archivo: string;
  antes_kb: number;
  despues_kb?: number;
  reduccion_pct?: number;
  ancho?: number;
  alto?: number;
  escrito: boolean;
  motivo?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("token") !== TOKEN) {
    return new Response("No autorizado.", { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return new Response("Supabase no configurado.", { status: 503 });
  }

  // Por defecto es un simulacro: solo informa, no escribe nada. Hay que
  // pedir confirmar=1 explícitamente para que respalde y sobrescriba.
  const confirmar = searchParams.get("confirmar") === "1";
  const bucket = supabase.storage.from("galeria");
  const resultados: Resultado[] = [];

  for (const archivo of ARCHIVOS) {
    try {
      const { data: blob, error: errorDescarga } = await bucket.download(archivo);
      if (errorDescarga || !blob) {
        resultados.push({
          archivo,
          antes_kb: 0,
          escrito: false,
          motivo: `no se pudo descargar: ${errorDescarga?.message ?? "desconocido"}`,
        });
        continue;
      }

      const original = Buffer.from(await blob.arrayBuffer());

      if (original.length < YA_LIVIANO) {
        resultados.push({
          archivo,
          antes_kb: Math.round(original.length / 1024),
          escrito: false,
          motivo: "ya es liviana, se omite (¿corrida anterior?)",
        });
        continue;
      }

      const comprimido = await sharp(original)
        .rotate() // aplica la orientación EXIF antes de tirar los metadatos
        .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 78 })
        .toBuffer();

      if (comprimido.length < 15_000 || comprimido.length >= original.length) {
        resultados.push({
          archivo,
          antes_kb: Math.round(original.length / 1024),
          escrito: false,
          motivo: "la versión comprimida no mejoró, se omite por seguridad",
        });
        continue;
      }

      // Confirma que el resultado es una imagen válida antes de escribir.
      const metaFinal = await sharp(comprimido).metadata();
      if (!metaFinal.width || !metaFinal.height) {
        resultados.push({
          archivo,
          antes_kb: Math.round(original.length / 1024),
          escrito: false,
          motivo: "la versión comprimida salió inválida, se omite",
        });
        continue;
      }

      if (confirmar) {
        const { data: yaExiste } = await bucket.list(CARPETA_RESPALDO, {
          search: archivo,
        });
        if (!yaExiste || yaExiste.length === 0) {
          await bucket.upload(`${CARPETA_RESPALDO}/${archivo}`, original, {
            contentType: blob.type || "image/jpeg",
            upsert: false,
          });
        }

        const { error: errorSubida } = await bucket.upload(archivo, comprimido, {
          contentType: "image/jpeg",
          upsert: true,
        });
        if (errorSubida) {
          resultados.push({
            archivo,
            antes_kb: Math.round(original.length / 1024),
            escrito: false,
            motivo: `falló la subida: ${errorSubida.message}`,
          });
          continue;
        }
      }

      resultados.push({
        archivo,
        antes_kb: Math.round(original.length / 1024),
        despues_kb: Math.round(comprimido.length / 1024),
        reduccion_pct: Math.round((1 - comprimido.length / original.length) * 100),
        ancho: metaFinal.width,
        alto: metaFinal.height,
        escrito: confirmar,
      });
    } catch (e) {
      resultados.push({
        archivo,
        antes_kb: 0,
        escrito: false,
        motivo: `error inesperado: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  }

  return Response.json({ modo: confirmar ? "real" : "simulacro", resultados });
}
