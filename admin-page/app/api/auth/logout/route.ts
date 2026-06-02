import { NextResponse } from "next/server";
import { getSession, cookieName } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (session?.nim_nip) {
    await pool.query(
      "UPDATE user_admin SET session_id = NULL WHERE nip = $1 AND session_id = $2",
      [session.nim_nip, session.session_id ?? null],
    ).catch(() => {});
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieName(), "", { maxAge: 0, path: "/" });
  return response;
}
