import { ChatSection } from "@/components/chat-section";
import { Galeria } from "@/components/galeria";

const CARACTERISTICAS = [
  "84 m²",
  "3 habitaciones",
  "3 baños",
  "Piso 10",
  "Parqueadero privado",
  "Desde $320 millones",
];

const SELLOS = [
  "El asistente es una IA y lo dice desde el primer mensaje",
  "Dirección real, verificable en Google Maps",
  "Sin anticipos ni separaciones: todo se firma en notaría",
];

export default function Home() {
  return (
    <>
      <p className="bg-magdalena px-4 py-2 text-center text-sm font-bold tracking-wide text-white">
        Aqualina Orange · Vía Nariño, Girardot
      </p>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-8 lg:grid-cols-[5fr_6fr] lg:items-center lg:gap-12 lg:py-14">
        <section>
          <p className="text-sm font-bold uppercase tracking-widest text-mango-oscuro">
            Apartamento en venta · Único dueño
          </p>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Piso 10, 84 m² y brisa propia en Aqualina Orange
          </h1>
          <p className="mt-4 text-lg leading-8 text-magdalena-suave">
            Tres habitaciones, tres baños, balcón amplio y parqueadero privado,
            en un conjunto con piscinas, gimnasio y vigilancia 24 horas.
            Amoblado o desocupado: tú eliges.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {CARACTERISTICAS.map((item) => (
              <li
                key={item}
                className="rounded-full border border-agua-borde bg-agua px-3.5 py-1.5 text-sm font-bold"
              >
                {item}
              </li>
            ))}
          </ul>

          <ul className="mt-8 space-y-2.5 rounded-2xl border border-agua-borde bg-white p-5">
            {SELLOS.map((sello) => (
              <li key={sello} className="flex gap-2.5 leading-snug">
                <span aria-hidden="true" className="font-bold text-mango-oscuro">
                  ✓
                </span>
                {sello}
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Chat con el asistente virtual">
          <ChatSection />
        </section>
      </main>

      <Galeria />

      <footer className="border-t border-agua-borde px-4 py-6 text-center text-sm leading-6 text-magdalena-suave">
        Transversal 26 No. 05A-02, Vía Nariño, Girardot (Cundinamarca)
        <br />
        Publicado por Cristian, el dueño · Atención con asistente de
        inteligencia artificial
      </footer>
    </>
  );
}
