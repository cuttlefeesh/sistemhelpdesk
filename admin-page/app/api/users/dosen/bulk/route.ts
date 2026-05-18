import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateEmbedding, dosenFields } from "@/lib/embedding";

export async function POST(request: Request) {
  try {
    const rows: { nama: string; nip: string; kode_dosen?: string; nidn_nuptk?: string; email?: string; prodi?: string }[] =
      await request.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Data kosong" }, { status: 400 });
    }

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      if (!row.nama?.trim()) { skipped++; continue; }
      const nip = row.nip?.trim() || "";
      const passwordSource = nip || row.nama;
      try {
        const password = await bcrypt.hash(passwordSource, 10);

        // Generate embedding langsung saat insert
        const embedding = await generateEmbedding(dosenFields({
          nip: nip || null,
          nama: row.nama.trim(),
          kode_dosen: row.kode_dosen,
          nidn_nuptk: row.nidn_nuptk,
          email: row.email,
          prodi: row.prodi,
        }));

        await pool.query(
          `INSERT INTO user_dosen (nama, nip, kode_dosen, nidn_nuptk, email, password, prodi, embedding)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8::vector)
           ON CONFLICT (nip) DO NOTHING`,
          [
            row.nama.trim(),
            nip || null,
            row.kode_dosen || null,
            row.nidn_nuptk || null,
            row.email || null,
            password,
            row.prodi || null,
            embedding ? JSON.stringify(embedding) : null,
          ]
        );
        inserted++;
      } catch (err) {
        errors.push(`${row.nama}: ${err instanceof Error ? err.message : String(err)}`);
        skipped++;
      }
    }

    return NextResponse.json({ inserted, skipped, errors });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal upload data", detail: msg }, { status: 500 });
  }
}
