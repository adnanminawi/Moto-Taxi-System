"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/admin";

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
    const data = {username, password};
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">
        <h1 className="mb-2 text-3xl font-bold text-center text-gray-800">
          Admin Login
        </h1>

        <p className="mb-6 text-center text-gray-500">
          Sign in to access the Admin Dashboard
        </p>

        {error && (
          <div className="p-3 mb-4 text-red-600 bg-red-100 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-white transition bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}