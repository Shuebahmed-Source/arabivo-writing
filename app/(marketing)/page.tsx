import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { LandingChallengeSection } from "@/components/marketing/landing-challenge-section";
import {
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingPricing,
} from "@/components/marketing/landing-sections";
import { getHomepageDemoChallenge } from "@/lib/marketing/demo-challenge";
import { getStripeTrialPeriodDays } from "@/lib/stripe/server";

type PageProps = {
  searchParams: Promise<{ checkout?: string; subscription_error?: string }>;
};

export default async function LandingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const checkoutCanceled = params.checkout === "canceled";
  const checkoutFailed =
    params.checkout === "failed" || params.subscription_error === "1";
  const trialDays = getStripeTrialPeriodDays();
  const demo = getHomepageDemoChallenge();
  const { userId } = await auth();
  const initialSignedIn = Boolean(userId);

  return (
    <>
      {checkoutCanceled ? (
        <div className="mkt-banner">
          Checkout was canceled. You can try again from{" "}
          <Link href="/#pricing">Pricing</Link>.
        </div>
      ) : null}
      {checkoutFailed ? (
        <div className="mkt-banner" role="alert">
          Something went wrong starting checkout. Please wait a moment and try
          again from <Link href="/#pricing">Pricing</Link>.
        </div>
      ) : null}

      <LandingHero trialDays={trialDays} initialSignedIn={initialSignedIn} />

      <LandingChallengeSection
        demo={demo}
        trialDays={trialDays}
        initialSignedIn={initialSignedIn}
      />

      <LandingFeatures />

      <LandingPricing
        trialDays={trialDays}
        initialSignedIn={initialSignedIn}
      />

      <LandingFooter />
    </>
  );
}
