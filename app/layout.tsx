import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Noto_Sans_Arabic } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ArabivoWrite",
    template: "%s · ArabivoWrite",
  },
  description:
    "Learn Arabic handwriting through guided tracing and practice.",
};

function clerkRedirectOriginProps(): {
  allowedRedirectOrigins?: string[];
} {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) {
    return {};
  }
  try {
    return { allowedRedirectOrigins: [new URL(raw).origin] };
  } catch {
    return {};
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/lessons"
      signUpFallbackRedirectUrl="/lessons"
      {...clerkRedirectOriginProps()}
      appearance={{
        variables: {
          colorPrimary: "hsl(160 84% 32%)",
          borderRadius: "0.625rem",
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${notoSansArabic.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
