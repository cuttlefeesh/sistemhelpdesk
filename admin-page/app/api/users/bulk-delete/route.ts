import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
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
