import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET: eventi per il calendario (APPROVATE nel range richiesto)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const where: Record<string, unknown> = {
    stato: "APPROVATA",
  };

  if (start && end) {
    where.dataInizio = { gte: new Date(start) };
    where.dataFine = { lte: new Date(end) };
  }

  // Responsabili vedono tutto il team, dipendenti solo se stessi
  if (session.ruolo === "DIPENDENTE") {
    where.userId = session.userId;
  }

  const richieste = await prisma.richiesta.findMany({
    where,
    include: { utente: { select: { nome: true, cognome: true } } },
  });

  const eventi = richieste.map((r) => ({
    id: r.id,
    title:
      r.tipo === "FERIE"
        ? `${r.utente.nome} ${r.utente.cognome} - Ferie`
        : `${r.utente.nome} ${r.utente.cognome} - Permesso ${r.oraInizio}-${r.oraFine}`,
    start: r.dataInizio,
    end: r.dataFine,
    allDay: r.tipo === "FERIE",
    color: r.tipo === "FERIE" ? "#3B82F6" : "#F59E0B",
    extendedProps: { tipo: r.tipo, stato: r.stato },
  }));

  return NextResponse.json({ eventi });
}
