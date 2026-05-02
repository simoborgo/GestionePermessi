import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPin } from "@/lib/auth";

// GET: lista utenti (solo RESPONSABILE)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });
  if (session.ruolo !== "RESPONSABILE") {
    return NextResponse.json({ errore: "Accesso negato" }, { status: 403 });
  }

  const utenti = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      nome: true,
      cognome: true,
      ruolo: true,
      attivo: true,
      responsabileId: true,
      responsabile: { select: { nome: true, cognome: true } },
      createdAt: true,
    },
    orderBy: [{ ruolo: "asc" }, { cognome: "asc" }],
  });

  return NextResponse.json({ utenti });
}

// POST: crea nuovo utente (solo RESPONSABILE)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });
  if (session.ruolo !== "RESPONSABILE") {
    return NextResponse.json({ errore: "Accesso negato" }, { status: 403 });
  }

  const { email, pin, nome, cognome, ruolo, responsabileId } = await req.json();

  if (!email || !pin || !nome || !cognome) {
    return NextResponse.json({ errore: "Dati obbligatori mancanti" }, { status: 400 });
  }

  if (!/^\d{5}$/.test(pin)) {
    return NextResponse.json({ errore: "Il PIN deve essere di esattamente 5 cifre" }, { status: 400 });
  }

  const esistente = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (esistente) {
    return NextResponse.json({ errore: "Email già registrata" }, { status: 409 });
  }

  const pinHash = await hashPin(pin);

  const utente = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      pin: pinHash,
      nome,
      cognome,
      ruolo: ruolo || "DIPENDENTE",
      responsabileId: responsabileId || null,
    },
    select: { id: true, email: true, nome: true, cognome: true, ruolo: true, attivo: true },
  });

  return NextResponse.json({ utente, pinInCiaro: pin }, { status: 201 });
}
