import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, cookieName } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

// Login: backstop per-IP. Cek per-akun (lebih ketat) dilakukan di route handler.
const loginLimiterIP = rateLimit({ interval: 15 * 60_000, limit: 120 });
// General API: per-user (nim_nip dari sesi JWT) untuk yang sudah login, fallback per-IP untuk yang belum.
const generalUserLimiter = rateLimit({ interval: 60_000, limit: 60 });
const generalIPLimiter = rateLimit({ interval: 60_000, limit: 60 });

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting untuk semua API route
  if (pathname.startsWith("/api/")) {
    const ip = getIP(request);
    let allowed: boolean;
    if (pathname === "/api/auth/login") {
      allowed = loginLimiterIP.check(ip);
    } else {
      const token = request.cookies.get(cookieName())?.value;
      const session = token ? await verifyToken(token) : null;
      allowed = session?.nim_nip
        ? generalUserLimiter.check(session.nim_nip)
        : generalIPLimiter.check(ip);
    }
    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
        {
          status: 429,
          headers: pathname === "/api/auth/login" ? { "Retry-After": "900" } : {},
        },
      );
    }
  }

  // Proteksi route /dashboard
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(cookieName())?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const session = await verifyToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.set(cookieName(), "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  // Jika sudah login dan akses halaman login, redirect ke dashboard
  if (pathname === "/") {
    const token = request.cookies.get(cookieName())?.value;
    if (token) {
      const session = await verifyToken(token);
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/:path*"],
};
