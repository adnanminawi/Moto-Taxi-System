"use client";
import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import { fetchRideTracking, createRide } from "@/services/customer";
import { RideTracking } from "@/types";
const Map = dynamic(() => import("@/components/CustomerMap"), { ssr: false });

const FINAL_STATUSES: RideTracking["status"][] = ["completed", "cancelled", "no_driver_found"];

const STATUS_TEXT: Record<RideTracking["status"], string> = {
  searching: "Finding your driver…",
  assigned: "Your driver accepted and is on the way",
  en_route: "On the way to your destination",
  completed: "Ride completed — thank you!",
  cancelled: "Ride cancelled",
  no_driver_found: "No driver available, please try again.",
};

export default function Page() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [rideId, setRideId] = useState<number | null>(null);
  const [tracking, setTracking] = useState<RideTracking | null>(null);

  useEffect(() => {
    if (!rideId) return;
    const id = rideId;

    const interval = setInterval(load, 10000);
    load();
    async function load() {
      try {
        const data = await fetchRideTracking(id);
        setTracking(data);
        if (FINAL_STATUSES.includes(data.status)) clearInterval(interval);
      } catch (err) {
        console.error("Tracking failed:", err);
      }
    }
    return () => clearInterval(interval);
  }, [rideId]);



  async function handleSubmit() {
    if (!pickup || !destination) return;

    const data = {
      name,
      phone,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
    };
      try {
        const s = await createRide(data);
        setRideId(s.rideId);
        setTracking({ status: s.assignedDriver === null ? "no_driver_found" : "searching", driver: null,});
      } catch (error) {
        console.log(error);
        alert("Failed to book");
      }
  }

  function reset() {
    setPickup(null);
    setDestination(null);
    setRideId(null);
    setTracking(null);
  }

 return (
    <div className="flex h-screen font-sans text-[#222]">
      <div className="w-80 bg-white p-5 flex flex-col gap-4 border-r border-gray-300">
        <div className="bg-[#f7f7f7] p-4 rounded-[10px] border border-[#e3e3e3]">
          <h3 className="text-[13px] font-semibold text-gray-500 mb-1.5">Book a Ride</h3>
          <div className="flex flex-col gap-3">
            <input
              className="p-2.5 rounded-md border border-gray-300 outline-none focus:border-[#f4c542]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <input
              className="p-2.5 rounded-md border border-gray-300 outline-none focus:border-[#f4c542]"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
            />
          </div>
        </div>

        <div className="bg-[#f7f7f7] p-4 rounded-[10px] border border-[#e3e3e3]">
          <h3 className="text-[13px] font-semibold text-gray-500 mb-1.5">Trip</h3>
          <p className="text-sm text-gray-700 my-1">Pickup: {pickup ? "Selected" : "Click on map"}</p>
          <p className="text-sm text-gray-700 my-1">
            Destination: {destination ? "Selected" : "Click on map"}
          </p>
        </div>

        <button
          className="w-full py-2.5 bg-[#f4c542] hover:bg-[#e6b93c] font-semibold text-sm cursor-pointer rounded-md text-black transition"
          onClick={handleSubmit}
        >
          Request Ride
        </button>
        <button
          className="w-full py-2.5 bg-[#e0e0e0] font-semibold text-sm cursor-pointer rounded-md text-black"
          onClick={reset}
        >
          Reset
        </button>

        {tracking && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl w-[280px] z-[1000] shadow-lg border-l-4 border-[#f4c542]">
            <h3 className="text-[15px] font-bold mb-2">{STATUS_TEXT[tracking.status]}</h3>

            {tracking.status === "searching" && (
              <p className="text-[13px] text-gray-600">Waiting for a driver to accept your ride…</p>
            )}

            {tracking.driver && (
              <>
                <p className="text-[13px] text-gray-600 my-1">Driver: {tracking.driver.name}</p>
                <p className="text-[13px] text-gray-600 my-1">Phone: {tracking.driver.phone}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 h-full relative overflow-hidden bg-[#dcdcdc]">
        <Map
          setPickup={setPickup}
          setDestination={setDestination}
          pickup={pickup}
          destination={destination}
          driverLocation={
            tracking?.driver
              ? { lat: tracking.driver.current_lat, lng: tracking.driver.current_lng }
              : null
          }
        />
      </div>
    </div>
  );
}