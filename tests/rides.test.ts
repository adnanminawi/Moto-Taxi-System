import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import db from '@/lib/db'
import { acceptRide, completeRide, markArrived, rejectRide } from '@/lib/rides'
import { resetDb, createDriver, createRide, getRide, getDriver } from '@/tests/helpers/db'
import { ArrowUpWideNarrow } from 'lucide-react'
import { get } from 'http'


beforeEach(async () => {
  await resetDb()
})

afterAll(async () => {
  await db.end()
})

describe('acceptRide', () => {
  it('assigns a searching ride to the driver it was offered to', async () => {
    // Arrange
    const driverId = await createDriver()
    const rideId = await createRide({ status: 'searching', driverId })

    // Act
    const result = await acceptRide(rideId, driverId)

    // Assert
    expect(result).toEqual({ ok: true })

    const ride = await getRide(rideId)
    expect(ride.status).toBe('assigned')
    expect(ride.driver_id).toBe(driverId)

    const driver = await getDriver(driverId)
    expect(driver.status).toBe('busy')
  })

  it('rejects a driver accepting a ride offered to someone else', async () => {
    // Arrange
    const driverA = await createDriver()
    const driverB = await createDriver()
    const rideId = await createRide({ status: 'searching', driverId: driverA })

    // Act: B tries to take A's ride
    const result = await acceptRide(rideId, driverB)

    // Assert: refused
    expect(result).toEqual({ ok: false, reason: 'conflict' })

    // Assert: nothing changed
    const ride = await getRide(rideId)
    expect(ride.status).toBe('searching')
    expect(ride.driver_id).toBe(driverA)

    const b = await getDriver(driverB)
    expect(b.status).toBe('online')
  })
})

describe('markArrived', () => {
  it('refuses arrived on a ride that has not been accepted', async () => {
    // Arrange
    const driverId = await createDriver()
    const rideId = await createRide({ status: 'searching', driverId })

    // Act: driver marks arrived without accepting first
    const result = await markArrived(rideId, driverId)

    // Assert
    expect(result).toEqual({ ok: false, reason: 'conflict' })

    const ride = await getRide(rideId)
    expect(ride.status).toBe('searching')

    const driver = await getDriver(driverId)
    expect(driver.status).toBe('online')
  })
})

describe('completeRide', () => {
  it('completes an en_route ride and sets the driver online', async () => {
    // Arrange: A is busy on his own ride
    const driverA = await createDriver({ status: 'busy' })
    const rideId = await createRide({ status: 'en_route', driverId: driverA })

    // Act: A completes his own ride
    const result = await completeRide(rideId, driverA)

    // Assert
    expect(result).toEqual({ ok: true })

    const ride = await getRide(rideId)
    expect(ride.status).toBe('completed')

    const a = await getDriver(driverA)
    expect(a.status).toBe('online')
  })

  it("rejects completing another driver's ride without changing the caller's status", async () => {
    // Arrange: A has an en_route ride, B is busy with something else
    const driverA = await createDriver({ status: 'busy' })
    const driverB = await createDriver({ status: 'busy' })
    const rideId = await createRide({ status: 'en_route', driverId: driverA })

    // Act: B tries to complete A's ride
    const result = await completeRide(rideId, driverB)

    // Assert: refused
    expect(result).toEqual({ ok: false, reason: 'conflict' })

    // Assert: nothing changed
    const ride = await getRide(rideId)
    expect(ride.status).toBe('en_route')

    const b = await getDriver(driverB)
    expect(b.status).toBe('busy')
  })

  it('refuses completing a ride that has not been marked arrived', async () => {
    // Arrange
    const driverId = await createDriver({ status: 'busy' })
    const rideId = await createRide({ status: 'assigned', driverId })

    // Act: driver tries to complete too early
    const result = await completeRide(rideId, driverId)

    // Assert: refused, nothing changed
    expect(result).toEqual({ ok: false, reason: 'conflict' })

    const ride = await getRide(rideId)
    expect(ride.status).toBe('assigned')

    const driver = await getDriver(driverId)
    expect(driver.status).toBe('busy')
  })
})
describe('rejectRide', () => {
  it('marks the ride no_driver_found when no other driver is online',async()=>{
    const driverId = await createDriver();
    const rideId = await createRide({status:'searching', driverId})

    const result = await rejectRide(rideId,driverId)

    expect(result).toEqual({ok: true, assignedDriver: null})

    const ride = await getRide(rideId)
    expect(ride.status).toBe('no_driver_found')
    expect(ride.driver_id).toBeNull()

    const driver = await getDriver(driverId)
    expect(driver.status).toBe('online')
  })

  it('re-offers the ride to the next available driver',async()=>{
    const driverA = await createDriver({status:'online'})
    const driverB = await createDriver({status:'online'})
    const rideId = await createRide({ status: 'searching', driverId: driverA })

    const result = await rejectRide(rideId,driverA)

    expect(result).toEqual({ok: true, assignedDriver: driverB})

    const ride = await getRide(rideId)
    expect(ride.status).toBe('searching')
    expect(ride.driver_id).toBe(driverB)

    const driver = await getDriver(driverB)
    expect(driver.status).toBe('online')
  })
  it('skips every driver who already rejected the ride', async()=>{
    const beirut = { lat: 33.8938, lng: 35.5018 }
    const aley = { lat: 33.8053, lng: 35.6000 }
    const tyre = { lat: 33.271992, lng: 35.203487 }

    
    const driverA = await createDriver({lat: beirut.lat, lng: beirut.lng})
    const driverB = await createDriver({lat: aley.lat, lng: aley.lng})
    const driverC = await createDriver({lat: tyre.lat, lng: tyre.lng})
    const rideId = await createRide({status:'searching', driverId: driverA})

    const result = await rejectRide(rideId,driverA)
    expect(result).toEqual({ok: true, assignedDriver: driverB})

    const result2 = await rejectRide(rideId,driverB)
    expect(result2).toEqual({ok: true, assignedDriver: driverC})


    const ride = await getRide(rideId)
    expect(ride.status).toBe('searching')
    expect(ride.driver_id).toBe(driverC)

  })
  it('the wrong driver rejects a ride',async()=>{
    const driverA = await createDriver()
    const driverB = await createDriver()
    const rideId= await createRide({status:'searching',driverId: driverA})
    
    const result = await rejectRide(rideId,driverB)
    expect(result).toEqual({ok: false, reason:'conflict'})

    const ride = await getRide(rideId)
    expect(ride.status).toBe('searching')
    expect(ride.driver_id).toBe(driverA)
    expect(ride.rejected_by).toBeNull()
  })
})