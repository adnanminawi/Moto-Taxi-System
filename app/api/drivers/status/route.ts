import db from "@/lib/db";
import { getDriverId } from "@/lib/getDriverId";

export async function POST(req: Request) {
  try {
    const driverId = await getDriverId();
    if (!driverId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    if (status !== "online" && status !== "offline") {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const [result]: any = await db.query(
      "UPDATE driver SET status = ? WHERE id = ? AND status != 'busy'",
      [status, driverId]
    );

    if (result.affectedRows === 0) {
      return Response.json({ error: "Cannot change status during a ride" }, { status: 409 });
    }
    return Response.json({ message: "Driver status updated successfully", status });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}