"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/admin";
import { DEMO } from "@/lib/demo";

export default function AdminLogin() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = { username, password };
    try {
      await login(data);
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#eef0ea] text-[#111] font-sans flex flex-col items-center justify-center px-5 py-10">
      {/* logo */}
      <div className="mb-6 flex items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-[15px] font-extrabold shadow-md">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f4c542]">🏍️</span>
        MotoTaxi
        <span className="text-[11px] font-bold text-gray-400">ADMIN</span>
      </div>

      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.10)]">
        <h1 className="text-[26px] font-extrabold tracking-tight">Admin login</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to manage rides, drivers and customers.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <label className="block rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-[#f4c542]">
            <span className="text-[11px] font-medium text-gray-500">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
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
              autoComplete="current-password"
              className="block w-full text-[15px] font-semibold outline-none"
            />
          </label>
          {/* demo account */}
          <div className="mt-5 w-full max-w-md rounded-3xl border border-[#f4c542] bg-[#fff8e1] p-5 text-sm">
            <p className="font-bold">Demo account</p>
            <p className="mt-1 text-gray-600">
              Username: <code className="rounded bg-white px-1.5 py-0.5">{DEMO.adminUsername}</code>
              <span className="mx-2 text-gray-300">·</span>
              Password: <code className="rounded bg-white px-1.5 py-0.5">{DEMO.adminPassword}</code>
            </p>
            <button
              type="button"
              onClick={() => {
                setUsername(DEMO.adminUsername);
                setPassword(DEMO.adminPassword);
              }}
              className="mt-3 w-full rounded-xl border border-gray-200 bg-white py-2 font-semibold cursor-pointer hover:bg-gray-50 transition"
            >
              Fill demo login
            </button>
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="mt-1 h-14 rounded-2xl bg-[#111] text-base font-extrabold text-white cursor-pointer transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}