import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows: { nama: string; nip: string }[] = await request.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Data kosong" }, { status: 400 });
    }

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      if (!row.nama?.trim() || !row.nip?.trim()) { skipped++; continue; }
      try {
        const password = await bcrypt.hash(row.nip.trim(), 10);
        await pool.query(
          `INSERT INTO user_admin (nama, nip, password)
           VALUES ($1, $2, $3)
           ON CONFLICT (nip) DO NOTHING`,
          [row.nama.trim(), row.nip.trim(), password]
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
