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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const da = { phone, password };
    try {
      await login(da);
      router.push("/driver");

    } catch (err) {
      setError("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-[#222] flex flex-col font-sans">
      <header className="h-[60px] flex items-center px-5 font-semibold text-lg bg-white border-b-[3px] border-[#f4c542]">
        Moto Taxi System
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-md bg-white border border-[#e3e3e3] rounded-[14px] p-8 shadow-sm">
          <h1 className="text-center text-3xl font-extrabold text-[#111] mb-8">
            <span className="text-[#f4c542]">Driver</span> Login
          </h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-[#e3e3e3] px-4 py-3 outline-none focus:border-[#f4c542]"/>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#e3e3e3] px-4 py-3 outline-none focus:border-[#f4c542]"/>
            {error && (
              <p className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}
            <button
              type="submit"
              className=" bg-[#f4c542] text-black font-semibold py-3 rounded-lg transition hover:bg-[#e6b93c]">
              Login
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-xl border border-[#f4c542] bg-[#fff8e1] p-4 text-sm">
          <p className="font-semibold">Demo accounts</p>
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
                className="flex-1 rounded-lg border border-gray-300 bg-white py-2 font-semibold hover:bg-gray-50 transition"
              >
                Driver {i + 1}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-500">
            To test two drivers, use two different browsers — a browser holds one login.
          </p>
        </div>

      </main>

    </div>
  );
}