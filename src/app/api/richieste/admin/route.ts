import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST: il RESPONSABILE inserisce una richiesta già APPROVATA per conto di un dipendente
// (usato per dipendenti senza accesso all'app, es. migrazione dati storici da Notion)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });
  if (session.ruolo !== "RESPONSABILE") {
    return NextResponse.json({ errore: "Accesso negato" }, { status: 403 });
  }

  const { userId, tipo, dataInizio, dataFine, oraInizio, oraFine, note, legge104, motivazione } = await req.json();

  if (!userId || !tipo || !dataInizio || !dataFine) {
    return NextResponse.json({ errore: "Dati mancanti" }, { status: 400 });
  }

  if (tipo === "PERMESSO" && (!oraInizio || !oraFine)) {
    return NextResponse.json({ errore: "Per il permesso orario indicare inizio e fine" }, { status: 400 });
  }

  const dipendente = await prisma.user.findUnique({ where: { id: userId } });
  if (!dipendente) return NextResponse.json({ errore: "Dipendente non trovato" }, { status: 404 });
  if (dipendente.id !== session.userId && dipendente.responsabileId !== session.userId) {
    return NextResponse.json({ errore: "Accesso negato" }, { status: 403 });
  }

  const richiesta = await prisma.richiesta.create({
    data: {
      tipo,
      stato: "APPROVATA",
      dataInizio: new Date(dataInizio),
      dataFine: new Date(dataFine),
      oraInizio: tipo === "PERMESSO" ? oraInizio : null,
      oraFine: tipo === "PERMESSO" ? oraFine : null,
      note,
      legge104: legge104 === true,
      motivazione,
      userId,
    },
    include: { utente: { select: { nome: true, cognome: true, email: true } } },
  });

  // Nessuna notifica n8n: inserimento amministrativo/backfill, non un evento reale da segnalare
  return NextResponse.json({ richiesta }, { status: 201 });
}
