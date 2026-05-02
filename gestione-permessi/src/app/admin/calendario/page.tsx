import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import CalendarioClient from "@/components/CalendarioClient";

export default async function CalendarioPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.ruolo !== "RESPONSABILE") redirect("/dashboard");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-offwhite)" }}>
      <Navbar nome={session.nome} cognome={session.cognome} ruolo={session.ruolo} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-black)" }}
          >
            Calendario assenze
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-grey-mid)" }}>
            Ferie e permessi approvati del team
          </p>
        </div>

        <div
          className="bg-white border p-6"
          style={{ borderColor: "var(--color-offwhite)", borderRadius: "var(--radius-button)" }}
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#3B82F6" }} />
              <span className="text-sm" style={{ color: "var(--color-grey-mid)" }}>Ferie</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "var(--color-primary)" }} />
              <span className="text-sm" style={{ color: "var(--color-grey-mid)" }}>Permesso orario</span>
            </div>
          </div>
          <CalendarioClient />
        </div>
      </main>
    </div>
  );
}
