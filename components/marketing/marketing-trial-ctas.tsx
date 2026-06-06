"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { captureEvent } from "@/components/analytics/posthog-provider";
import { primaryTrialCtaLabel } from "@/lib/marketing/trial-cta-copy";

const SIGN_UP_RETURN = "/sign-up?redirect_url=%2Fsubscribe";
const SIGN_IN_RETURN = "/sign-in?redirect_url=%2Fsubscribe";

type Props = {
  trialDays: number;
  initialSignedIn: boolean;
  variant?: "hero" | "pricing" | "success";
  className?: string;
};

export function MarketingTrialCTAs({
  trialDays,
  initialSignedIn,
  variant = "hero",
  className,
}: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const signedIn = isLoaded ? Boolean(isSignedIn) : initialSignedIn;

  const primarySignedOutLabel = primaryTrialCtaLabel(trialDays);
  const ctaSource =
    variant === "hero"
      ? "hero_cta"
      : variant === "pricing"
        ? "pricing_cta"
        : "demo_success_cta";

  if (signedIn) {
    const label =
      variant === "hero"
        ? "Start your free trial"
        : variant === "success"
          ? "Start your first lesson →"
          : primarySignedOutLabel;

    const href = variant === "success" ? "/lessons" : "/subscribe";
    const target = variant === "success" ? "lessons" : "subscribe";

    const primary = (
      <Link
        href={href}
        className="mkt-btn-primary"
        onClick={() =>
          captureEvent("subscribe_click", {
            source: ctaSource,
            target,
          })
        }
      >
        {label}
      </Link>
    );

    if (variant === "hero") {
      return <div className="mkt-hero-ctas">{primary}</div>;
    }

    return (
      <div className={`mkt-pricing-ctas ${className ?? ""}`.trim()}>{primary}</div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={`mkt-hero-ctas ${className ?? ""}`.trim()}>
        <Link
          href="/onboarding"
          className="mkt-btn-primary"
          onClick={() =>
            captureEvent("subscribe_click", {
              source: ctaSource,
              target: "onboarding",
            })
          }
        >
          Let&apos;s go!
        </Link>
        <Link
          href={SIGN_IN_RETURN}
          className="mkt-btn-ghost"
          onClick={() =>
            captureEvent("subscribe_click", {
              source: ctaSource,
              target: "sign_in",
            })
          }
        >
          Sign in
        </Link>
      </div>
    );
  }

  const primaryHref = variant === "success" ? "/onboarding" : SIGN_UP_RETURN;
  const primaryLabel =
    variant === "success" ? "Start your first lesson →" : primarySignedOutLabel;
  const primaryTarget = variant === "success" ? "onboarding" : "sign_up";

  return (
    <div className={`mkt-pricing-ctas ${className ?? ""}`.trim()}>
      <Link
        href={primaryHref}
        className="mkt-btn-primary"
        style={{ textAlign: "center" }}
        onClick={() =>
          captureEvent("subscribe_click", {
            source: ctaSource,
            target: primaryTarget,
          })
        }
      >
        {primaryLabel}
      </Link>
      {variant === "pricing" ? (
        <Link href={SIGN_IN_RETURN} className="mkt-pricing-link">
          Already have an account? Sign in
        </Link>
      ) : null}
    </div>
  );
}
