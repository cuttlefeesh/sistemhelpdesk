import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generateEmbedding, knowledgeFields } from "@/lib/embedding";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { intent, tipe_pengguna, deskripsi, prosedur, syarat, estimasi_waktu, platform, pihak, catatan } =
      await request.json();

    if (!intent) {
      return NextResponse.json({ error: "Intent wajib diisi" }, { status: 400 });
    }

    // Re-generate embedding dengan konten terbaru
    const embedding = await generateEmbedding(knowledgeFields({
      intent, tipe_pengguna, deskripsi, prosedur, syarat, estimasi_waktu, platform, pihak, catatan,
    }));

    const result = await pool.query(
      `UPDATE knowledge_base
       SET intent=$1, tipe_pengguna=$2, deskripsi=$3, prosedur=$4, syarat=$5,
           estimasi_waktu=$6, platform=$7, pihak=$8, catatan=$9, updated_at=now(),
           embedding=$10::vector
       WHERE id=$11
       RETURNING id, intent, tipe_pengguna, deskripsi, prosedur, syarat, estimasi_waktu, platform, pihak, catatan, updated_at`,
      [intent, tipe_pengguna, deskripsi, prosedur, syarat, estimasi_waktu, platform, pihak, catatan,
       embedding ? JSON.stringify(embedding) : null, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal mengupdate data", detail: msg }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query("DELETE FROM knowledge_base WHERE id=$1", [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
