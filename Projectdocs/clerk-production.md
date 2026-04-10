# Clerk — production (Vercel) troubleshooting

If **`/sign-in`** or **`/sign-up`** looks **blank** (header only, no form), Clerk’s browser bundle (`clerk-js`) is usually **not finishing initialization** or **redirects are blocked** for your domain. Fix the dashboard + env first.

**This is not caused by Stripe or a subscription paywall.** Subscription code does not protect `/sign-in` or `/sign-up` (only `/dashboard` and `/lessons` use `auth.protect()` in **`proxy.ts`**).

## 1. Keys must match the Clerk instance (production)

In **Vercel → Settings → Environment Variables** (Production):

| Variable | What to verify |
|----------|----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Starts with **`pk_live_`** for production users (or **`pk_test_`** if you intentionally use Clerk’s test mode). |
| `CLERK_SECRET_KEY` | Starts with **`sk_live_`** (or **`sk_test_`** matching the publishable key). |

**Common mistake:** Production deploy still has **test** keys, or **publishable** and **secret** keys are from **different** Clerk applications.

Redeploy after changing these.

## 2. Allow your production domain in Clerk

In Clerk Dashboard (same application as the keys above):

1. **Domains** — Add your production host (e.g. **`write.arabivo.net`**) if you use a custom domain or satellite setup. Follow Clerk’s DNS guidance if prompted.
2. **Paths / redirects** — Add your site URL to **allowed redirect / origin** lists (wording varies by Clerk version). Include at least:
   - `https://write.arabivo.net`
   - `https://write.arabivo.net/*` (if your dashboard offers a wildcard pattern)

Without this, Clerk may refuse to run auth flows on that origin and the embedded `<SignIn />` UI can stay empty.

## 3. `NEXT_PUBLIC_APP_URL` (recommended on Vercel)

Set the same value in Vercel and locally:

```bash
NEXT_PUBLIC_APP_URL=https://write.arabivo.net
```

Use **`https://`**, no trailing slash required. Used for Stripe return URLs and other absolute links; **Clerk** still needs correct **keys** and **domain allowlist** in the Clerk dashboard (see above).

## 4. Browser / network

- **VPN** or strict **privacy / ad blockers** can block Clerk’s scripts or third-party cookies. Try a normal window without extensions, or another network.
- Open **DevTools → Console** on `/sign-in` and look for Clerk errors (invalid key, blocked origin, CSP, failed network to `*.clerk.accounts.dev` / `clerk.*`).

## 5. Quick verification checklist

- [ ] Vercel Production has **both** Clerk keys + `NEXT_PUBLIC_APP_URL` and you **redeployed**
- [ ] Clerk Dashboard allows **`https://write.arabivo.net`** (and wildcard if available)
- [ ] Keys are **live** vs **test** consistently for the environment you expect
- [ ] No console errors on `/sign-in`

## 6. CSP: “script source URI is not allowed” for `clerk.your-domain`

If the console shows something like:

`script source URI is not allowed … https://clerk.write.arabivo.net/npm/@clerk/clerk-js@…/clerk.browser.js`

the browser is applying **Content-Security-Policy** and blocking Clerk’s **Frontend API** host (the `clerk.` subdomain). This is **not** a bad API key; it’s CSP.

This repo enables Clerk’s automatic CSP in **`proxy.ts`** via `contentSecurityPolicy: {}` on **`clerkMiddleware`** so `script-src` / `connect-src` include your FAPI host. See Clerk’s docs: **`https://clerk.com/docs/security/clerk-csp`**.

After deploying that change, hard-refresh `/sign-in` and confirm the Clerk script loads in the **Network** tab.

## 7. Network: “CORS Failed” for `clerk.write.arabivo.net` / `clerk.browser.js`

If **Firefox/Chrome** shows **CORS Failed** (or blocked) for:

`https://clerk.<your-domain>/npm/@clerk/clerk-js@.../clerk.browser.js`

the **Frontend API** subdomain is not serving Clerk correctly for your browser (DNS, SSL, **Cloudflare proxy**, or Clerk DNS not verified). This is **not** fixed by rotating API keys.

**Fix A — DNS (stay on `clerk.` subdomain)**

1. Clerk Dashboard → **Domains** → confirm **DNS** for `clerk.<your-domain>` is **verified**.  
2. If **Cloudflare**: set the Clerk **CNAME** to **DNS only** (grey cloud), not proxied orange cloud — Clerk [warns](https://clerk.com/docs/deployments/overview) this breaks validation.  
3. Wait for DNS propagation; try without **VPN**.

**Fix B — Path proxy (recommended if subdomain keeps failing)**

Serve the Frontend API under **your app origin** so `clerk-js` loads from `https://write.arabivo.net/__clerk/...` (same site as the page — no cross-origin request to `clerk.write.arabivo.net`).

1. Deploy this repo’s `proxy.ts` (it enables `frontendApiProxy` when the env below is set).  
2. In **Clerk Dashboard** → **Domains** → Frontend API → set **proxy URL** to  
   `https://write.arabivo.net/__clerk/` (with trailing slash; adjust host if yours differs).  
3. In **Vercel** (Production) set:  
   `NEXT_PUBLIC_CLERK_PROXY_URL=https://write.arabivo.net/__clerk/`  
4. **Redeploy**. The SDK reads this env automatically (`NEXT_PUBLIC_CLERK_PROXY_URL`).

Details: [Proxying the Clerk Frontend API](https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi).

## 8. Google sign-in: “Access blocked” after choosing Gmail

In **production**, Clerk does **not** use shared development Google credentials. You must:

1. **Clerk Dashboard** → **User & authentication** → **Social connections** → **Google** — add **Client ID** and **Client secret** from [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials** (OAuth 2.0 Web client).  
2. In Google Cloud, under that OAuth client, set **Authorized redirect URIs** to the **exact** value(s) Clerk shows (often includes your **accounts.*** Clerk host).  
3. **OAuth consent screen:** if the app is in **Testing**, add each test Gmail under **Test users**, or **Publish** the app (and complete Google verification if required).

Misconfigured redirects or unpublished consent screens cause Google to block access even when email/password works.

## Related env vars

See **`.env.example`** for path-based sign-in/sign-up URLs (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, etc.). Those routes must match the app (`/sign-in`, `/sign-up`).

## Vercel Preview (`*.vercel.app`)

- Allow **Preview** origins in **Clerk Dashboard** (Domains / allowed origins) if **`/`**, **`/sign-in`**, or other Clerk-dependent pages fail or stay blank on a Preview deployment.  
- The app can still open **`/lessons`** on Preview **without** sign-in when **`lib/env/dev-access.ts`** bypass is active (middleware skips **`auth.protect()`** for **`/lessons`** / **`/dashboard`**). That does **not** fix a broken **`ClerkProvider`** on **`/`** — fix keys + domain allowlist for the preview host.  
- **`NEXT_PUBLIC_CLERK_PROXY_URL`** pointing only at **production** (`https://write.arabivo.net/__clerk/`) while the page runs on **`*.vercel.app`** can break Clerk; omit or configure per-environment as needed.
