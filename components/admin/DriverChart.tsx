"use client";

import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ResponsiveContainer, Cell } from "recharts";

type DriverChartProps = {
  online: number;
  busy: number;
  offline: number;
};

// green / yellow / grey — same status colors as the rest of the app
const COLORS = ["#16a34a", "#f4c542", "#d4d4cf"];

export default function DriverChart({ online, busy, offline }: DriverChartProps) {
  const data = [
    { status: "Online", value: online },
    { status: "Busy", value: busy },
    { status: "Offline", value: offline },
  ];

  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-[15px] font-extrabold">Driver status</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}