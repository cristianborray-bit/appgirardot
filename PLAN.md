# CristianBot — Plan Maestro V6 (tablero de control)

Agente de venta del apartamento **Aqualina Orange (Girardot)**: chat con IA que informa, califica leads, detecta estafas y notifica a Cristian.

**Stack:** Next.js (App Router) en Vercel · Supabase (Postgres + Auth + Storage) · OpenAI (modelo mini) vía Vercel AI SDK · Resend · GitHub `cristianborray-bit/appgirardot`

---

## Decisiones cerradas

| # | Decisión |
|---|----------|
| 1 | Next.js full-stack en Vercel (sin Express ni Railway) |
| 2 | Supabase Postgres — proyecto nuevo `appgirardot`, región `us-east-1`, plan gratuito |
| 3 | IA: API de OpenAI de Cristian, modelo económico, proveedor intercambiable vía AI SDK |
| 4 | Emails a leads: dominio propio + Resend |
| 5 | Panel `/admin` con login (Supabase Auth) desde el inicio |
| 6 | Seguimientos día 1/3/7 con Vercel Cron diario |
| 7 | Info sensible (teléfono, nº exacto de apto, motivo de venta) JAMÁS en el prompt del bot — solo lógica de servidor |

## Protocolo de cierre de fase (gate obligatorio)

Una fase se considera terminada SOLO cuando:

1. ✅ Verificada con la app corriendo de verdad (skill `verify`)
2. ✅ Revisión de código sin hallazgos graves (skill `code-review`)
3. ✅ Si hubo interfaz: auditoría UI/UX (skill `web-design-guidelines`)
4. ✅ Commit + push a la rama de trabajo
5. ✅ Este PLAN.md actualizado (checkboxes y estado de la fase)
6. ✅ Demo/URL reportada a Cristian y **OK explícito de Cristian** para abrir la fase siguiente

La Fase 5 añade además la auditoría completa con la skill `security-review`.

---

## FASE 0 — Infraestructura `[estado: 🔄 lista salvo deploy (paso de Cristian)]`

- [x] Crear proyecto Supabase `appgirardot` — creado: id `umqotxoixboqkgerlupy`, us-east-1, costo $0 confirmado
- [x] Esquema: tablas `leads`, `conversations`, `email_log` — RLS activado, advisors de seguridad sin hallazgos
- [x] App Next.js 16 base (TypeScript + Tailwind v4) — build limpio, verificada corriendo (HTTP 200)
- [ ] Primer deploy a Vercel — **requiere paso de Cristian**: el sandbox no tiene credenciales de Vercel CLI y la red bloquea el login, así que el deploy llega por la integración GitHub↔Vercel (2 min, abajo)

