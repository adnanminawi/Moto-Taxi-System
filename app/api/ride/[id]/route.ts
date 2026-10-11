    import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try{
    const [loc] = await db.query<RowDataPacket[]>("SELECT d.current_lng, d.current_lat, d.name,d.phone, r.status FROM ride r JOIN driver d on r.driver_id=d.id WHERE r.id=?AND r.status IN ('assigned', 'en_route')",
    [id]);
    return Response.json({ location: loc[0] ?? null });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }}