"use client";

import {
  GOAL_TO,
  LEVEL_FROM,
  TIME_LABEL,
} from "@/lib/onboarding/steps";
import type { OnboardingAnswers } from "@/lib/onboarding/types";

type Props = {
  answers: OnboardingAnswers;
  onContinue: () => void;
};

const PROJ_POINTS = [
  [8, 78],
  [24, 70],
  [38, 60],
  [52, 56],
  [66, 42],
  [80, 30],
  [94, 16],
] as const;

export function OnboardingProjectionStep({ answers, onContinue }: Props) {
  const from = LEVEL_FROM[answers.level ?? 0];
  const to = GOAL_TO[answers.goal ?? 1];
  const time = TIME_LABEL[answers.time ?? 1];
  const d = PROJ_POINTS.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");

  return (
    <>
      <div className="onb-step onb-projection-step">
        <h1 className="onb-q-title" style={{ marginTop: 24 }}>
          Here&apos;s your year with ArabivoWrite ✨
        </h1>
        <p className="onb-q-sub onb-projection-sub">
          You&apos;ll go from <b className="onb-emerald">{from}</b> to{" "}
          <b className="onb-amber">{to}</b> with just{" "}
          <b className="onb-emerald">{time}/day</b>.
        </p>

        <div className="onb-proj-card">
          <div className="onb-proj-plot">
            <svg viewBox="0 0 100 90" width="100%" height="200" preserveAspectRatio="none">
              {[20, 38, 56, 74].map((y) => (
                <line
                  key={y}
                  x1="6"
                  y1={y}
                  x2="96"
                  y2={y}
                  stroke="var(--onb-line)"
                  strokeWidth="0.6"
                />
              ))}
              <path
                d={d}
                fill="none"
                stroke="var(--onb-brand)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span
              className="onb-proj-dot onb-start"
              style={{ left: "8%", top: `${(78 / 90) * 100}%` }}
            />
            <span
              className="onb-proj-dot onb-end"
              style={{ left: "94%", top: `${(16 / 90) * 100}%` }}
            />
          </div>
          <div className="onb-axis">
            <span>Today</span>
            <span>Month 6</span>
            <span>Month 12</span>
          </div>
          <div className="onb-proj-title">Your handwriting, projected</div>
        </div>

        <div className="onb-stat-pill">
          Your plan targets <b>{time}/day</b> — small daily reps build real muscle
          memory.
        </div>
      </div>

      <div className="onb-cta-dock">
        <button type="button" className="onb-btn" onClick={onContinue}>
          Create my free account
        </button>
      </div>
    </>
  );
}
