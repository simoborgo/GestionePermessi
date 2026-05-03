import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const where: Record<string, unknown> = {
    stato: { in: ["APPROVATA", "PENDING"] },
  };

  if (start && end) {
    where.dataInizio = { lte: new Date(end) };
    where.dataFine = { gte: new Date(start) };
  }

  if (session.ruolo === "DIPENDENTE") {
    where.userId = session.userId;
  } else {
    const dipendenti = await prisma.user.findMany({
      where: { responsabileId: session.userId },
      select: { id: true },
    });
    const ids = dipendenti.map((d: { id: string }) => d.id);
    ids.push(session.userId);
    where.userId = { in: ids };
  }

  const richieste = await prisma.richiesta.findMany({
    where,
    include: { utente: { select: { nome: true, cognome: true } } },
  });

  const eventi = richieste.map((r) => {
    const dataInizioStr = r.dataInizio.toISOString().split("T")[0];
    const dataFineStr = r.dataFine.toISOString().split("T")[0];

    const start =
      r.tipo === "PERMESSO" && r.oraInizio
        ? `${dataInizioStr}T${r.oraInizio}:00`
        : dataInizioStr;

    // Per FERIE FullCalendar usa end esclusivo, aggiungiamo 1 giorno
    let end: string;
    if (r.tipo === "FERIE") {
      const d = new Date(r.dataFine);
      d.setDate(d.getDate() + 1);
      end = d.toISOString().split("T")[0];
    } else {
      end =
        r.oraFine
          ? `${dataFineStr}T${r.oraFine}:00`
          : dataFineStr;
    }

    return {
      id: r.id,
      title:
        r.tipo === "FERIE"
          ? `${r.utente.nome} ${r.utente.cognome} - Ferie`
          : `${r.utente.nome} ${r.utente.cognome} - Permesso ${r.oraInizio}-${r.oraFine}`,
      start,
      end,
      allDay: r.tipo === "FERIE",
      color:
        r.stato === "PENDING"
          ? "#F59E0B"
          : r.tipo === "FERIE"
          ? "#3B82F6"
          : "#10B981",
      extendedProps: { tipo: r.tipo, stato: r.stato },
    };
  });

  return NextResponse.json({ eventi });
}
