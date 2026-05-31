import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verifikasi session masih aktif (single-session enforcement)
  const sessionCheck = await pool.query(
    "SELECT session_id FROM user_admin WHERE nip = $1",
    [session.nim_nip],
  );
  if (!sessionCheck.rows[0] || sessionCheck.rows[0].session_id !== session.session_id) {
    return NextResponse.json({ error: "Session invalidated" }, { status: 401 });
  }

  return NextResponse.json({
    id: session.id,
    nama: session.nama,
    nim_nip: session.nim_nip,
    role: session.role,
  });
}
