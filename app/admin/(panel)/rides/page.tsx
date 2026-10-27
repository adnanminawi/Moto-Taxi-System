"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getRides, cancelRide } from "@/services/admin";
import type { RideInfo } from "@/types";
import { RIDE_STATUS, ASSIGNABLE, CANCELLABLE } from "@/lib/rideStatus";
import { Search } from "lucide-react";

type Filter = "all" | RideInfo["status"];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "searching", label: "Searching" },
  { value: "assigned", label: "Assigned" },
  { value: "en_route", label: "En route" },
  { value: "completed", label: "Completed" },
  { value: "no_driver_found", label: "No driver" },
  { value: "cancelled", label: "Cancelled" },
];

export default function RidesPage() {
  const [rides, setRides] = useState<RideInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchRides() {
      try {
        setRides(await getRides());
      } catch (err) {
        console.error("Error fetching rides:", err);
        setError("Couldn't load rides.");
      } finally {
        setLoading(false);
      }
    }
    fetchRides();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rides.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return [r.customer_name, r.driver_name, r.pickup_address, r.destination_address].some((field) =>
        field?.toLowerCase().includes(q)
      );
    });
  }, [rides, filter, query]);

  async function handleCancel(ride: RideInfo) {
    if (!confirm(`Cancel ride #${ride.id} for ${ride.customer_name}?`)) return;
    try {
      await cancelRide(ride.id);
      setRides((prev) => prev.map((r) => (r.id === ride.id ? { ...r, status: "cancelled" } : r)));
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to cancel ride");
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading rides…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

   return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Rides</h1>
        <p className="text-sm text-gray-500">{rides.length} rides</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold cursor-pointer ${
                filter === f.value ? "bg-[#111] text-white" : "border border-gray-200 bg-white text-gray-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 focus-within:border-[#f4c542]">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, driver, address…"
            className="w-full text-sm outline-none"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-200/70 bg-white shadow-sm">
        {visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">No rides found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf8] text-left text-[11px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-bold">#</th>
                <th className="px-5 py-3 font-bold">Customer</th>
                <th className="px-5 py-3 font-bold">Driver</th>
                <th className="px-5 py-3 font-bold">Pickup</th>
                <th className="px-5 py-3 font-bold">Destination</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((ride) => {
                const status = RIDE_STATUS[ride.status];
                return (
                  <tr key={ride.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-gray-400">{ride.id}</td>
                    <td className="px-5 py-3.5 font-bold">{ride.customer_name}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {ride.driver_name ?? <span className="text-gray-400">Unassigned</span>}
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3.5 text-gray-600" title={ride.pickup_address}>
                      {ride.pickup_address}
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3.5 text-gray-600" title={ride.destination_address}>
                      {ride.destination_address}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold whitespace-nowrap ${status.badge}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        {ASSIGNABLE.includes(ride.status) && (
                          <Link
                            href={`/admin/rides/${ride.id}/assign`}
                            className="rounded-xl bg-[#111] px-3 py-1.5 text-xs font-bold text-white hover:bg-black/85"
                          >
                            Assign
                          </Link>
                        )}
                        {CANCELLABLE.includes(ride.status) && (
                          <button
                            onClick={() => handleCancel(ride)}
                            className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}