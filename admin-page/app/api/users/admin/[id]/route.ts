import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { nama, nip, email, prodi, reset_password } = await request.json();
    if (!nama || !nip) {
      return NextResponse.json({ error: "Nama dan NIP wajib diisi" }, { status: 400 });
    }

    let query: string;
    let values: unknown[];

    if (reset_password) {
      const password = await bcrypt.hash(nip, 10);
      query = `UPDATE user_admin SET nama=$1, nip=$2, email=$3, prodi=$4, password=$5
               WHERE id=$6 RETURNING id, nama, nip, email, prodi`;
      values = [nama, nip, email, prodi, password, id];
    } else {
      query = `UPDATE user_admin SET nama=$1, nip=$2, email=$3, prodi=$4
               WHERE id=$5 RETURNING id, nama, nip, email, prodi`;
      values = [nama, nip, email, prodi, id];
    }

    const result = await pool.query(query, values);
    if (result.rowCount === 0) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Gagal mengupdate admin", detail: msg }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const result = await pool.query("DELETE FROM user_admin WHERE id=$1", [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menghapus admin" }, { status: 500 });
  }
}
