"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { captureEvent } from "@/components/analytics/posthog-provider";
import { MARKETING_ACCESS_CTA } from "@/lib/marketing/paywall-copy";

const SIGN_UP_RETURN = "/sign-up?redirect_url=%2Fsubscribe";
const SIGN_IN_RETURN = "/sign-in?redirect_url=%2Fsubscribe";

type Props = {
  initialSignedIn: boolean;
};

export function MarketingHeader({ initialSignedIn }: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const signedIn = isLoaded ? Boolean(isSignedIn) : initialSignedIn;

  const primaryHref = signedIn ? "/subscribe" : SIGN_UP_RETURN;

  return (
    <nav className="mkt-nav">
      <Link href="/" className="mkt-wordmark">
        Arabivo<b>Write</b>
      </Link>
      <ul className="mkt-nav-links">
        <li>
          <Link href="/#challenge">Try</Link>
        </li>
        <li>
          <Link href="/#features">Features</Link>
        </li>
        <li>
          <Link href="/#pricing">Pricing</Link>
        </li>
        <li>
          <Link href={SIGN_IN_RETURN}>Sign in</Link>
        </li>
      </ul>
      <Link
        href={primaryHref}
        className="mkt-btn-nav"
        onClick={() =>
          captureEvent("subscribe_click", {
            source: "marketing_header",
            target: signedIn ? "subscribe" : "sign_up",
          })
        }
      >
        {MARKETING_ACCESS_CTA}
      </Link>
    </nav>
  );
}
