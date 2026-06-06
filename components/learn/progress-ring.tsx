"use client";

import { useEffect, useState } from "react";

const CIRCUMFERENCE = 2 * Math.PI * 20;

type Props = {
  pct: number;
  accent?: boolean;
  delayMs?: number;
  label?: string;
};

export function LearnProgressRing({
  pct,
  accent = false,
  delayMs = 0,
  label,
}: Props) {
  const [animated, setAnimated] = useState(false);
  const color = accent ? "var(--learn-amber)" : "var(--learn-brand)";
  const finalOffset = CIRCUMFERENCE * (1 - pct / 100);
  const offset = animated ? finalOffset : CIRCUMFERENCE;

  useEffect(() => {
    const id = window.setTimeout(() => setAnimated(true), 300 + delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs, pct]);

  return (
    <div
      className="learn-progress-ring"
      role="img"
      aria-label={label ?? `${pct}% complete`}
    >
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
        <circle
          fill="none"
          stroke="var(--learn-line)"
          strokeWidth="3.5"
          cx="26"
          cy="26"
          r="20"
        />
        <circle
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          cx="26"
          cy="26"
          r="20"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: "rotate(-90deg)",
            transition: "stroke-dashoffset 0.75s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="learn-progress-ring-label" style={{ color }}>
        {pct}%
      </div>
    </div>
  );
}
