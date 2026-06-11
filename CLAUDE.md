# CristianBot — appgirardot

Agente de venta del apartamento Aqualina Orange (Girardot): chat IA + calificación de leads + emails automáticos. El dueño del proyecto es Cristian (no técnico): comunicarse SIEMPRE en español, claro y sin jerga.

## Flujo de trabajo obligatorio

- El roadmap operativo vive en **PLAN.md**. Léelo al iniciar cada sesión. Marca los checkboxes al completar tareas y actualiza el `[estado: …]` de cada fase en el mismo commit que cierra el trabajo.
- **Gates entre fases:** NO arrancar una fase nueva sin OK explícito de Cristian. Cierre de fase = `verify` + `code-review` (+ `web-design-guidelines` si hubo UI) + push + PLAN.md actualizado + demo reportada.
- Preguntar antes de decisiones importantes (AskUserQuestion) — preferencia explícita de Cristian.
- Rama de trabajo: la designada por la sesión. No tocar `main` sin permiso.
- El proyecto Supabase de esta app es `appgirardot`. NO tocar los proyectos `Zumas` ni `cristianborray-bit's Project` de la misma cuenta.

## Seguridad (no negociable)

- Jamás commitear claves o API keys: van como variables de entorno en Vercel.
- La información sensible (teléfono de Cristian, número exacto del apto, motivo del viaje/mudanza) NUNCA entra al prompt del bot ni al código cliente. Solo lógica de servidor decide revelarla (p. ej. teléfono por email tras calificar HOT).
- El bot jamás pide pagos, anticipos ni datos bancarios; mantener las respuestas anti-scam del PLAN.md.
- Toda tabla nueva en Supabase nace con RLS activado; el cliente del navegador no escribe directo en tablas.

## Stack

Next.js (App Router) + TypeScript + Tailwind en Vercel · Supabase (Postgres/Auth/Storage) · OpenAI modelo económico vía Vercel AI SDK (`ai` + `@ai-sdk/openai`), proveedor intercambiable · Resend para emails · Vercel Cron diario para seguimientos día 1/3/7.

La ficha comercial del apto vive en `content/apartamento.md` (editable sin tocar código).
