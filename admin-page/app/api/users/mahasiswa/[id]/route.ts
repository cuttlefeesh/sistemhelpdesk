import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { nama, nim, email, prodi, kelas, reset_password } = await request.json();
    if (!nama || !nim) {
      return NextResponse.json({ error: "Nama dan NIM wajib diisi" }, { status: 400 });
    }

    let query: string;
    let values: unknown[];

    if (reset_password) {
      const password = await bcrypt.hash(nim, 10);
      query = `UPDATE user_mahasiswa SET nama=$1, nim=$2, email=$3, prodi=$4, kelas=$5, password=$6
               WHERE id=$7 RETURNING id, nama, nim, email, prodi, kelas`;
      values = [nama, nim, email, prodi, kelas, password, id];
    } else {
      query = `UPDATE user_mahasiswa SET nama=$1, nim=$2, email=$3, prodi=$4, kelas=$5
               WHERE id=$6 RETURNING id, nama, nim, email, prodi, kelas`;
      values = [nama, nim, email, prodi, kelas, id];
    }

    const result = await pool.query(query, values);
    if (result.rowCount === 0) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal mengupdate mahasiswa", detail: msg }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const result = await pool.query("DELETE FROM user_mahasiswa WHERE id=$1", [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menghapus mahasiswa" }, { status: 500 });
  }
}
