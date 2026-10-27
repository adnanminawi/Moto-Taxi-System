import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { logAdmin } from "@/lib/LogAdmin";

export async function POST(req: Request) {
  try {
    const { rideId, driverId } = await req.json();

    if (!rideId || !driverId) {
      return Response.json({ message: "Ride ID and Driver ID are required." }, { status: 400 });
    }

    // driver must be online and not already holding another offer (one offer per driver)
    const [drivers] = await db.query<RowDataPacket[]>(
      `SELECT id, name FROM driver
       WHERE id = ? AND status = 'online'
         AND id NOT IN (
           SELECT driver_id FROM ride
           WHERE status = 'searching' AND driver_id IS NOT NULL AND id <> ?
         )`,
      [driverId, rideId]
    );
    if (drivers.length === 0) {
      return Response.json(
        { message: "This driver isn't available (offline, on a ride, or already has an offer)." },
        { status: 409 }
      );
    }

    // atomic: only rides still waiting for a driver can be assigned
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE ride SET driver_id = ?, status = 'searching', offered_at = NOW()
       WHERE id = ? AND status IN ('searching', 'no_driver_found')`,
      [driverId, rideId]
    );
    if (result.affectedRows === 0) {
      return Response.json(
        { message: "This ride can't be assigned anymore (already accepted, finished, or not found)." },
        { status: 409 }
      );
    }

    await logAdmin("assign_ride", "ride", rideId, `Offered to ${drivers[0].name}`);

    return Response.json({ message: "Driver assigned successfully." });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Something went wrong." }, { status: 500 });
  }
}