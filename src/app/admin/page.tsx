import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import GestioneRichieste from "@/components/GestioneRichieste";

export default async function AdminPage() {
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
    where: { userId: { in: ids } },
    include: { utente: { select: { nome: true, cognome: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const pending = richieste.filter((r: { stato: string }) => r.stato === "PENDING").length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-offwhite)" }}>
      <Navbar nome={session.nome} cognome={session.cognome} ruolo={session.ruolo} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}
          >
            Richieste del team
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-grey-mid)" }}>
            {pending > 0
              ? `${pending} richiesta${pending > 1 ? "e" : ""} in attesa di approvazione`
              : "Nessuna richiesta in attesa"}
          </p>
        </div>

        <GestioneRichieste
          richiesteIniziali={richieste.map((r) => ({
            ...r,
            dataInizio: r.dataInizio.toISOString(),
            dataFine: r.dataFine.toISOString(),
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
