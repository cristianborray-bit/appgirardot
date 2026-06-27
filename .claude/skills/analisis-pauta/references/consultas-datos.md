# Consultas y campos — datos de la pauta

Referencia técnica para traer los datos sin equivocarse. Todo esto ya está probado contra la API real; respetarlo evita gastar llamadas en errores de validación.

## IDs y constantes

| Qué | Valor |
|---|---|
| Cuenta de anuncios (BotrayIA) | `26032618096422928` |
| Píxel Aqualina Orange | `27511282028466005` |
| Evento de optimización | `IniciaChat` (custom, `offsite_conversion.fb_pixel_custom.IniciaChat`) |
| Proyecto Supabase | `umqotxoixboqkgerlupy` |

**Campaña vigente (a 2026-06-27 — reconfirmar cada vez):**

| Entidad | ID | Nota |
|---|---|---|
| Campaña | `6961134391898` | OUTCOME_LEADS, optimiza IniciaChat, presupuesto por conjunto (ABO) |
| Conjunto Foto | `6961134557098` | $7.500 COP/día |
| Conjunto Video | `6961134543098` | $7.500 COP/día |
| Anuncio Foto | `6961134738698` | |
| Anuncio Video | `6961134698498` | |

> Las IDs cambian al lanzar una pauta nueva. **No asumirlas:** confirmar la campaña activa primero (abajo).

## Cómo hallar la campaña activa

Con `mcp__meta-ads__ads_get_ad_entities`, nivel `campaign`, sin breakdown, filtrando por estado activo:

- `level: "campaign"`, `fields: ["id","name","effective_status","amount_spent"]`, `date_preset: "maximum"`
- `filtering: [{"field":"campaign.effective_status","operator":"IN","value":["ACTIVE"]}]`

Quedarse con la campaña cuyo nombre corresponde a Aqualina Orange / IniciaChat. Ignorar cualquier otra (regla de alcance estricto).

## Reglas de oro de la API de Meta (gotchas ya aprendidos)

- **Para métricas hace falta rango de tiempo:** pasar `date_preset` **o** `time_range` (nunca ambos). Sin rango solo devuelve atributos.
- **`amount_spent`**, NO `spend`. (`spend` da error de validación.)
- **Nada de `actions` a secas.** Usar subtipos: `actions:comment`, `actions:like`, `actions:link_click`, `actions:page_engagement`, `actions:post_reaction`, `actions:post_save`.
- **Resultados de la optimización:** `results`, `cost_per_result`, `result_values` — reflejan el evento configurado (IniciaChat).
- **A nivel `ad`:** usar `creative_id`, NO `creative`.
- **Un solo breakdown por llamada.** Para `publisher_platform` y `platform_position`, hacer dos llamadas.
- **Tendencia diaria:** `time_increment: "1"` parte el rango en días.
- **Filtros:** formato `{"field":"<nivel>.<campo>","operator":"IN","value":[...]}`. Operadores probados: `IN`, `EQUAL`.

## Las llamadas a hacer (en paralelo)

Todas con `ad_account_id: "26032618096422928"`, `date_preset: "maximum"`.

1. **Totales campaña** — `level: "campaign"`, `filtering` por `campaign.id IN [<campaña>]`
   `fields: ["id","name","impressions","reach","frequency","clicks","ctr","cpc","amount_spent","results","cost_per_result"]`

2. **Comparación por conjunto (Video vs Foto)** — `level: "adset"`, `filtering` por `adset.id IN [<foto>,<video>]`, mismos `fields`.

3. **Engagement por anuncio** — `level: "ad"`, `filtering` por `ad.id IN [<foto>,<video>]`
   `fields: ["id","name","impressions","clicks","actions:comment","actions:post_reaction","actions:like","actions:post_save","actions:link_click","actions:page_engagement"]`

4. **Tendencia diaria** — `level: "campaign"`, `filtering` por `campaign.id`, `time_increment: "1"`
   `fields: ["id","impressions","clicks","ctr","amount_spent","results"]`

5. **Por plataforma** — `level: "campaign"`, `filtering` por `campaign.id`, `breakdowns: ["publisher_platform"]`
   `fields: ["id","impressions","reach","clicks","ctr","cpc","amount_spent","actions:link_click","results"]`

6. **Por ubicación exacta** — igual que (5) pero `breakdowns: ["platform_position"]`. **La más reveladora:** separa Feed bueno de basura (rewarded_video, audience_network, right_hand_column).

> Otras herramientas útiles: `ads_get_creatives` (con `creative_ids` para ver el copy completo), `ads_get_errors` (errores que frenan la entrega), `ads_get_ig_media` (medios de Instagram). Leer comentarios uno por uno no está disponible directo por estas herramientas hoy → si Cristian menciona comentarios, cuantificarlos con `actions:comment` y recomendarle revisarlos/responderlos en Ads Manager.

## Consultas de Supabase (proyecto `umqotxoixboqkgerlupy`)

**Conteos (totales y desde el inicio de la pauta — ajustar la fecha):**
```sql
SELECT
  (SELECT count(*) FROM conversations) AS conversations_total,
  (SELECT count(*) FROM leads) AS leads_total,
  (SELECT count(*) FROM email_log) AS email_log_total,
  (SELECT count(*) FROM conversations WHERE created_at >= 'AAAA-MM-DD') AS conv_desde_pauta;
```

**Conversaciones recientes con UTM:**
```sql
SELECT id, created_at, message_count, suspicious_level, utm_source, utm_medium, utm_campaign
FROM conversations
ORDER BY created_at DESC
LIMIT 20;
```

**Leer el contenido de las conversaciones de la pauta** (reemplazar la ID de campaña):
```sql
SELECT id, created_at, message_count, suspicious_level, utm_source, utm_campaign, messages
FROM conversations
WHERE utm_campaign = '6961134391898'
ORDER BY created_at DESC;
```

**Leads capturados de la pauta (para detectar fuga de captura):**
```sql
SELECT l.id, l.created_at, l.score, l.category, l.status, l.phone_revealed, l.wants_contact, c.utm_campaign
FROM leads l JOIN conversations c ON c.id = l.conversation_id
WHERE c.utm_campaign = '6961134391898'
ORDER BY l.created_at DESC;
```

Esquema relevante: `conversations` (incluye `messages` jsonb, `message_count`, `suspicious_level` 0-2, columnas UTM) · `leads` (`score`, `category`, `status`, `phone_revealed`, `price_revealed`, `wants_contact`, FK a conversación) · `email_log` (`email_type` con `owner_hot_alert`/`welcome_hot`/etc., FK a lead). Todas con RLS activado.
