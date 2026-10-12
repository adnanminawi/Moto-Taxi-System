import db from "@/lib/db";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [driv_info] = await db.query("SELECT id, name, phone, status, current_lat, current_lng FROM driver");
    return Response.json({ drivers: driv_info });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const { name, phone, password } = await request.json();
    if (!name || !phone || !password) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM driver WHERE phone = ?",
      [phone]
    );
    if (rows.length > 0) {
      return Response.json({ error: "Phone already exists." }, { status: 400 });
    }


    const password_hash = await bcrypt.hash(password, 10);


    await db.query("INSERT into driver(name,phone,password_hash,status) VALUES (?,?,?,?)",
      [name, phone, password_hash, 'offline']
    );
    return Response.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

