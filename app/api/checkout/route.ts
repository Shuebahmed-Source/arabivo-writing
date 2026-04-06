import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import {
  getStripe,
  getStripePriceId,
  getStripeTrialPeriodDays,
  isStripeConfigured,
} from "@/lib/stripe/server";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const envOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = envOrigin || `${proto}://${host}`;

  const stripe = getStripe();
  const priceId = getStripePriceId();
  const trialDays = getStripeTrialPeriodDays();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...(email ? { customer_email: email } : {}),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard?checkout=canceled`,
    client_reference_id: userId,
    metadata: { clerk_user_id: userId },
    subscription_data: {
      metadata: { clerk_user_id: userId },
      ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "No checkout URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
