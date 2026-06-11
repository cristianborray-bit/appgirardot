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

## FASE 0 — Infraestructura `[estado: ⬜ pendiente]`

- [ ] Crear proyecto Supabase `appgirardot` (us-east-1, costo $0 confirmado antes de crear)
- [ ] Esquema: tablas `leads`, `conversations`, `email_log` — todas con RLS activado
- [ ] App Next.js base (TypeScript + Tailwind) en el repo
- [ ] Primer deploy a Vercel

**Entregable:** URL viva con página base + tablas creadas
**Nota:** conectar GitHub↔Vercel para auto-deploy es un paso de 2 min de Cristian en el dashboard (opcional; mientras tanto yo despliego desde la sesión)

## FASE 1 — Chat MVP `[estado: ⬜ pendiente]`

- [ ] Ficha del apto en archivo editable (`content/apartamento.md`) — sin datos sensibles
- [ ] Prompt de sistema del bot (con skill `prompt-master`): transparencia "soy una IA", tono cálido, informar primero, calificación suave, respuestas anti-scam
- [ ] API de chat con streaming (Vercel AI SDK + OpenAI)
- [ ] UI del chat "abuelo-friendly" (skill `frontend-design`): botones grandes, texto claro, mobile-first
- [ ] Guardar TODAS las conversaciones en Supabase (con o sin lead)
- [ ] Rate limiting básico (proteger la cuota de OpenAI)

**Entregable:** chateas con el bot desde tu celular en una URL real
**Requiere de Cristian:** `OPENAI_API_KEY` en variables de entorno de Vercel

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

- [ ] **"Aprobado"** para arrancar Fase 0
- [ ] `OPENAI_API_KEY` → para Fase 1 (se pega en Vercel, nunca en el chat ni en el repo)
- [ ] Fotos + video del apto → para Fase 2
- [ ] Cuenta en resend.com + API key → para Fase 4
- [ ] Dominio elegido y comprado → para Fase 5. Candidatos libres a $11.25/año: `aqualinagirardot.com` · `aptoaqualina.com` · `aptogirardot.com` · `ventaaptogirardot.com`
- [ ] Confirmar email de notificaciones: cristianborray@gmail.com
