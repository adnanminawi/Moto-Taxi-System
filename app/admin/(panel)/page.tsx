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

  if (loading) return <p className="text-sm text-gray-500">Loading dashboard…</p>;

  if (error && !data) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">{error}</p>
        <button onClick={load} className="mt-3 rounded-xl bg-[#111] px-4 py-2 text-sm font-bold text-white cursor-pointer">
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
          <h1 className="text-[26px] font-extrabold tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500">
            Platform activity at a glance
            {updatedAt && ` · updated ${updatedAt.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold hover:bg-gray-50 transition cursor-pointer"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {error} Showing the last loaded data.
        </p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <StatTile label="Drivers" value={totalDrivers} hint={`${online} online now`} icon={<CarTaxiFront size={18} />} tone="yellow" />
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
            action={
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
                Live
              </span>
            }
          >
            <div className="h-[360px] overflow-hidden rounded-2xl">
              <LiveMap />
            </div>
          </Card>
        </div>

        <Card title="Driver status">
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="bg-green-600" style={{ width: `${share(online)}%` }} />
            <div className="bg-[#f4c542]" style={{ width: `${share(busy)}%` }} />
            <div className="bg-gray-300" style={{ width: `${share(offline)}%` }} />
          </div>

          <ul className="mt-5 space-y-3 text-sm">
            {[
              { label: "Online", value: online, dot: "bg-green-600" },
              { label: "On a ride", value: busy, dot: "bg-[#f4c542]" },
              { label: "Offline", value: offline, dot: "bg-gray-300" },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
                  {row.label}
                </span>
                <span className="font-extrabold">{row.value}</span>
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