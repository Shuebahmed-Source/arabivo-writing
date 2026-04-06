import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/lessons(.*)",
]);

/**
 * Inject a Clerk-compatible Content-Security-Policy (includes your Frontend API host,
 * e.g. https://clerk.write.arabivo.net). Without this, browsers block clerk-js with:
 * "script source URI is not allowed in this document".
 * @see https://clerk.com/docs/security/clerk-csp
 */
export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    contentSecurityPolicy: {},
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
