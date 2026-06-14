import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const GUEST_ID_COOKIE = "guest_id";
// Per-tamu (guest_id cookie): 10 pesan / jam
const guestLimiter = rateLimit({ interval: 60 * 60_000, limit: 10 });

export async function POST(request: NextRequest) {
  const existingGuestId = request.cookies.get(GUEST_ID_COOKIE)?.value;
  const guestId = existingGuestId ?? crypto.randomUUID();

  const withGuestCookie = (res: NextResponse): NextResponse => {
    if (!existingGuestId) {
      res.cookies.set(GUEST_ID_COOKIE, guestId, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return res;
  };

  if (!guestLimiter.check(guestId)) {
    return withGuestCookie(
      NextResponse.json(
        {
          status: "error",
          message:
            "Batas 10 pesan per jam untuk pengguna tamu telah tercapai. Silakan login untuk pesan tidak terbatas.",
        },
        { status: 429, headers: { "Retry-After": "3600" } },
      ),
    );
  }

  const { query, history } = await request.json();

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/chat-bot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        user_mode: "Mahasiswa",
        history: history ?? [],
      }),
    });

    const data = await response.json();
    return withGuestCookie(NextResponse.json(data));
  } catch (error) {
    console.error("ERROR AT GUEST CHAT-BOT:", error);
    return withGuestCookie(
      NextResponse.json(
        { output: "Terjadi kesalahan jaringan. Silakan coba lagi.", suggest_ticket: false },
        { status: 500 },
      ),
    );
  }
}
