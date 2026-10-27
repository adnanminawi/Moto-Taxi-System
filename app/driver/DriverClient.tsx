"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { driverSession, setStatus, rideService, logout } from "@/services/driver";
import type { Driver, RideAction, RideRequest, RidePoint } from "@/types";
import GPSStream from "@/components/GPSStream";
import RidePopup from "@/components/RidePopup";

const Map = dynamic(() => import("@/components/DriverMap"), { ssr: false });

const OFFER_SECONDS = 30;

// opens Google Maps (app on phones) with directions to the point
const navigateUrl = (p: RidePoint) =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving`;

export default function DriverClient() {
  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [totalRides, setTotalRides] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(OFFER_SECONDS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");

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

  // countdown shown on the request card (the real 30s reject stays in RidePopup + server)
  const requestId = rideRequest?.id ?? null;
  useEffect(() => {
    if (requestId === null) return;
    setSecondsLeft(OFFER_SECONDS);
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [requestId]);

  // customer can cancel while we're going to pickup.
  // the cancel route sets the driver back to "online", so if our status
  // turns "online" during an assigned ride, the ride was cancelled.
  const goingToPickup = activeRide?.status === "assigned";
  useEffect(() => {
    if (!goingToPickup) return;
    const timer = setInterval(async () => {
      try {
        const data = await driverSession();
        if (data.driver?.status === "online") {
          setActiveRide(null);
          setMessage("The customer cancelled the ride.");
        }
      } catch (err) {
        console.error("Status check failed:", err);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [goingToPickup]);

  async function toggleStatus() {
    if (!driver) return;
    const newStatus = isOnline ? "offline" : "online";
    try {
      await setStatus(newStatus);
      setIsOnline(newStatus === "online");
      setDriver((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setMessage("");
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
      setMessage("");
    } catch (err: any) {
      // e.g. the offer expired on the server just before we tapped
      setMessage(err.response?.data?.message ?? "This ride is no longer available.");
    }
    setRideRequest(null);
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
    } catch (err: any) {
      setMessage(err.response?.data?.message ?? "Couldn't update the ride.");
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
      setTotalRides((n) => n + 1);
    } catch (err: any) {
      setMessage(err.response?.data?.message ?? "Couldn't complete the ride.");
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

  // the ride shown on the map: an accepted ride, or a request we're looking at
  const shownRide = activeRide ?? rideRequest;

  // which panel to show
  const view = activeRide
    ? activeRide.status === "en_route"
      ? "trip"
      : "pickup"
    : rideRequest
    ? "request"
    : isOnline
    ? "waiting"
    : "offline";

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#eef0ea] text-[#111] font-sans">
      <GPSStream driverId={driver?.id} isActive={isOnline} />
      {isOnline && !activeRide && <RidePopup setRideRequest={setRideRequest} />}

      {/* map fills the screen */}
      <div className="absolute inset-0">
        <Map
          driverLocation={{ lat: driver?.current_lat, lng: driver?.current_lng }}
          pickup={shownRide && activeRide?.status !== "en_route" ? shownRide.pickup : null}
          destination={shownRide ? shownRide.destination : null}
          target={target}
        />
      </div>

      {/* top bar: online switch + menu */}
      <div className="absolute inset-x-4 top-4 z-[1000] flex items-start justify-between md:inset-x-6">
        <button
          onClick={toggleStatus}
          disabled={!driver || !!activeRide}
          className="flex items-center gap-2.5 rounded-full bg-white py-2 pl-4 pr-2 text-[15px] font-extrabold shadow-md cursor-pointer disabled:cursor-not-allowed"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-green-600 ring-4 ring-green-100" : "bg-gray-400"}`} />
          {isOnline ? "Online" : "Offline"}
          <span className={`relative h-6 w-11 rounded-full transition ${isOnline ? "bg-green-600" : "bg-gray-300"}`}>
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${isOnline ? "right-0.5" : "left-0.5"}`}
            />
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-lg shadow-md cursor-pointer"
          >
            ☰
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-4 shadow-lg">
              <p className="font-bold">{driver?.name ?? "Loading…"}</p>
              <p className="text-xs text-gray-500">{driver?.phone}</p>
              <p className="mt-3 text-sm text-gray-600">
                Total rides: <span className="font-bold text-gray-900">{totalRides}</span>
              </p>
              <button
                onClick={handleLogout}
                className="mt-3 w-full rounded-xl bg-gray-100 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* panel: bottom sheet on phones, floating card on desktop */}
      <div className="absolute inset-x-0 bottom-0 z-[1000] max-h-[65%] overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:inset-x-auto md:bottom-auto md:left-6 md:top-20 md:w-[390px] md:rounded-3xl md:pt-5 md:shadow-[0_12px_40px_rgba(0,0,0,0.16)]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200 md:hidden" />

        {message && <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{message}</p>}

        {/* ---------- offline ---------- */}
        {view === "offline" && (
          <>
            <h2 className="text-[22px] font-extrabold tracking-tight">You're offline</h2>
            <p className="mb-4 text-sm text-gray-500">Go online to start getting rides.</p>
            <button
              onClick={toggleStatus}
              disabled={!driver}
              className="h-14 w-full rounded-2xl bg-[#f4c542] text-base font-extrabold cursor-pointer hover:bg-[#e6b93c] disabled:opacity-60"
            >
              Go online
            </button>
          </>
        )}

        {/* ---------- online, waiting ---------- */}
        {view === "waiting" && (
          <>
            <h2 className="flex items-center gap-2 text-[22px] font-extrabold tracking-tight">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-600" />
              Looking for rides…
            </h2>
            <p className="mb-4 text-sm text-gray-500">Requests will pop up here.</p>
            <div className="rounded-2xl border border-gray-200 bg-[#f7f7f5] px-4 py-3">
              <p className="text-[11px] font-semibold text-gray-500">Total rides</p>
              <p className="text-[22px] font-extrabold">{totalRides}</p>
            </div>
            <button
              onClick={toggleStatus}
              className="mt-4 h-12 w-full rounded-2xl border border-gray-200 text-[15px] font-bold cursor-pointer hover:bg-gray-50"
            >
              Go offline
            </button>
          </>
        )}

        {/* ---------- new request ---------- */}
        {view === "request" && rideRequest && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[22px] font-extrabold tracking-tight">New ride request</h2>
              <Countdown secondsLeft={secondsLeft} />
            </div>
            <Trip pickup={rideRequest.pickup} destination={rideRequest.destination} />
            <p className="mt-3 text-sm text-gray-600">
              Customer: <span className="font-semibold text-gray-900">{rideRequest.customer.name}</span>
            </p>
            <div className="mt-4 flex gap-2.5">
              <button
                onClick={rejectRide}
                className="h-14 flex-1 rounded-2xl bg-gray-100 text-[15px] font-bold text-gray-700 cursor-pointer hover:bg-gray-200"
              >
                Reject
              </button>
              <button
                onClick={acceptRide}
                className="h-14 flex-[2] rounded-2xl bg-green-600 text-[17px] font-extrabold text-white cursor-pointer hover:bg-green-700"
              >
                Accept
              </button>
            </div>
          </>
        )}

        {/* ---------- going to pickup ---------- */}
        {view === "pickup" && activeRide && (
          <>
            <h2 className="text-[22px] font-extrabold tracking-tight">Pick up {activeRide.customer.name}</h2>
            <p className="mb-4 text-sm text-gray-600">{activeRide.pickup.address ?? "Pickup point on the map"}</p>
            <div className="flex gap-2.5">
              <a
                href={`tel:${activeRide.customer.phone}`}
                className="grid h-12 flex-1 place-items-center rounded-2xl border border-gray-200 text-[15px] font-bold"
              >
                📞 Call
              </a>
              <a
                href={navigateUrl(activeRide.pickup)}
                target="_blank"
                rel="noreferrer"
                className="grid h-12 flex-1 place-items-center rounded-2xl border border-gray-200 text-[15px] font-bold"
              >
                🧭 Navigate
              </a>
            </div>
            <button
              onClick={arrivedAtPickup}
              className="mt-3 h-14 w-full rounded-2xl bg-[#f4c542] text-[17px] font-extrabold cursor-pointer hover:bg-[#e6b93c]"
            >
              I've arrived
            </button>
          </>
        )}

        {/* ---------- on the trip ---------- */}
        {view === "trip" && activeRide && (
          <>
            <h2 className="text-[22px] font-extrabold tracking-tight">On the trip</h2>
            <p className="mb-4 text-sm text-gray-600">To {activeRide.destination.address ?? "the destination"}</p>
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#f7f7f5] p-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-black font-extrabold text-[#f4c542]">
                {activeRide.customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold">{activeRide.customer.name}</p>
                <p className="text-xs text-gray-500">{activeRide.customer.phone}</p>
              </div>
              <a
                href={`tel:${activeRide.customer.phone}`}
                aria-label="Call customer"
                className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-green-600"
              >
                📞
              </a>
            </div>
            <a
              href={navigateUrl(activeRide.destination)}
              target="_blank"
              rel="noreferrer"
              className="grid h-12 w-full place-items-center rounded-2xl border border-gray-200 text-[15px] font-bold"
            >
              🧭 Navigate
            </a>
            <button
              onClick={completeRide}
              className="mt-3 h-14 w-full rounded-2xl bg-green-600 text-[17px] font-extrabold text-white cursor-pointer hover:bg-green-700"
            >
              Complete ride
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// pickup → destination box
function Trip({ pickup, destination }: { pickup: RidePoint; destination: RidePoint }) {
  return (
    <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-[#f7f7f5]">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="h-3 w-3 shrink-0 rounded-full bg-green-600 ring-4 ring-green-100" />
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-500">Pickup</p>
          <p className="truncate text-[15px] font-semibold">{pickup.address ?? "Point on the map"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="h-3 w-3 shrink-0 rounded-sm bg-black" />
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-500">Destination</p>
          <p className="truncate text-[15px] font-semibold">{destination.address ?? "Point on the map"}</p>
        </div>
      </div>
    </div>
  );
}

// ring that empties as the 30 seconds run out
function Countdown({ secondsLeft }: { secondsLeft: number }) {
  const r = 22;
  const length = 2 * Math.PI * r;
  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={r} stroke="#eee" strokeWidth="5" fill="none" />
        <circle
          cx="28"
          cy="28"
          r={r}
          stroke={secondsLeft <= 10 ? "#e11d48" : "#16a34a"}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - secondsLeft / OFFER_SECONDS)}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-extrabold">{secondsLeft}s</span>
    </div>
  );
}