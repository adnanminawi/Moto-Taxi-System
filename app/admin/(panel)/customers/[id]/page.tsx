"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { oneCustomer, updateCustomer } from "@/services/admin";
import type { Customer } from "@/types";

type Notice = { type: "success" | "error"; text: string } | null;

export default function CustomerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customerId = Number(id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

   useEffect(() => {
    async function fetchCustomer() {
      try {
        const profile = await oneCustomer(customerId);
        setCustomer(profile);
        setName(profile.name);
        setPhone(profile.phone);
      } catch (err) {
        console.error(err);
        setLoadError("Couldn't load this customer.");
      }
    }
    fetchCustomer();
  }, [customerId]);


  async function handleSave() {
    if (!name.trim() || !phone.trim()) {
      setNotice({ type: "error", text: "Name and phone are required." });
      return;
    }
    setSaving(true);
    try {
      await updateCustomer(customerId, { name: name.trim(), phone: phone.trim() });
      setCustomer((prev) => (prev ? { ...prev, name: name.trim(), phone: phone.trim() } : prev));
      setIsEditing(false);
      setNotice({ type: "success", text: "Customer updated." });
    } catch (err: any) {
      setNotice({ type: "error", text: err.response?.data?.message ?? "Couldn't update customer." });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!customer) return;
    setIsEditing(false);
    setName(customer.name);
    setPhone(customer.phone);
    setNotice(null);
  }

 if (loadError) return <p className="text-sm text-rose-600">{loadError}</p>;
  if (!customer) return <p className="text-sm text-slate-500">Loading customer…</p>;

  const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2";
  
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/admin/customers" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to customers
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 p-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
            {customer.name.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">Customer #{customer.id}</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setNotice(null);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Full name</label>
            {isEditing ? (
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
            ) : (
              <p className="mt-1 font-medium text-slate-900">{customer.name}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</label>
            {isEditing ? (
              <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
            ) : (
              <p className="mt-1 font-medium text-slate-900">{customer.phone}</p>
            )}
          </div>

          {notice && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}
            >
              {notice.text}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 border-t border-slate-100 p-4">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}