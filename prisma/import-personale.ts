import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generaEmailPlaceholderUnivoca } from "../src/lib/utenti";

// Script di import massivo del personale, sullo stile di seed.ts: self-contained,
// da eseguire con `npm run db:import-personale` (ts-node, nessun alias @/).
// NON committare mai questo file con dati reali dentro `personale` — riempirlo
// solo al momento dell'esecuzione (in locale o direttamente sul VPS) e poi
// svuotarlo di nuovo prima di eventuali commit.

const prisma = new PrismaClient();

interface EntryPersonale {
  nome: string;
  cognome: string;
  email?: string;
  ruolo?: "DIPENDENTE" | "RESPONSABILE";
  responsabileEmail?: string;
}

const personale: EntryPersonale[] = [
  // { nome: "Mario", cognome: "Rossi", responsabileEmail: "admin@modar.it" },
];

function generaPinCasuale(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

async function main() {
  const riepilogo: { nome: string; cognome: string; email: string; pin: string; stato: string }[] = [];

  for (const entry of personale) {
    const responsabile = entry.responsabileEmail
      ? await prisma.user.findUnique({ where: { email: entry.responsabileEmail.toLowerCase() } })
      : null;
    if (entry.responsabileEmail && !responsabile) {
      console.warn(`Attenzione: responsabile "${entry.responsabileEmail}" non trovato per ${entry.nome} ${entry.cognome}`);
    }

    if (entry.email) {
      // Email esplicita: upsert idempotente come seed.ts (rieseguibile in sicurezza)
      const pin = generaPinCasuale();
      const utente = await prisma.user.upsert({
        where: { email: entry.email.toLowerCase() },
        update: {},
        create: {
          email: entry.email.toLowerCase(),
          pin: await bcrypt.hash(pin, 10),
          nome: entry.nome,
          cognome: entry.cognome,
          ruolo: entry.ruolo || "DIPENDENTE",
          responsabileId: responsabile?.id || null,
        },
      });
      riepilogo.push({ nome: entry.nome, cognome: entry.cognome, email: utente.email, pin, stato: "creato/esistente" });
      continue;
    }

    // Nessuna email: senza chiave stabile, controllo per nome+cognome per rendere
    // lo script rieseguibile senza duplicare utenti o rigenerare email/PIN a ogni run
    const esistente = await prisma.user.findFirst({ where: { nome: entry.nome, cognome: entry.cognome } });
    if (esistente) {
      riepilogo.push({ nome: entry.nome, cognome: entry.cognome, email: esistente.email, pin: "(invariato)", stato: "già presente, saltato" });
      continue;
    }

    const email = await generaEmailPlaceholderUnivoca(prisma, entry.nome, entry.cognome);
    const pin = generaPinCasuale();
    await prisma.user.create({
      data: {
        email,
        pin: await bcrypt.hash(pin, 10),
        nome: entry.nome,
        cognome: entry.cognome,
        ruolo: entry.ruolo || "DIPENDENTE",
        responsabileId: responsabile?.id || null,
      },
    });
    riepilogo.push({ nome: entry.nome, cognome: entry.cognome, email, pin, stato: "creato" });
  }

  console.log("\nRiepilogo import personale:");
  console.table(riepilogo);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
