# ArabivoWrite – Project Context

ArabivoWrite is a web app that helps users learn to write Arabic script through guided tracing and handwriting practice.

**Deployment:** Production traffic is served from **`main`** via **Vercel** (custom domain **`write.arabivo.net`**). Feature development typically happens on **`dev`**, then merges into **`main`** when ready — see **`Projectdocs/github.md`**.  

The app focuses on **Arabic letter formation and writing**, not general Arabic language learning.

## Design handoffs (reference → live code)

| Reference | Live implementation |
|-----------|---------------------|
| **`Projectdocs/design_handoff_onboarding/`** | **`/onboarding`** — `app/onboarding/`, `components/onboarding/`, `lib/onboarding/` |
| **`Projectdocs/Landing Page.html`** | **`/`** and **`/try`** — `app/(marketing)/`, `components/marketing/marketing.css`, `components/marketing/landing-*.tsx` |
| **`Projectdocs/design_handoff_dashboard_lessons/`** | **`/dashboard`** and **`/lessons`** — `components/learn/learn.css`, `components/learn/*-view.tsx`, `lib/learn/` |

Section hubs (`/lessons/sections/*`) and lesson detail (`/lessons/[lessonId]`) still use the **shadcn / Inter** practice shell; they share **`LearnHeader`** padding via **`learn-main-default`** but are not yet restyled to the dashboard/lessons handoff.

## Curriculum scope (MVP)

Lesson content is defined in **`lib/lessons.ts`** (local source of truth). The MVP uses a **three-level structure**:

1. **Units (categories)** — high-level groupings on the dashboard and lessons overview.  
2. **Sections** — cards the learner opens to work through a **chunk** of content in order (e.g. “Letters I” … “Letters V”), or — for challenge content — pick any item freely.  
3. **Lessons (items)** — individual practicable rows: one canvas target each (`/lessons/[lessonId]`).

**Units in the dataset:**

- **Arabic letters** — isolated letter shapes, split into **five sections** (Letters I–V) with several letters per section.  
- **Letter forms (positions)** — one section with initial / medial / final examples (e.g. jīm, nūn).  
- **Simple words** — **seven** themed sections of short connected **nouns** (and greeting-style words), mostly without harakat in the guide text.  
- **Challenge words** — **one** optional section of visually striking words and shape drills (repeating letters, dot walls, famous long forms). **Always available** on the dashboard; lessons inside use **open** unlock (no strict order).

**Simple words — section ids and titles** (in unlock order; see `SECTION_META` in `lib/lessons.ts`):

| Section id | Section card title |
|------------|-------------------|
| `simple-words-i` | Simple words I |
| `simple-words-ii` | Simple words II |
| `simple-words-iii` | Simple words III |
| `simple-words-body-people` | Body & people |
| `simple-words-home-objects` | Home & objects |
| `simple-words-nature` | Nature |
| `simple-words-animals` | Animals |

**Challenge words — section:**

| Section id | Section card title |
|------------|-------------------|
| `challenge-words-core` | Can you write this? |

**Scale (current dataset):** **28** isolated-letter lessons, **4** letter-form lessons, **39** word lessons, **8** challenge lessons → **79** lesson rows in `lib/lessons.ts`, across **14** sections (5 + 1 + 7 + 1). The **dashboard** shows **four unit cards** (progress rings, Arabic watermarks). **`/lessons`** lists the same four units as **section blocks** with **section cards** inside each.

Future expansion can add more units (e.g. numbers, deeper connection drills). Those are not required for the current MVP dataset.

## Unlock and progression

Unlocking is **section-aware**, not a single flat global queue:

- The **first lesson of the first section** (e.g. alif in Letters I) is available by default.  
- **Within a sequential section**, each lesson unlocks after the **previous lesson in that section** is completed with **Good** or **Excellent**.  
- The **first lesson of the next section** unlocks only when **every** lesson in the **previous section** is completed.  
- The next unit’s first section follows the same idea after the prior unit is finished (see `lib/progress/unlock.ts`).  
- **Open sections** (`unlockPolicy: "open"` in `SECTION_META`) — every lesson is available immediately; used for **`challenge-words-core`**.  
- **Always-available units** (`alwaysAvailable: true` on `UNITS`) — the unit is reachable on the dashboard without completing prior units; used for **`challenge-words`**.

**Good** or **Excellent** still saves completion to **Supabase** keyed by stable **`lesson_id`**; navigation after save (**Next**) goes to the **next lesson in the section** in order (including when replaying a section that is already complete); after the **last** lesson in the section, to **`/lessons/sections/[sectionId]`** for that section.

## Lesson experience

Each lesson includes:

- Arabic script, transliteration, and a short meaning or note  
- A **writing canvas** with a **faint guide** matching the Arabic to trace (font size scales down for long challenge strings via **`guideFontSizeRatio`** in **`lib/writing/lesson-display.ts`**)  
- **Clear** (reset strokes) and **Check** (pixel-overlap scoring vs the guide mask)  
- Feedback labels: **Excellent**, **Good**, or **Try again**  
- Lesson types: **`isolated_letter`**, **`letter_form`**, **`word`**, **`challenge`** (challenge items show **CHALLENGE · TRACE** on the practice screen)

