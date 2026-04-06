"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { isPaidSubscriptionStatus } from "@/lib/subscriptions/status";
import type { UserSubscriptionRow } from "@/lib/subscriptions/types";

type Props = {
  stripeConfigured: boolean;
  subscription: UserSubscriptionRow | null;
};

export function SubscriptionCard({ stripeConfigured, subscription }: Props) {
  const [pending, setPending] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!stripeConfigured) {
    return null;
  }

  const paid = isPaidSubscriptionStatus(subscription?.status);

  async function openCheckout() {
    setError(null);
    setPending("checkout");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout");
    } finally {
      setPending(null);
    }
  }

  async function openPortal() {
    setError(null);
    setPending("portal");
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
      setPending(null);
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
    <section
      className="rounded-xl border border-border/80 bg-muted/30 p-5 sm:p-6"
      aria-labelledby="subscription-heading"
    >
      <h2
        id="subscription-heading"
        className="font-heading text-lg font-semibold tracking-tight text-foreground"
      >
        Subscription
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Support ArabivoWrite with a subscription. Manage payment methods and
        invoices in the Stripe customer portal.
      </p>

      {paid ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <span className="font-medium text-foreground capitalize">
              {subscription?.status.replace(/_/g, " ")}
            </span>
            {periodLabel ? (
              <span className="text-muted-foreground">
                {" "}
                · Renews {periodLabel}
              </span>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 shrink-0"
            disabled={pending !== null}
            onClick={() => void openPortal()}
          >
            {pending === "portal" ? "Opening…" : "Manage billing"}
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <Button
            type="button"
            className="min-h-11"
            disabled={pending !== null}
            onClick={() => void openCheckout()}
          >
            {pending === "checkout" ? "Redirecting…" : "Subscribe"}
          </Button>
        </div>
      )}

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
