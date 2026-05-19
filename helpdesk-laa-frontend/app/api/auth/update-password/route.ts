import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const { token, newPassword } = await request.json();

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json(
      { status: "error", message: "Password baru minimal 6 karakter" },
      { status: 400 },
    );
  }

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

    // 2. Cek apakah password baru sama dengan password lama
    const userResult = await pool.query(
      "SELECT password FROM users WHERE nim_nip = $1",
      [nimNip],
    );
    if (userResult.rows.length > 0) {
      const isSame = await bcrypt.compare(newPassword, userResult.rows[0].password);
      if (isSame) {
        return NextResponse.json(
          { status: "error", message: "Password baru tidak boleh sama dengan password yang sudah ada" },
          { status: 400 },
        );
      }
    }

    // 3. Enkripsi (Hash) password baru
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

    const response = NextResponse.json({
      status: "success",
      message: "Password berhasil diubah",
    });
    response.cookies.set(cookieName(), "", { maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
