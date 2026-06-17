import type { NextConfig } from "next";

const SUPABASE_HOST = "umqotxoixboqkgerlupy.supabase.co";

const CSP = [
  "default-src 'self'",
  // Next.js App Router requiere unsafe-inline para estilos y scripts en runtime
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://${SUPABASE_HOST}`,
  "font-src 'self' data:",
  `connect-src 'self' https://${SUPABASE_HOST} https://*.supabase.co https://api.openai.com`,
  // El embed de YouTube-nocookie de la galería vive en un iframe
  "frame-src https://www.youtube-nocookie.com",
  // Nadie puede incrustar este sitio en un iframe (anti-clickjacking)
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // La ficha del apto se lee con fs en runtime; sin esto el trazado de
  // archivos de Vercel podría dejarla fuera del bundle serverless.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**"],
    // sharp carga sus binarios nativos (@img/sharp-*) con requires que el
    // trazador estático no siempre detecta; sin esto el bundle serverless
    // se queda sin el binario y la función truena en runtime (no en build).
    "/api/admin/comprimir-galeria": ["./node_modules/@img/**/*"],
  },
  // Fotos de la galería: bucket público `galeria` en Supabase Storage.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/galeria/**",
      },
    ],
    // 75 para miniaturas del mosaico; 90 para la foto grande del lightbox.
    qualities: [75, 90],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
