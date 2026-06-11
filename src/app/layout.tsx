import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#16334f",
};

export const metadata: Metadata = {
  title: "Apartamento en venta — Aqualina Orange, Girardot",
  description:
    "Apartamento de 84 m², 3 habitaciones y 3 baños en piso 10, conjunto Aqualina Orange (Girardot). Pregunta lo que quieras: el asistente virtual te responde al instante.",
  openGraph: {
    title: "Apartamento en venta — Aqualina Orange, Girardot",
    description:
      "84 m² · 3 habitaciones · 3 baños · Piso 10 · Parqueadero privado. Chatea con el asistente y resuelve todas tus dudas al instante.",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
