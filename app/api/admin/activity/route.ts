import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";

// latest admin actions, newest first
export async function GET() {
  try {
    const [logs] = await db.query<RowDataPacket[]>(
      `SELECT l.id, l.action, l.target_type, l.target_id, l.details, l.created_at
       FROM admin_log l
       ORDER BY l.id DESC
       LIMIT 200`
    );
    return NextResponse.json({ logs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}