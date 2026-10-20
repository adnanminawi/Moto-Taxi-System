"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/services/admin";
import { ADMIN_MENU, isActive, adminLogout } from "./Menu";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 min-h-screen bg-slate-950 border-r border-slate-800 flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">🚖 Moto Admin</h1>
        <p className="text-sm text-slate-400 mt-1">Control Center</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={20} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          onClick={() => adminLogout(logout)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}