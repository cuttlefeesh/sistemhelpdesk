import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
         t.id, t.nim, t.nama, t.subject, t.description, t.status, t.date,
         t.created_at, t.updated_at, t.handled_by,
         COALESCE((
           SELECT COUNT(*)::int
           FROM ticket_messages
           WHERE ticket_id = t.id
             AND sender_type = 'user'
             AND is_read = false
         ), 0)
         + CASE
             WHEN LOWER(t.status) = 'open'
               AND NOT EXISTS (
                 SELECT 1 FROM ticket_messages
                 WHERE ticket_id = t.id AND sender_type = 'user'
               )
             THEN 1
             ELSE 0
           END
         AS unread_count
       FROM tickets t
       ORDER BY COALESCE(t.updated_at, t.created_at) DESC`
    );
    return NextResponse.json(result.rows);
  } catch {
    try {
      const result = await pool.query(
        `SELECT id, nim, nama, subject, description, status, date, created_at,
                CASE WHEN LOWER(status) = 'open' THEN 1 ELSE 0 END AS unread_count
         FROM tickets
         ORDER BY created_at DESC`
      );
      return NextResponse.json(result.rows);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Gagal mengambil data tiket" }, { status: 500 });
    }
  }
}
