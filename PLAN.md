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

## FASE 2 — Experiencia + Leads `[estado: ✅ leads vivos; galería, video y OG con foto real publicados]`

- [x] Flujo de calificación con botones: presupuesto, timeline, financiación (valores espejo de los check constraints de la tabla `leads`; los tres grupos opcionales, con des-selección)
- [x] Captura de lead (nombre + email obligatorios, teléfono opcional ≥7 dígitos) ligada a su conversación — reenviar el formulario actualiza el lead (índice único por conversación), campo trampa anti-bots, rate limit propio
- [x] Infraestructura de galería + video lista y "auto-encendible": bucket público `galeria` en Storage, manifiesto editable `content/galeria.json`, grid de fotos (next/image) y embed YouTube-nocookie que aparecen solos al llenar el manifiesto. La carpeta de Drive de Cristian ("videos y fotos apto girardot") ya está visible para la sesión; cuando suba el material, se ingiere a Storage y se llena el manifiesto
- [x] **Rediseño móvil pedido por Cristian (2026-06-11):** chat a pantalla completa estilo WhatsApp en celular (tarjeta de invitación + botón flotante 💬; la página de atrás se congela, un solo scroll, "← Volver"), y la captura de datos se integró DENTRO del chat como burbuja (botón "📝 Que Cristian me contacte" siempre visible; tras enviar queda "✓ Cristian te contactará pronto"). El formulario del final de la página se eliminó: un solo camino sin fricción. En computador todo sigue incrustado como antes
- [x] **Rediseño de galería pedido por Cristian (2026-06-17):** mosaico de fotos con tamaños variados, foto destacada + video integrados como una pieza más, click para ampliar con navegación anterior/siguiente. Se incorporan 7 fotos nuevas subidas por Cristian (20 en total) y se corrige el tamaño/calidad de la foto ampliada (patrón `fill` + `object-contain` de Next.js, calidad 90)
- [x] **Fix de carga lenta/bloqueo en mobile reportado por Cristian (2026-06-17):** causa confirmada consultando los archivos reales en Supabase Storage (no fue una suposición): 5 de las 20 fotos son tomas de cámara sin comprimir (3.5-4.2 MB cada una) mientras el resto pesa menos de 120 KB; en datos móviles esas 5 disparaban varias descargas pesadas a la vez. Se corrige en el código: el mosaico arranca con 7 fotos en vez de 20 (botón "Ver N fotos más" para el resto), se corrige el tamaño pedido de la foto destacada en celular (pedía la mitad de su ancho real), y se agrega aviso si una foto no carga en vez de quedar rota
- [x] **Compresión de las 5 fotos pesadas (2026-06-17):** hecho directamente desde la sesión con una herramienta temporal (sharp, redimensionado a 2200px + JPEG calidad 78, original respaldado antes de sobrescribir). Resultado real verificado en Supabase: las 5 bajaron de 3.5-4.2 MB a 200-307 KB (92-95% menos peso) sin reducir su resolución visible en el sitio. La herramienta temporal ya se borró del código tras confirmar el resultado
- [x] **Fix de botones del lightbox en mobile reportado por Cristian (2026-06-17):** los botones de cerrar/anterior/siguiente no tenían fondo visible (solo aparecía al pasar el mouse, algo que no existe en celular) y las flechas quedaban a 8px del borde físico de la pantalla, zona donde el celular detecta gestos del sistema (volver atrás, centro de control) y a veces "roba" el toque. Se corrige dándoles un fondo oscuro semitransparente fijo + reacción visual al tocar, y alejando las flechas a 16px del borde
- [x] **Segundo ajuste a los botones del lightbox tras nueva prueba de Cristian (2026-06-17):** el primer fix no bastó — con fotos verticales el botón de cerrar se perdía y volvía a aparecer al deslizar/hacer scroll pero sin funcionar, y la flecha de "anterior" no se veía. Causa nueva: el cuadro de la foto medía su alto con una unidad fija (`vh`) que en el navegador del celular no sigue el tamaño real visible (la barra del navegador se esconde/aparece al deslizar, dejando el botón de cerrar fuera de sitio); se cambia a una unidad dinámica (`dvh`), el mismo patrón que ya usa con éxito el chat estilo WhatsApp de esta página. Además, ambas flechas se alejan un poco más del borde (16px→24px) para evitar mejor el gesto de "volver atrás" del celular en el borde izquierdo
- [x] OG tags con foto real (2026-06-18): la vista previa al compartir por WhatsApp/Facebook ya muestra la foto destacada de la piscina principal (antes solo salía texto)

