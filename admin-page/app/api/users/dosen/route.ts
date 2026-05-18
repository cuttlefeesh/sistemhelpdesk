import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateEmbedding, dosenFields } from "@/lib/embedding";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await pool.query(
      `SELECT id, nama, nip, kode_dosen, nidn_nuptk, email, prodi
       FROM user_dosen ORDER BY nama ASC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data dosen" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { nama, nip, kode_dosen, nidn_nuptk, email, prodi } = await request.json();
    if (!nama || !nip) {
      return NextResponse.json({ error: "Nama dan NIP wajib diisi" }, { status: 400 });
    }

    const password = await bcrypt.hash(nip, 10);
    const embedding = await generateEmbedding(dosenFields({ nim_nip: nip, nama, kode_dosen, nidn_nuptk, email, prodi }));

    const result = await pool.query(
      `INSERT INTO user_dosen (nama, nip, kode_dosen, nidn_nuptk, email, password, prodi, embedding)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::vector)
       RETURNING id, nama, nip, kode_dosen, nidn_nuptk, email, prodi`,
      [nama, nip, kode_dosen, nidn_nuptk, email, password, prodi,
       embedding ? JSON.stringify(embedding) : null]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal menambah dosen", detail: msg }, { status: 500 });
  }
}
