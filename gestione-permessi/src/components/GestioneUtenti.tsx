"use client";

import { useState } from "react";

interface Utente {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  ruolo: string;
  attivo: boolean;
  responsabileId: string | null;
  createdAt: string;
}

interface Responsabile { id: string; nome: string; cognome: string; }

type ModalMode = "crea" | "modifica" | "reset-pin";

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid var(--color-grey-icon)",
  borderRadius: "var(--radius-button)",
  fontSize: "14px",
  fontFamily: "var(--font-ui)",
  color: "var(--color-black)",
  outline: "none",
  backgroundColor: "white",
};

export default function GestioneUtenti({
  utentiIniziali,
  responsabili,
}: {
  utentiIniziali: Utente[];
  responsabili: Responsabile[];
}) {
  const [utenti, setUtenti] = useState(utentiIniziali);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [utenteSelezionato, setUtenteSelezionato] = useState<Utente | null>(null);
  const [errore, setErrore] = useState("");
  const [successo, setSuccesso] = useState("");
  const [caricamento, setCaricamento] = useState(false);
  const [form, setForm] = useState({
    email: "", pin: "", nome: "", cognome: "", ruolo: "DIPENDENTE", responsabileId: "",
  });

  function reset() { setErrore(""); setSuccesso(""); }

  function apriCrea() {
    setForm({ email: "", pin: "", nome: "", cognome: "", ruolo: "DIPENDENTE", responsabileId: "" });
    reset();
    setModalMode("crea");
  }

  function apriModifica(u: Utente) {
    setUtenteSelezionato(u);
    setForm({ ...form, nome: u.nome, cognome: u.cognome, ruolo: u.ruolo, responsabileId: u.responsabileId || "" });
    reset();
    setModalMode("modifica");
  }

  function apriResetPin(u: Utente) {
    setUtenteSelezionato(u);
    setForm((f) => ({ ...f, pin: "" }));
    reset();
    setModalMode("reset-pin");
  }

  function generaPin() {
    const pin = String(Math.floor(10000 + Math.random() * 90000));
    setForm((f) => ({ ...f, pin }));
  }

  async function creaUtente() {
    setErrore("");
    setCaricamento(true);
    try {
      const res = await fetch("/api/utenti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email, pin: form.pin, nome: form.nome,
          cognome: form.cognome, ruolo: form.ruolo,
          responsabileId: form.responsabileId || null,
        }),
      });
      const dati = await res.json();
      if (!res.ok) { setErrore(dati.errore); return; }
      setUtenti((prev) => [dati.utente, ...prev]);
      setSuccesso(`Utente creato. PIN assegnato: ${dati.pinInCiaro}`);
    } finally { setCaricamento(false); }
  }

  async function modificaUtente() {
    if (!utenteSelezionato) return;
    setErrore("");
    setCaricamento(true);
    try {
      const res = await fetch(`/api/utenti/${utenteSelezionato.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome, cognome: form.cognome,
          ruolo: form.ruolo, responsabileId: form.responsabileId || null,
        }),
      });
      const dati = await res.json();
      if (!res.ok) { setErrore(dati.errore); return; }
      setUtenti((prev) => prev.map((u) => (u.id === dati.utente.id ? { ...u, ...dati.utente } : u)));
      setModalMode(null);
    } finally { setCaricamento(false); }
  }

  async function toggleAttivo(u: Utente) {
    const res = await fetch(`/api/utenti/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attivo: !u.attivo }),
    });
    if (res.ok) setUtenti((prev) => prev.map((x) => (x.id === u.id ? { ...x, attivo: !u.attivo } : x)));
  }

  async function resetPin() {
    if (!utenteSelezionato || !form.pin) return;
    setErrore("");
    setCaricamento(true);
    try {
      const res = await fetch(`/api/utenti/${utenteSelezionato.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: form.pin }),
      });
      const dati = await res.json();
      if (!res.ok) { setErrore(dati.errore); return; }
      setSuccesso(`PIN reimpostato: ${dati.pinInCiaro}`);
    } finally { setCaricamento(false); }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={apriCrea}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold uppercase tracking-widest transition"
          style={{ backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-button)", fontFamily: "var(--font-ui)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuovo utente
        </button>
      </div>

      <div
        className="bg-white border overflow-hidden"
        style={{ borderColor: "var(--color-offwhite)", borderRadius: "var(--radius-button)" }}
      >
        <div className="divide-y" style={{ borderColor: "var(--color-offwhite)" }}>
          {utenti.map((u) => (
            <div key={u.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--color-offwhite)", borderRadius: "var(--radius-button)" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "var(--color-grey-mid)" }}>
                    {u.nome[0]}{u.cognome[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--color-black)" }}>
                    {u.nome} {u.cognome}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-grey-mid)" }}>{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-xs px-2.5 py-0.5 font-medium uppercase tracking-wider"
                  style={{
                    backgroundColor: u.ruolo === "RESPONSABILE" ? "#F3E8FF" : "var(--color-offwhite)",
                    color: u.ruolo === "RESPONSABILE" ? "#7C3AED" : "var(--color-grey-mid)",
                    borderRadius: "var(--radius-badge)",
                  }}
                >
                  {u.ruolo === "RESPONSABILE" ? "Responsabile" : "Dipendente"}
                </span>
                {!u.attivo && (
                  <span
                    className="text-xs px-2.5 py-0.5 font-medium uppercase tracking-wider"
                    style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", borderRadius: "var(--radius-badge)" }}
                  >
                    Disabilitato
                  </span>
                )}

                {/* Azioni */}
                {[
                  { icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", action: () => apriModifica(u), title: "Modifica" },
                  { icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", action: () => apriResetPin(u), title: "Reset PIN" },
                ].map(({ icon, action, title }) => (
                  <button
                    key={title}
                    onClick={action}
                    className="p-1.5 transition"
                    style={{ color: "var(--color-grey-icon)", borderRadius: "var(--radius-button)" }}
                    title={title}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                  </button>
                ))}

                <button
                  onClick={() => toggleAttivo(u)}
                  className="p-1.5 transition"
                  style={{
                    color: u.attivo ? "var(--color-grey-icon)" : "#15803D",
                    borderRadius: "var(--radius-button)",
                  }}
                  title={u.attivo ? "Disabilita" : "Abilita"}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {u.attivo ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
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
                {modalMode === "crea" && "Nuovo utente"}
                {modalMode === "modifica" && "Modifica utente"}
                {modalMode === "reset-pin" && "Reset PIN"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {(modalMode === "crea" || modalMode === "modifica") && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--color-grey-mid)" }}>Nome</label>
                      <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--color-grey-mid)" }}>Cognome</label>
                      <input value={form.cognome} onChange={(e) => setForm((f) => ({ ...f, cognome: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                  {modalMode === "crea" && (
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--color-grey-mid)" }}>Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--color-grey-mid)" }}>Ruolo</label>
                    <select value={form.ruolo} onChange={(e) => setForm((f) => ({ ...f, ruolo: e.target.value }))} style={inputStyle}>
                      <option value="DIPENDENTE">Dipendente</option>
                      <option value="RESPONSABILE">Responsabile</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--color-grey-mid)" }}>Responsabile assegnato</label>
                    <select value={form.responsabileId} onChange={(e) => setForm((f) => ({ ...f, responsabileId: e.target.value }))} style={inputStyle}>
                      <option value="">Nessuno</option>
                      {responsabili.map((r) => (
                        <option key={r.id} value={r.id}>{r.nome} {r.cognome}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(modalMode === "crea" || modalMode === "reset-pin") && (
                <div>
                  {modalMode === "reset-pin" && (
                    <p className="text-sm mb-3" style={{ color: "var(--color-grey-mid)" }}>
                      Reset PIN per <strong style={{ color: "var(--color-black)" }}>{utenteSelezionato?.nome} {utenteSelezionato?.cognome}</strong>
                    </p>
                  )}
                  <label className="block text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--color-grey-mid)" }}>
                    {modalMode === "reset-pin" ? "Nuovo PIN" : "PIN"} (5 cifre)
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={form.pin}
                      onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="12345"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={generaPin}
                      className="px-3 py-2 border text-sm font-medium transition"
                      style={{
                        borderColor: "var(--color-grey-icon)",
                        color: "var(--color-grey-mid)",
                        borderRadius: "var(--radius-button)",
                        fontFamily: "var(--font-ui)",
                      }}
                    >
                      Genera
                    </button>
                  </div>
                </div>
              )}

              {errore && (
                <div
                  className="text-sm px-4 py-3"
                  style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", borderRadius: "var(--radius-button)" }}
                >
                  {errore}
                </div>
              )}
              {successo && (
                <div
                  className="text-sm px-4 py-3 font-medium"
                  style={{ backgroundColor: "#FEF3E4", border: "1px solid var(--color-primary-light)", color: "var(--color-primary-dark)", borderRadius: "var(--radius-button)" }}
                >
                  {successo}
                </div>
              )}
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => { setModalMode(null); reset(); }}
                className="flex-1 py-2.5 border text-sm font-bold uppercase tracking-widest transition"
                style={{
                  borderColor: "var(--color-grey-icon)",
                  color: "var(--color-grey-mid)",
                  borderRadius: "var(--radius-button)",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {successo ? "Chiudi" : "Annulla"}
              </button>
              {!successo && (
                <button
                  onClick={modalMode === "crea" ? creaUtente : modalMode === "modifica" ? modificaUtente : resetPin}
                  disabled={caricamento}
                  className="flex-1 py-2.5 text-white text-sm font-bold uppercase tracking-widest transition"
                  style={{
                    backgroundColor: caricamento ? "var(--color-primary-light)" : "var(--color-primary)",
                    borderRadius: "var(--radius-button)",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {caricamento ? "..." : modalMode === "crea" ? "Crea utente" : modalMode === "modifica" ? "Salva" : "Reimposta PIN"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
