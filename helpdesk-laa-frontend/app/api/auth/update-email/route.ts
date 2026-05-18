import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { email } = await request.json();

  try {
    const result = await pool.query(
      "UPDATE users SET email = $1 WHERE nim_nip = $2 RETURNING id, nim_nip, email",
      [email, session.nim_nip],
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
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Gagal memperbarui database" },
      { status: 500 },
    );
  }
}
