# ArabivoWrite – Project Context

ArabivoWrite is a web app that helps users learn to write Arabic script through guided tracing and handwriting practice.

The app focuses on **Arabic letter formation and writing**, not general Arabic language learning.

## Curriculum scope (MVP)

Lesson content is defined in **`lib/lessons.ts`** (local source of truth). The MVP uses a **three-level structure**:

1. **Units (categories)** — high-level groupings on the dashboard and lessons overview.  
2. **Sections** — cards the learner opens to work through a **chunk** of content in order (e.g. “Letters I” … “Letters V”).  
3. **Lessons (items)** — individual practicable rows: one canvas target each (`/lessons/[lessonId]`).

**Units in the dataset:**

- **Arabic letters** — isolated letter shapes, split into **five sections** (Letters I–V) with several letters per section.  
- **Letter forms (positions)** — one section with initial / medial / final examples (e.g. jīm, nūn).  
- **Simple words** — one section with short connected words.

Future expansion can add more units (e.g. numbers, deeper connection drills). Those are not required for the current MVP dataset.

## Unlock and progression

Unlocking is **section-aware**, not a single flat global queue:

- The **first lesson of the first section** (e.g. alif in Letters I) is available by default.  
- **Within a section**, each lesson unlocks after the **previous lesson in that section** is completed with **Good** or **Excellent**.  
- The **first lesson of the next section** unlocks only when **every** lesson in the **previous section** is completed.  
- The next unit’s first section follows the same idea after the letters unit is finished (see `lib/progress/unlock.ts`).

**Good** or **Excellent** still saves completion to **Supabase** keyed by stable **`lesson_id`**; navigation after save goes to the **next lesson in the section** when possible, otherwise to the **next section hub** or **`/lessons`**.

## Lesson experience

Each lesson includes:

- Arabic script, transliteration, and a short meaning or note  
- A **writing canvas** with a **faint guide** matching the Arabic to trace  
- **Clear** (reset strokes) and **Check** (pixel-overlap scoring vs the guide mask)  
- Feedback labels: **Excellent**, **Good**, or **Try again**  

After a successful save on **Good** / **Excellent**, a full-screen **lesson complete** celebration (Framer Motion) appears: section progress, per-lesson badge icon, result line, **Practice again** (close overlay, keep progress) and **Next** (same routing as before: next item or next section).

## Input and devices

The writing canvas uses **pointer events** only (`pointerdown`, `pointermove`, `pointerup`) so **touch, stylus, and mouse** behave consistently.

The product targets **phones, tablets, iPads, and desktop** with a **mobile-first** layout.

## Visual direction

Clean, minimal, **premium** feel with an **emerald-forward** theme (see `Projectdocs/ui.md`).

## Source control (GitHub)

Repository URL, initial push steps, and **GitHub CLI (`gh`)** troubleshooting (including `gh auth login`) are documented in **`Projectdocs/github.md`**.

## Billing and access (Stripe)

The app can run as **free-for-signed-in-users** (Stripe env incomplete) or **paid lessons** (production):

- **Stripe Checkout** (subscription) and **Customer Billing Portal**; state synced to **`user_subscriptions`** via **`/api/webhooks/stripe`**.  
- **`/lessons`** and progress saves require subscription **`active`** or **`trialing`** when **`STRIPE_SECRET_KEY`** and **`STRIPE_PRICE_ID`** are set. Subscriptions start from the **landing `#pricing`** section and **`/subscribe`**; unpaid visits to **`/lessons`** redirect to **`/subscribe`**.  
- Optional **free trial** via **`STRIPE_TRIAL_PERIOD_DAYS`** (e.g. `3`) — no separate Stripe “trial product” required.

Operational checklist: **`Projectdocs/launch-checklist.md`**. Technical detail: **`Projectdocs/stripe.md`**.

## Clerk and custom domains

Production sign-in depends on **Clerk DNS** (e.g. **`clerk.<your-subdomain>`**) verification, correct **Vercel env** keys, and the app hostname (**`write.arabivo.net`** or equivalent) **resolving** to Vercel. **Google sign-in** in production needs **your own** OAuth credentials in Clerk. See **`Projectdocs/clerk-production.md`**.
