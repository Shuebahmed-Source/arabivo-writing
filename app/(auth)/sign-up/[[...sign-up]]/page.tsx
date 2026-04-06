import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { safeInternalRedirectPath } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = {
  title: "Sign up",
};

type PageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const target = safeInternalRedirectPath(params.redirect_url);
  const signInUrl = target
    ? `/sign-in?redirect_url=${encodeURIComponent(target)}`
    : "/sign-in";

  return (
    <div className="flex flex-1 flex-col gap-4 py-2 sm:items-center">
      <details className="w-full max-w-md rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-left text-xs text-muted-foreground sm:mx-auto">
        <summary className="cursor-pointer list-none font-medium text-foreground [&::-webkit-details-marker]:hidden">
          Can’t see the sign-up form?
        </summary>
        <p className="mt-2 border-t border-border/60 pt-2">
          Same as sign-in: check the browser <strong>Console</strong>, Clerk domain allowlist, and
          Vercel Production env. See <span className="whitespace-nowrap">Projectdocs/clerk-production.md</span>.
        </p>
      </details>
      <div className="flex min-h-[22rem] w-full flex-col items-stretch justify-center sm:items-center">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "hsl(160 84% 32%)",
              borderRadius: "0.625rem",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl={signInUrl}
          {...(target ? { forceRedirectUrl: target } : {})}
        />
      </div>
    </div>
  );
}
