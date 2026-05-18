import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, cookieName, cookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "NIP/Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Cari admin berdasarkan nim_nip (NIP) atau email
    const result = await pool.query(
      `SELECT id, nama, nim_nip, email, password, role
       FROM users
       WHERE role = 'admin' AND (nim_nip = $1 OR email = $1)
       LIMIT 1`,
      [identifier.trim()]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "NIP/Email atau password salah" },
        { status: 401 }
      );
    }

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      return NextResponse.json(
        { error: "NIP/Email atau password salah" },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: admin.id,
      nama: admin.nama,
      nim_nip: admin.nim_nip,
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, nama: admin.nama, nim_nip: admin.nim_nip, email: admin.email },
    });

    response.cookies.set(cookieName(), token, cookieOptions());
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
