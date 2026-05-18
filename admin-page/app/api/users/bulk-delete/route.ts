import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ids } = await request.json() as { ids: number[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids wajib diisi" }, { status: 400 });
    }

    const result = await pool.query(
      `DELETE FROM users WHERE id = ANY($1::int[])`,
      [ids]
    );
    return NextResponse.json({ deleted: result.rowCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}
