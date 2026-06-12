import type { Metadata } from "next";

// El panel es privado: fuera de los buscadores.
export const metadata: Metadata = {
  title: "Panel — CristianBot",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
