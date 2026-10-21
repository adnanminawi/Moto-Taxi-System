import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { findNearestDriver } from "@/lib/findNearestDriver";
import { expireOffers } from "@/lib/expireOffers";

async function getAddress(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "MotoTaxiApp/1.0" } }
    );
    const data = await res.json();
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, pickup_lat, pickup_lng, destination_lat, destination_lng } = await request.json();

    if (
      !name ||
      !phone ||
      pickup_lat === undefined ||
      pickup_lng === undefined ||
      destination_lat === undefined ||
      destination_lng === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields: name, phone, and pickup/destination coordinates are required." },
        { status: 400 }
      );
    }

    // find or create the customer
    const [existing] = await db.query<RowDataPacket[]>("SELECT id FROM customer WHERE phone = ?", [phone]);

    let customerId: number;
    if (existing.length > 0) {
      customerId = existing[0].id;
    } else {
      const [newCust] = await db.query<ResultSetHeader>(
        "INSERT INTO customer (name, phone) VALUES (?, ?)",
        [name, phone]
      );
      customerId = newCust.insertId;
    }

    // block double submission: one active ride per customer
    const [active] = await db.query<RowDataPacket[]>(
      "SELECT id FROM ride WHERE customer_id = ? AND status IN ('searching', 'assigned', 'en_route') LIMIT 1",
      [customerId]
    );
    if (active.length > 0) {
      return NextResponse.json({ message: "You already have an active ride." }, { status: 409 });
    }

    const pickupAddress = await getAddress(pickup_lat, pickup_lng);
    const destinationAddress = await getAddress(destination_lat, destination_lng);

    const [created] = await db.query<ResultSetHeader>(
      `INSERT INTO ride (customer_id, pickup_lat, pickup_lng, pickup_address,
                         destination_lat, destination_lng, destination_address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'searching')`,
      [customerId, pickup_lat, pickup_lng, pickupAddress, destination_lat, destination_lng, destinationAddress]
    );
    const rideId = created.insertId;

    // free up drivers stuck on expired offers before matching
    await expireOffers();

    const driver = await findNearestDriver(pickup_lat, pickup_lng);
    if (driver) {
      await db.query("UPDATE ride SET driver_id = ?, offered_at = NOW() WHERE id = ?", [driver.id, rideId]);
    } else {
      await db.query("UPDATE ride SET status = 'no_driver_found' WHERE id = ?", [rideId]);
    }

    // receipt: proves this browser booked this ride
    const rideToken = jwt.sign({ rideId, role: "customer" }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    // no driver details here — the customer only sees the driver after they accept
    const res = NextResponse.json({ ok: true, rideId, assignedDriver: driver?.id ?? null }, { status: 201 });

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