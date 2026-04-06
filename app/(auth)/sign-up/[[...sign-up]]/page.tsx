import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { ClerkAuthShell } from "@/components/auth/clerk-auth-shell";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col items-stretch justify-center py-2 sm:items-center">
      <ClerkAuthShell label="Loading sign-up…">
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
      </ClerkAuthShell>
    </div>
  );
}
