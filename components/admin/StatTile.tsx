import type { ReactNode } from "react";

export type Tone = "yellow" | "green" | "amber" | "red" | "slate";

const TONES: Record<Tone, string> = {
  yellow: "bg-[#fdf3cf] text-[#111]",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-rose-100 text-rose-600",
  slate: "bg-gray-100 text-gray-700",
};

type StatTileProps = {
  label: string;
  value: number | string;
  hint?: string;
  icon: ReactNode;
  tone: Tone;
};

export default function StatTile({ label, value, hint, icon, tone }: StatTileProps) {
  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-semibold text-gray-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONES[tone]}`}>{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}