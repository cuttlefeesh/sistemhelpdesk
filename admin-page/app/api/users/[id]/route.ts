import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateEmbedding, dosenFields } from "@/lib/embedding";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { role, nim_nip, nama, email, prodi, kelas, kode_dosen, nidn_nuptk, reset_password } =
      await request.json();

    if (!nim_nip || !nama) {
      return NextResponse.json({ error: "nim_nip dan nama wajib diisi" }, { status: 400 });
    }

    const embedding = role === "dosen"
      ? await generateEmbedding(dosenFields({ nim_nip, nama, kode_dosen, nidn_nuptk, email, prodi }))
      : null;
    const embeddingVal = embedding ? JSON.stringify(embedding) : null;

    let query: string;
    let values: unknown[];

    if (reset_password) {
      const password = await bcrypt.hash(nim_nip, 10);
      query = `UPDATE users SET nim_nip=$1, nama=$2, email=$3, prodi=$4, kelas=$5,
               kode_dosen=$6, nidn_nuptk=$7, password=$8, embedding=$9::vector
               WHERE id=$10
               RETURNING id, role, nim_nip, nama, email, prodi, kelas, kode_dosen, nidn_nuptk`;
      values = [nim_nip, nama, email || null, prodi || null, kelas || null,
                kode_dosen || null, nidn_nuptk || null, password, embeddingVal, id];
    } else {
      query = `UPDATE users SET nim_nip=$1, nama=$2, email=$3, prodi=$4, kelas=$5,
               kode_dosen=$6, nidn_nuptk=$7, embedding=$8::vector
               WHERE id=$9
               RETURNING id, role, nim_nip, nama, email, prodi, kelas, kode_dosen, nidn_nuptk`;
      values = [nim_nip, nama, email || null, prodi || null, kelas || null,
                kode_dosen || null, nidn_nuptk || null, embeddingVal, id];
    }

    const result = await pool.query(query, values);
    if (result.rowCount === 0) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal mengupdate user", detail: msg }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query("DELETE FROM users WHERE id=$1", [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}
