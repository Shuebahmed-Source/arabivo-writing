import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { LandingChallengeSection } from "@/components/marketing/landing-challenge-section";
import {
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingPricing,
} from "@/components/marketing/landing-sections";
import { getDailyChallengeStreakForCurrentUser } from "@/lib/daily-challenge/queries";
import { getDailyChallenge } from "@/lib/marketing/demo-challenge";

type PageProps = {
  searchParams: Promise<{ checkout?: string; subscription_error?: string }>;
};

export default async function LandingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const checkoutCanceled = params.checkout === "canceled";
  const checkoutFailed =
    params.checkout === "failed" || params.subscription_error === "1";
  const challenge = getDailyChallenge();
  const { userId } = await auth();
  const initialSignedIn = Boolean(userId);
  const streak = initialSignedIn
    ? await getDailyChallengeStreakForCurrentUser()
    : null;

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

      <LandingHero initialSignedIn={initialSignedIn} />

      <LandingChallengeSection
        challenge={challenge}
        initialSignedIn={initialSignedIn}
        streak={streak}
      />

      <LandingFeatures />

      <LandingPricing initialSignedIn={initialSignedIn} />

      <LandingFooter />
    </>
  );
}
