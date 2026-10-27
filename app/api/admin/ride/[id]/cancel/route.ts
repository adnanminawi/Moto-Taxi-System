import { NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { logAdmin } from "@/lib/LogAdmin"

// admin cancels any ride that's still active
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rideId = Number(id);
  if (!Number.isInteger(rideId)) {
    return NextResponse.json({ message: "Invalid ride id." }, { status: 400 });
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT status, driver_id FROM ride WHERE id = ?", [rideId]);
    const ride = rows[0];
    if (!ride) {
      return NextResponse.json({ message: "Ride not found." }, { status: 404 });
    }
    if (!["searching", "assigned", "en_route"].includes(ride.status)) {
      return NextResponse.json({ message: "This ride is already finished." }, { status: 409 });
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
    if (ride.status === "assigned" || ride.status === "en_route") {
      await db.query("UPDATE driver SET status = 'online' WHERE id = ? AND status = 'busy'", [ride.driver_id]);
    }
    await logAdmin("cancel_ride", "ride", rideId, `Was ${ride.status}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}