"use client";
import { useEffect, useState } from "react";
import { getDrivers, deleteDriver } from "@/services/admin";
import Link from "next/link";
import { Driver } from "@/types";


export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await getDrivers();
        setDrivers(data);
      } catch (err) {
        console.log("Error fetching drivers:", err);
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const getStatusColor = (status: Driver["status"]) => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "busy":
        return "text-amber-500";
      case "offline":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  async function handleDelete(id: number) {
    if (!confirm("Delete this driver? Their past rides are kept but unlinked.")) return;
    try {
      await deleteDriver(id);
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to delete driver");
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>

        <Link
          href="/admin/drivers/create"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          + Add Driver
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading drivers...</p>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 text-gray-800 font-semibold">Name</th>
                <th className="p-3 text-gray-800 font-semibold">Phone</th>
                <th className="p-3 text-gray-800 font-semibold">Status</th>
                <th className="p-3 text-gray-800 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {(drivers || []).map((driver) => (
                <tr key={driver.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 text-gray-700">{driver.name}</td>
                  <td className="p-3 text-gray-700">{driver.phone}</td>
                  <td className={`p-3 font-semibold ${getStatusColor(driver.status)}`}>
                    {driver.status}
                  </td>
                  <td className="p-3 flex gap-2">
                    <Link
                      href={`/admin/drivers/${driver.id}`}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}