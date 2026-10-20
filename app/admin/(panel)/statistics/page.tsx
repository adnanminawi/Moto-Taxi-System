"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Activity, Route } from "lucide-react";
import StatTile from "@/components/admin/StatTile";
import RideChart from "@/components/admin/RideChart";
import DriverChart from "@/components/admin/DriverChart";
import { getStats } from "@/services/admin";
import type { Stats } from "@/types";

const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setStats(await getStats());
      } catch (err) {
        console.error("Error loading stats:", err);
        setError("Couldn't load statistics.");
      }
    }
    load();
  }, []);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!stats) return <p className="text-sm text-slate-500">Loading statistics…</p>;

  const finished = stats.completed_rides + stats.cancelled_rides;
  const activeDrivers = stats.online + stats.busy;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statistics</h1>
        <p className="text-sm text-slate-500">Ride outcomes and driver activity</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Completion rate"
          value={`${percent(stats.completed_rides, finished)}%`}
          hint={`${stats.completed_rides} of ${finished} finished rides`}
          icon={<CheckCircle size={18} />}
          tone="green"
        />
        <StatTile
          label="Cancellation rate"
          value={`${percent(stats.cancelled_rides, finished)}%`}
          hint={`${stats.cancelled_rides} cancelled`}
          icon={<XCircle size={18} />}
          tone="red"
        />
        <StatTile
          label="Driver utilization"
          value={`${percent(stats.busy, activeDrivers)}%`}
          hint={`${stats.busy} of ${activeDrivers} active drivers on a ride`}
          icon={<Activity size={18} />}
          tone="amber"
        />
        <StatTile
          label="Rides per driver"
          value={stats.total_drivers ? (stats.total_rides / stats.total_drivers).toFixed(1) : "0"}
          hint={`${stats.total_rides} rides · ${stats.total_drivers} drivers`}
          icon={<Route size={18} />}
          tone="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RideChart
          completed={stats.completed_rides}
          searching={stats.searching_rides}
          cancelled={stats.cancelled_rides}
        />
        <DriverChart online={stats.online} busy={stats.busy} offline={stats.offline} />
      </div>
    </div>
  );
}