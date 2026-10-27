"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/services/admin";
import { ADMIN_MENU, isActive, adminLogout } from "./Menu";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* brand on phones (the sidebar shows it on desktop) */}
        <span className="flex items-center gap-2 md:hidden">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f4c542]">🏍️</span>
          <span className="text-base font-extrabold">MotoTaxi</span>
          <span className="text-[10px] font-bold text-gray-400">ADMIN</span>
        </span>
        <span className="hidden text-sm text-gray-500 md:block">Welcome back, Admin 👋</span>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111] text-sm font-extrabold text-[#f4c542]">
            A
          </div>
          <button
            onClick={() => adminLogout(logout)}
            aria-label="Logout"
            className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 cursor-pointer md:hidden"
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
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              isActive(pathname, item.href)
                ? "bg-[#f4c542] text-[#111]"
                : "border border-gray-200 bg-white text-gray-600"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}