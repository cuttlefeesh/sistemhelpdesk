import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ nip: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { nip } = await params;
    const body = await request.json();
    const { nama, kode_dosen, nidn_nuptk, prodi, panggilan } = body;

    if (!nama) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE dosen
       SET nama=$1, kode_dosen=$2, nidn_nuptk=$3, prodi=$4, panggilan=$5
       WHERE nip=$6
       RETURNING *`,
      [nama, kode_dosen, nidn_nuptk, prodi, panggilan, nip]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengupdate data dosen" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ nip: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { nip } = await params;
    const result = await pool.query("DELETE FROM dosen WHERE nip=$1", [nip]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menghapus data dosen" }, { status: 500 });
  }
}
