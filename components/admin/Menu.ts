import { LayoutDashboard, Users, CarTaxiFront, UserCircle, BarChart3, MapPin } from "lucide-react";

export const ADMIN_MENU = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { title: "Live map", icon: MapPin, href: "/admin/live" },
  { title: "Drivers", icon: UserCircle, href: "/admin/drivers" },
  { title: "Customers", icon: Users, href: "/admin/customers" },
  { title: "Rides", icon: CarTaxiFront, href: "/admin/rides" },
  { title: "Statistics", icon: BarChart3, href: "/admin/statistics" },
];

// "/admin" must match exactly; the others also match their sub-pages (e.g. /admin/drivers/7)
export function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export async function adminLogout(logout: () => Promise<unknown>) {
  try {
    await logout();
  } finally {
    window.location.href = "/admin/login";
  }
}