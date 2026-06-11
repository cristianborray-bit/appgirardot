# CristianBot — Apartamento Aqualina Orange (Girardot)

Agente autónomo de venta: una página con chat de IA que responde todo sobre el apartamento, califica a los interesados (HOT/WARM/COLD), detecta intentos de estafa y le avisa a Cristian solo cuando vale la pena.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4) desplegado en **Vercel**
- **Supabase** (Postgres + Auth + Storage) — proyecto `appgirardot`
- **OpenAI** vía Vercel AI SDK (proveedor intercambiable)
- **Resend** para emails automáticos · **Vercel Cron** para seguimientos día 1/3/7

## Documentos clave

- [`PLAN.md`](./PLAN.md) — tablero de control: fases, checkboxes, estado y pendientes
- [`AGENTS.md`](./AGENTS.md) — protocolo de trabajo y reglas de seguridad del proyecto
- [`.env.example`](./.env.example) — variables de entorno requeridas (valores solo en Vercel)

## Desarrollo

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # build de producción
```
