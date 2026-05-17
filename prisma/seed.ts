import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pinHash = await bcrypt.hash("12345", 10);

  const responsabile = await prisma.user.upsert({
    where: { email: "admin@modar.it" },
    update: {},
    create: {
      email: "admin@modar.it",
      pin: pinHash,
      nome: "Admin",
      cognome: "Modar",
      ruolo: "RESPONSABILE",
    },
  });

  console.log("✓ Utente admin creato:", responsabile.email);
  console.log("  PIN: 12345");
  console.log("  Cambia il PIN dopo il primo accesso!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
