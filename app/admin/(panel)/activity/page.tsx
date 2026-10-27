"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getActivity } from "@/services/admin";
import type { AdminLog } from "@/types";

// how each action is shown — add a line here when you log a new action
const ACTIONS: Record<string, { label: string; badge: string }> = {
  assign_ride: { label: "Assigned ride", badge: "bg-[#fdf3cf] text-yellow-900" },
  cancel_ride: { label: "Cancelled ride", badge: "bg-rose-50 text-rose-700" },
  force_offline: { label: "Set driver offline", badge: "bg-amber-50 text-amber-800" },
  create_driver: { label: "Created driver", badge: "bg-green-50 text-green-800" },
  update_driver: { label: "Edited driver", badge: "bg-gray-100 text-gray-700" },
  delete_driver: { label: "Deleted driver", badge: "bg-rose-50 text-rose-700" },
  update_customer: { label: "Edited customer", badge: "bg-gray-100 text-gray-700" },
};

type Filter = "all" | AdminLog["target_type"];
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ride", label: "Rides" },
  { value: "driver", label: "Drivers" },
  { value: "customer", label: "Customers" },
];

// where the target links to (rides have no detail page)
function targetLink(log: AdminLog): string | null {
  if (log.target_id === null) return null;
  if (log.target_type === "driver") return `/admin/drivers/${log.target_id}`;
  if (log.target_type === "customer") return `/admin/customers/${log.target_id}`;
  return null;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLogs(await getActivity());
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError("Couldn't load activity.");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? logs : logs.filter((l) => l.target_type === filter)),
    [logs, filter]
  );

  if (loading) return <p className="text-sm text-gray-500">Loading activity…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Activity log</h1>
        <p className="text-sm text-gray-500">Every admin action, newest first (last 200)</p>
      </div>

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

      <div className="overflow-x-auto rounded-3xl border border-gray-200/70 bg-white shadow-sm">
        {visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">No activity yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf8] text-left text-[11px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-bold">When</th>
                <th className="px-5 py-3 font-bold">Admin</th>
                <th className="px-5 py-3 font-bold">Action</th>
                <th className="px-5 py-3 font-bold">Target</th>
                <th className="px-5 py-3 font-bold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((log) => {
                const action = ACTIONS[log.action] ?? { label: log.action, badge: "bg-gray-100 text-gray-700" };
                const link = targetLink(log);
                const target = `${log.target_type} #${log.target_id ?? "—"}`;
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-bold">{log.admin_username ?? "Unknown"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${action.badge}`}>
                        {action.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 capitalize">
                      {link ? (
                        <Link href={link} className="font-semibold underline">
                          {target}
                        </Link>
                      ) : (
                        <span className="text-gray-600">{target}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{log.details ?? ""}</td>
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