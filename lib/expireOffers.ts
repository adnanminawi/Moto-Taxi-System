import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { rejectRide } from "@/lib/rides";

const OFFER_SECONDS = 30;

export async function expireOffers() {
  try {
    const [stale] = await db.query<RowDataPacket[]>(
      `SELECT id, driver_id FROM ride
       WHERE status = 'searching'
         AND driver_id IS NOT NULL
         AND offered_at < NOW() - INTERVAL ? SECOND`,
      [OFFER_SECONDS]
    );
    for (const ride of stale) {
      await rejectRide(ride.id, ride.driver_id);
    }
  } catch (error) {
    console.error("expireOffers failed:", error);
  }
}