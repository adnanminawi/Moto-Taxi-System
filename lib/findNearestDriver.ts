import db from "@/lib/db";
import { haversine } from "@/lib/haversine";
import { RowDataPacket } from "mysql2";

export async function findNearestDriver(pickupLat: number, pickupLng: number, excludeIds: number[] = []) {
  const [drivers] = await db.query<RowDataPacket[]>(
    "SELECT id, current_lat, current_lng FROM driver WHERE status = 'online' AND current_lat IS NOT NULL"
  );

  let nearest = null;
  let minDistance = Infinity;

  for (let i = 0; i < drivers.length; i++) {
    const d = drivers[i];
    if (excludeIds.includes(d.id)) continue;
    const distance = haversine(pickupLat, pickupLng, d.current_lat, d.current_lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = d;
    }
  }

  return nearest;
}