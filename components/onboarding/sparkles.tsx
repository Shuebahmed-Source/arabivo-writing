"use client";

type SparkleBit = { x: number; y: number; d: number };

const BITS: SparkleBit[] = [
  { x: -60, y: -10, d: 0 },
  { x: 60, y: -20, d: 0.05 },
  { x: -40, y: -60, d: 0.1 },
  { x: 44, y: -54, d: 0.15 },
  { x: 0, y: -80, d: 0.08 },
  { x: -75, y: -45, d: 0.12 },
  { x: 78, y: -40, d: 0.18 },
];

type Props = {
  show: boolean;
};

export function OnboardingSparkles({ show }: Props) {
  if (!show) return null;
  return (
    <div className="onb-sparkles" aria-hidden>
      {BITS.map((b, i) => (
        <span
          key={i}
          style={
            {
              ["--tx" as string]: `${b.x}px`,
              ["--ty" as string]: `${b.y}px`,
              animationDelay: `${b.d}s`,
            } as React.CSSProperties
          }
        >
          ✦
        </span>
      ))}
    </div>
  );
}
