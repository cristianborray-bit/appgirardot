import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La ficha del apto se lee con fs en runtime; sin esto el trazado de
  // archivos de Vercel podría dejarla fuera del bundle serverless.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**"],
  },
};

export default nextConfig;
