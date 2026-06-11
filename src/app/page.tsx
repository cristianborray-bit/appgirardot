export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-24 text-center font-sans">
      <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700">
        Aqualina Orange · Girardot
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
        Apartamento en venta
      </h1>
      <p className="max-w-xl text-lg leading-8 text-zinc-600">
        84 m² · 3 habitaciones · 3 baños · Piso 10 · Balcón amplio · Parqueadero
        privado
      </p>
      <p className="max-w-xl text-base leading-7 text-zinc-500">
        Muy pronto podrás chatear aquí con el asistente virtual y conocer todos
        los detalles al instante.
      </p>
    </main>
  );
}
