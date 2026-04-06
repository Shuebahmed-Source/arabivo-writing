"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const SIGN_UP_RETURN = "/sign-up?redirect_url=%2Fsubscribe";
const SIGN_IN_RETURN = "/sign-in?redirect_url=%2Fsubscribe";

export function LandingPricingCTAs() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return (
      <div className="mt-8">
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
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Button
        size="lg"
        nativeButton={false}
        render={<Link href={SIGN_UP_RETURN} />}
        className="min-h-12 w-full px-6 sm:w-auto"
      >
        Start free trial
      </Button>
      <Button
        variant="outline"
        size="lg"
        nativeButton={false}
        render={<Link href={SIGN_IN_RETURN} />}
        className="min-h-12 w-full px-6 sm:w-auto"
      >
        Subscribe
      </Button>
      <p className="w-full text-xs text-muted-foreground sm:mt-0 sm:w-auto sm:pl-2">
        New accounts: start with the trial button. Already have an account? Use
        Subscribe to sign in, then you will go to secure checkout.
      </p>
    </div>
  );
}
