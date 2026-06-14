import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import { normalize, findSimilar } from "@/lib/similarity";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, nama_layanan, tipe_pengguna
       FROM layanan_master
       ORDER BY tipe_pengguna, nama_layanan`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil daftar layanan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { nama_layanan, tipe_pengguna, force } = await request.json();

    if (!nama_layanan || !nama_layanan.trim()) {
      return NextResponse.json({ error: "Nama layanan wajib diisi" }, { status: 400 });
    }
    if (!["Mahasiswa", "Dosen"].includes(tipe_pengguna)) {
      return NextResponse.json({ error: "Tipe pengguna tidak valid" }, { status: 400 });
    }

    const existing = await pool.query<{ id: number; nama_layanan: string; tipe_pengguna: string }>(
      `SELECT id, nama_layanan, tipe_pengguna FROM layanan_master WHERE tipe_pengguna = $1`,
      [tipe_pengguna]
    );

    const normName = normalize(nama_layanan);
    const exactMatch = existing.rows.find((r) => normalize(r.nama_layanan) === normName);
    if (exactMatch) {
      return NextResponse.json({ error: "Layanan ini sudah ada di Master Layanan" }, { status: 409 });
    }

    if (!force) {
      const similar = findSimilar(nama_layanan, existing.rows, (r) => r.nama_layanan);
      if (similar.length > 0) {
        return NextResponse.json(
          {
            error: "similar_found",
            similar: similar.map((r) => ({ id: r.id, nama_layanan: r.nama_layanan })),
          },
          { status: 409 }
        );
      }
    }

    const result = await pool.query(
      `INSERT INTO layanan_master (nama_layanan, tipe_pengguna)
       VALUES ($1, $2)
       RETURNING id, nama_layanan, tipe_pengguna`,
      [nama_layanan.trim(), tipe_pengguna]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal menambah layanan", detail: msg }, { status: 500 });
  }
}
