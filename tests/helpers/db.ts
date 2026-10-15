import db from '@/lib/db'
import { ResultSetHeader, RowDataPacket } from 'mysql2'



export async function resetDb() {
  // Safety: never wipe a database that isn't a test database
  if (!process.env.DB_NAME?.endsWith('_test')) {
    throw new Error(`Refusing to reset non-test database: ${process.env.DB_NAME}`)
  }

  // One connection, so the FOREIGN_KEY_CHECKS setting applies to every line
  const conn = await db.getConnection()
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0')
    await conn.query('TRUNCATE TABLE ride')
    await conn.query('TRUNCATE TABLE driver')
    await conn.query('TRUNCATE TABLE customer')
    await conn.query('SET FOREIGN_KEY_CHECKS = 1')
  } finally {
    conn.release() // give the connection back to the pool, even if something failed
  }
}

// ---------- Create ----------

let seq = 0 // counter for unique, predictable names and phones

type DriverOptions = {
  status?: string
  lat?: number
  lng?: number
}

export async function createDriver(options: DriverOptions = {}): Promise<number> {
  const status = options.status ?? 'online'
  const lat = options.lat ?? 33.8938
  const lng = options.lng ?? 35.5018

  seq++

  const [result] = await db.query<ResultSetHeader>(
    'INSERT INTO driver (name, phone, password_hash, status, current_lat, current_lng) VALUES (?, ?, ?, ?, ?, ?)',
    [`Driver ${seq}`, `7000${seq}`, 'not-a-real-hash', status, lat, lng]
  )

  return result.insertId
}

type RideOptions = {
  status?: string
  driverId?: number | null
  pickupLat?: number
  pickupLng?: number
}

export async function createRide(options: RideOptions = {}): Promise<number> {
  const status = options.status ?? 'searching'
  const driverId = options.driverId ?? null
  const pickupLat = options.pickupLat ?? 33.8938
  const pickupLng = options.pickupLng ?? 35.5018

  seq++

  // A ride needs a customer, so create one first
  const [customer] = await db.query<ResultSetHeader>(
    'INSERT INTO customer (name, phone) VALUES (?, ?)',
    [`Customer ${seq}`, `7100${seq}`]
  )

  const [ride] = await db.query<ResultSetHeader>(
    `INSERT INTO ride (customer_id, driver_id, pickup_lat, pickup_lng, pickup_address,
                       destination_lat, destination_lng, destination_address, status)
     VALUES (?, ?, ?, ?, 'Test pickup', 33.9, 35.5, 'Test destination', ?)`,
    [customer.insertId, driverId, pickupLat, pickupLng, status]
  )

  return ride.insertId
}

// ---------- Read ----------

export async function getRide(id: number) {
  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM ride WHERE id = ?', [id])
  return rows[0]
}

export async function getDriver(id: number) {
  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM driver WHERE id = ?', [id])
  return rows[0]
}