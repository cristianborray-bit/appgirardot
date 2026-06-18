---
name: Meta Ad Generator
description: This skill should be used when the user asks to "crear un anuncio para Facebook o Instagram", "generar anuncios de Meta Ads", "escribir copy para pauta", "hacer ganchos para el anuncio", "textos para los ads del apartamento", "create a Meta ad", "Facebook/Instagram ad copy", or otherwise needs ad creative to promover el apartamento Aqualina Orange. Produce 3 variaciones de anuncio de alta conversión (ángulos distintos), cada una con gancho, texto primario, título, descripción y CTA, más una verificación de cumplimiento (políticas de Meta + reglas de seguridad del proyecto).
version: 0.1.0
---

# Generador de anuncios de Meta Ads — Aqualina Orange

## Propósito

Producir, en cada pedido, 3 variaciones de anuncio para Facebook/Instagram listas para pegar en Ads Manager: ángulos distintos, gancho propio en cada una, y verificación de cumplimiento antes de entregar.

## Antes de escribir: fuente única de verdad

- Leer siempre `content/apartamento.md` para los datos del apartamento (precio, m², distribución, zonas comunes, ubicación). No inventar ni redondear datos que no estén ahí.
- Revisar `content/galeria.json` para sugerir qué foto o el video acompaña cada variación (usar el campo `titulo` de cada foto listada).
- Si Cristian pide un dato que no aparece en la ficha (ej. una promoción nueva), preguntar antes de inventarlo.
- Nunca usar el teléfono de Cristian, el número exacto del apartamento, ni el motivo de la venta/mudanza — están prohibidos en cualquier texto público (regla del proyecto, ver AGENTS.md).

## Las 3 variaciones obligatorias

Cada tanda cubre 3 ángulos para probar qué resuena más (A/B/C testing). Salvo que se indique otro público, usar siempre estos tres:

1. **Inversión / renta** — para quien ve el apartamento como activo: potencial de renta vacacional en Girardot, precio frente al sector, negociable de contado.
2. **Familia / estilo de vida** — para quien busca vivienda: 3 habitaciones, balcón amplio, 6 piscinas y zonas comunes, seguridad 24h, todo amoblado y casi nuevo.
3. **Urgencia / precio** — para quien está listo para decidir: único dueño, 2 años de uso, negociable si la compra es rápida o de contado, comparación con apartamentos más pequeños al mismo precio.

Si se pide un público distinto (ej. inversionistas extranjeros, jubilados), ajustar los 3 ángulos a ese público sin perder la estructura de 3 variaciones.

## Estructura de cada variación

Entregar cada variación con estos 5 elementos, en este orden:

1. **Gancho** — primera línea del texto primario; debe leerse solo y generar curiosidad o parar el scroll.
2. **Texto primario** — gancho + cuerpo del anuncio (2-4 líneas cortas) + cierre con llamado a la acción hacia el chat.
3. **Título (headline)** — máx. ~40 caracteres.
4. **Descripción** — máx. ~30 caracteres.
5. **Sugerencia visual** — qué foto de `content/galeria.json` o el video usar, y por qué calza con el ángulo.

Cerrar siempre el texto primario invitando a escribir o entrar al chat (ej. "Escríbeme" / "Conoce todos los detalles aquí 👇"), apuntando a `https://aqualinagirardot.company`. El chat es quien califica al lead y revela el teléfono solo si corresponde — el anuncio nunca promete una llamada inmediata de Cristian ni pide datos de pago.

## Límites de formato de Meta Ads

- Texto primario: ideal ≤125 caracteres visibles antes de "Ver más" (puede ser más largo, pero el gancho va en esos primeros caracteres).
- Título: ~27-40 caracteres.
- Descripción: ~18-30 caracteres.
- Para Stories/Reels: texto más corto (1-2 líneas), gancho visual fuerte porque hay menos tiempo de lectura.

## Ganchos: menú rápido

Usar un tipo de gancho distinto en cada una de las 3 variaciones (no repetir fórmula en la misma tanda):

- **Pregunta directa**: "¿Buscas apartamento en Girardot con piscina, parqueadero y seguridad 24h?"
- **Cifra/dato concreto**: "84 m², 3 habitaciones, piso 10... y 6 piscinas en el conjunto."
- **Contraste de precio**: "En este sector, apartamentos más pequeños cuestan lo mismo."
- **Urgencia suave** (siempre real, nunca inventada): "Único dueño, 2 años de uso, listo para negociar de contado."
- **Beneficio + curiosidad**: "Girardot es el destino de descanso más cercano a Bogotá..."

Ver `references/ganchos.md` para la librería completa con más ejemplos y cuándo usar cada fórmula.

## Compliance: verificar antes de entregar

Revisar cada variación contra esta lista antes de mostrar el resultado (detalle completo en `references/compliance.md`):

- [ ] No aparece el teléfono de Cristian, el número exacto del apartamento ni el motivo de venta.
- [ ] No se pide ni se menciona pago, anticipo, consignación ni datos bancarios.
- [ ] No hay lenguaje que excluya o se dirija a un grupo por edad, sexo, estado civil, hijos, origen, religión o discapacidad (política de vivienda de Meta).
- [ ] No hay promesas de rentabilidad garantizada ni cifras de retorno inventadas (la renta vacacional se presenta como potencial, no como garantía).
- [ ] No hay mayúsculas sostenidas, exceso de signos/emojis, ni superlativos sin respaldo ("el mejor", "único en Colombia").
- [ ] Los datos citados (precio, m², habitaciones, baños, ubicación) coinciden exactamente con `content/apartamento.md`.
- [ ] El CTA apunta al link del chat, nunca a un número de WhatsApp directo ni a un formulario externo.

Si una variación no pasa algún punto, corregirla antes de entregarla.

## Formato de entrega

Entregar las 3 variaciones en español, una sección por variación con el ángulo como título, seguida de los 5 elementos de la estructura. Cerrar con una nota de una línea confirmando que pasaron el checklist de compliance (o señalando qué se ajustó). Ver `examples/ejemplo-variaciones.md` para una tanda completa ya resuelta, como referencia de tono, longitud y formato.

## Recursos adicionales

- `references/compliance.md` — detalle de políticas de Meta para anuncios de vivienda + reglas de seguridad propias del proyecto.
- `references/ganchos.md` — librería extendida de fórmulas de ganchos con ejemplos.
- `examples/ejemplo-variaciones.md` — una tanda completa de 3 variaciones ya generada.
