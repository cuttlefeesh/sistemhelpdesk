import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await pool.query(
      `SELECT id, nama, nip, email, prodi FROM user_admin ORDER BY nama ASC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data admin" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { nama, nip, email, prodi } = await request.json();
    if (!nama || !nip) {
      return NextResponse.json({ error: "Nama dan NIP wajib diisi" }, { status: 400 });
    }
    const password = await bcrypt.hash(nip, 10);
    const result = await pool.query(
      `INSERT INTO user_admin (nama, nip, email, password, prodi)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nama, nip, email, prodi`,
      [nama, nip, email, password, prodi]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal menambah admin", detail: msg }, { status: 500 });
  }
}