**Entregable:** URL viva con página base + tablas creadas
**Cómo conectar (Cristian, 2 min):** entrar a [vercel.com/new](https://vercel.com/new) → "Import Git Repository" → elegir `cristianborray-bit/appgirardot` → botón "Deploy" (Next.js se detecta solo, sin cambiar nada). Desde ahí, cada push mío se despliega automáticamente y yo monitoreo los deployments desde la sesión.

## FASE 1 — Chat MVP `[estado: 🔄 código completo y verificado — falta prueba en vivo]`

- [x] Ficha del apto en archivo editable (`content/apartamento.md`) — sin datos sensibles
- [x] Prompt de sistema del bot (con skill `prompt-master`): transparencia "soy una IA", tono cálido, informar primero, calificación suave, respuestas anti-scam — los secretos NO están en el prompt (no puede filtrarlos)
- [x] API de chat con streaming (AI SDK v6 + OpenAI, modelo configurable con `OPENAI_MODEL`, por defecto `gpt-5-mini`)
- [x] UI del chat "abuelo-friendly" (skill `frontend-design`): Fraunces + Atkinson Hyperlegible, botones ≥48px, mobile-first — auditada con `web-design-guidelines` (7 hallazgos corregidos)
- [x] Guardar TODAS las conversaciones en Supabase (se activa al poner `SUPABASE_SECRET_KEY` en Vercel; sin la clave el chat funciona igual)
- [x] Rate limiting básico: 10 req/min por IP y por sesión + topes de longitud y de historial (endurecimiento definitivo en Fase 5)
- [x] Revisión de código (7 ángulos): corregidos tope de historial forjado, trazado del archivo de ficha al bundle, errores del servidor visibles en el chat, guard `server-only`
- [ ] **Prueba en vivo del chat con OpenAI** — imposible desde este sandbox (la red bloquea api.openai.com); se hace sobre el deploy de Vercel apenas estén las variables

**Entregable:** chateas con el bot desde tu celular en una URL real
**Requiere de Cristian:** conectar Vercel (paso de Fase 0) + pegar 3 variables en Vercel → Settings → Environment Variables:
1. `OPENAI_API_KEY` = tu clave de OpenAI
2. `NEXT_PUBLIC_SUPABASE_URL` = `https://umqotxoixboqkgerlupy.supabase.co`
3. `SUPABASE_SECRET_KEY` = en [supabase.com/dashboard](https://supabase.com/dashboard) → proyecto **appgirardot** → Project Settings → API Keys → crear/copiar la **secret key**

## FASE 2 — Experiencia + Leads `[estado: ⬜ pendiente]`

- [ ] Galería de fotos (Supabase Storage) + video tour (YouTube oculto embebido)
- [ ] Flujo de calificación con botones: presupuesto, timeline, financiación
- [ ] Captura de lead (nombre + email obligatorios, teléfono opcional) ligada a su conversación
- [ ] OG tags: vista previa atractiva al compartir el link por WhatsApp/Facebook

**Entregable:** flujo completo de usuario guardándose en Supabase
**Requiere de Cristian:** fotos y video del apto

## FASE 3 — Scoring + Panel `[estado: ⬜ pendiente]`

- [ ] Scoring automático: presupuesto 40 + urgencia 30 + financiación 20 + interacción 10
- [ ] Clasificación: HOT (70-100) / WARM (40-69) / COLD (0-39)
- [ ] Detección anti-scam con `suspicious_flags` y respuestas estándar de seguridad
- [ ] Panel `/admin` con login: leads con semáforo, conversaciones completas, cambiar estado, notas

**Entregable:** panel funcionando con leads de prueba

## FASE 4 — Emails automáticos `[estado: ⬜ pendiente]`

- [ ] Notificación inmediata a Cristian para leads HOT (incluye revisión de seguridad del lead)
- [ ] Emails de bienvenida por categoría (plantillas del plan V5.1)
- [ ] Vercel Cron diario: seguimientos día 1/3/7 para WARM, registrados en `email_log`
- [ ] El teléfono de Cristian se entrega SOLO vía servidor/email tras calificar HOT

**Entregable:** registras un lead de prueba y llegan los emails correctos
**Requiere de Cristian:** cuenta Resend + API key + dominio verificado

## FASE 5 — Endurecimiento + Dominio `[estado: ⬜ pendiente]`

- [ ] Dominio conectado en Vercel y verificado en Resend
- [ ] Auditoría completa con skill `security-review`
- [ ] Pruebas de extracción de prompt (intentar sacarle al bot info que no debe dar)
- [ ] Pruebas anti-scam end-to-end + revisión final de RLS y rate limiting

**Entregable:** app lista para recibir pauta
**Requiere de Cristian:** comprar el dominio (~$11.25 USD/año desde su cuenta Vercel)

## FASE 6 — Lanzamiento + Iteración `[estado: ⬜ pendiente]`

- [ ] Textos para anuncios (Facebook, Instagram, OLX) apuntando al link
- [ ] Revisión periódica de conversaciones reales → mejoras al prompt y a la ficha

**Entregable:** pauta activa, leads entrando solos

---

## Pendientes de Cristian

- [x] **"Aprobado"** para arrancar Fase 0 — dado el 2026-06-11
- [ ] Conectar GitHub↔Vercel (2 min): [vercel.com/new](https://vercel.com/new) → Import `cristianborray-bit/appgirardot` → Deploy
- [ ] `OPENAI_API_KEY` → para Fase 1 (se pega en Vercel, nunca en el chat ni en el repo)
- [ ] Fotos + video del apto → para Fase 2
- [ ] Cuenta en resend.com + API key → para Fase 4
- [ ] Dominio elegido y comprado → para Fase 5. Candidatos libres a $11.25/año: `aqualinagirardot.com` · `aptoaqualina.com` · `aptogirardot.com` · `ventaaptogirardot.com`
- [ ] Confirmar email de notificaciones: cristianborray@gmail.com
