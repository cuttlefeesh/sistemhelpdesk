import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { nimNip, password } = await request.json();

  try {
    const result = await pool.query("SELECT * FROM users WHERE nim_nip = $1", [
      nimNip,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const user = result.rows[0];

    // 2. [BAGIAN YANG DIUBAH] Gunakan bcrypt.compare untuk mencocokkan input dengan hash di DB
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { status: "error", message: "Password salah" },
        { status: 401 },
      );
    }

    // Logika Penentuan Role
    let detectedRole = "User";
    if (user.kelas && user.kelas !== "") {
      detectedRole = "Mahasiswa";
    } else if (user.kode_dosen && user.kode_dosen !== "") {
      detectedRole = "Dosen";
    }

    return NextResponse.json({
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
