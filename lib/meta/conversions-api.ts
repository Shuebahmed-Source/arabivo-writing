import { createHash } from "node:crypto";

import { META_PIXEL_ID } from "@/lib/meta/config";

const META_GRAPH_VERSION = "v21.0";

type MetaPurchaseEvent = {
  /** Stripe event id — lets Meta dedupe if the webhook is retried. */
  eventId: string;
  value: number;
  currency: string;
  email?: string | null;
};

function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

/**
 * Sends a server-side Purchase event to the Meta Conversions API.
 * Logs and returns silently on failure — a Meta outage must never fail the caller
 * (e.g. the Stripe webhook, which would otherwise get retried by Stripe).
 */
export async function sendMetaPurchaseEvent({
  eventId,
  value,
  currency,
  email,
}: MetaPurchaseEvent): Promise<void> {
  const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    console.error(
      "[meta capi] Missing META_CONVERSIONS_API_ACCESS_TOKEN — skipping Purchase event",
    );
    return;
  }

  const userData: Record<string, unknown> = {};
  if (email) {
    userData.em = [hashEmail(email)];
  }

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        user_data: userData,
        custom_data: {
          value,
          currency,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("[meta capi] Purchase event rejected", res.status, text);
    }
  } catch (err) {
    console.error("[meta capi] Purchase event request failed", err);
  }
}
