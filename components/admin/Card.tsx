import type { ReactNode } from "react";

type CardProps = { title: string; action?: ReactNode; children: ReactNode };

export default function Card({ title, action, children }: CardProps) {
  return (
    <section className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}