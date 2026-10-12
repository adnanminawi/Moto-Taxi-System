import db from "@/lib/db";
export async function GET() {
  try {
    const [driv_info] = await db.query("SELECT id, name, phone, status, current_lat, current_lng FROM driver");
    return Response.json({ drivers: driv_info });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}