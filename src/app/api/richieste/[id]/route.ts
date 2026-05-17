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

// PATCH: approva o rifiuta una richiesta (solo RESPONSABILE)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });
  if (session.ruolo !== "RESPONSABILE") {
    return NextResponse.json({ errore: "Accesso negato" }, { status: 403 });
  }

  const { id } = await params;
  const { stato, motivazione } = await req.json();

  if (!["APPROVATA", "RIFIUTATA"].includes(stato)) {
    return NextResponse.json({ errore: "Stato non valido" }, { status: 400 });
  }

  const richiesta = await prisma.richiesta.update({
    where: { id },
    data: { stato, motivazione },
    include: { utente: { select: { nome: true, cognome: true, email: true } } },
  });

  // Notifica n8n
  const webhook =
    stato === "APPROVATA"
      ? process.env.N8N_WEBHOOK_RICHIESTA_APPROVATA
      : process.env.N8N_WEBHOOK_RICHIESTA_RIFIUTATA;

  if (webhook) {
    await notificaN8n(webhook, {
      tipo: stato === "APPROVATA" ? "RICHIESTA_APPROVATA" : "RICHIESTA_RIFIUTATA",
      richiesta: {
        id: richiesta.id,
        tipo: richiesta.tipo,
        dataInizio: richiesta.dataInizio,
        dataFine: richiesta.dataFine,
        oraInizio: richiesta.oraInizio,
        oraFine: richiesta.oraFine,
        stato: richiesta.stato,
        motivazione: richiesta.motivazione,
      },
      dipendente: richiesta.utente,
      responsabile: {
        nome: session.nome,
        cognome: session.cognome,
        email: session.email,
      },
    });
  }

  return NextResponse.json({ richiesta });
}

// DELETE: cancella richiesta (solo il proprietario, solo se PENDING)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });

  const { id } = await params;

  const richiesta = await prisma.richiesta.findUnique({ where: { id } });
  if (!richiesta) return NextResponse.json({ errore: "Non trovata" }, { status: 404 });

  if (richiesta.userId !== session.userId) {
    return NextResponse.json({ errore: "Accesso negato" }, { status: 403 });
  }

  if (richiesta.stato !== "PENDING") {
    return NextResponse.json({ errore: "Puoi cancellare solo richieste in attesa" }, { status: 400 });
  }

  await prisma.richiesta.delete({ where: { id } });
  return NextResponse.json({ successo: true });
}
