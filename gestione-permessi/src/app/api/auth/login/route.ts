import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificaPin, creaToken, SessionPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, pin } = await req.json();

    if (!email || !pin) {
      return NextResponse.json({ errore: "Email e PIN sono obbligatori" }, { status: 400 });
    }

    if (!/^\d{5}$/.test(pin)) {
      return NextResponse.json({ errore: "Il PIN deve essere di 5 cifre" }, { status: 400 });
    }

    const utente = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!utente || !utente.attivo) {
      return NextResponse.json({ errore: "Credenziali non valide" }, { status: 401 });
    }

    const pinValido = await verificaPin(pin, utente.pin);
    if (!pinValido) {
      return NextResponse.json({ errore: "Credenziali non valide" }, { status: 401 });
    }

    const payload: SessionPayload = {
      userId: utente.id,
      email: utente.email,
      nome: utente.nome,
      cognome: utente.cognome,
      ruolo: utente.ruolo,
    };

    const token = await creaToken(payload);

    const response = NextResponse.json({ successo: true, utente: payload });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 ore
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Errore login:", err);
    return NextResponse.json({ errore: "Errore del server" }, { status: 500 });
  }
}
