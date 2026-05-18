import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { token, newPassword } = await request.json();

  try {
    // 1. Cek apakah tokennya ada dan belum kadaluwarsa
    const tokenCheck = await pool.query(
      "SELECT nim_nip FROM password_resets WHERE token = $1 AND expires_at > NOW()",
      [token],
    );

    if (tokenCheck.rows.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Token tidak valid atau sudah kadaluwarsa",
        },
        { status: 400 },
      );
    }

    const nimNip = tokenCheck.rows[0].nim_nip;

    // 2. Enkripsi (Hash) password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update password di tabel users
    await pool.query("UPDATE users SET password = $1 WHERE nim_nip = $2", [
      hashedPassword,
      nimNip,
    ]);

    // 4. Hapus token agar tidak bisa dipakai 2 kali (Keamanan)
    await pool.query("DELETE FROM password_resets WHERE nim_nip = $1", [
      nimNip,
    ]);

    return NextResponse.json({
      status: "success",
      message: "Password berhasil diubah",
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
