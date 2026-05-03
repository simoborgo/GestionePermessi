import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import CalendarioClient from "@/components/CalendarioClient";

export default async function CalendarioPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.ruolo !== "RESPONSABILE") redirect("/dashboard");

  const dipendenti = await prisma.user.findMany({
    where: { responsabileId: session.userId },
    select: { id: true },
  });
  const ids = dipendenti.map((d: { id: string }) => d.id);
  ids.push(session.userId);

  const richieste = await prisma.richiesta.findMany({
    where: {
      userId: { in: ids },
      stato: { in: ["APPROVATA", "PENDING"] },
    },
    include: { utente: { select: { cognome: true } } },
  });

  const eventi = richieste.map((r) => {
    const dataInizioStr = r.dataInizio.toISOString().split("T")[0];
    const dataFineStr = r.dataFine.toISOString().split("T")[0];

    const start =
      r.tipo === "PERMESSO" && r.oraInizio
        ? `${dataInizioStr}T${r.oraInizio}:00`
        : dataInizioStr;

    let end: string;
    if (r.tipo === "FERIE") {
      const d = new Date(r.dataFine);
      d.setDate(d.getDate() + 1);
      end = d.toISOString().split("T")[0];
    } else {
      end = r.oraFine ? `${dataFineStr}T${r.oraFine}:00` : dataFineStr;
    }

    return {
      id: r.id,
      title: r.utente.cognome,
      start,
      end,
      allDay: r.tipo === "FERIE",
      color: r.stato === "PENDING" ? "#F59E0B" : "#10B981",
    };
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-offwhite)" }}>
      <Navbar nome={session.nome} cognome={session.cognome} ruolo={session.ruolo} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}
          >
            Calendario assenze
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-grey-mid)" }}>
            Ferie e permessi del team
          </p>
        </div>

        <div
          className="bg-white border p-6"
          style={{ borderColor: "var(--color-offwhite)", borderRadius: "var(--radius-button)" }}
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#10B981" }} />
              <span className="text-sm" style={{ color: "var(--color-grey-mid)" }}>Approvato</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#F59E0B" }} />
              <span className="text-sm" style={{ color: "var(--color-grey-mid)" }}>In attesa</span>
            </div>
          </div>
          <CalendarioClient eventi={eventi} />
        </div>
      </main>
    </div>
  );
}
