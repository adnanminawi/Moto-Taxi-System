"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getCustomers } from "@/services/admin";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

 useEffect(() => {
  async function fetchCustomers() {
    try {
      setCustomers(await getCustomers());
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Couldn't load customers.");
    } finally {
      setLoading(false);
    }
  }
  fetchCustomers();
}, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, query]);

   if (loading) return <p className="text-sm text-slate-500">Loading customers…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Customers</h1>
          <p className="text-sm text-gray-500">{customers.length} registered customers</p>
        </div>
        <label className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 focus-within:border-[#f4c542]">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full text-sm outline-none"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm">
        {visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">No customers found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf8] text-left text-[11px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-bold">Customer</th>
                <th className="px-5 py-3 font-bold">Phone</th>
                <th className="px-5 py-3 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#111] text-xs font-extrabold text-[#f4c542]">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-bold">{c.name}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{c.phone}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-bold hover:bg-gray-50"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}