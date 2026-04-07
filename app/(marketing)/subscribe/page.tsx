import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createCheckoutSessionUrlForCurrentUser } from "@/lib/stripe/createCheckoutSession";

export const metadata: Metadata = {
  title: "Subscribe",
};

export default async function SubscribePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/subscribe");
  }

  const result = await createCheckoutSessionUrlForCurrentUser();

  if (result.ok) {
    redirect(result.url);
  }

  if (result.error === "already_subscribed") {
    redirect("/lessons");
  }

  if (
    result.error === "not_configured" ||
    result.error === "no_url" ||
    result.error === "checkout_failed"
  ) {
    redirect("/?checkout=failed#pricing");
  }

  redirect("/sign-in?redirect_url=/subscribe");
}
