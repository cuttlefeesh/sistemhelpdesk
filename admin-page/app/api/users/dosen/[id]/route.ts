import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateEmbedding, dosenFields } from "@/lib/embedding";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { nama, nip, kode_dosen, nidn_nuptk, email, prodi, reset_password } = await request.json();
    if (!nama || !nip) {
      return NextResponse.json({ error: "Nama dan NIP wajib diisi" }, { status: 400 });
    }

    // Re-generate embedding dengan data terbaru
    const embedding = await generateEmbedding(dosenFields({ nip, nama, kode_dosen, nidn_nuptk, email, prodi }));
    const embeddingVal = embedding ? JSON.stringify(embedding) : null;

    let query: string;
    let values: unknown[];

    if (reset_password) {
      const password = await bcrypt.hash(nip, 10);
      query = `UPDATE user_dosen SET nama=$1, nip=$2, kode_dosen=$3, nidn_nuptk=$4, email=$5, prodi=$6, password=$7, embedding=$8::vector
               WHERE id=$9 RETURNING id, nama, nip, kode_dosen, nidn_nuptk, email, prodi`;
      values = [nama, nip, kode_dosen, nidn_nuptk, email, prodi, password, embeddingVal, id];
    } else {
      query = `UPDATE user_dosen SET nama=$1, nip=$2, kode_dosen=$3, nidn_nuptk=$4, email=$5, prodi=$6, embedding=$7::vector
               WHERE id=$8 RETURNING id, nama, nip, kode_dosen, nidn_nuptk, email, prodi`;
      values = [nama, nip, kode_dosen, nidn_nuptk, email, prodi, embeddingVal, id];
    }

    const result = await pool.query(query, values);
    if (result.rowCount === 0) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal mengupdate dosen", detail: msg }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query("DELETE FROM user_dosen WHERE id=$1", [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menghapus dosen" }, { status: 500 });
  }
}
