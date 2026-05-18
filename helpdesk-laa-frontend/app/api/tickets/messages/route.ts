// File: app/api/tickets/messages/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get("ticketId");

  if (!ticketId) {
    return NextResponse.json(
      { status: "error", message: "ID Tiket diperlukan" },
      { status: 400 },
    );
  }

  try {
    // Ambil pesan berdasarkan ticket_id, urutkan dari yang terlama ke terbaru (ASC)
    const result = await pool.query(
      "SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC",
      [ticketId],
    );
    return NextResponse.json({ status: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching ticket messages:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal mengambil pesan" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { ticket_id, sender_type, sender_id, sender_name, message } =
      await request.json();

    // Simpan pesan baru ke database (created_at otomatis diisi NOW())
    const result = await pool.query(
      `INSERT INTO ticket_messages 
      (ticket_id, sender_type, sender_id, sender_name, message, is_read, created_at) 
      VALUES ($1, $2, $3, $4, $5, false, NOW()) RETURNING *`,
      [ticket_id, sender_type, sender_id, sender_name, message],
    );

    return NextResponse.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    console.error("Error inserting ticket message:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal mengirim pesan" },
      { status: 500 },
    );
  }
}
