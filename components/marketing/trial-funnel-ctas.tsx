"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { captureEvent } from "@/components/analytics/posthog-provider";
import { Button } from "@/components/ui/button";
import { MARKETING_ACCESS_CTA } from "@/lib/marketing/paywall-copy";
import { cn } from "@/lib/utils";

const SIGN_UP_RETURN = "/sign-up?redirect_url=%2Fsubscribe";
const SIGN_IN_RETURN = "/sign-in?redirect_url=%2Fsubscribe";

type Props = {
  /** From server `auth()` — correct first paint, avoids Clerk `isLoaded` flicker. */
  initialSignedIn: boolean;
  variant?: "hero" | "pricing";
};

export function TrialFunnelCTAs({
  initialSignedIn,
  variant = "hero",
}: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const signedIn = isLoaded ? Boolean(isSignedIn) : initialSignedIn;

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
          {MARKETING_ACCESS_CTA}
        </Button>
      </div>
    );
  }

  const primaryHref = variant === "hero" ? "/onboarding" : SIGN_UP_RETURN;
  const primaryLabel = variant === "hero" ? "Let's go!" : MARKETING_ACCESS_CTA;
  const primaryTarget = variant === "hero" ? "onboarding" : "sign_up";

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
            href={primaryHref}
            onClick={() =>
              captureEvent("subscribe_click", {
                source: ctaSource,
                target: primaryTarget,
              })
            }
          />
        }
        className="min-h-12 w-full px-6 sm:w-auto"
      >
        {primaryLabel}
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
