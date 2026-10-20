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
  online: { label: "Online", dot: "bg-emerald-500" },
  busy: { label: "On a ride", dot: "bg-amber-400" },
  offline: { label: "Offline", dot: "bg-slate-300" },
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
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">{error}</p>
        <Link href="/admin/drivers" className="mt-3 inline-block text-sm underline">Back to drivers</Link>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 rounded-2xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-200" />)}
        </div>
        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  const driver = details.driver_Profile[0];
  const { rides, totalRides } = details;
  const status = DRIVER_STATUS[driver.status];
  const active = rides.filter((r) => r.status === "assigned" || r.status === "en_route").length;

  return (
    <div className="space-y-6">
      <Link href="/admin/drivers" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to drivers
      </Link>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-700">
          {driver.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{driver.name}</h1>
          <p className="text-sm text-slate-500">{driver.phone} · Driver #{driver.id}</p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="All rides" value={rides.length} icon={<Route size={18} />} tone="slate" />
        <StatTile label="Completed" value={totalRides} icon={<CheckCircle size={18} />} tone="green" />
        <StatTile label="In progress" value={active} icon={<Activity size={18} />} tone="amber" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Ride history</h2>
        </div>
        {rides.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">This driver hasn't had any rides yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Pickup</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rides.map((r) => {
                  const s = RIDE_STATUS[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-400">{r.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">{r.customer_name}</td>
                      <td className="max-w-[220px] truncate px-5 py-3 text-slate-600" title={r.pickup_address}>{r.pickup_address}</td>
                      <td className="max-w-[220px] truncate px-5 py-3 text-slate-600" title={r.destination_address}>{r.destination_address}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${s.badge}`}>{s.label}</span>
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