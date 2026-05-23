"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Sessione {
  nome: string;
  cognome: string;
  ruolo: "DIPENDENTE" | "RESPONSABILE";
}

const inputStyle = {
  borderColor: "var(--color-grey-icon)",
  borderRadius: "var(--radius-button)",
  color: "var(--color-black)",
  fontFamily: "var(--font-ui)",
  outline: "none",
  width: "100%",
  padding: "10px 16px",
  fontSize: "14px",
  border: "1px solid",
  backgroundColor: "white",
};

export default function NuovaRichiesta() {
  const router = useRouter();
  const [sessione, setSessione] = useState<Sessione | null>(null);
  const [tipo, setTipo] = useState<"PERMESSO" | "FERIE">("PERMESSO");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [oraInizio, setOraInizio] = useState("");
  const [oraFine, setOraFine] = useState("");
  const [note, setNote] = useState("");
  const [legge104, setLegge104] = useState(false);
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  if (!sessione) {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setSessione(d.utente))
      .catch(() => router.push("/login"));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrore("");

    if (tipo === "PERMESSO" && (!oraInizio || !oraFine)) {
      setErrore("Per il permesso indicare l'orario di inizio e fine");
      return;
    }
    if (tipo === "FERIE" && dataFine < dataInizio) {
      setErrore("La data di fine non può essere precedente alla data di inizio");
      return;
    }

    setCaricamento(true);
    try {
      const res = await fetch("/api/richieste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          dataInizio,
          dataFine: tipo === "PERMESSO" ? dataInizio : dataFine,
          oraInizio: tipo === "PERMESSO" ? oraInizio : undefined,
          oraFine: tipo === "PERMESSO" ? oraFine : undefined,
          note,
          legge104,
        }),
      });
      const dati = await res.json();
      if (!res.ok) { setErrore(dati.errore || "Errore nell'invio"); return; }
      router.push("/dashboard");
    } catch {
      setErrore("Errore di connessione. Riprova.");
    } finally {
      setCaricamento(false);
    }
  }

  if (!sessione) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-offwhite)" }}>
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const oggi = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-offwhite)" }}>
      <Navbar nome={sessione.nome} cognome={sessione.cognome} ruolo={sessione.ruolo} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-medium mb-4 transition"
            style={{ color: "var(--color-grey-mid)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Torna indietro
          </button>
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}
          >
            Nuova richiesta
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-grey-mid)" }}>
            Compila il modulo per inviare la tua richiesta
          </p>
        </div>

        <div
          className="bg-white border p-6"
          style={{ borderColor: "var(--color-offwhite)", borderRadius: "var(--radius-modal)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo */}
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: "var(--color-grey-mid)" }}
              >
                Tipo di richiesta
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["PERMESSO", "FERIE"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className="p-4 border-2 text-left transition"
                    style={{
                      borderColor: tipo === t ? "var(--color-primary)" : "var(--color-offwhite)",
                      backgroundColor: tipo === t ? "#FEF3E4" : "white",
                      borderRadius: "var(--radius-button)",
                    }}
                  >
                    <div
                      className="w-8 h-8 mb-2 flex items-center justify-center"
                      style={{
                        backgroundColor: t === "FERIE" ? "#EFF6FF" : "#FEF3E4",
                        borderRadius: "var(--radius-button)",
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        style={{ color: t === "FERIE" ? "#3B82F6" : "var(--color-primary)" }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        {t === "FERIE" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-black)" }}
                    >
                      {t === "FERIE" ? "Ferie" : "Permesso orario"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-grey-mid)" }}>
                      {t === "FERIE" ? "Assenza per uno o più giorni" : "Assenza per alcune ore"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            {tipo === "PERMESSO" ? (
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: "var(--color-grey-mid)" }}>
                  Data del permesso
                </label>
                <input type="date" value={dataInizio} min={oggi}
                  onChange={(e) => setDataInizio(e.target.value)} required style={inputStyle} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: "var(--color-grey-mid)" }}>
                    Data inizio
                  </label>
                  <input type="date" value={dataInizio} min={oggi}
                    onChange={(e) => setDataInizio(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: "var(--color-grey-mid)" }}>
                    Data fine
                  </label>
                  <input type="date" value={dataFine} min={dataInizio || oggi}
                    onChange={(e) => setDataFine(e.target.value)} required style={inputStyle} />
                </div>
              </div>
            )}

            {/* Orari */}
            {tipo === "PERMESSO" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: "var(--color-grey-mid)" }}>
                    Ora inizio
                  </label>
                  <input type="time" value={oraInizio}
                    onChange={(e) => setOraInizio(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: "var(--color-grey-mid)" }}>
                    Ora fine
                  </label>
                  <input type="time" value={oraFine}
                    onChange={(e) => setOraFine(e.target.value)} required style={inputStyle} />
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: "var(--color-grey-mid)" }}>
                Note <span style={{ color: "var(--color-grey-icon)", textTransform: "none", letterSpacing: 0 }}>(facoltativo)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Aggiungi eventuali informazioni utili..."
                style={{ ...inputStyle, resize: "none" }}
              />
            </div>

            {/* Legge 104 */}
            <div
              className="flex items-center gap-3 p-4 border cursor-pointer"
              style={{ borderColor: legge104 ? "var(--color-primary)" : "var(--color-offwhite)", backgroundColor: legge104 ? "#FEF3E4" : "white", borderRadius: "var(--radius-button)" }}
              onClick={() => setLegge104(v => !v)}
            >
              <div
                className="w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 transition"
                style={{ borderColor: legge104 ? "var(--color-primary)" : "var(--color-grey-icon)", backgroundColor: legge104 ? "var(--color-primary)" : "white", borderRadius: "4px" }}
              >
                {legge104 && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-black)" }}>Legge 104</p>
                <p className="text-xs" style={{ color: "var(--color-grey-mid)" }}>Assenza ai sensi della Legge 104/92</p>
              </div>
            </div>

            {errore && (
              <div
                className="text-sm px-4 py-3"
                style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", borderRadius: "var(--radius-button)" }}
              >
                {errore}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2.5 text-sm font-bold uppercase tracking-widest transition border"
                style={{
                  borderColor: "var(--color-grey-icon)",
                  color: "var(--color-grey-mid)",
                  borderRadius: "var(--radius-button)",
                  backgroundColor: "white",
                  fontFamily: "var(--font-ui)",
                }}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={caricamento}
                className="flex-1 py-2.5 text-white text-sm font-bold uppercase tracking-widest transition"
                style={{
                  backgroundColor: caricamento ? "var(--color-primary-light)" : "var(--color-primary)",
                  borderRadius: "var(--radius-button)",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {caricamento ? "Invio in corso..." : "Invia richiesta"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
