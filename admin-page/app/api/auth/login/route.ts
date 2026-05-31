import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, cookieName, cookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "NIP dan password wajib diisi" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT id, nama, nip AS nim_nip, password, 'admin' AS role
       FROM user_admin
       WHERE nip = $1
       LIMIT 1`,
      [identifier.trim()]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "NIP atau password salah" },
        { status: 401 }
      );
    }

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      return NextResponse.json(
        { error: "NIP atau password salah" },
        { status: 401 }
      );
    }

    const sessionId = crypto.randomUUID();
    await pool.query(
      "UPDATE user_admin SET session_id = $1 WHERE nip = $2",
      [sessionId, admin.nim_nip],
    );

    const token = await signToken({
      id: admin.id,
      nama: admin.nama,
      nim_nip: admin.nim_nip,
      role: admin.role,
      session_id: sessionId,
    });

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, nama: admin.nama, nim_nip: admin.nim_nip },
    });

    response.cookies.set(cookieName(), token, cookieOptions());
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
