
import { describe, it, expect } from 'vitest'
import { haversine } from '@/lib/haversine'

describe('haversine', () => {
    const beirut = { lat: 33.8938, lng: 35.5018 }
    const aley = {lat: 33.8053, lng: 35.6000}
    const tyre = {lat: 33.271992, lng: 35.203487}
    const southWest = { lat: -35.4563, lng: -36.4543 }

  it('returns 0 when both points are the same', () => {
    // Act
    const result = haversine(beirut.lat, beirut.lng, beirut.lat, beirut.lng)

    // Assert
    expect(result).toBe(0)
  })
  it('returns a positive distance for points with negative coordinates', () => {
    const result = haversine(beirut.lat, beirut.lng, southWest.lat, southWest.lng)

    expect(result).toBeGreaterThan(0);
})
it('returns the same distance regardless of point order', () => {
    const result = haversine(beirut.lat, beirut.lng, aley.lat, aley.lng)
    const result2 = haversine(aley.lat, aley.lng, beirut.lat, beirut.lng)

    expect(result).toBeCloseTo(result2, 6);
})
it('returns a aley nearer than tyre', () => {
    const toALey = haversine(beirut.lat, beirut.lng, aley.lat, aley.lng)
    const toTyre = haversine(beirut.lat, beirut.lng, tyre.lat, tyre.lng)

    expect(toALey).toBeLessThan(toTyre);
})
it('returns ~111.19 km for one degree of latitude along a meridian', () => {
    // Source: hand calculation, 2πR / 360 with R = 6371 km = 111.195 km
    const result = haversine(0, 0, 1, 0)

    expect(result).toBeCloseTo(111.19, 1)
  })
})