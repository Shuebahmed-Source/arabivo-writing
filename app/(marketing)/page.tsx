import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { PenLine, Sparkles, Tablet } from "lucide-react";

import { TrialFunnelCTAs } from "@/components/marketing/trial-funnel-ctas";
import { getStripeTrialPeriodDays } from "@/lib/stripe/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = {
  searchParams: Promise<{ checkout?: string }>;
};

export default async function LandingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const checkoutCanceled = params.checkout === "canceled";
  const trialDays = getStripeTrialPeriodDays();
  const { userId } = await auth();
  const initialSignedIn = Boolean(userId);

  return (
    <>
      {checkoutCanceled ? (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-foreground sm:px-6">
          Checkout was canceled. You can try again from{" "}
          <Link
            href="/#pricing"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Pricing
          </Link>
          .
        </div>
      ) : null}

      <section className="relative overflow-hidden border-b border-primary/10 bg-gradient-to-b from-primary/8 via-background to-background px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,hsl(160_84%_38%/0.12),transparent_65%)]"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-6">
          <p className="text-sm font-medium text-primary">
            Arabic handwriting practice
          </p>
          <h1 className="max-w-2xl text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Learn to write Arabic with calm, guided tracing.
          </h1>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            ArabivoWrite focuses on letter shapes, positions, connections, words,
            and numerals—so you build muscle memory with clear feedback, not
            guesswork.
          </p>
          <TrialFunnelCTAs
            trialDays={trialDays}
            initialSignedIn={initialSignedIn}
            variant="hero"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Built for steady progress
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Every lesson follows the same rhythm: see the script, trace with
          guides, then check your work. Later phases will add scoring and saved
          progress.
        </p>
        <ul className="mt-8 grid list-none gap-4 sm:grid-cols-3 sm:gap-5">
          <li>
            <Card size="sm" className="h-full ring-1 ring-primary/10">
              <CardHeader>
                <PenLine
                  className="mb-2 size-8 text-primary"
                  aria-hidden
                />
                <CardTitle className="text-base">Tracing canvas</CardTitle>
                <CardDescription>
                  Finger, stylus, and mouse—practice the same stroke everywhere.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card size="sm" className="h-full ring-1 ring-primary/10">
              <CardHeader>
                <Sparkles
                  className="mb-2 size-8 text-primary"
                  aria-hidden
                />
                <CardTitle className="text-base">Simple feedback</CardTitle>
                <CardDescription>
                  Short evaluations after each trace so you know when to move on
                  or retry.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card size="sm" className="h-full ring-1 ring-primary/10 sm:col-span-1">
              <CardHeader>
                <Tablet
                  className="mb-2 size-8 text-primary"
                  aria-hidden
                />
                <CardTitle className="text-base">Mobile first</CardTitle>
                <CardDescription>
                  Large touch targets and layouts tuned for phones and tablets.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        </ul>
      </section>

      <section
        id="pricing"
        className="scroll-mt-20 border-t border-border/80 bg-muted/25 px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Pricing
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            One subscription unlocks the full guided path: every unit, section,
            and handwriting lesson. Billing is handled securely by Stripe; any
            free trial is applied at checkout when enabled for your deployment.
          </p>
          <ul className="mt-2 max-w-xl list-disc space-y-1 pl-5 text-sm text-muted-foreground sm:text-base">
            <li>Full access to all lessons and saved progress</li>
            <li>Manage payment methods anytime (after you subscribe)</li>
          </ul>
          <TrialFunnelCTAs
            trialDays={trialDays}
            initialSignedIn={initialSignedIn}
            variant="pricing"
          />
        </div>
      </section>
    </>
  );
}
