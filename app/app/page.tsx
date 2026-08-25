import type { Metadata } from "next";

import { AppStoreRedirect } from "./app-store-redirect";

export const metadata: Metadata = {
  title: "Opening the App Store…",
  robots: { index: false, follow: false },
};

export default function AppRedirectPage() {
  return <AppStoreRedirect />;
}
