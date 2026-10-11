import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [drivers] = await db.query<RowDataPacket[]>(" SELECT id, name, current_lat, current_lng, status FROM driver WHERE status = 'online' AND current_lat IS NOT NULL AND current_lng IS NOT NULL");

    return Response.json({
      drivers,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}