"use client";

import { useState } from "react";

interface Evento {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
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

export default function CalendarioClient({ eventi }: Props) {
  const oggi = new Date();
  const [anno, setAnno] = useState(oggi.getFullYear());
  const [mese, setMese] = useState(oggi.getMonth());

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
          const eventiGiorno = data ? eventiDelGiorno(eventi, data) : [];

          return (
            <div
              key={i}
              className="min-h-[80px] p-1.5"
              style={{
                backgroundColor: isOggi ? "#FEF3E4" : "white",
              }}
            >
              {valido && (
                <>
                  <div className="text-xs mb-1 font-medium"
                    style={{ color: isOggi ? "var(--color-primary)" : "var(--color-grey-mid)" }}>
                    {giornoNum}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {eventiGiorno.map((e) => (
                      <div key={e.id} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: e.color }} />
                        <span className="text-xs truncate" style={{ color: "var(--color-black)" }}>
                          {e.title}
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
    </div>
  );
}
