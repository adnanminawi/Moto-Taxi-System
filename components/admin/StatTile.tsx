import type { ReactNode } from "react";

export type Tone = "blue" | "green" | "amber" | "red" | "slate";

const TONES: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONES[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}