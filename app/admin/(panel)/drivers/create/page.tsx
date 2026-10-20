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
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/admin/drivers" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to drivers
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Add driver</h1>
        <p className="text-sm text-slate-500">The driver signs in with this phone and password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-slate-700">Full name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} className={field} />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone</label>
          <input
            id="phone"
            name="phone"
            inputMode="numeric"
            placeholder="70123456"
            value={form.phone}
            onChange={handleChange}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} className={field} />
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Link
            href="/admin/drivers"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create driver"}
          </button>
        </div>
      </form>
    </div>
  );
}