import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

// Baca informasi dosen dari tabel users (hanya kolom yang relevan untuk chatbot)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await pool.query(
      `SELECT nim_nip AS nip, nama, kode_dosen, nidn_nuptk, prodi
       FROM users
       WHERE role = 'dosen'
       ORDER BY nama ASC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data dosen" }, { status: 500 });
  }
}
