import db from "@/lib/db";


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [driver] = await db.query("SELECT id, name, phone, status, current_lat, current_lng FROM driver Where id =?",
      [id]);
    const [rides] = await db.query("SELECT r.id, c.name AS customer_name, r.pickup_address, r.destination_address, r.status FROM ride r JOIN customer c ON r.customer_id = c.id WHERE r.driver_id = ?",
      [id]);
    const [totalRides]: any = await db.query(
      "SELECT COUNT(*) AS count FROM ride WHERE driver_id = ? AND status = 'completed'",
      [id]
    );

    return Response.json({
      driver_Profile: driver,
      rides,
      totalRides: totalRides[0].count
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, phone, status, current_lat, current_lng } = await request.json();
  try {
    await db.query("UPDATE driver SET name = ?, phone = ?, status = ?, current_lat = ?, current_lng = ? WHERE id = ?",
      [name, phone, status, current_lat, current_lng, id]);
    return Response.json({ message: "Driver updated successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}