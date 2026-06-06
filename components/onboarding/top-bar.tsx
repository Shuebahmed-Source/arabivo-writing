"use client";

type Props = {
  progress: number;
  onBack: () => void;
  hideBack?: boolean;
};

export function OnboardingTopBar({ progress, onBack, hideBack }: Props) {
  return (
    <div className="onb-topbar">
      <button
        type="button"
        className="onb-backbtn"
        data-hidden={hideBack ? "true" : "false"}
        onClick={onBack}
        aria-label="Back"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 5l-7 7 7 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className="onb-progress"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
