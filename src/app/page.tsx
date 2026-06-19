import Image from "next/image";
import { ChatSection } from "@/components/chat-section";
import { Galeria } from "@/components/galeria";
import { ScrollReveal } from "@/components/scroll-reveal";

const SPECS = [
  { value: "84", label: "m² const." },
  { value: "3", label: "habitaciones" },
  { value: "3", label: "baños" },
  { value: "10", label: "piso · ascensor" },
  { value: "4", label: "estrato" },
  { value: "1", label: "parqueadero" },
];

const AMENIDADES = [
  "6 piscinas",
  "Gimnasio",
  "4 zonas BBQ",
  "Salón de juegos",
  "Canchas",
  "Sendero para correr",
  "Vigilancia 24h",
  "Súper interno",
  "Parque infantil",
];

const TRUST_ITEMS = [
  { icon: "✓", text: "Escrituras y predial al día" },
  { icon: "◷", text: "Sin anticipos · todo en notaría" },
  { icon: "⌖", text: "Verificable en Google Maps" },
];

const ENTORNO_PUNTOS = [
  {
    icon: "⌖",
    title: "El mejor sector",
    desc: "Rodeado de los condominios más valorizados de Girardot.",
  },
  {
    icon: "↗",
    title: "Sendero natural",
    desc: "Para caminar y correr dentro del conjunto.",
  },
  {
    icon: "▤",
    title: "Amplios parqueaderos",
    desc: "Gran número para visitantes. Te visitan sin problema.",
  },
  {
    icon: "❄",
    title: "Tranquilo y seguro",
    desc: "Entorno residencial, fresco y de baja densidad.",
  },
];

const LEGAL_PUNTOS = [
  "Servicios de agua y luz al día, sin problemas de acueducto.",
  "Todo correctamente estipulado ante la alcaldía.",
  "Sin inconvenientes en el POT (Plan de Ordenamiento Territorial).",
];

