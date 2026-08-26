"use client";

import { useState } from "react";

interface Evento {
  id: string;
  nome: string;
  cognome: string;
  tipo: "PERMESSO" | "FERIE";
  stato: "PENDING" | "APPROVATA";
  start: string;
  end: string;
  allDay: boolean;
  oraInizio?: string | null;
  oraFine?: string | null;
  color: string;
}

interface Props {
  eventi: Evento[];
}

const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
              "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

function eventiDelGiorno(eventi: Evento[], data: Date): Evento[] {
  return eventi.filter((e) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const d = new Date(data);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    d.setHours(12, 0, 0, 0);
    return d >= start && d <= end;
  });
}

function formatGiornoEsteso(data: Date): string {
  const s = data.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function CalendarioClient({ eventi }: Props) {
  const oggi = new Date();
  const [anno, setAnno] = useState(oggi.getFullYear());
  const [mese, setMese] = useState(oggi.getMonth());
  const [giornoSelezionato, setGiornoSelezionato] = useState<Date>(oggi);

  function mesePrecedente() {
    if (mese === 0) { setMese(11); setAnno(a => a - 1); }
    else setMese(m => m - 1);
  }

  function meseSuccessivo() {
    if (mese === 11) { setMese(0); setAnno(a => a + 1); }
    else setMese(m => m + 1);
  }

  const primoGiorno = new Date(anno, mese, 1);
  const ultimoGiorno = new Date(anno, mese + 1, 0);

  // Lunedì = 0, offset per griglia
  const offsetInizio = (primoGiorno.getDay() + 6) % 7;
  const totaleGiorni = ultimoGiorno.getDate();
  const celle = offsetInizio + totaleGiorni;
  const righe = Math.ceil(celle / 7);

  const eventiSelezionati = eventiDelGiorno(eventi, giornoSelezionato).sort((a, b) =>
    a.tipo === b.tipo ? a.cognome.localeCompare(b.cognome) : a.tipo === "FERIE" ? -1 : 1
  );
  const ferieSelezionate = eventiSelezionati.filter((e) => e.tipo === "FERIE");
  const permessiSelezionati = eventiSelezionati.filter((e) => e.tipo === "PERMESSO");

  return (
    <div style={{ fontFamily: "var(--font-ui)" }}>
      {/* Header navigazione */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={mesePrecedente}
          className="px-3 py-1 text-sm font-bold uppercase tracking-widest transition"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "white",
            borderRadius: "var(--radius-button)",
          }}
        >
          ‹
        </button>
        <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}>
          {MESI[mese]} {anno}
        </h2>
        <button
          onClick={meseSuccessivo}
          className="px-3 py-1 text-sm font-bold uppercase tracking-widest transition"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "white",
            borderRadius: "var(--radius-button)",
          }}
        >
          ›
        </button>
      </div>

      {/* Legenda tipo */}
      <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: "var(--color-grey-mid)" }}>
        <div className="flex items-center gap-1.5">
          <span className="inline-block rounded" style={{ width: 14, height: 8, backgroundColor: "var(--color-grey-mid)" }} />
          <span>Ferie (giornata intera)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "var(--color-grey-mid)" }} />
          <span>Permesso (orario)</span>
        </div>
      </div>

      {/* Griglia */}
      <div className="grid grid-cols-7 gap-px" style={{ backgroundColor: "var(--color-offwhite)" }}>
        {/* Intestazioni giorni */}
        {GIORNI.map((g) => (
          <div key={g} className="text-center py-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-grey-mid)", backgroundColor: "white" }}>
            {g}
          </div>
        ))}

        {/* Celle */}
        {Array.from({ length: righe * 7 }).map((_, i) => {
          const giornoNum = i - offsetInizio + 1;
          const valido = giornoNum >= 1 && giornoNum <= totaleGiorni;
          const data = valido ? new Date(anno, mese, giornoNum) : null;
          const isOggi = data && data.toDateString() === oggi.toDateString();
          const isSelezionato = data && data.toDateString() === giornoSelezionato.toDateString();
          const eventiGiorno = data ? eventiDelGiorno(eventi, data) : [];
          const ferieGiorno = eventiGiorno.filter((e) => e.tipo === "FERIE");
          const permessiGiorno = eventiGiorno.filter((e) => e.tipo === "PERMESSO");

          return (
            <div
              key={i}
              onClick={() => valido && data && setGiornoSelezionato(data)}
              className="min-h-[92px] p-1.5"
              style={{
                backgroundColor: isOggi ? "#FEF3E4" : "white",
                cursor: valido ? "pointer" : "default",
                boxShadow: isSelezionato ? "inset 0 0 0 2px var(--color-primary)" : "none",
              }}
            >
              {valido && (
                <>
                  <div className="text-xs mb-1 font-medium"
                    style={{ color: isOggi ? "var(--color-primary)" : "var(--color-grey-mid)" }}>
                    {giornoNum}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {ferieGiorno.map((e) => (
                      <div key={e.id} className="text-xs truncate px-1 py-0.5 rounded font-medium"
                        style={{ backgroundColor: e.color, color: "white" }}
                        title={`${e.cognome} ${e.nome} — Ferie`}>
                        {e.cognome}
                      </div>
                    ))}
                    {permessiGiorno.map((e) => (
                      <div key={e.id} className="flex items-center gap-1"
                        title={`${e.cognome} ${e.nome} — Permesso ${e.oraInizio ?? ""}-${e.oraFine ?? ""}`}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: e.color }} />
                        <span className="text-xs truncate" style={{ color: "var(--color-black)" }}>
                          {e.cognome}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Dettaglio giornaliero assenti */}
      <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--color-offwhite)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}>
          Assenti — {formatGiornoEsteso(giornoSelezionato)}
        </h3>

        {eventiSelezionati.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-grey-mid)" }}>Nessuna assenza in questa data.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ferieSelezionate.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm px-3 py-2"
                style={{ backgroundColor: "var(--color-offwhite)", borderRadius: "var(--radius-button)" }}>
                <span style={{ color: "var(--color-black)" }}>{e.cognome} {e.nome}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: e.color }}>
                    Ferie — giornata intera
                  </span>
                  {e.stato === "PENDING" && (
                    <span className="text-xs" style={{ color: "var(--color-grey-mid)" }}>In attesa</span>
                  )}
                </span>
              </div>
            ))}
            {permessiSelezionati.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm px-3 py-2"
                style={{ backgroundColor: "var(--color-offwhite)", borderRadius: "var(--radius-button)" }}>
                <span style={{ color: "var(--color-black)" }}>{e.cognome} {e.nome}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: e.color }}>
                    Permesso {e.oraInizio ?? "?"}–{e.oraFine ?? "?"}
                  </span>
                  {e.stato === "PENDING" && (
                    <span className="text-xs" style={{ color: "var(--color-grey-mid)" }}>In attesa</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
