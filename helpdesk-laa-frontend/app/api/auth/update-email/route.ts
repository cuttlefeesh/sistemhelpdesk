import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  const { nimNip, email } = await request.json();

  try {
    // Update kolom email berdasarkan nim_nip
    const result = await pool.query(
      "UPDATE users SET email = $1 WHERE nim_nip = $2 RETURNING *",
      [email, nimNip],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { status: "error", message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Email berhasil diperbarui di database",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Gagal memperbarui database" },
      { status: 500 },
    );
  }
}
