"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getStats } from "@/services/admin";
import type { Stats } from "@/types";
import StatTile from "@/components/admin/StatTile";
import Card from "@/components/admin/Card";
import RideChart from "@/components/admin/RideChart";
import {
  Users,
  CarTaxiFront,
  Route,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";

const LiveMap = dynamic(() => import("@/components/admin/LiveDriversMap"), { ssr: false });

const REFRESH_MS = 30_000;


export default function AdminDashboard() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const stats = await getStats();
      setData(stats);
      setError(null);
      setUpdatedAt(new Date());
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Couldn't load statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (loading) return <p className="text-sm text-slate-500">Loading dashboard…</p>;

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">{error}</p>
        <button onClick={load} className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  const totalRides = data?.total_rides ?? 0;
  const pct = (n: number) => (totalRides ? Math.round((n / totalRides) * 100) : 0);

  const online = data?.online ?? 0;
  const busy = data?.busy ?? 0;
  const offline = data?.offline ?? 0;
  const totalDrivers = data?.total_drivers ?? 0;
  const share = (n: number) => (totalDrivers ? (n / totalDrivers) * 100 : 0);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500">
            Platform activity at a glance
            {updatedAt && ` · updated ${updatedAt.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
          {error} Showing the last loaded data.
        </p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile label="Drivers" value={totalDrivers} hint={`${online} online now`} icon={<CarTaxiFront size={18} />} tone="blue" />
        <StatTile label="Customers" value={data?.total_customers ?? 0} icon={<Users size={18} />} tone="slate" />
        <StatTile label="Total rides" value={totalRides} icon={<Route size={18} />} tone="slate" />
        <StatTile label="Completed" value={data?.completed_rides ?? 0} hint={`${pct(data?.completed_rides ?? 0)}% of all rides`} icon={<CheckCircle size={18} />} tone="green" />
        <StatTile label="Searching" value={data?.searching_rides ?? 0} hint="Waiting for a driver" icon={<Clock size={18} />} tone="amber" />
        <StatTile label="Cancelled" value={data?.cancelled_rides ?? 0} hint={`${pct(data?.cancelled_rides ?? 0)}% of all rides`} icon={<XCircle size={18} />} tone="red" />
      </div>

      {/* map + driver status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Live drivers"
            action={<span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />Live</span>}
          >
            <div className="h-[360px] overflow-hidden rounded-xl">
              <LiveMap />
            </div>
          </Card>
        </div>

        <Card title="Driver status">
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="bg-emerald-500" style={{ width: `${share(online)}%` }} />
            <div className="bg-amber-400" style={{ width: `${share(busy)}%` }} />
            <div className="bg-slate-300" style={{ width: `${share(offline)}%` }} />
          </div>

          <ul className="mt-5 space-y-3 text-sm">
            {[
              { label: "Online", value: online, dot: "bg-emerald-500" },
              { label: "On a ride", value: busy, dot: "bg-amber-400" },
              { label: "Offline", value: offline, dot: "bg-slate-300" },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
                  {row.label}
                </span>
                <span className="font-semibold text-slate-900">{row.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* rides chart */}
      <RideChart
        completed={data?.completed_rides ?? 0}
        searching={data?.searching_rides ?? 0}
        cancelled={data?.cancelled_rides ?? 0}
      />
    </div>
  );
}
