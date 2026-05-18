import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  try {
    if (sessionId) {
      const result = await pool.query(
        "SELECT id, role, content FROM chat_history WHERE nim_nip = $1 AND session_id = $2 ORDER BY created_at ASC",
        [session.nim_nip, sessionId],
      );
      return NextResponse.json({ status: "success", data: result.rows });
    } else {
      const result = await pool.query(
        `SELECT DISTINCT ON (session_id) session_id, content
         FROM chat_history
         WHERE nim_nip = $1 AND role != 'bot' AND session_id IS NOT NULL
         ORDER BY session_id, created_at ASC`,
        [session.nim_nip],
      );
      return NextResponse.json({ status: "success", data: result.rows });
    }
  } catch (error) {
    console.error("ERROR AT GET CHAT:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, role, content } = await request.json();

  try {
    await pool.query(
      "INSERT INTO chat_history (nim_nip, session_id, role, content) VALUES ($1, $2, $3, $4)",
      [session.nim_nip, sessionId, role, content],
    );
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("ERROR AT POST CHAT:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { status: "error", message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    await pool.query(
      "DELETE FROM chat_history WHERE nim_nip = $1 AND session_id = $2",
      [session.nim_nip, sessionId],
    );

    return NextResponse.json({
      status: "success",
      message: "Chat berhasil dihapus",
    });
  } catch (error) {
    console.error("ERROR AT DELETE CHAT:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal menghapus chat" },
      { status: 500 },
    );
  }
}
