import { NextResponse } from "next/server";

import { createCheckoutSessionUrlForCurrentUser } from "@/lib/stripe/createCheckoutSession";

export async function POST() {
  const result = await createCheckoutSessionUrlForCurrentUser();

  if (!result.ok) {
    if (result.error === "not_configured") {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 },
      );
    }
    if (result.error === "unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (result.error === "already_subscribed") {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "No checkout URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: result.url });
}
