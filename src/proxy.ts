import { NextRequest, NextResponse } from "next/server";
import { verificaToken } from "@/lib/auth";

const paginaProtette = ["/admin", "/dashboard", "/nuova-richiesta"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Le API si proteggono da sole, il proxy protegge solo le pagine
  if (!paginaProtette.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const session = await verificaToken(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("auth-token", "", { maxAge: 0, path: "/" });
    return response;
  }

  if (pathname.startsWith("/admin") && session.ruolo !== "RESPONSABILE") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
