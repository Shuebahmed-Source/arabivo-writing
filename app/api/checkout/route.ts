import { NextResponse } from "next/server";

import { createCheckoutSessionUrlForCurrentUser } from "@/lib/stripe/createCheckoutSession";
import { isCheckoutPlan } from "@/lib/stripe/plans";

export async function POST(req: Request) {
  let plan: unknown = "lifetime";
  try {
    const body = (await req.json()) as { plan?: unknown };
    if (body.plan !== undefined) {
      plan = body.plan;
    }
  } catch {
    plan = "lifetime";
  }

  if (!isCheckoutPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const result = await createCheckoutSessionUrlForCurrentUser(plan);

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
    if (result.error === "invalid_plan") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (result.error === "checkout_failed") {
      return NextResponse.json(
        { error: "Could not start checkout" },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "No checkout URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: result.url });
}
