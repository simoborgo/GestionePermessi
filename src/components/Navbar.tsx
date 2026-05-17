"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import LogoModar from "./LogoModar";

interface Props {
  nome: string;
  cognome: string;
  ruolo: "DIPENDENTE" | "RESPONSABILE";
}

export default function Navbar({ nome, cognome, ruolo }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuAperto, setMenuAperto] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const links =
    ruolo === "RESPONSABILE"
      ? [
          { href: "/admin", label: "Richieste" },
          { href: "/admin/calendario", label: "Calendario" },
          { href: "/admin/utenti", label: "Utenti" },
        ]
      : [
          { href: "/dashboard", label: "Le mie richieste" },
          { href: "/nuova-richiesta", label: "Nuova richiesta" },
        ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white border-b sticky top-0 z-40" style={{ borderColor: "var(--color-offwhite)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <LogoModar size="sm" />

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium uppercase tracking-widest transition"
                style={{
                  fontFamily: "var(--font-ui)",
                  color: isActive(l.href) ? "var(--color-primary)" : "var(--color-grey-mid)",
                  borderBottom: isActive(l.href) ? "2px solid var(--color-primary)" : "2px solid transparent",
                  borderRadius: 0,
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-black)", fontFamily: "var(--font-ui)" }}
              >
                {nome} {cognome}
              </span>
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--color-grey-icon)" }}
              >
                {ruolo === "RESPONSABILE" ? "Responsabile" : "Dipendente"}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 transition"
              style={{ color: "var(--color-grey-icon)", borderRadius: "var(--radius-button)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-grey-icon)")}
              title="Esci"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {/* Mobile burger */}
            <button
              className="md:hidden p-2"
              style={{ color: "var(--color-grey-icon)", borderRadius: "var(--radius-button)" }}
              onClick={() => setMenuAperto(!menuAperto)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={menuAperto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuAperto && (
          <div className="md:hidden border-t py-2" style={{ borderColor: "var(--color-offwhite)" }}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuAperto(false)}
                className="block px-4 py-3 text-sm font-medium uppercase tracking-widest transition"
                style={{
                  fontFamily: "var(--font-ui)",
                  color: isActive(l.href) ? "var(--color-primary)" : "var(--color-grey-mid)",
                  backgroundColor: isActive(l.href) ? "#FEF3E4" : "transparent",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
