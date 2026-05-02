import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });
  }
  return NextResponse.json({ utente: session });
}
