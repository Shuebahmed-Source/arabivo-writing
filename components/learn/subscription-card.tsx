"use client";

import { useState } from "react";

import { isPaidSubscriptionStatus } from "@/lib/subscriptions/status";
import type { UserSubscriptionRow } from "@/lib/subscriptions/types";

type Props = {
  stripeConfigured: boolean;
  subscription: UserSubscriptionRow | null;
};

export function LearnSubscriptionCard({
  stripeConfigured,
  subscription,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!stripeConfigured) {
    return null;
  }

  const paid = isPaidSubscriptionStatus(subscription?.status);
  if (!paid) {
    return null;
  }

  async function openPortal() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open billing portal");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not open billing portal");
    } finally {
      setPending(false);
    }
  }

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;
  const periodLabel =
    periodEnd && !Number.isNaN(periodEnd.getTime())
      ? new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
        }).format(periodEnd)
      : null;

  return (
    <section className="learn-billing-card" aria-labelledby="learn-billing-heading">
      <h2 id="learn-billing-heading" className="learn-billing-title">
        Billing
      </h2>
      <p className="learn-billing-sub">
        Payment methods and invoices live in the Stripe customer portal.
      </p>

      <div className="learn-billing-row">
        <div className="text-sm">
          <span className="font-medium capitalize">
            {subscription?.status.replace(/_/g, " ")}
          </span>
          {periodLabel ? (
            <span className="text-[var(--learn-muted)]">
              {" "}
              · Renews {periodLabel}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="learn-billing-btn"
          disabled={pending}
          onClick={() => void openPortal()}
        >
          {pending ? "Opening…" : "Manage billing"}
        </button>
      </div>

      {error ? (
        <p className="learn-billing-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
