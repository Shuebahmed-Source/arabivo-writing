"use client";

import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

type Props = {
  children: React.ReactNode;
  /** Shown while ClerkJS is initializing (avoids an empty white area). */
  label?: string;
};

export function ClerkAuthShell({ children, label = "Loading sign-in…" }: Props) {
  return (
    <>
      <ClerkLoading>
        <div className="flex min-h-[22rem] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-12 text-center">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            If this never finishes, open the browser console on this page, confirm
            your Vercel env has the production Clerk keys, and add this site URL in
            the Clerk dashboard (see Projectdocs/clerk-production.md). Try without
            VPN or strict blockers if scripts fail to load.
          </p>
        </div>
      </ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
    </>
  );
}
