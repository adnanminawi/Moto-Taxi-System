"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchRideTracking, createRide, cancelRide } from "@/services/customer";
import type { RideTracking } from "@/types";
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
  const [submitting, setSubmitting] = useState(false);
  const [tracking, setTracking] = useState<RideTracking | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!rideId) return;
    const id = rideId;

    const interval = setInterval(load, 5000);
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

  const canBook = name.trim() !== "" && phone.trim() !== "" && pickup !== null && destination !== null;
  const rideOver = tracking !== null && FINAL_STATUSES.includes(tracking.status);
  const canCancel = tracking?.status === "searching" || tracking?.status === "assigned";

  async function handleSubmit() {
    if (!pickup || !destination || submitting) return;
    setSubmitting(true);
    setError("");

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
      setTracking({ status: s.assignedDriver === null ? "no_driver_found" : "searching", driver: null });
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to book, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!rideId || submitting) return;
    setSubmitting(true); // same lock as booking: blocks double taps
    setError("");
    try {
      await cancelRide(rideId);
      setTracking({ status: "cancelled", driver: null });
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Couldn't cancel the ride.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setPickup(null);
    setDestination(null);
    setRideId(null);
    setTracking(null);
    setError("");
  }

  return (
    <div className="flex h-[100dvh] flex-col md:flex-row font-sans text-[#222]">
      {/* form — below the map on phones, left sidebar on desktop */}
      <div className="order-2 md:order-1 w-full md:w-80 shrink-0 max-h-[45dvh] md:max-h-none overflow-y-auto bg-white p-5 flex flex-col gap-4 border-t md:border-t-0 md:border-r border-gray-300">
        {/* name + phone only before booking */}
        {!tracking && (
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
                type="tel"
                inputMode="tel"
              />
            </div>
          </div>
        )}

        <div className="bg-[#f7f7f7] p-4 rounded-[10px] border border-[#e3e3e3]">
          <h3 className="text-[13px] font-semibold text-gray-500 mb-1.5">Trip</h3>
          <div className="flex items-center justify-between my-1">
            <p className="text-sm text-gray-700">Pickup: {pickup ? "Selected" : "Choose on map"}</p>
            {pickup && !tracking && (
              <button onClick={() => setPickup(null)} className="text-xs font-semibold text-gray-500 underline cursor-pointer">
                Change
              </button>
            )}
          </div>
          <div className="flex items-center justify-between my-1">
            <p className="text-sm text-gray-700">Destination: {destination ? "Selected" : "Choose on map"}</p>
            {destination && !tracking && (
              <button onClick={() => setDestination(null)} className="text-xs font-semibold text-gray-500 underline cursor-pointer">
                Change
              </button>
            )}
          </div>
        </div>

        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        {/* before booking: Request + Reset */}
        {!tracking && (
          <>
            <button
              onClick={handleSubmit}
              disabled={submitting || !canBook}
              className="flex w-full items-center justify-center gap-2 py-2.5 rounded-md bg-[#f4c542] text-sm font-semibold text-black cursor-pointer transition
                 hover:bg-[#e6b93c]
                 active:scale-95 active:bg-[#d9a92e]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] focus-visible:ring-offset-2
                 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              )}
              {submitting ? "Requesting…" : "Request Ride"}
            </button>
            {!canBook && (
              <p className="-mt-2 text-center text-xs text-gray-500">Fill in your name, phone, pickup and destination</p>
            )}
            <button
              className="w-full py-2.5 bg-[#e0e0e0] font-semibold text-sm cursor-pointer rounded-md text-black"
              onClick={reset}
            >
              Reset
            </button>
          </>
        )}

        {/* during the ride: Cancel (only before the trip starts) */}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="w-full py-2.5 rounded-md border border-rose-300 bg-white text-sm font-semibold text-rose-700 cursor-pointer hover:bg-rose-50 disabled:opacity-60"
          >
            {submitting ? "Cancelling…" : "Cancel ride"}
          </button>
        )}

        {/* ride over: start again */}
        {rideOver && (
          <button
            onClick={reset}
            className="w-full py-2.5 bg-[#f4c542] hover:bg-[#e6b93c] font-semibold text-sm cursor-pointer rounded-md text-black transition"
          >
            Book another ride
          </button>
        )}
      </div>

      {/* map — on top on phones, right side on desktop */}
      <div className="order-1 md:order-2 flex-1 min-h-0 relative overflow-hidden bg-[#dcdcdc]">
        {tracking && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[300px] bg-white p-4 rounded-xl z-[1000] shadow-lg border-l-4 border-[#f4c542]">
            <h3 className="text-[15px] font-bold mb-2">{STATUS_TEXT[tracking.status]}</h3>

            {tracking.status === "searching" && (
              <p className="text-[13px] text-gray-600">Waiting for a driver to accept your ride…</p>
            )}

            {tracking.driver && (
              <>
                <p className="text-[13px] text-gray-600 my-1">Driver: {tracking.driver.name}</p>
                <p className="text-[13px] text-gray-600 my-1">
                  Phone:{" "}
                  <a href={`tel:${tracking.driver.phone}`} className="font-semibold text-black underline">
                    {tracking.driver.phone}
                  </a>
                </p>
              </>
            )}
          </div>
        )}

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