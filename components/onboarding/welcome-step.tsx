import Link from "next/link";

/** Server-rendered welcome — no client JS required to start onboarding. */
export function OnboardingWelcomeStep() {
  return (
    <div className="onb-center-step">
      <div className="onb-wordmark" style={{ fontSize: 26, marginBottom: 14 }}>
        Arabivo<b>Write</b>
      </div>
      <h1 className="onb-welcome-title">
        👋 Let&apos;s teach your hand to{" "}
        <span className="onb-emerald">write Arabic.</span>
      </h1>
      <p className="onb-welcome-sub">
        Calm, guided tracing that builds real muscle memory — one beautiful letter at
        a time.
      </p>
      <div className="onb-center-cta">
        <Link href="/onboarding?step=q0" className="onb-btn onb-btn-link">
          Let&apos;s go!
        </Link>
      </div>
      <Link href="/sign-in" className="onb-link-quiet">
        Already have an account?
      </Link>
    </div>
  );
}
