import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { format } from "date-fns";
import { it } from "date-fns/locale";

function BadgeStato({ stato }: { stato: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    PENDING:   { bg: "#FEF3E4", color: "#C06A10", label: "In attesa" },
    APPROVATA: { bg: "#F0FDF4", color: "#15803D", label: "Approvata" },
    RIFIUTATA: { bg: "#FEF2F2", color: "#B91C1C", label: "Rifiutata" },
  };
  const s = styles[stato] || { bg: "#F5F2EE", color: "#6B6560", label: stato };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider"
      style={{ backgroundColor: s.bg, color: s.color, borderRadius: "var(--radius-badge)" }}
    >
      {s.label}
    </span>
  );
}

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const richieste = await prisma.richiesta.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const pending   = richieste.filter((r) => r.stato === "PENDING").length;
  const approvate = richieste.filter((r) => r.stato === "APPROVATA").length;
  const rifiutate = richieste.filter((r) => r.stato === "RIFIUTATA").length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-offwhite)" }}>
      <Navbar nome={session.nome} cognome={session.cognome} ruolo={session.ruolo} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}
            >
              Le mie richieste
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-grey-mid)" }}>
              Benvenuto, {session.nome}!
            </p>
          </div>
          <Link
            href="/nuova-richiesta"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold uppercase tracking-widest transition"
            style={{
              backgroundColor: "var(--color-primary)",
              borderRadius: "var(--radius-button)",
              fontFamily: "var(--font-ui)",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuova richiesta
          </Link>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "In attesa",  valore: pending,   colore: "var(--color-primary)" },
            { label: "Approvate",  valore: approvate, colore: "#15803D" },
            { label: "Rifiutate",  valore: rifiutate, colore: "#B91C1C" },
          ].map(({ label, valore, colore }) => (
            <div
              key={label}
              className="bg-white p-5 border"
              style={{ borderColor: "var(--color-offwhite)", borderRadius: "var(--radius-button)" }}
            >
              <p className="text-3xl font-bold" style={{ color: "var(--color-black)" }}>{valore}</p>
              <p className="text-xs font-medium uppercase tracking-widest mt-1" style={{ color: colore }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Lista richieste */}
        <div
          className="bg-white border overflow-hidden"
          style={{ borderColor: "var(--color-offwhite)", borderRadius: "var(--radius-button)" }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: "var(--color-offwhite)" }}
          >
            <h2
              className="font-semibold text-sm uppercase tracking-widest"
              style={{ color: "var(--color-grey-mid)", fontFamily: "var(--font-ui)" }}
            >
              Storico richieste
            </h2>
          </div>

          {richieste.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "var(--color-grey-icon)" }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p style={{ color: "var(--color-grey-mid)" }}>Nessuna richiesta ancora</p>
              <Link
                href="/nuova-richiesta"
                className="text-sm font-medium mt-2 inline-block"
                style={{ color: "var(--color-primary)" }}
              >
                Crea la tua prima richiesta →
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--color-offwhite)" }}>
              {richieste.map((r) => (
                <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: r.tipo === "FERIE" ? "#EFF6FF" : "#FEF3E4",
                        borderRadius: "var(--radius-button)",
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{ color: r.tipo === "FERIE" ? "#3B82F6" : "var(--color-primary)" }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        {r.tipo === "FERIE" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--color-black)" }}
                      >
                        {r.tipo === "FERIE" ? "Ferie" : "Permesso orario"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-grey-mid)" }}>
                        {format(new Date(r.dataInizio), "d MMM yyyy", { locale: it })}
                        {r.dataFine.toISOString() !== r.dataInizio.toISOString() &&
                          ` — ${format(new Date(r.dataFine), "d MMM yyyy", { locale: it })}`}
                        {r.oraInizio && ` · ${r.oraInizio}–${r.oraFine}`}
                      </p>
                      {r.note && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-grey-icon)" }}>
                          {r.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <BadgeStato stato={r.stato} />
                    {r.stato === "RIFIUTATA" && r.motivazione && (
                      <span
                        className="text-xs hidden sm:block max-w-xs truncate italic"
                        style={{ color: "var(--color-grey-icon)" }}
                      >
                        {r.motivazione}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
