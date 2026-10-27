import { NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { rejectRide } from "@/lib/rides"; 
import { logAdmin } from "@/lib/LogAdmin";

// admin sets a driver offline (e.g. they closed the app but still show "online")
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const driverId = Number(id);
  if (!Number.isInteger(driverId)) {
    return NextResponse.json({ message: "Invalid driver id." }, { status: 400 });
  }

  try {
    // only online drivers — a busy driver is in the middle of a ride
    const [result] = await db.query<ResultSetHeader>(
      "UPDATE driver SET status = 'offline' WHERE id = ? AND status = 'online'",
      [driverId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Driver is not online (offline or on a ride)." }, { status: 409 });
    }

    // release rides waiting for this driver, same as when a driver goes offline
    const [offers] = await db.query<RowDataPacket[]>(
      "SELECT id FROM ride WHERE status = 'searching' AND driver_id = ?",
      [driverId]
    );
    for (const ride of offers) {
      await rejectRide(ride.id, driverId);
    }

     await logAdmin("force_offline", "driver", driverId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}