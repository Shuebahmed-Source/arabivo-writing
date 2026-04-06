# GitHub — repository setup

This document records how the **ArabivoWrite** codebase was connected to GitHub and includes **GitHub CLI (`gh`)** notes for future troubleshooting.

## Repository

- **Organization / user:** `Shuebahmed-Source`  
- **Repository name:** `arabivo-writing`  
- **URL:** https://github.com/Shuebahmed-Source/arabivo-writing  
- **Default branch:** `main`  

## What was done (initial setup)

1. The project was already a **git** repo on branch **`main`** with an earlier initial commit.  
2. All current application code and **`Projectdocs/`** were **staged and committed** as a single snapshot (MVP: sections, progress, canvas/scoring, lesson complete overlay, Clerk/Supabase wiring, `proxy.ts`, migrations, etc.).  
3. **`gh repo create`** was used to create the remote repository on GitHub under **`Shuebahmed-Source`**.  
4. **`origin`** was set to `https://github.com/Shuebahmed-Source/arabivo-writing.git`.  
5. **`main`** was **pushed** to **`origin`** and set to track **`origin/main`**.  

## Secrets and env files

- **`.env.local`** remains **gitignored** (see root **`.gitignore`**) and must **not** be committed.  
- **`.env.example`** is the committed template for required variables (no real secrets).  

## Note about `gh` (GitHub CLI)

Earlier, **`gh auth status`** reported that the token in the keychain was **invalid** for account **`Shuebahmed-Source`**. Despite that message, **`gh repo create`** still **created** the repository on GitHub, and **`git push`** succeeded using the machine’s **normal Git credential helper** (e.g. HTTPS credentials or another stored auth path).

If **`gh`** commands fail later (e.g. `gh pr`, `gh repo view`), re-authenticate:

```bash
gh auth login -h github.com
```

That does not replace normal **`git push` / `git pull`** if those still work; it only fixes the **GitHub CLI** session.

## Ongoing workflow (reference)

```bash
git pull
git add .
git status   # confirm .env.local is not listed
git commit -m "Your message"
git push
```

## Deployment (Vercel)

If the GitHub repo is connected to **Vercel**, pushes to **`main`** typically trigger a **Production** deploy. Env vars and domain/DNS checks are summarized in **`Projectdocs/launch-checklist.md`** (Clerk, Supabase, Stripe, optional trial, paywall).

## Related next steps (historical)

- Connect **Vercel** to **`Shuebahmed-Source/arabivo-writing`** if not already linked.  
- Add **Production** environment variables on the host — see **`launch-checklist.md`** and **`.env.example`**; never commit secrets to git.  
