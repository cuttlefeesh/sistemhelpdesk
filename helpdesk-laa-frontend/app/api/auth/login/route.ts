import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, cookieName, cookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const { nimNip, password } = await request.json();

  if (!nimNip || !password) {
    return NextResponse.json(
      { status: "error", message: "NIM/NIP dan password wajib diisi" },
      { status: 400 },
    );
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { status: "error", message: "Password minimal 6 karakter" },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query(
      "SELECT id, nim_nip, nama, email, password, role, prodi, kelas, kode_dosen FROM users WHERE nim_nip = $1 AND role != 'admin'",
      [nimNip],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "NIM/NIP atau password salah" },
        { status: 401 },
      );
    }

    const user = result.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { status: "error", message: "NIM/NIP atau password salah" },
        { status: 401 },
      );
    }

    const rawRole = (user.role || "").toLowerCase();
    let detectedRole: string;
    if (rawRole === "mahasiswa") {
      detectedRole = "Mahasiswa";
    } else if (rawRole === "dosen") {
      detectedRole = "Dosen";
    } else if (user.kelas && user.kelas !== "") {
      detectedRole = "Mahasiswa"; // fallback jika kolom role kosong
    } else if (user.kode_dosen && user.kode_dosen !== "") {
      detectedRole = "Dosen"; // fallback jika kolom role kosong
    } else {
      detectedRole = "User";
    }

    const sessionId = crypto.randomUUID();
    await pool.query(
      "UPDATE users SET session_id = $1 WHERE nim_nip = $2",
      [sessionId, user.nim_nip],
    );

    const token = await signToken({
      id: user.id,
      nim_nip: user.nim_nip,
      nama: user.nama,
      email: user.email,
      role: detectedRole,
      prodi: user.prodi,
      kelas: user.kelas,
      session_id: sessionId,
    });

    const response = NextResponse.json({
      status: "success",
      data: {
        nimNip: user.nim_nip,
        nama: user.nama,
        role: detectedRole,
        email: user.email,
        prodi: user.prodi,
        kelas: user.kelas,
      },
    });

    response.cookies.set(cookieName(), token, cookieOptions());
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
