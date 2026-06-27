# Marco de análisis, benchmarks y formato del reporte

Cómo pasar de "números sueltos" a un diagnóstico de analista senior.

## 1. El embudo (siempre calcularlo completo)

Reconstruir el camino y la tasa de conversión de cada paso:

```
Impresiones        (veces mostrado)
   ↓  CTR
Clics totales      (¡incluye clics basura! ver §3)
   ↓
Clics al enlace    (link_click = los que de verdad fueron a la web)
   ↓  ← PASO CRÍTICO
Abrieron el chat   (IniciaChat / resultados de Meta)
   ↓
Leads capturados   (filas en `leads`)
   ↓
Calificados / HOT  (score, category)
   ↓
Teléfono revelado / correo enviado
```

Calcular y mostrar al menos:
- **Clic al enlace → chat** = chats / link_clicks. Es el más importante. Sano 3-10%; alarma <1%.
- **Chat → lead** = leads / chats. Si es 0% con chats de buena intención, el bot informa pero no captura.
- **Costo por chat real** = gasto / chats. Y **costo por lead calificado** = gasto / leads HOT (suele ser el número que importa de verdad).

## 2. Benchmarks de referencia

| Métrica | Normal | Bueno | Alarma |
|---|---|---|---|
| CTR (link) | 1-2% | >4% | — |
| Clic al enlace → chat | 3-10% | >10% | <1% |
| Frecuencia | 1-2 | <1,5 | >3 (fatiga) |
| CPM en el tiempo | estable | bajando | subiendo fuerte = saturación |

Un CTR altísimo (>15%) puede ser **buena creatividad** O **clics basura**: confirmar siempre cruzando con la ubicación (§3) y con los chats reales. CTR alto + 0 chats = humo.

## 3. Auditoría de calidad de placements (clave)

El breakdown por `platform_position`/`publisher_platform` separa el oro de la basura. Para este objetivo (llevar a la web a chatear), clasificar:

- **Núcleo bueno:** `feed` (Facebook Feed) — históricamente el único que convierte. `facebook_reels` aceptable.
- **Basura / incentivado** (señal: CTR 40-55% y 0 resultados): `rewarded_video`, `audience_network` (`an_classic`). Son clics accidentales o por premios en apps.
- **Baja intención / desperdicio:** `right_hand_column` (columna derecha de escritorio), `marketplace`, `search`, `instream_video`.
- **No probado / caro acá:** `threads_feed`, `instagram_reels`, `instagram_stories` (en Colombia suelen dar poco y caro).

Sumar cuánto gasto se fue a ubicaciones fuera del núcleo con 0 chats → ese es el "desperdicio" a reportar en pesos.

## 4. Cruce Meta ↔ base de datos (validación de medición)

Los `results` (IniciaChat) que reporta Meta deben coincidir, aprox., con el número de filas en `conversations` que tienen el `utm_campaign` de la campaña. 
- Coinciden → la medición es confiable.
- Meta dice más que la base → posible doble conteo o evento que dispara de más.
- Base dice más que Meta → el píxel no está registrando todo.

## 5. Revisión de captura de leads (lo que un junior pasa por alto)

No basta con contar chats. **Leer** las conversaciones de la pauta y evaluar:
- ¿Eran de buena intención? (preguntan precio, administración, parqueadero, amoblado = comprador serio.)
- ¿El bot respondió con datos correctos de la ficha?
- ¿El bot **pidió el contacto / disparó el formulario**, o solo informó y dejó ir al prospecto?
- ¿Hay fila en `leads` para esa conversación? Si no → **fuga de captura**, el hallazgo más accionable.

## 6. Estructura del reporte (seguir este orden)

1. **El embudo completo** — el diagrama con los números reales de esta corrida.
2. **Hallazgos** (3-6), cada uno: dato → qué significa en plata/ventas → nivel de certeza (muestra grande vs anecdótica). Priorizar: cuello de botella del embudo, fuga de captura, desperdicio en placements, Video vs Foto, saturación.
3. **Comparación con la corrida anterior** (del historial): ¿qué mejoró, qué empeoró?
4. **Recomendaciones priorizadas** — 3-6 acciones por impacto, marcadas como recomendaciones (no ejecutadas). Separar las del **anuncio/pauta** de las del **bot/web**.
5. Cierre: ofrecer aplicar cualquiera cuando Cristian dé el OK, una por una.

Tono: español claro, sin jerga. Cada métrica traducida a "qué significa para vender el apartamento". Honesto con la incertidumbre: 0 vs 1 resultado todavía es muestra chica.

## 7. Formato del historial (`reports/pauta/historial.md`)

Agregar una fila a la tabla en cada corrida, con la fecha de corte y las métricas clave. Mantener orden cronológico. Después de escribirla, comparar contra la fila anterior y comentar el cambio en el reporte. Columnas mínimas:

`Fecha corte | Días activa | Gasto COP | Impresiones | Clics enlace | Chats (IniciaChat) | Leads | Correos | CPC | CTR | Nota corta`
