import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/** Post-signup demo removed — send any legacy links straight to subscribe. */
export default async function OnboardingDemoPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/onboarding?step=signup");
  }
  redirect("/subscribe");
}
