import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { findNearestDriver } from "@/lib/findNearestDriver";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function getAddress(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "MotoTaxiApp/1.0" } });
    const data = await res.json();
    return data.display_name ?? null;
  } catch (error) {
    return null;
  }
}



export async function POST(request: Request) {
  const { name, phone, pickup_lat, pickup_lng, destination_lat, destination_lng, status } = await request.json();
  if (!name || !phone || pickup_lat === undefined || pickup_lng === undefined || destination_lat === undefined || destination_lng === undefined) {
    return Response.json(
      { message: "Missing required fields: name, phone, and pickup/destination coordinates are required." },
      { status: 400 }
    );
  }
  try {
    const [existing] = await db.query<RowDataPacket[]>("SELECT id FROM customer Where phone=?",
      [phone]);


    let customerId;
    if (existing.length > 0) {
      customerId = existing[0].id;
    } else {
      const [newCust] = await db.query<ResultSetHeader>("INSERT INTO customer (name, phone) VALUES (?, ?)", [name, phone]);
      customerId = newCust.insertId;
    }

    
    const [active] = await db.query<RowDataPacket[]>(
      "SELECT id FROM ride WHERE customer_id = ? AND status IN ('searching', 'assigned', 'en_route') LIMIT 1",
      [customerId]
    );
    if (active.length > 0) {
      return NextResponse.json({ message: "You already have an active ride." }, { status: 409 });
    }


    const pickup_address = await getAddress(pickup_lat, pickup_lng);
    const destination_address = await getAddress(destination_lat, destination_lng);

    const [create_ride] = await db.query<ResultSetHeader>("INSERT INTO ride(customer_id,pickup_lat,pickup_lng,pickup_address,destination_lat,destination_lng,destination_address,status) VALUES (?,?,?,?,?,?,?,?)",
      [customerId, pickup_lat, pickup_lng, pickup_address, destination_lat, destination_lng, destination_address, 'searching']);
    const rideId = create_ride.insertId;


    const driver = await findNearestDriver(pickup_lat, pickup_lng);

    if (driver) {
      await db.query("UPDATE ride SET driver_id = ? WHERE id = ?", [driver.id, rideId]);
    } else {
      await db.query("UPDATE ride SET status = 'no_driver_found' WHERE id = ?", [rideId]);
    }

    const [driv] = await db.query<RowDataPacket[]>("SELECT d.name, d.phone FROM ride r JOIN driver d ON driver_id=d.id WHERE r.id=?",
      [rideId]);

    const rideToken = jwt.sign(
      { rideId, role: "customer" },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    const res = NextResponse.json(
      { ok: true, driver: driv[0] ?? null, rideId, assignedDriver: driver?.id ?? null },
      { status: 201 }
    );

    res.cookies.set("ride_token", rideToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}