"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

type RideChartProps = {
  completed: number;
  searching: number;
  cancelled: number;
};

// green / yellow / red — same status colors as the rest of the app
const COLORS = ["#16a34a", "#f4c542", "#e11d48"];

export default function RideChart({ completed, searching, cancelled }: RideChartProps) {
  const data = [
    { name: "Completed", value: completed },
    { name: "Searching", value: searching },
    { name: "Cancelled", value: cancelled },
  ];

  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-[15px] font-extrabold">Ride status</h2>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={70} outerRadius={120} paddingAngle={2} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}