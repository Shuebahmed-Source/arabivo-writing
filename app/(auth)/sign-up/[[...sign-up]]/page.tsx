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
