import type { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}