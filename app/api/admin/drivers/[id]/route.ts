import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PROTECTED_DRIVER_PHONES } from "@/lib/demo";

type Params = { params: Promise<{ id: string }> };

function parseId(id: string) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_request: Request, { params }: Params) {
  const driverId = parseId((await params).id);
  if (!driverId) return Response.json({ message: "Invalid driver id" }, { status: 400 });

  try {
    const [driver] = await db.query<RowDataPacket[]>(
      "SELECT id, name, phone, status, current_lat, current_lng FROM driver WHERE id = ?",
      [driverId]
    );
    if (driver.length === 0) {
      return Response.json({ message: "Driver not found" }, { status: 404 });
    }

    const [rides] = await db.query<RowDataPacket[]>(
      `SELECT r.id, c.name AS customer_name, r.pickup_address, r.destination_address, r.status
       FROM ride r
       JOIN customer c ON r.customer_id = c.id
       WHERE r.driver_id = ?`,
      [driverId]
    );

    const [total] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM ride WHERE driver_id = ? AND status = 'completed'",
      [driverId]
    );

    return Response.json({
      driver_Profile: driver,
      rides,
      totalRides: total[0].count,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const driverId = parseId((await params).id);
  if (!driverId) return Response.json({ message: "Invalid driver id" }, { status: 400 });

  try {
    const { name, phone, status, current_lat, current_lng } = await request.json();

    const [result] = await db.query<ResultSetHeader>(
      "UPDATE driver SET name = ?, phone = ?, status = ?, current_lat = ?, current_lng = ? WHERE id = ?",
      [name, phone, status, current_lat, current_lng, driverId]
    );
    if (result.affectedRows === 0) {
      return Response.json({ message: "Driver not found" }, { status: 404 });
    }

    return Response.json({ message: "Driver updated successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const driverId = parseId((await params).id);
  if (!driverId) return Response.json({ message: "Invalid driver id" }, { status: 400 });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // lock the driver row so nothing changes it while we delete
    const [drivers] = await conn.query<RowDataPacket[]>(
      "SELECT phone FROM driver WHERE id = ? FOR UPDATE",
      [driverId]
    );
    if (drivers.length === 0) {
      await conn.rollback();
      return Response.json({ message: "Driver not found" }, { status: 404 });
    }

    if (PROTECTED_DRIVER_PHONES.includes(drivers[0].phone)) {
      await conn.rollback();
      return Response.json({ message: "Demo drivers can't be deleted" }, { status: 403 });
    }

    const [active] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM ride WHERE driver_id = ? AND status IN ('searching', 'assigned', 'en_route') LIMIT 1",
      [driverId]
    );
    if (active.length > 0) {
      await conn.rollback();
      return Response.json({ message: "Driver has an active ride" }, { status: 409 });
    }

    // keep ride history, just unlink the driver
    await conn.query("UPDATE ride SET driver_id = NULL WHERE driver_id = ?", [driverId]);
    await conn.query("DELETE FROM driver WHERE id = ?", [driverId]);

    await conn.commit();
    return Response.json({ message: "Driver deleted" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return Response.json({ message: "Something went wrong." }, { status: 500 });
  } finally {
    conn.release();
  }
}