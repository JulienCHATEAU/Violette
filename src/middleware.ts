import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;

  // Si non configuré (dev local), désactivé.
  if (!user || !pass) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const [u, p] = atob(auth.slice(6)).split(":");
    if (u === user && p === pass) return NextResponse.next();
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Violette"' },
  });
}

export const config = {
  // Exempte : /api/cron (protégé par x-cron-secret), SW, manifest, icônes, Next static
  matcher: [
    "/((?!api/cron|_next/static|_next/image|icons/|manifest.json|sw\\.js|workbox-|worker-).*)",
  ],
};