**Entregable:** flujo completo de usuario guardándose en Supabase

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

- [x] **Textos para anuncios (Facebook, Instagram, OLX) apuntando al link:** 3 variaciones creadas con el skill `meta-ad-generator` (inversión/renta, familia/estilo de vida, urgencia/precio) y cargadas en Meta Ads Manager — campaña, conjunto de anuncios y los 3 anuncios quedan en PAUSA con tope de 10.000 COP/día, a la espera del "sí" final de Cristian tras revisar Ads Manager
- [x] **Verificación y corrección de segmentación geográfica (2026-06-18):** Cristian pidió confirmar que la campaña apunta a Bogotá y alrededores y a Girardot y alrededores. La herramienta de Meta Ads no permite leer la segmentación ya guardada (limitación confirmada a fondo), pero el nombre del conjunto de anuncios ("Compradores Colombia") sugería que estaba en todo el país en vez de enfocado. Con el "sí" de Cristian, se reconfiguró el conjunto de anuncios con dos círculos de 30 km de radio (Bogotá y Girardot), incluyendo tanto a quienes viven ahí como a quienes están de paso/viaje — relevante porque es una propiedad vacacional. Confirmado que el conjunto sigue en PAUSA y sin gasto después del cambio
- [x] **Auditoría de segmentación tras el cambio de ubicación (2026-06-18):** Cristian preguntó si los intereses también quedaron configurados. No — el cambio del mismo día solo tocó ubicación. Confirmado a fondo (varios intentos, sin atajos) que la herramienta de Meta Ads no deja buscar ni leer intereses, edad, sexo, posicionamiento ni la Categoría especial de anuncios de vivienda — son puntos ciegos totales, no solo "sin configurar". Riesgo importante detectado: en la API de Meta, guardar una nueva ubicación normalmente reemplaza TODA la segmentación anterior, así que si había intereses/edad/sexo desde la creación original del conjunto, es probable que ya no estén. No se inventaron IDs de intereses (regla del proyecto: nunca adivinar valores de Meta) — en su lugar se entregaron a Cristian términos concretos para escribir él mismo en el buscador de Ads Manager. Presupuesto ($10.000 COP/día), objetivo (LINK_CLICKS) y estado (PAUSA en campaña, conjunto y los 3 anuncios) se reverificaron y están correctos. Detalle y lista de pendientes abajo en "Pendientes de Cristian"
- [x] **Limpiar leads de prueba del panel antes de lanzar (2026-06-18):** borrados los 3 leads de prueba ("cristian borray" auto-prueba, "Comprador Caliente", "Prueba Alerta Email") junto con su único registro de `email_log` y sus 3 conversaciones asociadas. El lead real (Erika) y su conversación quedaron intactos. Verificado después: 1 lead, 1 email_log, 10 conversaciones en la base
- [x] **Verificación del link de destino de los 3 anuncios (2026-06-18):** el texto de los 3 anuncios apunta a `https://aqualinagirardot.company/` (coincide exactamente con el copy aprobado). La herramienta de vista previa visual de Meta no está disponible todavía para esta cuenta publicitaria (error de "rollout" al pedirla); queda pendiente que Cristian confirme con un vistazo rápido a "Vista previa" en Ads Manager antes de activar
- [x] **Píxel de Meta Ads instalado en el código (2026-06-18):** snippet base de Meta agregado en el layout (no carga nada si no hay ID configurado, así que es seguro tenerlo ya en producción), evento de conversión `Lead` conectado al momento exacto en que el formulario "Que Cristian me contacte" se guarda con éxito (no antes), y la política de seguridad del sitio (CSP) actualizada para permitir los dominios de Meta. Decisiones tomadas con Cristian: solo píxel del navegador por ahora (sin envío al servidor de Meta ni datos de contacto encriptados — se puede revisar más adelante si crece el volumen). Falta que Cristian cree el píxel en Meta Events Manager y entregue el ID (o lo ponga directo en Vercel)
- [x] **Cristian creó el píxel real y entregó el ID (2026-06-18):** conjunto de datos "Aqualina Orange Girardot" (ID `27511282028466005`) creado en Meta Events Manager, separado del "BotrayIA Pixel" del otro negocio — confirmado en la captura que envió. Se revisó todo el código (`layout.tsx`, `meta-pixel.ts`, `.env.example`, CSP en `next.config.ts`, y el disparo de `trackLead()` en `lead-form.tsx`) y ya estaba 100% listo desde el punto anterior: no hizo falta cambiar ni una línea. Se confirmó además, con una búsqueda en todo el repo, que no hay ningún ID de píxel quemado en el código ni archivos `.env` reales subidos al repositorio. Lo único que falta es que Cristian agregue la variable en Vercel (ver "Pendientes de Cristian") — sin eso el sitio sigue funcionando exactamente igual, solo que sin el píxel activo
- [x] **Ajustes al prompt del bot con el skill `prompt-master` (2026-06-18):** se reforzó el objetivo de invitar al contacto (ahora es explícito en la misión, no solo en la Fase 3) y se agregó un disparador de respaldo: si llevan 5 intercambios sin que el bot haya invitado a dejar los datos, lo hace aunque no haya detectado otra señal de interés
- [x] **Diagnóstico de los primeros días de pauta (2026-06-20):** Cristian reportó "no veo resultados". Se revisaron los números reales de Meta (no percepciones): en 3 días reales de entrega (17-19 jun) se gastaron ~$21.700 COP (~5 USD) y entraron ~603 visitas a la página (Urgencia se llevó el 82% del gasto por ser la más barata de entregar). Hallazgo clave: el anuncio jala clics muy bien (CTR 11,65%, CPC $27 — señal de tráfico barato/baja calidad), pero de ~603 visitas solo se crearon ~4 conversaciones reales (base de datos). La causa de raíz es que la campaña optimiza por **visitas a la página** (objetivo LINK_CLICKS/Tráfico), no por conversaciones ni leads, así que Meta busca el clic más barato y no al interesado. Las UTM están bien (no son el problema); el problema es el salto visita→chat. Conclusión: muestra demasiado chica para concluir fracaso; lo prioritario es arreglar la medición y el objetivo antes de subir presupuesto. OK de Cristian para arrancar por "mejorar medición + objetivo"
- [x] **Evento de embudo medio `IniciaChat` agregado (2026-06-20):** el píxel solo medía `PageView` (entró) y `Lead` (formulario final, muy al fondo); faltaba medir si la persona de verdad empezó a chatear. Se agregó `trackIniciaChat()` en `meta-pixel.ts` (evento personalizado `IniciaChat`, vía `trackCustom`) y se dispara en `chat.tsx` una sola vez por visita, al enviar el primer mensaje real (no se re-dispara si la sesión se retomó con mensajes previos). Solo píxel del navegador por ahora, coherente con la decisión previa; el refuerzo server-side (Conversions API) queda como siguiente sub-paso y necesita un token de acceso de Cristian. Typecheck y lint limpios
- [x] **Hallazgo clave revisando Meta a fondo (2026-06-20):** Cristian propuso reforzar el píxel en el celular antes que nada; antes de aceptarlo se revisaron los números reales del conjunto de datos "Aqualina Orange Girardot". El conjunto de datos se creó el 2026-06-18 a las 14:24 UTC — un día DESPUÉS de que Erika (el único lead real) llenara el formulario el 2026-06-17 a las 18:45 UTC. Conclusión dura: a Erika no la perdió el celular ni faltó Conversions API, el píxel todavía no existía cuando ella escribió. Desde que el píxel quedó activo solo ha registrado un evento `Lead` (el 2026-06-18 ~15:49 UTC) y coincide exactamente con la prueba de Cristian mismo ("prueba"/prueba@gmail.com), no con un cliente real. El desglose por tipo de dispositivo no devolvió datos (ni a favor ni en contra del celular: simplemente no hay todavía un lead real posterior al píxel para comprobarlo). Recomendación: no construir Conversions API aún (necesita token + código nuevo y resolvería un problema sin evidencia); primero confirmar con una prueba real desde el celular de Cristian, mirando "Probar eventos" en vivo, si el píxel dispara `PageView`/`IniciaChat`/`Lead` hoy. Se revisó también el conjunto de anuncios con datos frescos: `optimization_goal` = `LANDING_PAGE_VIEWS`, confirmando otra vez el hallazgo de objetivo de campaña ya registrado arriba
- [ ] Revisión periódica de conversaciones reales → mejoras al prompt y a la ficha
- [x] **Fix de recuperación de contraseña del panel admin reportada por Cristian (2026-06-17):** al pedir "Send password recovery" desde el dashboard de Supabase, el link lo mandaba a `localhost:3000` con un error técnico. Dos causas distintas: (1) el Site URL de Supabase Auth estaba mal configurado; (2) aunque el link funcionara, `/admin/login` no tenía ningún formulario para completar la recuperación. Se agrega ese formulario: si el link es válido se muestra "Pon tu contraseña nueva"; si ya venció o se usó, un aviso claro en español en vez del error técnico
- [x] **Cristian corrigió el Site URL** en Supabase a `https://aqualinagirardot.company/admin/login` (con el path completo: si solo se pone el dominio, el link cae en la portada y ahí nada puede procesarlo)
- [x] **Segundo fix (2026-06-17):** con el Site URL ya corregido, el link llevaba al sitio correcto pero a veces seguía mostrando el login normal en vez de "Pon tu contraseña nueva" — la página esperaba un aviso de Supabase que llega después de una llamada de red y podía tardar o no llegar a tiempo. Ahora la página decide qué formulario mostrar leyendo el link directamente, al instante, sin depender de ese aviso
- [x] **Tercer fix (2026-06-18):** con el formulario ya mostrándose bien, Cristian probó guardar la contraseña nueva y salió "No se pudo guardar la contraseña". Revisando los registros de Supabase confirmé que el link sí era válido (el servidor lo verificó bien), pero el navegador nunca terminó de avisarle a Supabase que esa sesión estaba activa antes de apretar "Guardar". Ahora la página usa los datos del propio link para activar la sesión directamente, sin depender de ese paso silencioso. Pendiente confirmar con Cristian que esta vez sí guarda

