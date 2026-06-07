"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { captureEvent } from "@/components/analytics/posthog-provider";
import {
  LIFETIME_BADGE,
  LIFETIME_COMPARE_PRICE,
  LIFETIME_CTA,
  LIFETIME_FEATURES,
  LIFETIME_HEADLINE,
  LIFETIME_SAVINGS_LABEL,
  MONTHLY_CTA,
  MONTHLY_FEATURES,
  MONTHLY_INTERVAL_LABEL,
  MONTHLY_PLAN_LABEL,
  MONTHLY_PRICE_LABEL,
  PAYWALL_HEADLINE,
  PAYWALL_SUBHEAD,
} from "@/lib/marketing/paywall-copy";
import type { CheckoutPlan } from "@/lib/stripe/plans";

const SIGN_UP_RETURN = "/sign-up?redirect_url=%2Fsubscribe";

type Props = {
  variant: "subscribe" | "landing";
  initialSignedIn: boolean;
};

export function PaywallOptions({ variant, initialSignedIn }: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const signedIn = isLoaded ? Boolean(isSignedIn) : initialSignedIn;
  const [pendingPlan, setPendingPlan] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lifetimePending = pendingPlan === "lifetime";
  const monthlyPending = pendingPlan === "monthly";
  const checkoutDisabled = lifetimePending || monthlyPending;

  async function startCheckout(plan: CheckoutPlan) {
    setError(null);
    setPendingPlan(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Try again shortly.");
        return;
      }
      captureEvent("checkout_started", { plan });
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout.");
    } finally {
      setPendingPlan(null);
    }
  }

  function trackPlanClick(plan: CheckoutPlan, target: "sign_up" | "checkout") {
    const isLifetime = plan === "lifetime";
    captureEvent("subscribe_click", {
      source:
        variant === "landing"
          ? isLifetime
            ? "pricing_cta"
            : "pricing_monthly"
          : isLifetime
            ? "subscribe_cta"
            : "subscribe_monthly",
      target,
      plan,
    });
  }

  function handlePlanClick(plan: CheckoutPlan) {
    if (!signedIn) {
      trackPlanClick(plan, "sign_up");
      return;
    }
    trackPlanClick(plan, "checkout");
    void startCheckout(plan);
  }

  function PlanButton({
    plan,
    className,
    children,
  }: {
    plan: CheckoutPlan;
    className: string;
    children: ReactNode;
  }) {
    const pending = plan === "lifetime" ? lifetimePending : monthlyPending;
    const label = pending ? "Redirecting…" : children;

    if (!signedIn) {
      return (
        <Link href={SIGN_UP_RETURN} className={className} onClick={() => handlePlanClick(plan)}>
          {label}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={className}
        disabled={checkoutDisabled}
        onClick={() => handlePlanClick(plan)}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      className={
        variant === "subscribe"
          ? "mkt-paywall mkt-paywall-subscribe"
          : "mkt-paywall"
      }
    >
      {variant === "subscribe" ? (
        <header className="mkt-paywall-header">
          <h1 className="mkt-paywall-title">{PAYWALL_HEADLINE}</h1>
          <p className="mkt-paywall-sub">{PAYWALL_SUBHEAD}</p>
        </header>
      ) : null}

      <div className="mkt-paywall-grid">
        {/* Monthly — left, smaller */}
        <article className="mkt-paywall-card mkt-paywall-card-monthly">
          <p className="mkt-paywall-plan-label">{MONTHLY_PLAN_LABEL}</p>
          <div className="mkt-paywall-price-row">
            <span className="mkt-paywall-price">{MONTHLY_PRICE_LABEL}</span>
            <span className="mkt-paywall-interval">/{MONTHLY_INTERVAL_LABEL}</span>
          </div>
          <ul className="mkt-pricing-list mkt-paywall-feature-list">
            {MONTHLY_FEATURES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <PlanButton plan="monthly" className="mkt-paywall-btn mkt-paywall-btn-secondary">
            {MONTHLY_CTA}
          </PlanButton>
        </article>

        {/* Lifetime — right, hero */}
        <article className="mkt-paywall-card mkt-paywall-card-lifetime">
          <span className="mkt-paywall-hero-tab">{LIFETIME_BADGE}</span>
          <p className="mkt-paywall-plan-label mkt-paywall-plan-label-hero">
            {LIFETIME_HEADLINE}
          </p>
          <div className="mkt-paywall-price-row mkt-paywall-price-row-hero">
            <span className="mkt-paywall-price mkt-paywall-price-hero">£54</span>
            <span className="mkt-paywall-compare">{LIFETIME_COMPARE_PRICE}</span>
            <span className="mkt-paywall-savings">{LIFETIME_SAVINGS_LABEL}</span>
          </div>
          <p className="mkt-paywall-once">One payment · keep forever</p>
          <ul className="mkt-pricing-list mkt-paywall-feature-list">
            {LIFETIME_FEATURES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <PlanButton plan="lifetime" className="mkt-paywall-btn mkt-paywall-btn-primary">
            {LIFETIME_CTA}
          </PlanButton>
        </article>
      </div>

      {error ? (
        <p className="mkt-paywall-error" role="alert">
          {error}
        </p>
      ) : null}

      {variant === "subscribe" ? (
        <p className="mkt-paywall-footer-link">
          <Link href="/">Back to home</Link>
        </p>
      ) : (
        <p className="mkt-paywall-footer-link">
          <Link href="/sign-in?redirect_url=%2Fsubscribe">
            Already have an account? Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
