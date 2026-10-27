import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";

// everything the live map needs: drivers on the road + rides still in progress
export async function GET() {
  try {
    const [drivers] = await db.query<RowDataPacket[]>(
      `SELECT id, name, phone, status, current_lat, current_lng, last_location_update
       FROM driver
       WHERE status IN ('online', 'busy')
         AND current_lat IS NOT NULL
         AND current_lng IS NOT NULL`
    );

    const [rides] = await db.query<RowDataPacket[]>(
      `SELECT r.id, r.status,
              r.pickup_lat, r.pickup_lng, r.pickup_address,
              r.destination_lat, r.destination_lng, r.destination_address,
              c.name AS customer_name, c.phone AS customer_phone,
              d.name AS driver_name
       FROM ride r
       JOIN customer c ON r.customer_id = c.id
       LEFT JOIN driver d ON r.driver_id = d.id
       WHERE r.status IN ('searching', 'assigned', 'en_route')
       ORDER BY r.id DESC`
    );

    return NextResponse.json({ drivers, rides });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}