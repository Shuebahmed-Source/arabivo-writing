"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIGN_UP_RETURN = "/sign-up?redirect_url=%2Fsubscribe";
const SIGN_IN_RETURN = "/sign-in?redirect_url=%2Fsubscribe";

type Props = {
  /** From `STRIPE_TRIAL_PERIOD_DAYS` — drives primary label accuracy. */
  trialDays: number;
  /** `hero`: inline with optional “View pricing”. `pricing`: below plan copy. */
  variant?: "hero" | "pricing";
};

export function TrialFunnelCTAs({ trialDays, variant = "hero" }: Props) {
  const { isSignedIn, isLoaded } = useAuth();

  const primarySignedOutLabel =
    trialDays > 0
      ? `Start ${trialDays}-day free trial`
      : "Subscribe";

  if (isLoaded && isSignedIn) {
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
          render={<Link href="/subscribe" />}
          className="min-h-12 w-full px-6 sm:w-auto"
        >
          Continue to checkout
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
        render={<Link href={SIGN_UP_RETURN} />}
        className="min-h-12 w-full px-6 sm:w-auto"
      >
        {primarySignedOutLabel}
      </Button>
      <Button
        variant="outline"
        size="lg"
        nativeButton={false}
        render={<Link href={SIGN_IN_RETURN} />}
        className="min-h-12 w-full px-6 sm:w-auto"
      >
        Sign in
      </Button>
      {variant === "hero" ? (
        <Link
          href="/#pricing"
          className="text-center text-sm font-medium text-primary underline-offset-4 hover:underline sm:text-left"
        >
          View pricing
        </Link>
      ) : null}
    </div>
  );
}
