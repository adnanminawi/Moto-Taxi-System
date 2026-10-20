"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { assignDriver, getDrivers } from "@/services/admin";
import type { Driver } from "@/types";

export default function AssignRide() {
  const { id } = useParams<{ id: string }>();
  const rideId = Number(id);
  const router = useRouter();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverId, setDriverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const all = await getDrivers();
        setDrivers(all.filter((d) => d.status === "online")); // only drivers who can take it
      } catch (err) {
        console.error("Error fetching drivers:", err);
        setError("Couldn't load drivers.");
      } finally {
        setLoading(false);
      }
    }
    fetchDrivers();
  }, []);

  async function handleAssign() {
    if (driverId === null) return;
    setSubmitting(true);
    setError("");
    try {
      await assignDriver({ rideId, driverId });
      router.push("/admin/rides");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Couldn't assign driver.");
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading drivers…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link href="/admin/rides" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to rides
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Assign ride #{rideId}</h1>
        <p className="text-sm text-slate-500">Choose an online driver.</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        {drivers.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No drivers are online right now.</p>
        ) : (
          <ul className="space-y-2">
            {drivers.map((d) => (
              <li key={d.id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                    driverId === d.id ? "border-blue-500 bg-blue-50" : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="driver"
                    checked={driverId === d.id}
                    onChange={() => setDriverId(d.id)}
                  />
                  <span className="font-medium">{d.name}</span>
                  <span className="text-sm text-slate-500">{d.phone}</span>
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Online
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/rides"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleAssign}
            disabled={driverId === null || submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Assigning…" : "Assign driver"}
          </button>
        </div>
      </div>
    </div>
  );
}