export default function Home() {
  return (
    <div className="min-h-full bg-arena-bg font-arena-body text-arena-text">
      <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
        {/* ── NAVBAR ── */}
        <nav className="flex items-center justify-between px-[18px] py-2 lg:px-0 lg:pt-6">
          <span className="text-[11.5px] font-semibold tracking-[0.02em] text-[#6e6457]">
            Aqualina Orange · Girardot
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-arena-accent">
            <span
              className="h-[7px] w-[7px] rounded-full bg-arena-accent animate-arena-pulse-owner"
              aria-hidden="true"
            />
            Dueño directo
          </span>
        </nav>

        {/* ── HERO ── */}
        <section
          className="relative mx-3.5 h-[380px] overflow-hidden rounded-arena-hero lg:mx-0 lg:h-[460px]"
          style={{ animation: "arena-fade-up .7s both" }}
        >
          <div className="absolute inset-0 animate-arena-kenburns origin-center">
            <Image
              src="/portada.jpg"
              alt="Vista aérea del conjunto Aqualina Orange con piscinas y montañas"
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              preload
              className="object-cover"
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(33,28,22,.84) 0%, rgba(33,28,22,.3) 42%, transparent 70%)",
            }}
          />
          <span className="absolute left-3.5 top-3.5 rounded-arena-pill bg-arena-accent px-3.5 py-[9px] text-[10.5px] font-extrabold uppercase tracking-[0.13em] text-white animate-arena-badge-glow">
            En venta · Único dueño
          </span>
          <span className="absolute right-3.5 top-3.5 rounded-arena-pill bg-arena-bg px-[13px] py-[9px] text-xs font-bold text-arena-dark shadow-arena-hero-price">
            Desde $320M
          </span>
          <div className="absolute bottom-[18px] left-[18px] right-[18px]">
            <h1 className="font-arena-display text-[30px] font-medium leading-[1.12] tracking-[-0.01em] text-white lg:text-4xl">
              Piso 10, 84&nbsp;m² y brisa propia.
            </h1>
            <p className="mt-2 text-[13px] text-white/80">
              Conjunto Aqualina Orange · Vía Nariño, Girardot
            </p>
          </div>
        </section>

        {/* ── OWNER CARD + CTA ── */}
        <section
          className="mx-3.5 mt-4 rounded-arena-md border border-arena-border bg-arena-surface p-4 lg:mx-0"
          style={{ animation: "arena-fade-up .7s .06s both" }}
        >
          <div className="flex items-center gap-[13px]">
            <div
              className="relative h-[82px] w-12 flex-none overflow-hidden rounded-arena-avatar border-2 border-arena-accent bg-arena-surface-warm shadow-arena-owner"
              style={{ animation: "arena-pop .55s .15s both" }}
            >
              <Image
                src="/perfil-clean.jpg"
                alt="Cristian Borray"
                width={48}
                height={82}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="leading-[1.34]">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[15px] font-bold animate-arena-shine"
                  style={{
                    background:
                      "linear-gradient(100deg, #211c16 0%, #211c16 38%, #cf7d4f 50%, #211c16 62%, #211c16 100%)",
                    backgroundSize: "220% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Cristian Borray
                </span>
                <span
                  className="inline-flex h-[15px] w-[15px] items-center justify-center rounded-full bg-arena-accent text-[9px] text-white"
                  style={{ animation: "arena-pop .5s .5s both" }}
                  aria-label="Verificado"
                >
                  ✓
                </span>
              </div>
              <p className="text-xs font-semibold text-arena-accent">
                Economista · Especializado en IA
              </p>
              <p className="text-[11.5px] font-medium text-arena-text-muted">
                Dueño directo · sin intermediarios
              </p>
            </div>
          </div>
          <a
            href="#seccion-chat"
            className="mt-3.5 flex h-[52px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-arena-dark text-[15px] font-bold text-arena-bg"
          >
            Hablar con el asistente{" "}
            <span className="inline-block text-[17px] animate-arena-nudge">
              →
            </span>
          </a>
        </section>

        {/* ── PROCESO DE CONTACTO ── */}
        <ScrollReveal className="mx-3.5 mt-4 rounded-arena-lg border border-arena-border bg-arena-surface px-[18px] py-5 lg:mx-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-arena-accent">
            Sin intermediarios
          </p>
          <h2 className="mt-1 font-arena-display text-[22px] font-medium tracking-[-0.01em]">
            Así funciona el proceso
          </h2>
          <p className="mt-[7px] mb-5 text-[12.5px] leading-[1.55] text-arena-text-mid">
            Transparente de principio a fin. Sabes exactamente qué pasa con tus
            datos y cuándo te contactamos.
          </p>

          {/* Paso 1 */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-arena-accent font-arena-display text-base font-bold text-white">
                1
              </div>
              <div
                className="mt-1 w-0.5 flex-1"
                style={{
                  background: "linear-gradient(to bottom, #e0c9b0, #efe7da)",
                  minHeight: 36,
                }}
              />
            </div>
            <div className="pb-6">
              <div className="flex items-center gap-[7px]">
                <span className="text-[15px]" aria-hidden="true">
                  🔍
                </span>
                <p className="text-sm font-bold">Explora y pregunta</p>
              </div>
              <p className="mt-1 text-[12.5px] leading-[1.55] text-arena-text-mid">
                Recorre la página con calma. Usa el asistente IA para resolver
                cualquier duda — precio, estado legal, visitas, lo que sea.
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-arena-accent font-arena-display text-base font-bold text-white">
                2
              </div>
              <div
                className="mt-1 w-0.5 flex-1"
                style={{
                  background: "linear-gradient(to bottom, #e0c9b0, #efe7da)",
                  minHeight: 36,
                }}
              />
            </div>
            <div className="pb-6">
              <div className="flex items-center gap-[7px]">
                <span className="text-[15px]" aria-hidden="true">
                  📋
                </span>
                <p className="text-sm font-bold">
                  Deja solo tu nombre y WhatsApp
                </p>
              </div>
              <p className="mt-1 text-[12.5px] leading-[1.55] text-arena-text-mid">
                Nada más. El asistente te enviará una confirmación automática de
                que tu mensaje llegó. Sin spam, sin sorpresas.
              </p>
              <div className="mt-2.5 flex flex-col gap-[7px] rounded-arena-xs bg-arena-bg p-[11px_13px]">
                <div
                  className="rounded-[9px] border border-arena-border bg-arena-surface px-3 py-[9px] text-xs font-medium text-arena-text-faint"
                  aria-hidden="true"
                >
                  Tu nombre…
                </div>
                <div
                  className="rounded-[9px] border border-arena-border bg-arena-surface px-3 py-[9px] text-xs font-medium text-arena-text-faint"
                  aria-hidden="true"
                >
                  WhatsApp…
                </div>
                <a
                  href="#seccion-chat"
                  className="flex h-10 items-center justify-center gap-[7px] rounded-[10px] bg-arena-dark text-[13px] font-bold text-arena-bg"
                >
                  Enviar al asistente
                  <span className="inline-block text-sm animate-arena-nudge">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-arena-accent font-arena-display text-base font-bold text-white">
                3
              </div>
            </div>
            <div>
              <div className="flex items-center gap-[7px]">
                <span className="text-[15px]" aria-hidden="true">
                  📞
                </span>
                <p className="text-sm font-bold">
                  Cristian te contacta en menos de 24h
                </p>
              </div>
              <p className="mt-1 text-[12.5px] leading-[1.55] text-arena-text-mid">
                Te llama personalmente para responder tus dudas de fondo y
                agendar una visita cuando tú puedas.
              </p>
            </div>
          </div>

          {/* Nota de privacidad */}
          <div className="mt-5 flex gap-[9px] rounded-arena-xs bg-arena-bg p-3">
            <span className="mt-px flex-none text-sm" aria-hidden="true">
              🔒
            </span>
            <p className="text-[11.5px] font-medium leading-[1.5] text-arena-text-mid">
              Tu información es confidencial. Solo Cristian Borray tendrá acceso
              a tus datos. No los compartimos con terceros ni agencias
              inmobiliarias.
            </p>
          </div>
        </ScrollReveal>

        {/* ── TRUST STRIP ── */}
        <div className="flex gap-[9px] px-3.5 pt-[18px] pb-1 lg:px-0">
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={item.text}
              className="flex-1 rounded-[15px] bg-arena-surface-warm px-[11px] py-3"
              style={{
                animation: `arena-fade-up .7s ${0.1 + i * 0.06}s both`,
              }}
            >
              <p
                className="font-arena-display text-xl font-bold text-arena-accent"
                aria-hidden="true"
              >
                {item.icon}
              </p>
              <p className="mt-1 text-[11.5px] font-semibold leading-[1.3]">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* ── SPECS ── */}
        <ScrollReveal className="px-[18px] pt-[22px] pb-1.5 lg:px-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-arena-accent">
            El apartamento
          </p>
          <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-arena-sm bg-arena-border">
            {SPECS.map((spec) => (
              <div key={spec.label} className="bg-arena-surface px-3 py-[15px]">
                <p className="font-arena-display text-[22px] font-semibold">
                  {spec.value}
                </p>
                <p className="text-[11px] font-medium text-arena-text-muted">
                  {spec.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-[9px] flex items-center gap-[11px] rounded-[15px] bg-arena-surface-warm px-[15px] py-[13px]">
            <span className="font-arena-display text-[19px] font-semibold leading-none text-arena-accent">
              ＋
            </span>
            <div className="leading-[1.25]">
              <p className="text-[13px] font-bold">
                Depósito privado · en el mismo piso
              </p>
              <p className="text-[11.5px] font-medium text-arena-text-muted">
                Incluido, además del parqueadero cubierto
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── GALERÍA (componente existente — R2 vestido con Arena) ── */}
        <ScrollReveal>
          <Galeria />
        </ScrollReveal>

        {/* ── VERIFICACIÓN ANTI-DUDA ── */}
        <ScrollReveal className="mx-3.5 mt-[22px] rounded-arena-lg bg-arena-dark px-[18px] py-5 text-arena-bg lg:mx-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-arena-gold-warm">
            100% verificable
          </p>
          <h2 className="mt-[7px] font-arena-display text-[22px] font-medium text-white">
            Confirma que la venta es real
          </h2>
          <p className="mt-1 mb-4 text-[12.5px] leading-[1.5] text-arena-bg/70">
            No tienes que confiar a ciegas. Compruébalo tú mismo en 3 pasos.
          </p>
          <div className="flex flex-col gap-[11px]">
            {[
              {
                n: "1",
                title: "Búscalo en Google Maps",
                desc: "Escribe \"Aqualina Orange\" y verás el conjunto.",
              },
              {
                n: "2",
                title: "Visita la dirección",
                desc: "Transversal 26 No. 05A-02, Vía Nariño, Girardot.",
              },
              {
                n: "3",
                title: "Pregunta en portería",
                desc: "Confirma el apartamento en venta del piso 10.",
              },
            ].map((paso) => (
              <div key={paso.n} className="flex items-start gap-3">
                <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-arena-accent font-arena-display text-[13px] font-semibold text-white">
                  {paso.n}
                </span>
                <div className="leading-[1.4]">
                  <p className="text-[13px] font-bold">{paso.title}</p>
                  <p className="text-xs font-medium text-arena-bg/70">
                    {paso.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="https://www.google.com/maps/search/Aqualina+Orange+Girardot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-[14px] bg-arena-bg text-[13.5px] font-bold text-arena-dark"
          >
            Abrir en Google Maps
          </a>
        </ScrollReveal>

        {/* ── AMENIDADES ── */}
        <ScrollReveal className="flex flex-wrap gap-[7px] px-4 pt-6 pb-1 lg:px-0">
          <p className="mb-1 w-full text-[11px] font-bold uppercase tracking-[0.14em] text-arena-accent">
            El conjunto
          </p>
          {AMENIDADES.map((a) => (
            <span
              key={a}
              className="rounded-arena-pill bg-arena-surface-warm px-3 py-[7px] text-xs font-semibold"
            >
              {a}
            </span>
          ))}
        </ScrollReveal>

        {/* ── ENTORNO · INTRO ── */}
        <ScrollReveal className="px-[18px] pt-[30px] pb-1 lg:px-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-arena-accent">
            El entorno · por qué aquí
          </p>
          <h2 className="mt-[9px] font-arena-display text-[27px] font-medium leading-[1.16] tracking-[-0.01em]">
            Girardot es caliente.
            <br />
            Aquí, la montaña lo cambia todo.
          </h2>
          <p className="mt-[11px] text-[13.5px] leading-[1.6] text-arena-text-mid">
            El conjunto está sobre la montaña, en el mejor sector de Girardot.
            Por eso corre una brisa fresca natural que no encontrarás en la zona
            plana ni en Ricaurte. Llegas a la ciudad caliente… y subes a
            respirar.
          </p>
        </ScrollReveal>

        {/* ── TARJETA CLIMA ── */}
        <ScrollReveal className="relative mx-3.5 mt-4 overflow-hidden rounded-arena-lg bg-arena-climate-bg p-[22px_18px] text-arena-climate-text lg:mx-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 85% 0%, rgba(120,168,150,.34) 0%, rgba(29,42,42,0) 60%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-[9px]">
              <span className="text-[21px]" aria-hidden="true">
                🌿
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-arena-climate-accent">
                Clima fresco de montaña
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-arena-display text-[44px] font-semibold leading-none text-white">
                +5°
              </span>
              <span className="text-[13px] font-medium leading-[1.35] text-arena-climate-text/75">
                más fresco que
                <br />
                el centro de Girardot
              </span>
            </div>
            <p className="mt-3.5 text-[12.5px] leading-[1.55] text-arena-climate-text/75">
              La altura sobre la montaña hace que las noches se disfruten de
              verdad. Aire limpio, brisa natural y un entorno tranquilo rodeado
              de los mejores condominios de la ciudad.
            </p>
          </div>
        </ScrollReveal>

        {/* ── ENTORNO · PUNTOS ── */}
        <ScrollReveal className="grid grid-cols-2 gap-[9px] px-3.5 pt-3.5 lg:px-0">
          {ENTORNO_PUNTOS.map((p) => (
            <div
              key={p.title}
              className="rounded-arena-sm border border-arena-border bg-arena-surface p-[15px]"
            >
              <p
                className="font-arena-display text-[19px] font-semibold text-arena-accent"
                aria-hidden="true"
              >
                {p.icon}
              </p>
              <p className="mt-[7px] text-[13px] font-bold">{p.title}</p>
              <p className="mt-[3px] text-[11.5px] font-medium leading-[1.4] text-arena-text-muted">
                {p.desc}
              </p>
            </div>
          ))}
        </ScrollReveal>

        {/* ── VÍAS DE ACCESO ── */}
        <ScrollReveal className="mx-3.5 mt-3.5 rounded-[20px] bg-arena-surface-warm p-[18px] lg:mx-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-arena-accent">
            Fácil de llegar
          </p>
          <p className="mt-1 font-arena-display text-[18px] font-medium">
            Varias vías de acceso
          </p>
          <div className="mt-[13px] flex items-center gap-2.5">
            <div className="flex-1 rounded-arena-xs bg-arena-surface p-[11px_13px] text-center">
              <p className="text-[13px] font-bold">Por Melgar</p>
            </div>
            <span className="text-[13px] font-semibold text-arena-accent">
              ó
            </span>
            <div className="flex-1 rounded-arena-xs bg-arena-surface p-[11px_13px] text-center">
              <p className="text-[13px] font-bold">Por La Mesa</p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── PRECIO VS RICAURTE ── */}
        <ScrollReveal className="mx-3.5 mt-3.5 rounded-[20px] border border-arena-border bg-arena-surface p-[18px] lg:mx-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-arena-accent">
            El precio justo
          </p>
          <p className="mt-2 mb-3.5 text-[12.5px] leading-[1.55] text-arena-text-mid">
            Mejor clima, mejor sector y mejor precio que proyectos comparables
            en la zona de Ricaurte.
          </p>
          <div className="flex items-stretch gap-2.5">
            <div className="flex-1 rounded-[14px] bg-arena-dark p-[13px] text-arena-bg">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-arena-gold-warm">
                Aquí · montaña
              </p>
              <p className="mt-1 font-arena-display text-[19px] font-semibold">
                Desde $320M
              </p>
              <p className="mt-0.5 text-[10.5px] font-medium text-arena-bg/70">
                Clima fresco
              </p>
            </div>
            <div className="flex-1 rounded-[14px] border border-dashed border-[#d8ccb6] bg-arena-bg p-[13px]">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-arena-text-faint">
                Zona Ricaurte
              </p>
              <p className="mt-1 font-arena-display text-[19px] font-semibold text-arena-text-faint">
                Similar o más
              </p>
              <p className="mt-0.5 text-[10.5px] font-medium text-arena-text-faint">
                Zona plana y caliente
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── TRANQUILIDAD LEGAL ── */}
        <ScrollReveal className="mx-3.5 mt-3.5 rounded-[20px] bg-arena-surface-warm p-[18px] lg:mx-0">
          <div className="flex items-center gap-[9px]">
            <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-arena-accent text-[13px] text-white">
              ✓
            </span>
            <p className="text-sm font-bold">Sin sorpresas. Todo en regla.</p>
          </div>
          <div className="mt-[13px] flex flex-col gap-2">
            {LEGAL_PUNTOS.map((punto) => (
              <div key={punto} className="flex items-start gap-[9px]">
                <span
                  className="text-[13px] font-bold text-arena-accent"
                  aria-hidden="true"
                >
                  ·
                </span>
                <p className="text-[12.5px] font-medium leading-[1.45] text-[#5f5648]">
                  {punto}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── CHAT (componente existente — R2 vestido con Arena) ── */}
        <section
          id="seccion-chat"
          aria-label="Chat con el asistente virtual"
          className="mx-3.5 mt-[22px] scroll-mt-4 lg:mx-0"
        >
          <ChatSection />
        </section>

        {/* ── PRECIOS ── */}
        <ScrollReveal className="px-3.5 pt-[22px] pb-1 lg:px-0">
          <div className="flex gap-[9px]">
            <div className="flex-1 rounded-arena-sm bg-arena-dark p-[15px] text-arena-bg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-arena-gold-warm">
                Amoblado
              </p>
              <p className="mt-1 font-arena-display text-[22px] font-semibold">
                $350M
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-arena-bg/70">
                Todo incluido
              </p>
            </div>
            <div className="flex-1 rounded-arena-sm border border-arena-border bg-arena-surface p-[15px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-arena-accent">
                Desocupado
              </p>
              <p className="mt-1 font-arena-display text-[22px] font-semibold">
                $320M
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-arena-text-muted">
                Negociable de contado
              </p>
            </div>
          </div>
          <p className="mt-[9px] text-center text-[11.5px] font-medium text-arena-text-muted">
            Administración aprox. $300.000/mes · negociable si la compra es
            rápida o de contado
          </p>
        </ScrollReveal>
      </div>

      {/* ── FOOTER ── */}
      <footer className="px-[18px] pt-2 pb-[26px] text-center">
        <p className="text-[11.5px] font-medium leading-[1.5] text-arena-text-faint">
          Publicado por{" "}
          <strong className="font-bold text-[#6e6457]">Cristian Borray</strong>{" "}
          · Economista especializado en IA · Dueño directo, atención con
          asistente de IA
        </p>
      </footer>
    </div>
  );
}
