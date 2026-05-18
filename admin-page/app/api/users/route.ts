import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateEmbedding, dosenFields, knowledgeFields as _k } from "@/lib/embedding";
import { getSession } from "@/lib/auth";

void _k;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const role = new URL(request.url).searchParams.get("role");
    if (!role) return NextResponse.json({ error: "Parameter role wajib diisi" }, { status: 400 });

    const result = await pool.query(
      `SELECT id, role, nim_nip, nama, email, prodi, kelas, kode_dosen, nidn_nuptk
       FROM users WHERE role = $1 ORDER BY nama ASC`,
      [role]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { role, nim_nip, nama, email, prodi, kelas, kode_dosen, nidn_nuptk } =
      await request.json();

    if (!role || !nim_nip || !nama) {
      return NextResponse.json({ error: "role, nim_nip, dan nama wajib diisi" }, { status: 400 });
    }

    const password = await bcrypt.hash(nim_nip, 10);

    const embedding = role === "dosen"
      ? await generateEmbedding(dosenFields({ nim_nip, nama, kode_dosen, nidn_nuptk, email, prodi }))
      : null;

    const result = await pool.query(
      `INSERT INTO users (role, nim_nip, nama, email, password, prodi, kelas, kode_dosen, nidn_nuptk, embedding)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::vector)
       RETURNING id, role, nim_nip, nama, email, prodi, kelas, kode_dosen, nidn_nuptk`,
      [role, nim_nip, nama, email || null, password, prodi || null,
       kelas || null, kode_dosen || null, nidn_nuptk || null,
       embedding ? JSON.stringify(embedding) : null]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal menambah user", detail: msg }, { status: 500 });
  }
}
