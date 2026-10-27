"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getDriverDetails } from "@/services/admin";
import type { DriverDetails } from "@/types";
import { RIDE_STATUS } from "@/lib/rideStatus";
import StatTile from "@/components/admin/StatTile";
import { Route, CheckCircle, Activity } from "lucide-react";

const DRIVER_STATUS = {
  online: { label: "Online", badge: "bg-green-100 text-green-800", dot: "bg-green-600" },
  busy: { label: "On a ride", badge: "bg-[#fdf3cf] text-yellow-900", dot: "bg-[#f4c542]" },
  offline: { label: "Offline", badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
} as const;

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<DriverDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  async function fetchDriver() {
    try {
      setDetails(await getDriverDetails(Number(id)));
    } catch (err: any) {
      console.error("Error fetching driver:", err);
      setError(err.response?.status === 404 ? "Driver not found." : "Couldn't load this driver.");
    }
  }
  fetchDriver();
}, [id]);

    if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">{error}</p>
        <Link href="/admin/drivers" className="mt-3 inline-block text-sm font-semibold underline">
          Back to drivers
        </Link>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl bg-gray-200/70" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-gray-200/70" />
          ))}
        </div>
        <div className="h-72 rounded-3xl bg-gray-200/70" />
      </div>
    );
  }
  const driver = details.driver_Profile[0];
  const { rides, totalRides } = details;
  const status = DRIVER_STATUS[driver.status];
  const active = rides.filter((r) => r.status === "assigned" || r.status === "en_route").length;

  return (
    <div className="space-y-6">
      <Link href="/admin/drivers" className="text-sm font-semibold text-gray-500 hover:text-[#111]">
        ← Back to drivers
      </Link>

      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111] text-xl font-extrabold text-[#f4c542]">
          {driver.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold tracking-tight">{driver.name}</h1>
          <p className="text-sm text-gray-500">
            {driver.phone} · Driver #{driver.id}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${status.badge}`}>
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="All rides" value={rides.length} icon={<Route size={18} />} tone="slate" />
        <StatTile label="Completed" value={totalRides} icon={<CheckCircle size={18} />} tone="green" />
        <StatTile label="In progress" value={active} icon={<Activity size={18} />} tone="yellow" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-[15px] font-extrabold">Ride history</h2>
        </div>
        {rides.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">This driver hasn't had any rides yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fafaf8] text-left text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-bold">#</th>
                  <th className="px-5 py-3 font-bold">Customer</th>
                  <th className="px-5 py-3 font-bold">Pickup</th>
                  <th className="px-5 py-3 font-bold">Destination</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rides.map((r) => {
                  const s = RIDE_STATUS[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 text-gray-400">{r.id}</td>
                      <td className="px-5 py-3.5 font-bold">{r.customer_name}</td>
                      <td className="max-w-[220px] truncate px-5 py-3.5 text-gray-600" title={r.pickup_address}>
                        {r.pickup_address}
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-3.5 text-gray-600" title={r.destination_address}>
                        {r.destination_address}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${s.badge}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}