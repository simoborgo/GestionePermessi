"use client";

import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Richiesta {
  id: string;
  tipo: string;
  stato: string;
  dataInizio: string;
  dataFine: string;
  oraInizio: string | null;
  oraFine: string | null;
  note: string | null;
  motivazione: string | null;
  createdAt: string;
  utente: { nome: string; cognome: string; email: string };
}

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

export default function GestioneRichieste({ richiesteIniziali }: { richiesteIniziali: Richiesta[] }) {
  const [richieste, setRichieste] = useState(richiesteIniziali);
  const [filtro, setFiltro] = useState<"TUTTE" | "PENDING" | "APPROVATA" | "RIFIUTATA">("PENDING");
  const [modalAperta, setModalAperta] = useState<Richiesta | null>(null);
  const [motivazione, setMotivazione] = useState("");
  const [elaborazione, setElaborazione] = useState(false);

  const richiesteFiltrate =
    filtro === "TUTTE" ? richieste : richieste.filter((r) => r.stato === filtro);

  const nPending = richieste.filter((r) => r.stato === "PENDING").length;

  async function gestisciRichiesta(id: string, stato: "APPROVATA" | "RIFIUTATA") {
    setElaborazione(true);
    try {
      const res = await fetch(`/api/richieste/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stato, motivazione }),
      });
      if (res.ok) {
        const dati = await res.json();
        setRichieste((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, stato: dati.richiesta.stato, motivazione: dati.richiesta.motivazione } : r
          )
        );
        setModalAperta(null);
        setMotivazione("");
      }
    } finally {
      setElaborazione(false);
    }
  }

  const filtriConfig = [
    { k: "PENDING", l: "In attesa" },
    { k: "TUTTE",   l: "Tutte" },
    { k: "APPROVATA", l: "Approvate" },
    { k: "RIFIUTATA", l: "Rifiutate" },
  ] as const;

  return (
    <>
      {/* Filtri */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filtriConfig.map(({ k, l }) => (
          <button
            key={k}
            onClick={() => setFiltro(k)}
            className="px-4 py-2 text-sm font-bold uppercase tracking-widest transition border"
            style={{
              backgroundColor: filtro === k ? "var(--color-primary)" : "white",
              color: filtro === k ? "white" : "var(--color-grey-mid)",
              borderColor: filtro === k ? "var(--color-primary)" : "var(--color-offwhite)",
              borderRadius: "var(--radius-button)",
              fontFamily: "var(--font-ui)",
            }}
          >
            {l}
            {k === "PENDING" && nPending > 0 && (
              <span
                className="ml-2 text-xs px-1.5 py-0.5 font-bold"
                style={{
                  backgroundColor: filtro === k ? "rgba(255,255,255,0.2)" : "#FEF3E4",
                  color: filtro === k ? "white" : "var(--color-primary-dark)",
                  borderRadius: "var(--radius-badge)",
                }}
              >
                {nPending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div
        className="bg-white border overflow-hidden"
        style={{ borderColor: "var(--color-offwhite)", borderRadius: "var(--radius-button)" }}
      >
        {richiesteFiltrate.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--color-grey-mid)" }}>
            Nessuna richiesta in questa categoria
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--color-offwhite)" }}>
            {richiesteFiltrate.map((r) => (
              <div key={r.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
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
                      <p className="text-sm font-semibold" style={{ color: "var(--color-black)" }}>
                        {r.utente.nome} {r.utente.cognome}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-grey-mid)" }}>
                        {r.tipo === "FERIE" ? "Ferie" : "Permesso"} ·{" "}
                        {format(new Date(r.dataInizio), "d MMM yyyy", { locale: it })}
                        {r.dataFine !== r.dataInizio &&
                          ` — ${format(new Date(r.dataFine), "d MMM yyyy", { locale: it })}`}
                        {r.oraInizio && ` · ${r.oraInizio}–${r.oraFine}`}
                      </p>
                      {r.note && (
                        <p className="text-xs mt-1" style={{ color: "var(--color-grey-icon)" }}>{r.note}</p>
                      )}
                      {r.motivazione && (
                        <p className="text-xs mt-1 italic" style={{ color: "var(--color-grey-icon)" }}>
                          Note: {r.motivazione}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: "var(--color-grey-icon)" }}>
                        Inviata il {format(new Date(r.createdAt), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <BadgeStato stato={r.stato} />
                    {r.stato === "PENDING" && (
                      <button
                        onClick={() => setModalAperta(r)}
                        className="px-3 py-1.5 text-white text-xs font-bold uppercase tracking-widest transition"
                        style={{
                          backgroundColor: "var(--color-black)",
                          borderRadius: "var(--radius-button)",
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        Gestisci
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAperta && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white w-full max-w-md shadow-xl"
            style={{ borderRadius: "var(--radius-modal)" }}
          >
            <div className="p-6 border-b" style={{ borderColor: "var(--color-offwhite)" }}>
              <h3
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}
              >
                Gestisci richiesta
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--color-grey-mid)" }}>
                {modalAperta.utente.nome} {modalAperta.utente.cognome} ·{" "}
                {modalAperta.tipo === "FERIE" ? "Ferie" : "Permesso orario"}
              </p>
            </div>
            <div className="p-6">
              <label
                className="block text-xs font-medium uppercase tracking-widest mb-1.5"
                style={{ color: "var(--color-grey-mid)" }}
              >
                Nota per il dipendente{" "}
                <span style={{ color: "var(--color-grey-icon)", textTransform: "none", letterSpacing: 0 }}>
                  (opzionale per l&apos;approvazione)
                </span>
              </label>
              <textarea
                value={motivazione}
                onChange={(e) => setMotivazione(e.target.value)}
                rows={3}
                placeholder="Aggiungi una nota..."
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  border: "1px solid var(--color-grey-icon)",
                  borderRadius: "var(--radius-button)",
                  fontSize: "14px",
                  fontFamily: "var(--font-ui)",
                  color: "var(--color-black)",
                  resize: "none",
                  outline: "none",
                }}
              />
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => { setModalAperta(null); setMotivazione(""); }}
                disabled={elaborazione}
                className="flex-1 py-2.5 text-sm font-bold uppercase tracking-widest border transition"
                style={{
                  borderColor: "var(--color-grey-icon)",
                  color: "var(--color-grey-mid)",
                  borderRadius: "var(--radius-button)",
                  fontFamily: "var(--font-ui)",
                }}
              >
                Annulla
              </button>
              <button
                onClick={() => gestisciRichiesta(modalAperta.id, "RIFIUTATA")}
                disabled={elaborazione}
                className="flex-1 py-2.5 text-white text-sm font-bold uppercase tracking-widest transition"
                style={{
                  backgroundColor: "#B91C1C",
                  borderRadius: "var(--radius-button)",
                  fontFamily: "var(--font-ui)",
                  opacity: elaborazione ? 0.5 : 1,
                }}
              >
                Rifiuta
              </button>
              <button
                onClick={() => gestisciRichiesta(modalAperta.id, "APPROVATA")}
                disabled={elaborazione}
                className="flex-1 py-2.5 text-white text-sm font-bold uppercase tracking-widest transition"
                style={{
                  backgroundColor: "var(--color-primary)",
                  borderRadius: "var(--radius-button)",
                  fontFamily: "var(--font-ui)",
                  opacity: elaborazione ? 0.5 : 1,
                }}
              >
                Approva
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
