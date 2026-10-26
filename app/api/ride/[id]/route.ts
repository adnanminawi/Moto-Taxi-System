import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { expireOffers } from "@/lib/expireOffers";

// reads the ride_token cookie → returns the rideId, or null if missing/invalid
function getRideIdFromToken(request: NextRequest): number | null {
  const token = request.cookies.get("ride_token")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { rideId?: number; role?: string };
    if (payload.role !== "customer" || typeof payload.rideId !== "number") return null;
    return payload.rideId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rideId = getRideIdFromToken(request);
  if (rideId === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // receipt must be for THIS ride — 404, not 403, so we don't confirm it exists
  if (Number(id) !== rideId) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  await expireOffers();

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT d.current_lat, d.current_lng, d.name, d.phone, r.status
       FROM ride r
       LEFT JOIN driver d ON r.driver_id = d.id
       WHERE r.id = ?`,
      [rideId]
    );
    const ride = rows[0];
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }
    const inProgress = ride.status === "assigned" || ride.status === "en_route";

    return NextResponse.json({
      status: ride.status,
      driver: inProgress
        ? { name: ride.name, phone: ride.phone, current_lat: ride.current_lat, current_lng: ride.current_lng }
        : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

// customer cancels their ride — only before the trip starts
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rideId = getRideIdFromToken(request);
  if (rideId === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (Number(id) !== rideId) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT status, driver_id FROM ride WHERE id = ?", [rideId]);
    const ride = rows[0];
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }
    if (ride.status !== "searching" && ride.status !== "assigned") {
      return NextResponse.json({ message: "This ride can't be cancelled anymore." }, { status: 409 });
    }

    // atomic: only cancels if the status is still the one we just read
    const [result] = await db.query<ResultSetHeader>(
      "UPDATE ride SET status = 'cancelled' WHERE id = ? AND status = ?",
      [rideId, ride.status]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Ride status changed, please try again." }, { status: 409 });
    }

    // driver had accepted → they were busy → make them available again
    if (ride.status === "assigned") {
      await db.query("UPDATE driver SET status = 'online' WHERE id = ? AND status = 'busy'", [ride.driver_id]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}