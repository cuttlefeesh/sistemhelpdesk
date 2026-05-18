import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generateEmbedding, knowledgeFields } from "@/lib/embedding";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, intent, tipe_pengguna, deskripsi, prosedur, syarat,
              estimasi_waktu, platform, pihak, catatan, updated_at
       FROM knowledge_base
       ORDER BY updated_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { intent, tipe_pengguna, deskripsi, prosedur, syarat, estimasi_waktu, platform, pihak, catatan } =
      await request.json();

    if (!intent) {
      return NextResponse.json({ error: "Intent wajib diisi" }, { status: 400 });
    }

    const embedding = await generateEmbedding(knowledgeFields({
      intent, tipe_pengguna, deskripsi, prosedur, syarat, estimasi_waktu, platform, pihak, catatan,
    }));

    const result = await pool.query(
      `INSERT INTO knowledge_base
        (intent, tipe_pengguna, deskripsi, prosedur, syarat, estimasi_waktu, platform, pihak, catatan, embedding)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::vector)
       RETURNING id, intent, tipe_pengguna, deskripsi, prosedur, syarat, estimasi_waktu, platform, pihak, catatan, updated_at`,
      [intent, tipe_pengguna, deskripsi, prosedur, syarat, estimasi_waktu, platform, pihak, catatan,
       embedding ? JSON.stringify(embedding) : null]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal menambah data", detail: msg }, { status: 500 });
  }
}
