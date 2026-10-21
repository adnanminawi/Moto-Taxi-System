import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getDriverId } from "@/lib/getDriverId";
import { acceptRide, markArrived, completeRide, rejectRide } from "@/lib/rides";
import { expireOffers } from "@/lib/expireOffers";


export async function GET() {
  const driverId = await getDriverId();
  if (!driverId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
   await expireOffers();

  try {
    const [rides] = await db.query<RowDataPacket[]>(
      `SELECT
        ride.*,
        customer.name AS customer_name,
        customer.phone AS customer_phone
      FROM ride
      JOIN customer ON ride.customer_id = customer.id
      WHERE ride.status = 'searching' AND ride.driver_id = ?
      ORDER BY ride.id DESC
      LIMIT 1`,
      [driverId]
    );

    return Response.json({ rides_info: rides });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch rides" }, { status: 500 });
  }
}


// GET unchanged

export async function PUT(req: Request) {
  try {
    const driverId = await getDriverId();
    if (!driverId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { action, rideId } = await req.json();

    if (action === "accept") {
      const result = await acceptRide(rideId, driverId);
      if (!result.ok) return Response.json({ message: "Ride already taken" }, { status: 409 });
      return Response.json({ message: "Ride accepted successfully" });
    }

    if (action === "arrived") {
      const result = await markArrived(rideId, driverId);
      if (!result.ok) return Response.json({ message: "Ride not in a state to mark arrived" }, { status: 409 });
      return Response.json({ message: "Arrived at pickup" });
    }

    if (action === "complete") {
      const result = await completeRide(rideId, driverId);
      if (!result.ok) return Response.json({ message: "Ride not in a state to complete" }, { status: 409 });
      return Response.json({ message: "Ride completed successfully" });
    }

    if (action === "reject") {
      const result = await rejectRide(rideId, driverId);
      if (!result.ok) {
        if (result.reason === "not_found") {
          return Response.json({ message: "Ride not found" }, { status: 404 });
        }
        return Response.json({ message: "Ride not offered to you" }, { status: 409 });
      }
      return Response.json({
        message: result.assignedDriver ? "Reassigned to next driver" : "No drivers left",
        assignedDriver: result.assignedDriver,
      });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update ride" }, { status: 500 });
  }
}
