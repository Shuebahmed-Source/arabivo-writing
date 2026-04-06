import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 py-2 sm:items-center">
      <p className="text-center text-xs text-muted-foreground sm:max-w-md sm:text-left">
        Sign-in uses Clerk (not Stripe). There is no subscription paywall on this page. If the
        form area stays empty, check the browser console and Clerk dashboard: production domain
        allowlist and matching <code className="rounded bg-muted px-1 py-0.5">pk_live_</code> /{" "}
        <code className="rounded bg-muted px-1 py-0.5">sk_live_</code> keys on Vercel. See{" "}
        <span className="whitespace-nowrap">Projectdocs/clerk-production.md</span>.
      </p>
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
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
