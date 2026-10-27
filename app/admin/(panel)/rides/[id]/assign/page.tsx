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
        <Link href="/admin/rides" className="text-sm font-semibold text-gray-500 hover:text-[#111]">
          ← Back to rides
        </Link>
        <h1 className="mt-2 text-[26px] font-extrabold tracking-tight">Assign ride #{rideId}</h1>
        <p className="text-sm text-gray-500">Choose an online driver.</p>
      </div>

      <div className="rounded-3xl border border-gray-200/70 bg-white shadow-sm">
        <div className="space-y-4 p-5">
          {drivers.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No drivers are online right now.</p>
          ) : (
            <ul className="space-y-2">
              {drivers.map((d) => (
                <li key={d.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${
                      driverId === d.id ? "border-[#f4c542] bg-[#fffbeb]" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="driver"
                      checked={driverId === d.id}
                      onChange={() => setDriverId(d.id)}
                      className="accent-[#111]"
                    />
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#111] text-sm font-extrabold text-[#f4c542]">
                      {d.name.charAt(0).toUpperCase()}
                    </span>
                    <span>
                      <span className="block font-bold">{d.name}</span>
                      <span className="block text-xs text-gray-500">{d.phone}</span>
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                      Online
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 p-4">
          <Link
            href="/admin/rides"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleAssign}
            disabled={driverId === null || submitting}
            className="rounded-xl bg-[#111] px-5 py-2.5 text-sm font-bold text-white hover:bg-black/85 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Assigning…" : "Assign driver"}
          </button>
        </div>
      </div>
    </div>
  );
}