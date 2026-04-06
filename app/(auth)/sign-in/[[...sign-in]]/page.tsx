import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { safeInternalRedirectPath } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = {
  title: "Sign in",
};

type PageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const target = safeInternalRedirectPath(params.redirect_url);
  const signUpUrl = target
    ? `/sign-up?redirect_url=${encodeURIComponent(target)}`
    : "/sign-up";

  return (
    <div className="flex flex-1 flex-col gap-4 py-2 sm:items-center">
      <details className="w-full max-w-md rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-left text-xs text-muted-foreground sm:mx-auto">
        <summary className="cursor-pointer list-none font-medium text-foreground [&::-webkit-details-marker]:hidden">
          Can’t see the sign-in form?
        </summary>
        <p className="mt-2 border-t border-border/60 pt-2">
          That message is not from Clerk checking your keys — it’s help text. If the form below is
          still empty, open the browser <strong>Console</strong> for errors, and in the Clerk
          dashboard allow your site URL (e.g. <code className="rounded bg-muted px-1 py-0.5">https://write.arabivo.net</code>
          ). Ensure Vercel <strong>Production</strong> has the same Clerk keys as your Clerk app and
          redeploy after changes. Details: <span className="whitespace-nowrap">Projectdocs/clerk-production.md</span>.
        </p>
      </details>
      <div className="flex min-h-[22rem] w-full flex-col items-stretch justify-center sm:items-center">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "hsl(160 84% 32%)",
              borderRadius: "0.625rem",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl={signUpUrl}
          {...(target ? { forceRedirectUrl: target } : {})}
        />
      </div>
    </div>
  );
}