**Entregable:** pauta activa, leads entrando solos

---

## Pendientes de Cristian

- [x] **"Aprobado"** para arrancar Fase 0 — dado el 2026-06-11
- [x] Conectar GitHub↔Vercel — hecho: auto-deploy funcionando
- [x] `OPENAI_API_KEY` + variables de Supabase en Vercel — hechas y verificadas en vivo
- [x] Fotos + video del apto → para Fase 2
- [x] Cuenta en resend.com + `RESEND_API_KEY` + `CRISTIAN_PHONE` en Vercel — hechas el 2026-06-12
- [x] `CRON_SECRET` en Vercel — hecho el 2026-06-16 (ver Fase 4)
- [x] Dominio elegido y comprado — `aqualinagirardot.company`, comprado y verificado el 2026-06-16 (ver Fase 4/5)
- [x] Confirmar email de notificaciones — ya funcionando: las alertas de leads HOT llegan a cristianborray@gmail.com desde Fase 4
- [x] Crear el píxel de "Aqualina Orange" en Meta Events Manager y darme el ID numérico — hecho el 2026-06-18 (`27511282028466005`)
- [x] Agregar en Vercel (Settings → Environment Variables) `NEXT_PUBLIC_META_PIXEL_ID` = `27511282028466005` en el entorno "Production" — hecho por Cristian (2026-06-18)
- [x] **Diagnóstico: por qué el sitio en vivo seguía sin el píxel (2026-06-18):** Vercel estaba publicando como "producción" la rama vieja `claude/keen-gauss-voe9u1` en vez de la rama de trabajo actual `claude/youthful-hamilton-t01tfw` (donde está el código del píxel). Cristian cambió la rama por defecto del repositorio en GitHub (Settings → General → Default branch) como primer intento. Se confirmó que el cambio en GitHub quedó bien hecho, y se forzó una compilación nueva para probarlo — pero, aun con la compilación lista y sin errores, Vercel siguió sin marcarla como "producción" ni publicarla en `aqualinagirardot.company`. Conclusión: el cambio en GitHub no alcanza por sí solo; Vercel guarda su propia configuración interna de "rama de producción" y no se actualiza sola. Se confirmó además, revisando directamente el código ya compilado, que el píxel está 100% instalado y correcto — el problema es solo de publicación, no del código
- [x] **Cristian usó "Promote to Production" en Vercel (2026-06-18):** confirmado — `aqualinagirardot.company` ya sirve la compilación de `claude/youthful-hamilton-t01tfw` (verificado leyendo directamente el HTML en vivo: el píxel `fbq('init', '27511282028466005')` y el `<noscript>` de respaldo están presentes, y la política de seguridad del sitio permite los dominios de Meta). Sigue pendiente, solo como mejora a futuro y sin urgencia, encontrar en Vercel el campo "Production Branch" (Settings → Git) y cambiarlo de `claude/keen-gauss-voe9u1` a `claude/youthful-hamilton-t01tfw` para no tener que repetir "Promote to Production" en cada cambio
- [x] Confirmar en Meta Events Manager que llega el evento `PageView` — Cristian lo confirmó con una captura de la pestaña "Probar eventos" del conjunto de datos "Aqualina Orange Girardot" (2026-06-18)
- [x] Confirmar también el evento `Lead` — confirmado con datos de Meta (2026-06-20): sí llegó un evento `Lead`, pero es la prueba del propio Cristian del 2026-06-18, no un cliente real (ver hallazgo arriba en Fase 6)
- [ ] **Confirmar el nuevo evento `IniciaChat`** (tras el próximo deploy): entrar al sitio, escribirle un mensaje al bot, y revisar en Events Manager (pestaña "Probar eventos" del conjunto "Aqualina Orange Girardot") que aparezca `IniciaChat`
- [ ] **Decisión de objetivo de la campaña (propuesta lista, falta tu OK):** la campaña actual optimiza por Tráfico/visitas (LINK_CLICKS), lo que trae clics baratos sin leads. Propuesta: crear una campaña nueva con objetivo **Interacción/Leads** que optimice por el evento `IniciaChat` (o `Lead`), no por visitas. Requiere primero (a) que `IniciaChat` esté llegando a Events Manager y (b) crear una "conversión personalizada" desde ese evento. No se toca la pauta sin tu OK explícito
- [ ] Revisar en Ads Manager si el conjunto de anuncios ya pausado tiene algún "conjunto de datos"/píxel seleccionado para medir conversiones — si aparece el "BotrayIA Pixel" hay que cambiarlo al de "Aqualina Orange Girardot"; esto no se puede leer por herramienta, necesita revisión manual
- [ ] Vista previa rápida de los 3 anuncios en Ads Manager para confirmar a simple vista que el botón lleva a `https://aqualinagirardot.company/`
- [ ] Escribir en Ads Manager (conjunto de anuncios → Audiencia → Segmentación detallada) intereses como: "Bienes raíces", "Inversión inmobiliaria", "Alquiler vacacional", "Compra de vivienda" / "Apartamentos", "Hipotecas", "Turismo en Girardot" o "Viajes" — eligiendo siempre la opción que Meta sugiera al escribir cada término, combinando 2-3 por variación de anuncio según el ángulo (inversión, familia, urgencia)
- [ ] Revisar si Meta exige marcar "Categoría especial de anuncios: Vivienda" en este conjunto — si aplica, restringe edad/sexo/exclusiones por ubicación y no hay forma de confirmarlo por herramienta
- [ ] Revisar Edad, Sexo y Posicionamiento del conjunto de anuncios en Ads Manager — no se pueden leer con las herramientas disponibles; pudieron quedar vacíos o distintos a lo esperado tras el cambio de ubicación del 2026-06-18
- [x] Cristian revisó Ads Manager y encendió los 3 anuncios (2026-06-18) — confirmado por herramienta: los 3 quedaron en `ACTIVE` y Meta los está revisando (`PENDING_REVIEW`, normal, tarda de minutos a 24h, no requiere acción)
- [ ] **Aún en PAUSA (esto es lo que falta para que algo se muestre o gaste):** el CONJUNTO de anuncios y la CAMPAÑA siguen pausados — confirmado por herramienta. Aunque los 3 anuncios ya están "Activos", nada se publica ni gasta mientras el conjunto y la campaña no se enciendan también. Encender ambos con sus interruptores en las pestañas "Campañas" y "Conjuntos" de Ads Manager
- [ ] Anuncio suelto "Nuevo anuncio de Tráfico" (en borrador, interruptor apagado) que apareció en la lista junto a los 3 aprobados — no es ninguna de las 3 variaciones; revisar y borrarlo para evitar confusión (mientras siga en borrador no gasta ni se publica solo)
- [x] Presupuesto verificado de nuevo por herramienta tras los cambios: sigue en $10.000 COP/día — sin cambios
