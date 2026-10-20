"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { driverSession, setStatus, rideService, logout } from "@/services/driver";
import type { Driver, RideAction, RideRequest } from "@/types";
import GPSStream from "@/components/GPSStream";
import RidePopup from "@/components/RidePopup";

const Map = dynamic(() => import("@/components/DriverMap"), { ssr: false });

// shared size for both popups: fits small phones, 300px max on larger screens
const POPUP =
  "absolute top-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[300px] bg-white p-4 rounded-xl z-[1000] shadow-lg border-l-4 border-[#f4c542]";

export default function DriverClient() {
  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [totalRides, setTotalRides] = useState(0);

  useEffect(() => {
    async function fetchDriver() {
      try {
        const data = await driverSession();
        setDriver(data.driver);
        setIsOnline(data.driver?.status === "online");
        setTotalRides(data.totalRides || 0);
      } catch (err) {
        console.error("Failed to fetch driver:", err);
      }
    }
    fetchDriver();
  }, []);

  async function toggleStatus() {
    if (!driver) return;
    const newStatus = isOnline ? "offline" : "online";
    try {
      await setStatus(newStatus);
      setIsOnline(newStatus === "online");
      setDriver((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }

  async function acceptRide() {
    if (!rideRequest) return;
    const d: RideAction = { action: "accept", rideId: rideRequest.id };
    try {
      await rideService(d);
      setActiveRide({ ...rideRequest, status: "assigned" });
      setRideRequest(null);
    } catch (err) {
      console.error("Failed to accept ride:", err);
    }
  }

  async function rejectRide() {
    if (!rideRequest) return;
    const d: RideAction = { action: "reject", rideId: rideRequest.id };
    try {
      await rideService(d);
    } catch (err) {
      console.error("Failed to reject ride:", err);
    }
    setRideRequest(null);
  }

  async function arrivedAtPickup() {
    if (!activeRide) return;
    const d: RideAction = { action: "arrived", rideId: activeRide.id };
    try {
      await rideService(d);
      setActiveRide((prev) => (prev ? { ...prev, status: "en_route" } : prev));
    } catch (err) {
      console.error("Failed to mark arrived:", err);
    }
  }

  async function completeRide() {
    if (!activeRide) return;
    const d: RideAction = { action: "complete", rideId: activeRide.id };
    try {
      await rideService(d);
      setActiveRide(null);
      setIsOnline(true);
      setDriver((prev) => (prev ? { ...prev, status: "online" } : prev));
    } catch (err) {
      console.error("Failed to complete ride:", err);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.href = "/driver/login";
    }
  }

  // where should the driver be heading right now?
  const target = activeRide
    ? activeRide.status === "en_route"
      ? activeRide.destination
      : activeRide.pickup
    : null;

  return (
    <div className="flex h-[calc(100dvh-60px)] flex-col md:flex-row">
      {/* controls — below the map on phones, left sidebar on desktop */}
      <div className="order-2 md:order-1 w-full md:w-80 shrink-0 max-h-[45dvh] md:max-h-none overflow-y-auto bg-white p-5 flex flex-col gap-4 border-t md:border-t-0 md:border-r border-gray-300">
        <GPSStream driverId={driver?.id} isActive={isOnline} />
        {isOnline && !activeRide && <RidePopup setRideRequest={setRideRequest} />}

        <div className="bg-[#f7f7f7] p-4 rounded-[10px] border border-[#e3e3e3]">
          <h3 className="text-[13px] font-semibold text-gray-500 mb-1.5">Driver Info</h3>
          <p className="text-sm text-gray-700 my-1">Name: {driver?.name || "Loading..."}</p>
          <p className="text-sm text-gray-700 my-1">Phone: {driver?.phone || "Loading..."}</p>
        </div>

        <div className="bg-[#f7f7f7] p-4 rounded-[10px] border border-[#e3e3e3]">
          <h3 className="text-[13px] font-semibold text-gray-500 mb-1.5">Status</h3>
          <button
            className="w-full py-2.5 bg-[#f4c542] hover:bg-[#e6b93c] font-semibold text-sm cursor-pointer rounded-md text-black transition"
            onClick={toggleStatus}
          >
            {isOnline ? "Go Offline" : "Go Online"}
          </button>
        </div>

        <div className="bg-[#f7f7f7] p-4 rounded-[10px] border border-[#e3e3e3]">
          <h3 className="text-[13px] font-semibold text-gray-500 mb-1.5">Total Rides</h3>
          <h2 className="text-[22px] font-bold text-gray-900">{totalRides}</h2>
        </div>

        <button
          className="w-full py-2.5 bg-[#e0e0e0] font-semibold text-sm cursor-pointer rounded-md text-black"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* map — on top on phones, right side on desktop */}
      <div className="order-1 md:order-2 flex-1 min-h-0 w-full relative overflow-hidden bg-[#dcdcdc]">
        {rideRequest && (
          <div className={POPUP}>
            <h3 className="text-[15px] font-bold mb-2">🚨 New Ride Request</h3>
            <p className="text-[13px] text-gray-600 my-1">Customer: {rideRequest.customer.name}</p>
            <p className="text-[13px] text-gray-600 my-1">Phone: {rideRequest.customer.phone}</p>
            <p className="text-[13px] text-gray-600 my-1">Pickup: {rideRequest.pickup.address}</p>
            <p className="text-[13px] text-gray-600 my-1">Destination: {rideRequest.destination.address}</p>
            <div className="flex mt-2.5 gap-2.5">
              <button className="flex-1 bg-[#f4c542] p-2 rounded-md font-semibold cursor-pointer" onClick={acceptRide}>
                Accept
              </button>
              <button className="flex-1 bg-[#e0e0e0] p-2 rounded-md font-semibold cursor-pointer" onClick={rejectRide}>
                Reject
              </button>
            </div>
          </div>
        )}

        {activeRide && (
          <div className={POPUP}>
            <h3 className="text-[15px] font-bold mb-2">Current Ride</h3>
            <p className="text-[13px] text-gray-600 my-1">Pickup: {activeRide.pickup.address}</p>
            <p className="text-[13px] text-gray-600 my-1">Destination: {activeRide.destination.address}</p>
            <div className="mt-4 flex">
              {activeRide.status === "assigned" ? (
                <button className="flex-1 bg-[#f4c542] p-2 rounded-md font-semibold cursor-pointer" onClick={arrivedAtPickup}>
                  Arrived
                </button>
              ) : (
                <button className="flex-1 bg-[#f4c542] p-2 rounded-md font-semibold cursor-pointer" onClick={completeRide}>
                  Complete Ride
                </button>
              )}
            </div>
          </div>
        )}

        <Map driverLocation={{ lat: driver?.current_lat, lng: driver?.current_lng }} target={target} />
      </div>
    </div>
  );
}