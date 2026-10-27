"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getLive, cancelRide } from "@/services/admin";
import type { LiveData, LiveRide } from "@/types";
import { RIDE_STATUS, ASSIGNABLE, CANCELLABLE } from "@/lib/rideStatus";

const LiveMap = dynamic(() => import("@/components/admin/LiveMap"), { ssr: false });

const REFRESH_MS = 5000;

export default function LivePage() {
  const [data, setData] = useState<LiveData>({ drivers: [], rides: [] });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setData(await getLive());
        setError("");
      } catch (err) {
        console.error("Error loading live data:", err);
        setError("Couldn't load live data.");
      } finally {
        setLoading(false);
      }
    }
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  async function handleCancel(ride: LiveRide) {
    if (!confirm(`Cancel ride #${ride.id} for ${ride.customer_name}?`)) return;
    try {
      await cancelRide(ride.id);
      // remove it right away instead of waiting for the next refresh
      setData((prev) => ({ ...prev, rides: prev.rides.filter((r) => r.id !== ride.id) }));
      setSelectedId(null);
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to cancel ride");
    }
  }

  const online = data.drivers.filter((d) => d.status === "online").length;
  const busy = data.drivers.filter((d) => d.status === "busy").length;

  if (loading) return <p className="text-sm text-gray-500">Loading live map…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Live map</h1>
          <p className="text-sm text-gray-500">
            {data.rides.length} active rides · {online} drivers online · {busy} on a ride
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
          Updates every 5 seconds
        </span>
      </div>

      {error && <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        {/* map */}
        <div className="h-[55vh] overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm lg:h-[calc(100vh-200px)]">
          <LiveMap drivers={data.drivers} rides={data.rides} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* active rides list */}
        <div className="rounded-3xl border border-gray-200/70 bg-white shadow-sm lg:h-[calc(100vh-200px)] lg:overflow-y-auto">
          <h2 className="border-b border-gray-100 px-5 py-4 text-[15px] font-extrabold">Active rides</h2>

          {data.rides.length === 0 ? (
            <p className="p-10 text-center text-sm text-gray-500">No active rides right now.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.rides.map((r) => {
                const status = RIDE_STATUS[r.status];
                const isSelected = r.id === selectedId;
                return (
                  <li
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`cursor-pointer px-5 py-4 transition ${isSelected ? "bg-[#fffbeb]" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold">
                        #{r.id} · {r.customer_name}
                      </p>
                      <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${status.badge}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-[13px] text-gray-600">
                      <p className="flex items-center gap-2 truncate">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-600" />
                        {r.pickup_address ?? "Pinned on map"}
                      </p>
                      <p className="flex items-center gap-2 truncate">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[#111]" />
                        {r.destination_address ?? "Pinned on map"}
                      </p>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Driver: <span className="font-semibold text-gray-700">{r.driver_name ?? "Not assigned yet"}</span>
                    </p>

                    {isSelected && (
                      <div className="mt-3 flex gap-2">
                        {ASSIGNABLE.includes(r.status) && (
                          <Link
                            href={`/admin/rides/${r.id}/assign`}
                            className="rounded-xl bg-[#111] px-3 py-1.5 text-xs font-bold text-white hover:bg-black/85"
                          >
                            Assign
                          </Link>
                        )}
                        {CANCELLABLE.includes(r.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // don't re-select the row
                              handleCancel(r);
                            }}
                            className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <a
                          href={`tel:${r.customer_phone}`}
                          className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold hover:bg-gray-50"
                        >
                          Call customer
                        </a>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}