import type { RideInfo } from "@/types";

type RideStatus = RideInfo["status"];

export const RIDE_STATUS: Record<RideStatus, { label: string; badge: string }> = {
  searching: { label: "Searching", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  assigned: { label: "Assigned", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  en_route: { label: "En route", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  completed: { label: "Completed", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", badge: "bg-slate-100 text-slate-600 border-slate-200" },
  no_driver_found: { label: "No driver", badge: "bg-rose-50 text-rose-700 border-rose-200" },
};

// rides an admin can still assign manually
export const ASSIGNABLE: RideStatus[] = ["searching", "no_driver_found"];
export const CANCELLABLE: RideStatus[] = ["searching", "assigned", "en_route"];