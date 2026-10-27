"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/services/admin";
import { ADMIN_MENU, isActive, adminLogout } from "./Menu";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex sticky top-0 h-screen w-64 shrink-0 flex-col bg-white border-r border-gray-200">
      <div className="flex items-center gap-2.5 px-6 py-7">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f4c542] text-xl">🏍️</span>
        <span className="text-xl font-extrabold">MotoTaxi</span>
        <span className="text-[11px] font-bold text-gray-400">ADMIN</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1.5">
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition ${
                active ? "bg-[#f4c542] text-[#111]" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={21} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <button
          onClick={() => adminLogout(logout)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}