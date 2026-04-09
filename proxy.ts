import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { isPreviewOrLocalDevBypassFromRequest } from "@/lib/env/dev-access";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/lessons(.*)",
]);

/**
 * When set, Clerk JS and API calls go through same-origin `https://<app>/__clerk/*` instead of
 * `https://clerk.<domain>/*`, avoiding CORS/CSP issues on the Frontend API subdomain.
 * Set `NEXT_PUBLIC_CLERK_PROXY_URL` and configure the same URL in Clerk Dashboard → Domains.
 * @see https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi
 */
const useFrontendApiProxy = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim(),
);

/**
 * Clerk-compatible CSP (includes FAPI host when not using path proxy).
 * @see https://clerk.com/docs/security/clerk-csp
 */
export default clerkMiddleware(
  async (auth, req) => {
    if (isPreviewOrLocalDevBypassFromRequest(req)) {
      return;
    }
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    contentSecurityPolicy: {},
    ...(useFrontendApiProxy
      ? {
          frontendApiProxy: {
            enabled: true,
          },
        }
      : {}),
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc|__clerk)(.*)",
  ],
};
