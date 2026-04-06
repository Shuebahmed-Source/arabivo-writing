import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 py-2 sm:items-center">
      <p className="text-center text-xs text-muted-foreground sm:max-w-md sm:text-left">
        Sign-up uses Clerk only. Subscription billing does not block this page.
      </p>
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
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
