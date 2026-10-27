import type { RideInfo } from "@/types";

type RideStatus = RideInfo["status"];

export const RIDE_STATUS: Record<RideStatus, { label: string; badge: string }> = {
  searching: { label: "Searching", badge: "bg-amber-50 text-amber-800 border-amber-200" },
  assigned: { label: "Assigned", badge: "bg-[#fdf3cf] text-yellow-900 border-[#f4c542]/40" },
  en_route: { label: "En route", badge: "bg-sky-50 text-sky-800 border-sky-200" },
  completed: { label: "Completed", badge: "bg-green-50 text-green-800 border-green-200" },
  cancelled: { label: "Cancelled", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  no_driver_found: { label: "No driver", badge: "bg-gray-100 text-gray-600 border-gray-200" },
};

// rides an admin can still assign manually
export const ASSIGNABLE: RideStatus[] = ["searching", "no_driver_found"];
export const CANCELLABLE: RideStatus[] = ["searching", "assigned", "en_route"];