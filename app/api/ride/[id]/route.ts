import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";

export async function GET( request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;


  const token = request.cookies.get("ride_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rideId: number;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      rideId?: number;
      role?: string;
    };
    if (payload.role !== "customer" || typeof payload.rideId !== "number") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    rideId = payload.rideId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. receipt must be for THIS ride — 404, not 403, so we don't confirm it exists
  if (Number(id) !== rideId) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT d.current_lat, d.current_lng, d.name, d.phone, r.status
       FROM ride r
       JOIN driver d ON r.driver_id = d.id
       WHERE r.id = ? AND r.status IN ('assigned', 'en_route')`,
      [rideId]
    );
    return NextResponse.json({ location: rows[0] ?? null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}