import { NextResponse } from "next/server";
import pool from "@/lib/db";

// [KODE DIPERBARUI]: Mengambil tiket KHUSUS untuk user yang sedang login
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nim = searchParams.get("nim");

  if (!nim) {
    return NextResponse.json(
      { status: "error", message: "NIM diperlukan" },
      { status: 400 },
    );
  }

  try {
    // [KODE BARU]: Query yang sudah di-INTEGRASIKAN dengan LEFT JOIN layanan_master
    const result = await pool.query(
      `SELECT 
          t.*, 
          l.nama_layanan 
       FROM tickets t
       LEFT JOIN layanan_master l ON t.layanan_id = l.id
       WHERE t.nim = $1
       ORDER BY t.created_at DESC`,
      [nim],
    );

    return NextResponse.json({ status: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal mengambil data tiket" },
      { status: 500 },
    );
  }
}

// Menyimpan tiket baru (Tetap sama, tidak ada yang diubah)
export async function POST(request: Request) {
  try {
    // [KODE BARU]: Tambahkan layanan_id di baris ini untuk ditangkap dari frontend
    const { id, nim, nama, subject, description, status, layanan_id } =
      await request.json();

    if (!id || !nim || !subject) {
      return NextResponse.json(
        { status: "error", message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    // [KODE BARU]: Tambahkan kolom layanan_id dan $7 ke dalam perintah INSERT
    await pool.query(
      `INSERT INTO tickets (id, nim, nama, subject, description, status, layanan_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, nim, nama, subject, description, status, layanan_id || null],
    );

    return NextResponse.json({
      status: "success",
      message: "Tiket berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal membuat tiket" },
      { status: 500 },
    );
  }
}
