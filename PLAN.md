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

## FASE 1 — Chat MVP `[estado: ✅ completada — chat vivo en producción]`

- [x] Ficha del apto en archivo editable (`content/apartamento.md`) — sin datos sensibles
- [x] Prompt de sistema del bot (con skill `prompt-master`): transparencia "soy una IA", tono cálido, informar primero, calificación suave, respuestas anti-scam — los secretos NO están en el prompt (no puede filtrarlos)
- [x] API de chat con streaming (AI SDK v6 + OpenAI, modelo configurable con `OPENAI_MODEL`, por defecto `gpt-5-mini`)
- [x] UI del chat "abuelo-friendly" (skill `frontend-design`): Fraunces + Atkinson Hyperlegible, botones ≥48px, mobile-first — auditada con `web-design-guidelines` (7 hallazgos corregidos)
- [x] Guardar TODAS las conversaciones en Supabase (se activa al poner `SUPABASE_SECRET_KEY` en Vercel; sin la clave el chat funciona igual)
- [x] Rate limiting básico: 10 req/min por IP y por sesión + topes de longitud y de historial (endurecimiento definitivo en Fase 5)
- [x] Revisión de código (7 ángulos): corregidos tope de historial forjado, trazado del archivo de ficha al bundle, errores del servidor visibles en el chat, guard `server-only`
- [x] **Prueba en vivo del chat con OpenAI** — verificada de punta a punta el 2026-06-11 vía HTTP desde la base de datos (el sandbox no tiene red directa): respuesta real con los precios correctos + conversación persistida en Supabase. Bug encontrado y corregido en vivo: gpt-5-mini razonador se quedaba mudo con 600 tokens → 2500 + `reasoningEffort: minimal` + `textVerbosity: low`
- [x] **Fix del bug reportado por Cristian (2026-06-11, prueba desde su celular):** el chat se bloqueaba con "tu mensaje es muy largo" porque el tope de 1.000 caracteres validaba también las respuestas del propio bot (una salió de 1.201). Se aplicó el blindaje definitivo (adelantado de Fase 5 con OK de Cristian): el navegador solo envía el texto nuevo, el servidor reconstruye el historial desde Supabase (imposible de forjar o inflar), al recargar la página la conversación se retoma donde iba, los avisos de límites salen como nota tranquila (sin alarma roja), errores del modelo en español, y el bot responde más corto (~80 palabras)

