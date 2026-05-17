import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPin } from "@/lib/auth";

// PATCH: modifica utente o reimposta PIN
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });
  if (session.ruolo !== "RESPONSABILE") {
    return NextResponse.json({ errore: "Accesso negato" }, { status: 403 });
  }

  const { id } = await params;
  const { nome, cognome, ruolo, attivo, pin, responsabileId } = await req.json();

  const data: Record<string, unknown> = {};
  if (nome !== undefined) data.nome = nome;
  if (cognome !== undefined) data.cognome = cognome;
  if (ruolo !== undefined) data.ruolo = ruolo;
  if (attivo !== undefined) data.attivo = attivo;
  if (responsabileId !== undefined) data.responsabileId = responsabileId || null;

  let pinInCiaro: string | undefined;
  if (pin) {
    if (!/^\d{5}$/.test(pin)) {
      return NextResponse.json({ errore: "Il PIN deve essere di 5 cifre" }, { status: 400 });
    }
    data.pin = await hashPin(pin);
    pinInCiaro = pin;
  }

  const utente = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, nome: true, cognome: true, ruolo: true, attivo: true },
  });

  return NextResponse.json({ utente, ...(pinInCiaro ? { pinInCiaro } : {}) });
}
