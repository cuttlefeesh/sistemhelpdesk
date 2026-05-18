import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, cookieName } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/", "/dashboard/:path*"],
};