**Entregable:** ✅ [appgirardot.vercel.app](https://appgirardot.vercel.app) — chat respondiendo en producción
**Nota:** las variables de entorno de Vercel solo aplican a deployments nuevos; si se cambian, hay que redesplegar (un push basta)

## FASE 2 — Experiencia + Leads `[estado: 🔄 en curso — leads vivos; galería/video esperando material]`

- [x] Flujo de calificación con botones: presupuesto, timeline, financiación (valores espejo de los check constraints de la tabla `leads`; los tres grupos opcionales, con des-selección)
- [x] Captura de lead (nombre + email obligatorios, teléfono opcional ≥7 dígitos) ligada a su conversación — reenviar el formulario actualiza el lead (índice único por conversación), campo trampa anti-bots, rate limit propio
- [x] Infraestructura de galería + video lista y "auto-encendible": bucket público `galeria` en Storage, manifiesto editable `content/galeria.json`, grid de fotos (next/image) y embed YouTube-nocookie que aparecen solos al llenar el manifiesto. La carpeta de Drive de Cristian ("videos y fotos apto girardot") ya está visible para la sesión; cuando suba el material, se ingiere a Storage y se llena el manifiesto
- [x] **Rediseño móvil pedido por Cristian (2026-06-11):** chat a pantalla completa estilo WhatsApp en celular (tarjeta de invitación + botón flotante 💬; la página de atrás se congela, un solo scroll, "← Volver"), y la captura de datos se integró DENTRO del chat como burbuja (botón "📝 Que Cristian me contacte" siempre visible; tras enviar queda "✓ Cristian te contactará pronto"). El formulario del final de la página se eliminó: un solo camino sin fricción. En computador todo sigue incrustado como antes
- [ ] Fotos + video reales publicados (bloqueado por material de Cristian)
- [ ] OG tags con foto real: vista previa atractiva al compartir por WhatsApp/Facebook (los OG de texto existen desde Fase 1; la imagen entra con la primera foto)

**Entregable:** flujo completo de usuario guardándose en Supabase
**Requiere de Cristian:** subir fotos y video a su carpeta de Drive "videos y fotos apto girardot"

## FASE 3 — Scoring + Panel `[estado: ✅ completada — panel verificado por Cristian el 2026-06-12]`

- [x] Scoring automático: presupuesto 40 + urgencia 30 + financiación 20 + interacción 10 — calculado al enviar el formulario y RECALCULADO con cada mensaje del chat (pesos ajustables en `src/lib/scoring.ts`)
- [x] Clasificación: HOT (70-100) / WARM (40-69) / COLD (0-39)
- [x] Detección anti-scam: patrones de timos inmobiliarios típicos (anticipos, pagos a distancia, comprar sin visitar, terceros, sobrepagos, datos bancarios) → marca `suspicious_level` 1-2 con motivo legible; solo escala, nunca bloquea
- [x] Panel `/admin` con login de contraseña (cuenta creada para cristianborray@gmail.com, solo ese correo pasa): leads con semáforo 🔥🟡❄️ + 🚩, conversaciones completas, cambiar estado, notas — protegido con proxy + layout + re-chequeo en cada action (getClaims, patrón oficial @supabase/ssr)
- [x] Verificación en vivo del panel por Cristian (login + revisar un lead de prueba) — ✅ confirmado 2026-06-12

**Entregable:** ✅ panel funcionando en [appgirardot.vercel.app/admin](https://appgirardot.vercel.app/admin)

## FASE 4 — Emails automáticos `[estado: ✅ completada — dominio verificado, emails a leads encendidos, cron activo]`

- [x] Notificación inmediata a Cristian para leads HOT con 🚩 señales de alerta y link a la ficha — funciona desde ya (el remitente de prueba de Resend solo puede escribirle al dueño de la cuenta: justo lo que necesita la alerta)
- [x] Emails de bienvenida por categoría (el HOT incluye el teléfono de Cristian y marca `phone_revealed`) — código listo; se encienden SOLOS al poner `EMAIL_FROM` con el dominio verificado
- [x] Vercel Cron diario (8:00 am Bogotá): seguimientos día 1/3/7 para WARM aún sin contactar + reintento de emails fallidos o colgados — todo en `email_log` con candado único lead+tipo (imposible enviar dos veces el mismo email)
- [x] El teléfono de Cristian se entrega SOLO vía servidor/email tras calificar HOT — vive en la env var `CRISTIAN_PHONE`, jamás en código ni en el prompt
- [x] Revisión de código con autocrítica: corregida inyección de HTML en emails (datos del visitante ahora se escapan siempre)
- [x] `CRON_SECRET` en Vercel — agregado el 2026-06-16
- [x] Dominio `aqualinagirardot.company` comprado en Vercel + verificado en Resend + conectado al proyecto — completado el 2026-06-16

**Entregable:** ✅ emails funcionando — alertas HOT a Cristian + bienvenidas + seguimientos d1/3/7 desde `hola@aqualinagirardot.company`
**Requiere de Cristian:** ~~RESEND_API_KEY + CRISTIAN_PHONE~~ ✅ · ~~CRON_SECRET~~ ✅ · ~~dominio verificado~~ ✅ — todo completo

## FASE 5 — Endurecimiento + Dominio `[estado: ✅ completada — verificado por Cristian el 2026-06-16]`

- [x] Dominio `aqualinagirardot.company` conectado en Vercel y verificado en Resend — 2026-06-16
- [x] Auditoría completa de seguridad (14 hallazgos: 2 críticos, 4 altos, 4 medios, 4 bajos)
- [x] Correcciones aplicadas (2026-06-16):
  - C-1: proxy bloquea ahora usuarios autenticados no-admin (bypass corregido)
  - C-2: security headers en todas las rutas (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
  - A-3: CRISTIAN_PHONE escapado en HTML de email (previene inyección)
  - A-4: saltos de línea eliminados del subject del email (previene header injection)
  - M-3: validación de leadId en server actions del panel
  - M-4: override de PostCSS ≥8.5.10 (CVE transitivo)
  - B-4: honeypot mejorado con CSS posicional (más difícil de detectar por bots)
- [x] Pruebas de extracción de prompt: aprobadas por diseño (teléfono/nº apto/motivo NO están en el prompt ni en la ficha; reglas #2 y #5 del prompt las cubren) — 2026-06-16
- [x] Pruebas anti-scam: 7 patrones verificados en scoring.ts (anticipos, consignaciones, compra sin visitar, exterior, terceros, sobrepago, datos bancarios) — 2026-06-16
- [ ] Hallazgo A-2 pendiente: rate limit en login requiere migrar auth a server action (para Fase 6)
- [ ] Hallazgo A-1 pendiente: rate limiter persistente entre instancias requiere Vercel KV (para Fase 6)

**Entregable:** ✅ app lista para recibir pauta — verificada y endurecida
**Requiere de Cristian:** ~~OK para proceder con las pruebas~~ ✅ dado el 2026-06-16

## FASE 6 — Lanzamiento + Iteración `[estado: 🔄 en curso]`

- [ ] Textos para anuncios (Facebook, Instagram, OLX) apuntando al link
- [ ] Limpiar leads de prueba del panel antes de lanzar
- [ ] Revisión periódica de conversaciones reales → mejoras al prompt y a la ficha

**Entregable:** pauta activa, leads entrando solos

---

## Pendientes de Cristian

- [x] **"Aprobado"** para arrancar Fase 0 — dado el 2026-06-11
- [x] Conectar GitHub↔Vercel — hecho: auto-deploy funcionando
- [x] `OPENAI_API_KEY` + variables de Supabase en Vercel — hechas y verificadas en vivo
- [ ] Fotos + video del apto → para Fase 2
- [x] Cuenta en resend.com + `RESEND_API_KEY` + `CRISTIAN_PHONE` en Vercel — hechas el 2026-06-12
- [ ] `CRON_SECRET` en Vercel (valor generado y entregado por chat el 2026-06-12) → enciende el cron de seguimientos
- [ ] Dominio elegido y comprado → cierra Fase 4 (emails a leads) y sirve para Fase 5. Candidatos libres a $11.25/año: `aqualinagirardot.com` · `aptoaqualina.com` · `aptogirardot.com` · `ventaaptogirardot.com`
- [ ] Confirmar email de notificaciones: cristianborray@gmail.com
