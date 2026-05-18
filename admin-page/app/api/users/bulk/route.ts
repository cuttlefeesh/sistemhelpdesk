import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateEmbedding, dosenFields } from "@/lib/embedding";

/** Normalisasi prodi dari format DATA DOSEN: "PROGRAM STUDI S1 TEKNIK FISIKA (FTE)" → "S1 Teknik Fisika" */
function normalizeProdi(raw: string): string {
  const match = raw.match(/PROGRAM STUDI (.+?)(?:\s*\(.*\))?\s*$/i);
  if (!match) return raw.trim();
  return match[1].trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Deteksi prodi mahasiswa dari kode kelas (format iGracias) */
function detectProdiFromKelas(kelas: string): string {
  const k = kelas.toUpperCase().trim();
  // Urutan penting: lebih spesifik dulu
  if (/^S3[- ]TE/.test(k) || /^S3TE/.test(k))  return "S3 Teknik Elektro";
  if (/^S2TE/.test(k))                           return "S2 Teknik Elektro";
  if (/^S1TT/.test(k))                           return "S1 Teknik Telekomunikasi Kampus Jakarta";
  if (/^TTX/.test(k) || /^TT/.test(k))           return "S1 Teknik Telekomunikasi";
  if (/^EL/.test(k))                             return "S1 Teknik Elektro";
  if (/^TKX/.test(k) || /^TK/.test(k))           return "S1 Teknik Komputer";
  if (/^TB/.test(k))                             return "S1 Teknik Biomedis";
  if (/^TF/.test(k))                             return "S1 Teknik Fisika";
  if (/^TR/.test(k))                             return "S1 Teknik Sistem Energi";
  return "";
}

export async function POST(request: Request) {
  try {
    const { role, rows } = await request.json() as {
      role: string;
      rows: Record<string, string>[];
    };

    if (!role || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "role dan rows wajib diisi" }, { status: 400 });
    }

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      let nim_nip: string;
      let nama: string;
      let prodi: string | null = null;
      let kelas: string | null = null;
      let kode_dosen: string | null = null;
      let nidn_nuptk: string | null = null;
      let email: string | null = null;

      if (role === "dosen") {
        nim_nip    = (row["nip"] ?? "").trim();
        nama       = (row["nama pegawai"] ?? row["nama"] ?? "").trim();
        const rawProdi = row["prodi/lokasi kerja"] ?? row["prodi"] ?? "";
        prodi      = rawProdi ? normalizeProdi(rawProdi) : null;
        kode_dosen = (row["kode dosen"] ?? row["kode_dosen"] ?? "").trim() || null;
        nidn_nuptk = (row["nidn_nuptk"] ?? row["nidn"] ?? "").trim() || null;
        email      = (row["email"] ?? "").trim() || null;

      } else if (role === "mahasiswa") {
        // Header iGracias: "nim (nomor induk mahasiswa)" atau "nim"
        nim_nip = (
          row["nim (nomor induk mahasiswa)"] ??
          row["nim"] ??
          ""
        ).trim();
        nama  = (row["nama"] ?? "").trim();
        kelas = (row["kelas"] ?? "").trim() || null;
        email = (row["email"] ?? "").trim() || null;

        // Deteksi prodi dari kelas jika tidak ada kolom prodi
        const rawProdi = (row["prodi"] ?? "").trim();
        prodi = rawProdi || (kelas ? detectProdiFromKelas(kelas) : null) || null;

        // Skip baris header palsu / footer iGracias
        if (!nama || nama.toLowerCase().includes("showing") ||
            nama.toLowerCase().includes("igracias")) {
          skipped++;
          continue;
        }

      } else {
        // admin
        nim_nip = (row["nip"] ?? "").trim();
        nama    = (row["nama"] ?? "").trim();
        prodi   = (row["prodi"] ?? "").trim() || null;
        email   = (row["email"] ?? "").trim() || null;
      }

      if (!nama || !nim_nip) { skipped++; continue; }

      try {
        const password = await bcrypt.hash(nim_nip, 10);

        const embedding = role === "dosen"
          ? await generateEmbedding(dosenFields({ nim_nip, nama, kode_dosen, nidn_nuptk, email, prodi }))
          : null;

        await pool.query(
          `INSERT INTO users (role, nim_nip, nama, email, password, prodi, kelas, kode_dosen, nidn_nuptk, embedding)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::vector)
           ON CONFLICT (role, nim_nip) DO NOTHING`,
          [role, nim_nip, nama, email, password, prodi, kelas,
           kode_dosen, nidn_nuptk, embedding ? JSON.stringify(embedding) : null]
        );
        inserted++;
      } catch (err) {
        errors.push(`${nama}: ${err instanceof Error ? err.message : String(err)}`);
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
