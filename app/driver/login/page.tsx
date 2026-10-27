"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/driver";
import { DEMO } from "@/lib/demo";

export default function DriverLogin() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await login({ phone, password });
      router.push("/driver");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Something went wrong, please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#eef0ea] text-[#111] font-sans flex flex-col items-center justify-center px-5 py-10">
      {/* logo */}
      <div className="mb-6 flex items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-[15px] font-extrabold shadow-md">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f4c542]">🏍️</span>
        MotoTaxi
      </div>

      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.10)]">
        <h1 className="text-[26px] font-extrabold tracking-tight">Driver login</h1>
        <p className="mb-6 text-sm text-gray-500">Log in to start getting rides.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <label className="block rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-[#f4c542]">
            <span className="text-[11px] font-medium text-gray-500">Phone</span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03 123 456"
              className="block w-full text-[15px] font-semibold outline-none"
            />
          </label>

          <label className="block rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-[#f4c542]">
            <span className="text-[11px] font-medium text-gray-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full text-[15px] font-semibold outline-none"
            />
          </label>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !phone || !password}
            className="mt-1 h-14 rounded-2xl bg-[#f4c542] text-base font-extrabold cursor-pointer transition hover:bg-[#e6b93c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>

      {/* demo accounts */}
      <div className="mt-5 w-full max-w-md rounded-3xl border border-[#f4c542] bg-[#fff8e1] p-5 text-sm">
        <p className="font-bold">Demo accounts</p>
        <p className="mt-1 text-gray-600">
          Password for both: <code className="rounded bg-white px-1.5 py-0.5">{DEMO.driverPassword}</code>
        </p>

        <div className="mt-3 flex gap-2">
          {DEMO.drivers.map((demoPhone, i) => (
            <button
              key={demoPhone}
              type="button"
              onClick={() => {
                setPhone(demoPhone);
                setPassword(DEMO.driverPassword);
              }}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-2 font-semibold cursor-pointer hover:bg-gray-50 transition"
            >
              Driver {i + 1}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          To test two drivers, use two different browsers. A browser holds one login.
        </p>
      </div>
    </div>
  );
}