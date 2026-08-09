import type { PrismaClient } from "@prisma/client";

export function generaEmailPlaceholder(nome: string, cognome: string): string {
  const slug = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
  return `${slug(nome)}.${slug(cognome)}@modar.local`;
}

export async function generaEmailPlaceholderUnivoca(
  prisma: Pick<PrismaClient, "user">,
  nome: string,
  cognome: string
): Promise<string> {
  const base = generaEmailPlaceholder(nome, cognome);
  const [local, domain] = base.split("@");
  for (let i = 0; i < 50; i++) {
    const candidata = i === 0 ? base : `${local}${i + 1}@${domain}`;
    const esistente = await prisma.user.findUnique({ where: { email: candidata } });
    if (!esistente) return candidata;
  }
  throw new Error("Impossibile generare email placeholder univoca");
}
