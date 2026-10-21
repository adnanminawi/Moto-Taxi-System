import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { rideId, driverId } = await req.json();

    if (!rideId || !driverId) {
      return Response.json(
        { message: "Ride ID and Driver ID are required." },
        { status: 400 }
      );
    }

    // Check if ride exists
    const [rides]: any = await db.query(
      "SELECT id FROM ride WHERE id = ?",
      [rideId]
    );

    if (rides.length === 0) {
      return Response.json(
        { message: "Ride not found." },
        { status: 404 }
      );
    }

    // Check if driver exists
    const [drivers]: any = await db.query(
      "SELECT id FROM driver WHERE id = ?",
      [driverId]
    );

    if (drivers.length === 0) {
      return Response.json(
        { message: "Driver not found." },
        { status: 404 }
      );
    }

    // Assign/change the driver
    await db.query(
      "UPDATE ride SET driver_id = ?, status = 'searching', offered_at = NOW() WHERE id = ?",
      [driverId, rideId]
    );

    return Response.json({
      message: "Driver assigned successfully.",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}