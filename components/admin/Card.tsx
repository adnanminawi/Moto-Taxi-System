import type { ReactNode } from "react";

type CardProps = { title: string; action?: ReactNode; children: ReactNode };

export default function Card({ title, action, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}