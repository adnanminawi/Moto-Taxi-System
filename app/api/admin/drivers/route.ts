import db from "@/lib/db";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [drivers] = await db.query<RowDataPacket[]>(
      "SELECT id, name, phone, status, last_location_update FROM driver ORDER BY name"
    );
    return Response.json({ drivers });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, password } = await request.json();

    if (!name?.trim() || !phone?.trim() || !password) {
      return Response.json({ message: "All fields are required." }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO driver (name, phone, password_hash, status) VALUES (?, ?, ?, 'offline')",
      [name.trim(), phone.trim(), password_hash]
    );
    return Response.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    // phone column is UNIQUE — the database rejects duplicates
    if (error.code === "ER_DUP_ENTRY") {
      return Response.json({ message: "Phone already exists." }, { status: 409 });
    }
    console.error(error);
    return Response.json({ message: "Something went wrong." }, { status: 500 });
  }
}