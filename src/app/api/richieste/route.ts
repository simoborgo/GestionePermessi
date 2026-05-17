import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function notificaN8n(webhookUrl: string, dati: object) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dati),
    });
  } catch (err) {
    console.error("Errore notifica n8n:", err);
  }
}

// GET: lista richieste (dipendente vede le sue, responsabile vede quelle del suo team)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const stato = searchParams.get("stato");
  const mese = searchParams.get("mese");
  const anno = searchParams.get("anno");

  const where: Record<string, unknown> = {};

  if (session.ruolo === "DIPENDENTE") {
    where.userId = session.userId;
  } else {
    // Il responsabile vede le richieste dei suoi dipendenti
    const dipendenti = await prisma.user.findMany({
      where: { responsabileId: session.userId },
      select: { id: true },
    });
    const ids = dipendenti.map((d: { id: string }) => d.id);
    ids.push(session.userId);
    where.userId = { in: ids };
  }

  if (stato) where.stato = stato;

  if (mese && anno) {
    const inizioMese = new Date(Number(anno), Number(mese) - 1, 1);
    const fineMese = new Date(Number(anno), Number(mese), 0, 23, 59, 59);
    where.dataInizio = { gte: inizioMese, lte: fineMese };
  }

  const richieste = await prisma.richiesta.findMany({
    where,
    include: { utente: { select: { nome: true, cognome: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ richieste });
}

// POST: crea nuova richiesta
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });

  const body = await req.json();
  const { tipo, dataInizio, dataFine, oraInizio, oraFine, note } = body;

  if (!tipo || !dataInizio || !dataFine) {
    return NextResponse.json({ errore: "Dati mancanti" }, { status: 400 });
  }

  if (tipo === "PERMESSO" && (!oraInizio || !oraFine)) {
    return NextResponse.json({ errore: "Per il permesso orario indicare inizio e fine" }, { status: 400 });
  }

  const richiesta = await prisma.richiesta.create({
    data: {
      tipo,
      dataInizio: new Date(dataInizio),
      dataFine: new Date(dataFine),
      oraInizio: tipo === "PERMESSO" ? oraInizio : null,
      oraFine: tipo === "PERMESSO" ? oraFine : null,
      note,
      userId: session.userId,
    },
    include: { utente: { select: { nome: true, cognome: true, email: true } } },
  });

  // Notifica n8n
  if (process.env.N8N_WEBHOOK_RICHIESTA_INVIATA) {
    await notificaN8n(process.env.N8N_WEBHOOK_RICHIESTA_INVIATA, {
      tipo: "NUOVA_RICHIESTA",
      richiesta: {
        id: richiesta.id,
        tipo: richiesta.tipo,
        dataInizio: richiesta.dataInizio,
        dataFine: richiesta.dataFine,
        oraInizio: richiesta.oraInizio,
        oraFine: richiesta.oraFine,
        note: richiesta.note,
      },
      dipendente: richiesta.utente,
    });
  }

  return NextResponse.json({ richiesta }, { status: 201 });
}
