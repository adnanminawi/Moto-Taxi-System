import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { GET } from "@/app/api/ride/[id]/route";
import { resetDb, createDriver, createRide, getDriver } from "./helpers/db";

function trackingRequest(id: number, token?: string) {
  return new NextRequest(`http://localhost/api/ride/${id}`, {
    headers: token ? { cookie: `ride_token=${token}` } : {},
  });
}

function params(id: number) {
  return { params: Promise.resolve({ id: String(id) }) };
}

function rideToken(rideId: number, options: jwt.SignOptions = { expiresIn: "1d" }) {
  return jwt.sign({ rideId, role: "customer" }, process.env.JWT_SECRET!, options);
}


describe("GET /api/ride/[id] (customer tracking)", () => {
  beforeEach(async () => {
    await resetDb();
  });

 it("returns the driver location for the ride in the token", async () => {
  // Arrange
  const driverId = await createDriver();
  const rideId = await createRide({ driverId, status: "assigned" });
  const token = rideToken(rideId);
  const driver = await getDriver(driverId);

  // Act
  const res = await GET(trackingRequest(rideId, token), params(rideId));
  const body = await res.json();

  // Assert
  expect(res.status).toBe(200);
  expect(body.location.name).toBe(driver.name);
});
});