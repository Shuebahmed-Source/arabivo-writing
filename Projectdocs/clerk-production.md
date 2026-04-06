# Clerk — production (Vercel) troubleshooting

If **`/sign-in`** or **`/sign-up`** looks **blank** (header only, no form), Clerk’s browser bundle (`clerk-js`) is usually **not finishing initialization** or **redirects are blocked** for your domain. Fix the dashboard + env first; the app also shows a **loading** state and hints while Clerk loads.

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

Use **`https://`**, no trailing slash required. The app passes this origin’s **`allowedRedirectOrigins`** into **`ClerkProvider`** so redirects validated by Clerk match your production site.

## 4. Browser / network

- **VPN** or strict **privacy / ad blockers** can block Clerk’s scripts or third-party cookies. Try a normal window without extensions, or another network.
- Open **DevTools → Console** on `/sign-in` and look for Clerk errors (invalid key, blocked origin, CSP, failed network to `*.clerk.accounts.dev` / `clerk.*`).

## 5. Quick verification checklist

- [ ] Vercel Production has **both** Clerk keys + `NEXT_PUBLIC_APP_URL` and you **redeployed**
- [ ] Clerk Dashboard allows **`https://write.arabivo.net`** (and wildcard if available)
- [ ] Keys are **live** vs **test** consistently for the environment you expect
- [ ] No console errors on `/sign-in`

## Related env vars

See **`.env.example`** for path-based sign-in/sign-up URLs (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, etc.). Those routes must match the app (`/sign-in`, `/sign-up`).
