import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col items-stretch justify-center py-2 sm:items-center">
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
  );
}
