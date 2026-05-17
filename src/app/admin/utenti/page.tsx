import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import GestioneUtenti from "@/components/GestioneUtenti";

export default async function UtentiPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.ruolo !== "RESPONSABILE") redirect("/dashboard");

  const utenti = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      nome: true,
      cognome: true,
      ruolo: true,
      attivo: true,
      responsabileId: true,
      createdAt: true,
    },
    orderBy: [{ ruolo: "asc" }, { cognome: "asc" }],
  });

  const responsabili = utenti.filter((u) => u.ruolo === "RESPONSABILE");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-offwhite)" }}>
      <Navbar nome={session.nome} cognome={session.cognome} ruolo={session.ruolo} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}
          >
            Gestione utenti
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-grey-mid)" }}>
            {utenti.length} utenti registrati
          </p>
        </div>

        <GestioneUtenti
          utentiIniziali={utenti.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
          responsabili={responsabili.map((r) => ({ id: r.id, nome: r.nome, cognome: r.cognome }))}
        />
      </main>
    </div>
  );
}
