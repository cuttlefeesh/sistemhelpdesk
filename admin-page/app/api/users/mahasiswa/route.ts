import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, nama, nim, email, prodi, kelas FROM user_mahasiswa ORDER BY nama ASC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data mahasiswa" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nama, nim, email, prodi, kelas } = await request.json();
    if (!nama || !nim) {
      return NextResponse.json({ error: "Nama dan NIM wajib diisi" }, { status: 400 });
    }
    const password = await bcrypt.hash(nim, 10);
    const result = await pool.query(
      `INSERT INTO user_mahasiswa (nama, nim, email, password, prodi, kelas)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nama, nim, email, prodi, kelas`,
      [nama, nim, email, password, prodi, kelas]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal menambah mahasiswa", detail: msg }, { status: 500 });
  }
}