After a successful save on **Good** / **Excellent**, a full-screen **lesson complete** celebration (Framer Motion) appears: section progress, per-lesson badge icon, result line, **Practice again** (close overlay, keep progress) and **Next** (next lesson in section, then section hub after the final item — see **`userflow.md`**).

## Marketing demo (no account)

Public visitors can trace a featured word **without sign-in**:

- **`/#challenge`** on the landing page — dark **Can you write this?** section after the hero  
- **`/try`** — same challenge UI with compact heading and **Home** back link (for social / bio links)  
- Featured word: **`word-qalam`** (**قلم** — “pen”) — config in **`lib/marketing/demo-challenge.ts`**, UI in **`LandingChallengeSection`**  
- **Coverage-based demo** (handoff algorithm): trace the guide until the bar fills (~48% threshold); **no Check button**; **no progress save**  
- On success: **signed-out** → **`MarketingTrialCTAs`** (**Start your first lesson** → **`/onboarding`**); **signed-in** → **`/lessons`**

Legacy components **`TryChallengeDemo`** / **`TrialFunnelCTAs`** (Check + **ششش**) remain in the repo but are **not** used on **`/`** or **`/try`**.

## Onboarding funnel (`/onboarding`)

Signed-out entry from the landing hero **Let's go!** — **not** paywalled; **signed-in** visitors are redirected to **`/dashboard`**.

1. **Welcome** → five profiling questions (`q0`–`q4`)  
2. **One trace** — **س** (sīn) via **`OnboardingTraceStep`** (onboarding canvas; separate from lesson **`WritingCanvas`**)  
3. **Projection** — chart from answers  
4. **Sign up** — free Clerk account (Google or email); answers saved to **`user_onboarding`**  
5. **`/subscribe`** — Stripe plan page + Checkout (**no** extra post-signup trace exercises)

Design reference: **`Projectdocs/design_handoff_onboarding/`**. Implementation: **`app/onboarding/`**, **`lib/onboarding/`**, **`components/onboarding/`**.

## Input and devices

The writing canvas uses **pointer events** only (`pointerdown`, `pointermove`, `pointerup`) so **touch, stylus, and mouse** behave consistently.

The product targets **phones, tablets, iPads, and desktop** with a **mobile-first** layout.

## Visual direction

Clean, calm, **premium** feel with an **emerald-forward** theme. **Marketing**, **onboarding**, **dashboard**, and **`/lessons`** share **Fredoka / Hanken Grotesk / Noto Naskh Arabic** and scoped CSS (`marketing.css`, `onboarding.css`, `learn.css`). **Lesson practice** pages still use **Inter + Noto Sans Arabic** via shadcn globals until a future handoff. See **`Projectdocs/ui.md`**.

## Source control (GitHub)

Repository URL, initial push steps, and **GitHub CLI (`gh`)** troubleshooting (including `gh auth login`) are documented in **`Projectdocs/github.md`**.

## Billing and access (Stripe)

The app can run as **free-for-signed-in-users** (Stripe env incomplete) or **paid lessons** (production):

- **Stripe Checkout** (subscription) and **Customer Billing Portal**; state synced to **`user_subscriptions`** via **`/api/webhooks/stripe`**.  
- **`/lessons`** and progress saves require subscription access when Stripe billing is configured **and** enforcement runs (**Vercel Production** — **`shouldEnforceSubscriptionAccess()`**). Subscriptions start from **onboarding sign-up → `/subscribe`**, the **landing `#pricing`** section, and direct **`/subscribe`** visits; unpaid **`/lessons`** visits redirect to **`/subscribe`**. **Vercel Preview** and **local dev** skip subscription enforcement for testing; see **`features.md`**.  
- Optional **free trial** via **`STRIPE_TRIAL_PERIOD_DAYS`** (e.g. `7`) — no separate Stripe “trial product” required.  
- **`/`**, **`/try`**, **`/#challenge`**, and **`/onboarding`** stay public (demo tracing only; full curriculum is behind the lessons paywall in production).

Operational checklist: **`Projectdocs/launch-checklist.md`**. Technical detail: **`Projectdocs/stripe.md`**.

## Clerk and custom domains

Production sign-in depends on **Clerk DNS** (e.g. **`clerk.<your-subdomain>`**) verification, correct **Vercel env** keys, and the app hostname (**`write.arabivo.net`** or equivalent) **resolving** to Vercel. **Google sign-in** in production needs **your own** OAuth credentials in Clerk. **Preview** URLs (**`*.vercel.app`**) must be allowed in Clerk if the **marketing** shell or **`ClerkProvider`** needs to initialize there; **`/lessons`** can still be tested on Preview via **auth bypass** (**`lib/env/dev-access.ts`**). See **`Projectdocs/clerk-production.md`**.
