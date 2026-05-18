import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Mengambil riwayat chat berdasarkan NIM/NIP DAN Session ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nimNip = searchParams.get("nimNip");
  const sessionId = searchParams.get("sessionId");

  try {
    if (sessionId) {
      const result = await pool.query(
        "SELECT id, role, content FROM chat_history WHERE nim_nip = $1 AND session_id = $2 ORDER BY created_at ASC",
        [nimNip, sessionId],
      );
      return NextResponse.json({ status: "success", data: result.rows });
    } else {
      // [PERBAIKAN]: Mengubah role = 'user' menjadi role != 'bot' agar mahasiswa/dosen tetap muncul di sidebar
      const result = await pool.query(
        `SELECT DISTINCT ON (session_id) session_id, content 
         FROM chat_history 
         WHERE nim_nip = $1 AND role != 'bot' AND session_id IS NOT NULL 
         ORDER BY session_id, created_at ASC`,
        [nimNip],
      );
      return NextResponse.json({ status: "success", data: result.rows });
    }
  } catch (error) {
    console.error("ERROR AT GET CHAT:", error); // [TAMBAHAN]: Untuk memunculkan error di terminal jika GET gagal
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

// Menyimpan pesan baru ke database beserta Session ID
export async function POST(request: Request) {
  const { nimNip, sessionId, role, content } = await request.json();

  try {
    await pool.query(
      "INSERT INTO chat_history (nim_nip, session_id, role, content) VALUES ($1, $2, $3, $4)",
      [nimNip, sessionId, role, content],
    );
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("ERROR AT POST CHAT:", error); // [TAMBAHAN]: Sangat penting untuk melihat alasan database menolak menyimpan pesan
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const nimNip = searchParams.get("nimNip");

    if (!sessionId || !nimNip) {
      return NextResponse.json(
        { status: "error", message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    await pool.query(
      "DELETE FROM chat_history WHERE nim_nip = $1 AND session_id = $2",
      [nimNip, sessionId],
    );

    return NextResponse.json({
      status: "success",
      message: "Chat berhasil dihapus",
    });
  } catch (error) {
    console.error("ERROR AT DELETE CHAT:", error); // [TAMBAHAN]: Log error untuk fungsi delete
    return NextResponse.json(
      { status: "error", message: "Gagal menghapus chat" },
      { status: 500 },
    );
  }
}
