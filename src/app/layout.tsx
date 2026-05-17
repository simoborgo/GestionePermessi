import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestione Permessi — Modar S.p.A.",
  description: "Sistema di gestione permessi e ferie per Modar S.p.A.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full">
      <body className="h-full" style={{ fontFamily: "var(--font-ui)" }}>
        {children}
      </body>
    </html>
  );
}
