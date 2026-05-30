import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { TryChallengeDemo } from "@/components/marketing/try-challenge-demo";
import { Button } from "@/components/ui/button";
import { getHomepageDemoChallenge } from "@/lib/marketing/demo-challenge";
import { getStripeTrialPeriodDays } from "@/lib/stripe/server";

export const metadata: Metadata = {
  title: "Try a challenge word",
  description:
    "Trace ششش — three shīn letters, nine dots. Free handwriting demo, no account needed.",
};

export default async function TryPage() {
  const demo = getHomepageDemoChallenge();
  const trialDays = getStripeTrialPeriodDays();
  const { userId } = await auth();
  const initialSignedIn = Boolean(userId);

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <Button
        variant="ghost"
        size="lg"
        nativeButton={false}
        render={<Link href="/" />}
        className="mb-6 min-h-11 w-fit gap-2 px-2 sm:px-3"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Home
      </Button>

      <TryChallengeDemo
        demo={demo}
        trialDays={trialDays}
        initialSignedIn={initialSignedIn}
        compactHeading
      />
    </section>
  );
}
