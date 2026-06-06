import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { OnboardingWelcomeStep } from "@/components/onboarding/welcome-step";
import { parseOnboardingStep } from "@/lib/onboarding/routing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get started",
  description: "Set up your ArabivoWrite tracing plan in a few quick steps.",
};

type PageProps = {
  searchParams: Promise<{ step?: string }>;
};

export default async function OnboardingPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const step = parseOnboardingStep(params.step);

  if (step === "welcome") {
    return (
      <div className="onb-frame">
        <OnboardingWelcomeStep />
      </div>
    );
  }

  return <OnboardingFlow initialStep={step} />;
}
