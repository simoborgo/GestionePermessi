import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (secret !== process.env.RIEPILOGO_SECRET) {
    return NextResponse.json({ errore: "Non autorizzato" }, { status: 401 });
  }

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const domani = new Date(oggi);
  domani.setDate(domani.getDate() + 1);

  const assenze = await prisma.richiesta.findMany({
    where: {
      stato: { in: ["APPROVATA", "PENDING"] },
      dataInizio: { lte: domani },
      dataFine: { gte: oggi },
    },
    include: {
      utente: { select: { nome: true, cognome: true, email: true } },
    },
    orderBy: { dataInizio: "asc" },
  });

  return NextResponse.json({ assenze, data: oggi.toISOString() });
}
