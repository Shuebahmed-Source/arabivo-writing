import { Suspense } from "react";

import { OnboardingSsoCallbackHandler } from "@/components/onboarding/sso-callback-handler";

export default function OnboardingSsoCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingSsoCallbackHandler />
    </Suspense>
  );
}
