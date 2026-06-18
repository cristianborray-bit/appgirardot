import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/fraunces";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./globals.css";
import { META_PIXEL_ID } from "@/lib/meta-pixel";

export const viewport: Viewport = {
  themeColor: "#16334f",
  // Con el chat a pantalla completa, el teclado del celular debe EMPUJAR el
  // contenido (no taparlo): así la cajita de escribir queda siempre visible.
  interactiveWidget: "resizes-content",
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
      <body className="min-h-full flex flex-col">
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
