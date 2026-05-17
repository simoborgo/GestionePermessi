"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import LogoModar from "@/components/LogoModar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrore("");
    setCaricamento(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });

      const dati = await res.json();

      if (!res.ok) {
        setErrore(dati.errore || "Errore di accesso");
        return;
      }

      if (dati.utente.ruolo === "RESPONSABILE") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setErrore("Errore di connessione. Riprova.");
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-offwhite)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <LogoModar size="lg" />
          <p
            className="mt-3 text-sm tracking-widest uppercase"
            style={{ color: "var(--color-grey-mid)", fontFamily: "var(--font-ui)" }}
          >
            Gestione Permessi
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-white border p-8"
          style={{ borderColor: "var(--color-offwhite)", borderRadius: "var(--radius-modal)" }}
        >
          <h2
            className="mb-6 text-xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}
          >
            Accedi al portale
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-widest mb-1.5"
                style={{ color: "var(--color-grey-mid)" }}
              >
                Email aziendale
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nome.cognome@modar.it"
                className="w-full px-4 py-2.5 border bg-white text-sm transition"
                style={{
                  borderColor: "var(--color-grey-icon)",
                  borderRadius: "var(--radius-button)",
                  color: "var(--color-black)",
                  fontFamily: "var(--font-ui)",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.boxShadow = "var(--focus-ring)")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium uppercase tracking-widest mb-1.5"
                style={{ color: "var(--color-grey-mid)" }}
              >
                PIN (5 cifre)
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{5}"
                maxLength={5}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 5))}
                required
                placeholder="•••••"
                className="w-full px-4 py-2.5 border bg-white text-sm transition tracking-widest"
                style={{
                  borderColor: "var(--color-grey-icon)",
                  borderRadius: "var(--radius-button)",
                  color: "var(--color-black)",
                  fontFamily: "var(--font-ui)",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.boxShadow = "var(--focus-ring)")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>

            {errore && (
              <div
                className="text-sm px-4 py-3"
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#B91C1C",
                  borderRadius: "var(--radius-button)",
                }}
              >
                {errore}
              </div>
            )}

            <button
              type="submit"
              disabled={caricamento || pin.length !== 5}
              className="w-full py-3 text-white text-sm font-bold uppercase tracking-widest transition"
              style={{
                backgroundColor: caricamento || pin.length !== 5 ? "var(--color-primary-light)" : "var(--color-primary)",
                borderRadius: "var(--radius-button)",
                fontFamily: "var(--font-ui)",
                cursor: caricamento || pin.length !== 5 ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!caricamento && pin.length === 5)
                  (e.target as HTMLElement).style.backgroundColor = "var(--color-primary-dark)";
              }}
              onMouseLeave={(e) => {
                if (!caricamento && pin.length === 5)
                  (e.target as HTMLElement).style.backgroundColor = "var(--color-primary)";
              }}
            >
              {caricamento ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: "var(--color-grey-icon)" }}
        >
          Le credenziali vengono fornite dall&apos;amministratore di sistema
        </p>
      </div>
    </div>
  );
}
