"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createDriver } from "@/services/admin";

export default function CreateDriver() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name.trim(), phone: form.phone.trim(), password: form.password };

    if (!data.name || !data.phone || !data.password) {
      setError("All fields are required.");
      return;
    }
    if (!/^\d{8}$/.test(data.phone)) {
      setError("Phone must be 8 digits.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createDriver(data);
      router.push("/admin/drivers");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Couldn't create driver.");
      setSaving(false);
    }
  };

  const field =
    "mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[15px] font-semibold outline-none focus:border-[#f4c542]";
  const label = "text-[11px] font-bold uppercase tracking-wide text-gray-500";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link href="/admin/drivers" className="text-sm font-semibold text-gray-500 hover:text-[#111]">
          ← Back to drivers
        </Link>
        <h1 className="mt-2 text-[26px] font-extrabold tracking-tight">Add driver</h1>
        <p className="text-sm text-gray-500">The driver logs in with this phone and password.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200/70 bg-white shadow-sm">
        <div className="space-y-5 p-6">
          <div>
            <label htmlFor="name" className={label}>Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Karim Haddad" className={field} />
          </div>

          <div>
            <label htmlFor="phone" className={label}>Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={handleChange}
              placeholder="70123456"
              className={field}
            />
            <p className="mt-1 text-xs text-gray-400">8 digits, no spaces</p>
          </div>

          <div>
            <label htmlFor="password" className={label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              className={field}
            />
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 p-4">
          <Link
            href="/admin/drivers"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#111] px-5 py-2.5 text-sm font-bold text-white hover:bg-black/85 transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Creating…" : "Create driver"}
          </button>
        </div>
      </form>
    </div>
  );
}