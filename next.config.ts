import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La ficha del apto se lee con fs en runtime; sin esto el trazado de
  // archivos de Vercel podría dejarla fuera del bundle serverless.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**"],
  },
  // Fotos de la galería: bucket público `galeria` en Supabase Storage.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "umqotxoixboqkgerlupy.supabase.co",
        pathname: "/storage/v1/object/public/galeria/**",
      },
    ],
  },
};

export default nextConfig;
