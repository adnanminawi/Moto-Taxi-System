"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fetchRideTracking, createRide, cancelRide } from "@/services/customer";
import type { RideTracking } from "@/types";
import PlaceSearch from "@/components/PlaceSearch";
const Map = dynamic(() => import("@/components/CustomerMap"), { ssr: false });

// a point on the map; name is empty when the customer tapped the map
type Point = { lat: number; lng: number; name?: string };

const FINAL_STATUSES: RideTracking["status"][] = ["completed", "cancelled", "no_driver_found"];

const STATUS_TEXT: Record<RideTracking["status"], string> = {
  searching: "Finding your driver…",
  assigned: "Driver on the way",
  en_route: "On the trip",
  completed: "You've arrived — thank you!",
  cancelled: "Ride cancelled",
  no_driver_found: "No driver available",
};

// the progress bar: one segment per status
const STEPS: RideTracking["status"][] = ["searching", "assigned", "en_route", "completed"];
const STEP_LABELS = ["Finding", "On the way", "On trip", "Arrived"];

export default function Page() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState<Point | null>(null);
  const [destination, setDestination] = useState<Point | null>(null);
  const [rideId, setRideId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tracking, setTracking] = useState<RideTracking | null>(null);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);

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

  function handleMyLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Your browser can't share your location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickup({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: "Your location" });
        setLocating(false);
      },
      () => {
        setError("Couldn't get your location. Allow location access or tap the map.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function reset() {
    setPickup(null);
    setDestination(null);
    setRideId(null);
    setTracking(null);
    setError("");
  }

  // which screen to show — worked out from the state, no extra "step" state needed
  const view = tracking ? "ride" : pickup && destination ? "confirm" : "where";

  const mapHint = view !== "where" ? null : !pickup ? "Tap the map to set your pickup" : "Tap the map to set your destination";

  const stepIndex = tracking ? STEPS.indexOf(tracking.status) : -1; // -1 = cancelled / no driver

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#eef0ea] font-sans text-[#111]">
      {/* map fills the whole screen */}
      <div className="absolute inset-0">
        <Map
          setPickup={setPickup}
          setDestination={setDestination}
          pickup={pickup}
          destination={destination}
          driverLocation={
            tracking?.driver ? { lat: tracking.driver.current_lat, lng: tracking.driver.current_lng } : null
          }
        />
      </div>

      {/* logo */}
      <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-[15px] font-extrabold shadow-md md:left-6">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f4c542]">🏍️</span>
        MotoTaxi
      </div>

      {/* hint over the map */}
      {mapHint && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/85 px-4 py-2 text-[13px] font-semibold text-white md:left-[calc(50%+200px)] md:top-6">
          {mapHint}
        </div>
      )}

      {/* panel: bottom sheet on phones, floating card on the left on desktop */}
      <div className="absolute inset-x-0 bottom-0 z-[1000] max-h-[65dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:inset-x-auto md:bottom-auto md:left-6 md:top-20 md:max-h-[calc(100dvh-104px)] md:w-[390px] md:rounded-3xl md:pt-5 md:shadow-[0_12px_40px_rgba(0,0,0,0.16)]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200 md:hidden" />

        {/* ---------- 1. where to ---------- */}
        {view === "where" && (
          <>
            <h2 className="mb-4 text-[22px] font-extrabold tracking-tight">Where to?</h2>
            <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-[#f7f7f5]">
              <TripRow marker="pickup" label="Pickup" point={pickup} onChange={() => setPickup(null)}>
                <PlaceSearch placeholder="Search pickup" onSelect={setPickup} />
              </TripRow>
              <TripRow marker="destination" label="Destination" point={destination} onChange={() => setDestination(null)}>
                <PlaceSearch placeholder="Search destination" onSelect={setDestination} />
              </TripRow>
            </div>
            {!pickup && (
              <button
                onClick={handleMyLocation}
                disabled={locating}
                className="mt-3 rounded-full bg-gray-100 px-4 py-2 text-[13px] font-semibold cursor-pointer hover:bg-gray-200 disabled:opacity-60"
              >
                {locating ? "Locating…" : "📍 Use my location"}
              </button>
            )}
          </>
        )}

        {/* ---------- 2. confirm ---------- */}
        {view === "confirm" && (
          <>
            <h2 className="mb-4 text-[22px] font-extrabold tracking-tight">Confirm your ride</h2>
            <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-[#f7f7f5]">
              <TripRow marker="pickup" label="Pickup" point={pickup} onChange={() => setPickup(null)} />
              <TripRow marker="destination" label="Destination" point={destination} onChange={() => setDestination(null)} />
            </div>

            <label className="mt-3 block rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-[#f4c542]">
              <span className="text-[11px] font-medium text-gray-500">Name</span>
              <input
                className="block w-full text-[15px] font-semibold outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="mt-3 block rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-[#f4c542]">
              <span className="text-[11px] font-medium text-gray-500">Phone</span>
              <input
                className="block w-full text-[15px] font-semibold outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03 123 456"
                type="tel"
                inputMode="tel"
              />
            </label>

            <button
              onClick={handleSubmit}
              disabled={submitting || !canBook}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#f4c542] text-base font-extrabold cursor-pointer transition hover:bg-[#e6b93c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
              {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />}
              {submitting ? "Requesting…" : "Request ride"}
            </button>
            <p className="mt-2 text-center text-xs text-gray-500">
              {canBook ? "You can cancel until the trip starts" : "Enter your name and phone"}
            </p>
          </>
        )}

        {/* ---------- 3. ride ---------- */}
        {view === "ride" && tracking && (
          <>
            <h2 className="text-[22px] font-extrabold tracking-tight">{STATUS_TEXT[tracking.status]}</h2>
            <p className="mb-4 text-[13px] text-gray-500">
              {tracking.status === "searching" && "Waiting for a driver to accept your ride…"}
              {tracking.status === "assigned" && `Coming to ${pickup?.name ?? "your pickup"}`}
              {tracking.status === "en_route" && `To ${destination?.name ?? "your destination"}`}
              {tracking.status === "no_driver_found" && "All drivers are busy, please try again."}
            </p>

            {stepIndex >= 0 && (
              <div className="mb-4">
                <div className="flex gap-1.5">
                  {STEPS.map((step, i) => (
                    <span
                      key={step}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < stepIndex || tracking.status === "completed"
                          ? "bg-green-600"
                          : i === stepIndex
                          ? "bg-[#f4c542]"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-semibold">
                  {STEP_LABELS.map((label, i) => (
                    <span key={label} className={i <= stepIndex ? "text-gray-900" : "text-gray-400"}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tracking.driver && (
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#f7f7f5] p-3.5">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-black text-lg font-extrabold text-[#f4c542]">
                  {tracking.driver.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold">{tracking.driver.name}</p>
                  <p className="text-xs text-gray-500">Your driver · {tracking.driver.phone}</p>
                </div>
                <a
                  href={`tel:${tracking.driver.phone}`}
                  aria-label="Call driver"
                  className="ml-auto grid h-12 w-12 place-items-center rounded-full bg-green-600 text-xl"
                >
                  📞
                </a>
              </div>
            )}

            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={submitting}
                className="mt-4 h-12 w-full rounded-2xl border border-rose-200 text-[15px] font-bold text-rose-700 cursor-pointer hover:bg-rose-50 disabled:opacity-60"
              >
                {submitting ? "Cancelling…" : "Cancel ride"}
              </button>
            )}

            {rideOver && (
              <button
                onClick={reset}
                className="mt-4 h-14 w-full rounded-2xl bg-[#f4c542] text-base font-extrabold cursor-pointer hover:bg-[#e6b93c]"
              >
                Book another ride
              </button>
            )}
          </>
        )}

        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      </div>
    </div>
  );
}

// one row of the trip box: marker + label + place name (or the search box when empty)
function TripRow({
  marker,
  label,
  point,
  onChange,
  children,
}: {
  marker: "pickup" | "destination";
  label: string;
  point: Point | null;
  onChange: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span
        className={`mt-[22px] h-3 w-3 shrink-0 ${
          marker === "pickup" ? "rounded-full bg-green-600 ring-4 ring-green-100" : "rounded-sm bg-black"
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-500">{label}</p>
        {point ? (
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[15px] font-semibold">{point.name ?? "Pinned on map"}</p>
            <button onClick={onChange} className="text-xs font-semibold text-gray-500 underline cursor-pointer">
              Change
            </button>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}