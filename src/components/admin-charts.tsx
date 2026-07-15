"use client";

import type { ReactNode } from "react";

export type Bar = { label: string; value: number; hint?: string };
export type Segment = { label: string; value: number; color: string };

export function BarChart({
  data,
  format = (v) => v.toLocaleString(),
  accent = "#2dff88",
}: {
  data: Bar[];
  format?: (v: number) => string;
  accent?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-sm">
            <span className="text-muted">{d.label}</span>
            <span className="font-medium">{format(d.value)}</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: accent,
                boxShadow: `0 0 12px ${accent}66`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ data }: { data: Segment[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 52;
  const circ = 2 * Math.PI * radius;

  const segs = data.reduce<
    { d: Segment; len: number; offset: number }[]
  >((arr, d, i) => {
    const len = (d.value / total) * circ;
    const prev = arr[i - 1];
    const offset = prev ? prev.offset + prev.len : 0;
    arr.push({ d, len, offset });
    return arr;
  }, []);

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#131a23" strokeWidth="16" />
        {segs.map((s) => (
          <circle
            key={s.d.label}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={s.d.color}
            strokeWidth="16"
            strokeDasharray={`${s.len} ${circ - s.len}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-muted">{d.label}</span>
            <span className="ml-auto font-medium">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  delta,
  tone = "neon",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: "neon" | "electric" | "magenta";
}) {
  const ring =
    tone === "electric"
      ? "electric-border"
      : tone === "magenta"
        ? "border-magenta/50"
        : "neon-border";
  const tint =
    tone === "electric"
      ? "text-electric"
      : tone === "magenta"
        ? "text-magenta"
        : "neon-text";
  return (
    <div className={`glass rounded-2xl p-5 ${ring}`}>
      <div className="flex items-center justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${ring}`}>
          <span className={tint}>{icon}</span>
        </span>
        {delta && (
          <span className="rounded-full bg-neon/10 px-2 py-0.5 text-xs neon-text">
            {delta}
          </span>
        )}
      </div>
      <div className="mt-4 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
