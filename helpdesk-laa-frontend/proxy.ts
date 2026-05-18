import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const loginLimiter = rateLimit({ interval: 15 * 60_000, limit: 10 });
const resetLimiter = rateLimit({ interval: 60 * 60_000, limit: 5 });
const generalLimiter = rateLimit({ interval: 60_000, limit: 60 });

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export function proxy(req: NextRequest) {
  const ip = getIP(req);
  const { pathname } = req.nextUrl;

  if (pathname === "/api/auth/login") {
    if (!loginLimiter.check(ip)) {
      return NextResponse.json(
        { status: "error", message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }
  } else if (pathname === "/api/auth/reset-password") {
    if (!resetLimiter.check(ip)) {
      return NextResponse.json(
        { status: "error", message: "Terlalu banyak permintaan reset. Coba lagi nanti." },
        { status: 429 },
      );
    }
  } else if (pathname.startsWith("/api/")) {
    if (!generalLimiter.check(ip)) {
      return NextResponse.json(
        { status: "error", message: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
        { status: 429 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
