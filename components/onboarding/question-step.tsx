"use client";

import type { OnboardingQuestionStep } from "@/lib/onboarding/steps";

type Props = {
  step: OnboardingQuestionStep;
  value: number | undefined;
  onPick: (index: number) => void;
  onContinue: () => void;
};

export function OnboardingQuestionStepView({
  step,
  value,
  onPick,
  onContinue,
}: Props) {
  return (
    <>
      <div className="onb-step">
        <h1 className="onb-q-title">{step.title}</h1>
        {step.sub ? <p className="onb-q-sub">{step.sub}</p> : null}
        <div className="onb-options">
          {step.options.map((o, i) => (
            <button
              key={o.label}
              type="button"
              className="onb-opt"
              data-selected={value === i ? "true" : "false"}
              onClick={() => onPick(i)}
            >
              <span className="onb-emoji" aria-hidden>
                {o.emoji}
              </span>
              <span className="onb-label">{o.label}</span>
              <span className="onb-check" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="onb-cta-dock">
        <button
          type="button"
          className="onb-btn"
          disabled={value === undefined}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </>
  );
}
