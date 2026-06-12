import { correrCronDeEmails } from "@/lib/emails";

// Cron diario de Vercel (vercel.json): reintenta emails fallidos y envía
// los seguimientos día 1/3/7 a leads WARM. Vercel manda solo el header
// Authorization con CRON_SECRET; sin esa variable el endpoint queda cerrado.

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("Cron no configurado.", { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("No autorizado.", { status: 401 });
  }

  const resumen = await correrCronDeEmails();
  return Response.json(resumen);
}
