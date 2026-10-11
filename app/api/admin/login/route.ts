  import db from "@/lib/db";
  import bcrypt from "bcrypt";
  import { RowDataPacket } from "mysql2";
  import jwt from "jsonwebtoken";
  import { cookies } from "next/headers";

  interface Admin extends RowDataPacket {
    id: number;
    username: string;
    password_hash: string;
  }

  export async function POST(req: Request) {
    try {
      const { username, password } = await req.json();
      
      if (!username || !password) {
        return Response.json({ message: "Missing fields" }, { status: 400 });
      }

      const [rows] = await db.query<Admin[]>(
        "SELECT * FROM admin WHERE username = ?",
        [username]
      );
      // Username not found
      if (rows.length === 0) {
        return Response.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }
      const admin = rows[0];

      // Compare entered password with hashed password
      const isMatch = await bcrypt.compare(
        password,
        admin.password_hash
      );

      if (!isMatch) {
        return Response.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }
      const token = jwt.sign(
    { adminId: admin.id, role: "admin" },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
const cookieStore = await cookies();
cookieStore.set("admin_token", token, {          
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,    
});

      return Response.json(
        {
          message: "Login successful",
          admin: {
            id: admin.id,
            username: admin.username,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Login error:", error);

      return Response.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  }