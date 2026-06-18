# Compliance para anuncios de Meta — Aqualina Orange

## 1. Reglas de seguridad del proyecto (no negociables)

- Nunca incluir el teléfono de Cristian, el número exacto del apartamento ni el motivo de la venta/mudanza en ningún texto público (ads, posts, comentarios de respuesta). Esa información solo la revela el servidor por email después de calificar un lead como HOT.
- Nunca pedir ni sugerir pagos, anticipos, consignaciones o datos bancarios en el anuncio. El proyecto tiene lógica anti-estafa en el chat (`src/lib/scoring.ts`) — el anuncio debe modelar el mismo comportamiento confiable, no contradecirlo.
- El anuncio debe llevar siempre al link del sitio (`https://aqualinagirardot.company`), nunca a un número de WhatsApp directo ni a un formulario externo: el chat con IA es el único punto de calificación y captura de leads.
- Los datos del apartamento citados en el anuncio deben coincidir con `content/apartamento.md`. Si ese archivo cambia (precio, condiciones), regenerar los anuncios afectados en vez de reusar copys viejos.
- El bot del chat ya se presenta como asistente de IA al hablar con el visitante; el anuncio no necesita ni debe simular que es Cristian respondiendo en persona.

## 2. Políticas de Meta relevantes para anuncios de vivienda (real estate)

Meta aplica políticas reforzadas a anuncios de vivienda (categoría especial "Housing") para evitar discriminación, con alcance global más allá de EE.UU. Evitar:

- Lenguaje que excluya o dé preferencia por edad, sexo, estado civil, presencia de hijos, origen nacional, raza, religión o discapacidad (ej.: "ideal para parejas jóvenes sin hijos", "solo profesionales solteros"). Describir el inmueble y sus comodidades, no al tipo de persona "ideal" para vivir ahí.
- Imágenes o textos que sugieran que un grupo de personas no es bienvenido en el conjunto o el sector.
- Asumir o reforzar segmentación restringida (edad, sexo, código postal) en el copy. La configuración de segmentación de la campaña la decide quien arma el anuncio en Ads Manager — el copy nunca debe asumirla ni dirigirse a un grupo específico por atributo protegido.

### Contenido prohibido o de alto riesgo

- **Afirmaciones engañosas o exageradas**: no prometer "inversión garantizada", "rentabilidad asegurada" ni cifras de retorno inventadas. La renta vacacional se presenta como potencial del destino (Girardot), no como un hecho garantizado.
- **Comparaciones no verificables**: no inventar comparaciones de precios de la competencia que no se puedan sustentar. La única comparación válida es la que ya está en la ficha ("en el sector, apartamentos más pequeños se venden por el mismo precio").
- **Atributos personales directos**: evitar dirigirse al lector asumiendo su situación personal específica ("Tú, que tienes 3 hijos y buscas..."). Hablar de la situación o el deseo ("¿Cansado de pagar arriendo?") está bien porque no asume un atributo protegido.
- **Superlativos sin respaldo**: evitar "el mejor apartamento de Girardot", "única oportunidad en el país" — son afirmaciones no verificables que Meta puede marcar como engañosas o rechazar.
- **Mayúsculas sostenidas y puntuación excesiva**: "¡¡¡COMPRA YA!!!" reduce la calidad percibida de la cuenta y puede bajar el alcance del anuncio.
- **Texto en la imagen**: si la pieza visual lleva texto superpuesto, mantenerlo mínimo — Meta penaliza en el ranking de calidad las imágenes con mucho texto.

## 3. Checklist final antes de entregar un anuncio

1. ¿Coinciden precio, m², habitaciones, baños y ubicación con `content/apartamento.md`?
2. ¿Falta o sobra algún dato sensible prohibido (teléfono, número exacto del apto, motivo de venta)?
3. ¿Hay alguna frase que excluya o se dirija a un grupo protegido (edad, sexo, hijos, origen, religión, discapacidad)?
4. ¿Hay alguna promesa de rentabilidad garantizada o cifra de retorno inventada?
5. ¿El CTA apunta al link del chat y no a WhatsApp/formulario externo ni pide pagos?
6. ¿El tono es cálido y creíble, sin mayúsculas sostenidas ni superlativos sin respaldo?

Si una variación falla cualquier punto, corregirla antes de mostrarla. Si la corrección cambia mucho el ángulo original, señalarlo brevemente al entregar el resultado.
