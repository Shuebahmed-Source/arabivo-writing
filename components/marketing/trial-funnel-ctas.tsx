"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { captureEvent } from "@/components/analytics/posthog-provider";
import { Button } from "@/components/ui/button";
import { primaryTrialCtaLabel } from "@/lib/marketing/trial-cta-copy";
import { cn } from "@/lib/utils";

const SIGN_UP_RETURN = "/sign-up?redirect_url=%2Fsubscribe";
const SIGN_IN_RETURN = "/sign-in?redirect_url=%2Fsubscribe";

type Props = {
  trialDays: number;
  /** From server `auth()` — correct first paint, avoids Clerk `isLoaded` flicker. */
  initialSignedIn: boolean;
  variant?: "hero" | "pricing";
};

export function TrialFunnelCTAs({
  trialDays,
  initialSignedIn,
  variant = "hero",
}: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const signedIn = isLoaded ? Boolean(isSignedIn) : initialSignedIn;

  const primarySignedOutLabel = primaryTrialCtaLabel(trialDays);

  const ctaSource = variant === "hero" ? "hero_cta" : "pricing_cta";

  if (signedIn) {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
          variant === "pricing" && "mt-8",
        )}
      >
        <Button
          size="lg"
          nativeButton={false}
          render={
            <Link
              href="/subscribe"
              onClick={() =>
                captureEvent("subscribe_click", {
                  source: ctaSource,
                  target: "subscribe",
                })
              }
            />
          }
          className="min-h-12 w-full px-6 sm:w-auto"
        >
          Start your free trial
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        variant === "pricing" && "mt-8",
      )}
    >
      <Button
        size="lg"
        nativeButton={false}
        render={
          <Link
            href={SIGN_UP_RETURN}
            onClick={() =>
              captureEvent("subscribe_click", {
                source: ctaSource,
                target: "sign_up",
              })
            }
          />
        }
        className="min-h-12 w-full px-6 sm:w-auto"
      >
        {primarySignedOutLabel}
      </Button>
      <Button
        variant="outline"
        size="lg"
        nativeButton={false}
        render={
          <Link
            href={SIGN_IN_RETURN}
            onClick={() =>
              captureEvent("subscribe_click", {
                source: ctaSource,
                target: "sign_in",
              })
            }
          />
        }
        className="min-h-12 w-full px-6 sm:w-auto"
      >
        Sign in
      </Button>
    </div>
  );
}
