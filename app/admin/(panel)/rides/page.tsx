"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getRides } from "@/services/admin";
import type { RideInfo } from "@/types";
import { RIDE_STATUS, ASSIGNABLE } from "@/lib/rideStatus";

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

  if (loading) return <p className="text-sm text-slate-500">Loading rides…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rides</h1>
        <p className="text-sm text-slate-500">{rides.length} rides</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                filter === f.value ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customer, driver, address…"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        {visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">No rides found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Pickup</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((ride) => {
                const status = RIDE_STATUS[ride.status];
                return (
                  <tr key={ride.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-400">{ride.id}</td>
                    <td className="px-5 py-3 font-medium">{ride.customer_name}</td>
                    <td className="px-5 py-3 text-slate-600">{ride.driver_name ?? "Unassigned"}</td>
                    <td className="max-w-[220px] truncate px-5 py-3 text-slate-600" title={ride.pickup_address}>
                      {ride.pickup_address}
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3 text-slate-600" title={ride.destination_address}>
                      {ride.destination_address}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badge}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {ASSIGNABLE.includes(ride.status) && (
                        <Link
                          href={`/admin/rides/${ride.id}/assign`}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Assign
                        </Link>
                      )}
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