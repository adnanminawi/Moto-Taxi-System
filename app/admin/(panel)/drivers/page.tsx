"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDrivers, deleteDriver } from "@/services/admin";
import type { Driver } from "@/types";

const DRIVER_STATUS: Record<Driver["status"], { label: string; dot: string }> = {
  online: { label: "Online", dot: "bg-emerald-500" },
  busy: { label: "On a ride", dot: "bg-amber-400" },
  offline: { label: "Offline", dot: "bg-slate-300" },
};

type Filter = "all" | Driver["status"];
const FILTERS: Filter[] = ["all", "online", "busy", "offline"];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchDrivers() {
      try {
        setDrivers(await getDrivers());
      } catch (err) {
        console.error("Error fetching drivers:", err);
        setError("Couldn't load drivers.");
      } finally {
        setLoading(false);
      }
    }
    fetchDrivers();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drivers.filter(
      (d) =>
        (filter === "all" || d.status === filter) &&
        (!q || d.name.toLowerCase().includes(q) || d.phone.includes(q))
    );
  }, [drivers, filter, query]);

  async function handleDelete(driver: Driver) {
    if (!confirm(`Delete ${driver.name}? Their past rides are kept but unlinked.`)) return;
    try {
      await deleteDriver(driver.id);
      setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to delete driver");
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading drivers…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-sm text-slate-500">{drivers.length} drivers</p>
        </div>
        <Link
          href="/admin/drivers/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add driver
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                filter === f ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {f === "all" ? "All" : DRIVER_STATUS[f].label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">No drivers found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((d) => {
                const s = DRIVER_STATUS[d.status];
                return (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium">{d.name}</td>
                    <td className="px-5 py-3 text-slate-600">{d.phone}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/drivers/${d.id}`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(d)}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
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