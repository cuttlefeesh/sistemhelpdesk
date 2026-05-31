import { NextResponse } from "next/server";
import { getSession, signToken, cookieName, cookieOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ status: "error" }, { status: 401 });

  const result = await pool.query(
    "SELECT session_id FROM users WHERE nim_nip = $1",
    [session.nim_nip],
  );
  if (!result.rows[0] || result.rows[0].session_id !== session.session_id) {
    return NextResponse.json({ status: "error" }, { status: 401 });
  }

  const newToken = await signToken(session);
  const res = NextResponse.json({ status: "ok" });
  res.cookies.set(cookieName(), newToken, cookieOptions());
  return res;
}
