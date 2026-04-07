"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  trialDays: number;
  priceFormatted: string | null;
  priceInterval: string | null;
  productName: string | null;
};

const FEATURES = [
  "Full access to every handwriting lesson and unit",
  "Guided tracing canvas with clear feedback",
  "Progress saved to your account",
  "Cancel anytime from billing settings",
];

export function SubscribeBridge({
  trialDays,
  priceFormatted,
  priceInterval,
  productName,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTrial = trialDays > 0;
  const intervalLabel =
    priceInterval === "month"
      ? "month"
      : priceInterval === "year"
        ? "year"
        : priceInterval ?? "period";

  async function startCheckout() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Try again shortly.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-10 sm:py-14">
      <header className="text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Start learning today
        </h1>
        <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
          Guided Arabic handwriting practice—letters, connections, and words—with
          feedback on every trace.
        </p>
      </header>

      <Card className="border-primary/25 bg-primary/5 shadow-sm ring-1 ring-primary/10">
        {hasTrial ? (
          <div className="flex justify-center border-b border-primary/15 px-4 py-3">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
              {trialDays}-day free trial
            </span>
          </div>
        ) : null}
        <CardHeader className="gap-2">
          <CardTitle className="text-xl sm:text-2xl">
            {productName ?? "ArabivoWrite"}
          </CardTitle>
          <CardDescription className="text-base text-foreground/90">
            {priceFormatted ? (
              <>
                <span className="font-heading text-3xl font-semibold text-foreground">
                  {priceFormatted}
                </span>
                {priceInterval ? (
                  <span className="text-muted-foreground">
                    {" "}
                    / {intervalLabel}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-muted-foreground">
                Price shown at checkout
              </span>
            )}
          </CardDescription>
          {hasTrial && priceFormatted ? (
            <p className="text-sm text-muted-foreground">
              Start with {trialDays} days free, then {priceFormatted}
              {priceInterval ? ` / ${intervalLabel}` : ""}.
            </p>
          ) : null}
        </CardHeader>
        <div className="border-t border-border/60 px-6 pb-6">
          <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground">
            {FEATURES.map((line) => (
              <li key={line} className="flex gap-2">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <Button
              type="button"
              size="lg"
              className="min-h-12 w-full"
              disabled={pending}
              onClick={() => void startCheckout()}
            >
              {pending
                ? "Redirecting…"
                : hasTrial
                  ? `Start ${trialDays}-day free trial`
                  : "Continue to secure checkout"}
            </Button>
            {hasTrial ? (
              <p className="text-center text-xs text-muted-foreground">
                No charge during the trial. After that, billing continues unless
                you cancel.
              </p>
            ) : null}
            {error ? (
              <p className="text-center text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/" className="text-primary underline-offset-4 hover:underline">
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
