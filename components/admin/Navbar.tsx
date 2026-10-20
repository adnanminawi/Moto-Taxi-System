"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/services/admin";
import { ADMIN_MENU, isActive, adminLogout } from "./Menu";

export default function Navbar() {  
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* brand on phones (the sidebar shows it on desktop) */}
        <span className="text-lg font-extrabold md:hidden">🚖 Moto Admin</span>
        <span className="hidden text-sm text-slate-500 md:block">Welcome back, Admin 👋</span>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            A
          </div>
          <button
            onClick={() => adminLogout(logout)}
            aria-label="Logout"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* menu on phones only — swipe sideways if it doesn't fit */}
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {ADMIN_MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
              isActive(pathname, item.href) ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}