# UI Design

**Shipped:** Marketing landing, onboarding, **dashboard**, and **`/lessons`** match the design handoffs on **`main`**. Lesson detail and section hubs still use the **shadcn / Inter** practice shell. Further experiments can land on **`dev`** first — **`github.md`**.

## Design direction

Clean, calm, **minimal**, and **premium**. The learning surface should stay focused: script reference, canvas, and clear actions. Celebration UI after a pass should feel **rewarding** without breaking the emerald system.

Three visual **shells** share the same emerald tokens but different scoped CSS:

| Shell | Routes | CSS | Display fonts |
|-------|--------|-----|----------------|
| **Marketing** | `/`, `/try`, `/subscribe` | `components/marketing/marketing.css` | Fredoka, Hanken Grotesk, Noto Naskh Arabic |
| **Onboarding** | `/onboarding/*` | `components/onboarding/onboarding.css` | Same trio |
| **Learn overview** | `/dashboard`, `/lessons` | `components/learn/learn.css` | Same trio |
| **Practice (legacy shadcn)** | `/lessons/[id]`, `/lessons/sections/*`, auth | `app/globals.css` + shadcn | Inter, Noto Sans Arabic |

## Theme

- **Primary:** Emerald `#0E7A4B` (handoff shells) and **`oklch`** shadcn tokens in `app/globals.css` (practice pages)  
- **Amber accents:** `#B86E1F` / `#FEF0E0` — **In progress** badges and rings on dashboard/lessons  
- **Neutrals:** `#F4F9F6` page bg, `#E1EBE5` borders, `#5C6B63` muted text  
- **Feedback states (lessons):** Stronger emerald for **Excellent** / **Good**; muted card for **Try again**  
- **Lesson complete overlay:** Full-screen **`background/92` + backdrop blur**; primary-colored **progress bar**; badge circle uses **primary / emerald / teal / lime / cyan** tints chosen deterministically from `lessonId`  

## Typography

- **Marketing / onboarding / learn overview:** **Fredoka** (headings, buttons), **Hanken Grotesk** (body), **Noto Naskh Arabic** (glyphs, watermarks)  
- **Lesson practice + auth:** **Inter** (`next/font`), **Noto Sans Arabic** on canvas via `font-arabic`  
- Lesson feedback uses a clear **title + supporting sentence** hierarchy  
- Complete screen: small-caps **“Lesson complete”**, large **short lesson title** (from `getLessonShortTitle`)  
- Long challenge strings use a **smaller canvas guide** (computed by **`guideFontSizeRatio`**) so glyphs stay on-screen  

## Layout patterns

- **Mobile-first** spacing and tap targets  
- **Marketing** (`/`, `/try`, `/subscribe`): **`MarketingHeader`** — wordmark, **Try** (`/#challenge`), **Features**, **Pricing**, **Sign in**, trial CTA; sticky 64px bar with backdrop blur  
- **Onboarding** (`/onboarding`): **`onboarding-root`** — max-width **560px** column; fixed bottom **CTA dock** on question/trace/sign-up steps  
- **Learn overview** (`/dashboard`, `/lessons`): **`LearnHeader`** — wordmark → `/dashboard`, centered **Dashboard / Lessons** tab pills, **UserButton**; 60px sticky bar  
- **Learn practice** (section hub, lesson detail): **`learn-main-default`** padding wrapper; shadcn **Card** / **Button** components  
- **Auth** (`/sign-in`, `/sign-up`): slim header, centered Clerk card  

## Key surfaces

### Landing (`/`)

- **Hero:** two-column grid — copy + **`MarketingTrialCTAs`** (**Let's go!** → `/onboarding`, **Sign in**); right column animated **سلام** trace mockup card  
- **`#challenge`:** dark band, **`LandingChallengeSection`** — **قلم**, coverage trace, success CTA  
- **`#features`:** six emoji feature cards  
- **`#pricing`:** centered plan card + **`MarketingTrialCTAs`** (`variant="pricing"`)  
- **Footer:** copyright + legal link placeholders  
- Green **primary buttons** use **white text** (link color override in `marketing.css`)

### Onboarding

- **Welcome:** centered wordmark, headline, **Let's go!** → **`?step=q0`**  
- **Trace:** **FIRST TRACE** tag, **س** canvas (**`OnboardingTraceStep`**), coverage bar, pinned **Continue**  
- **Sign-up:** Google + email → **`/subscribe`**

### `/try`

- Same **`LandingChallengeSection`** as **`#challenge`**, compact heading, **← Home** link

### Dashboard (`/dashboard`)

- **Stats row:** three chips — overall %, lessons complete, sections done  
- **Up Next card:** emerald tint, Arabic watermark, mini progress bar, **Continue →** (hidden CTA label on mobile; whole card tappable)  
- **All sections grid:** 2-column unit cards, **SVG progress rings** (staggered mount animation), **In progress** / **✓ Complete** / **Locked** badges  
- **Billing:** **`LearnSubscriptionCard`** when subscribed  

### Lessons (`/lessons`)

- Intro copy with **Good** / **Excellent** in bold  
- Per **unit block:** header with Arabic watermark, unit badge (**✓ Complete** or **n / total**), grid of **section cards**  
- **Section card:** title, status badge, description, **progress dots**, count label; links to next lesson  

### Section hub & lesson detail (shadcn — not yet handoff-styled)

- **Section hub:** Back link, **Continue**, lesson list cards  
- **Lesson detail:** breadcrumb, **`lg+` two-column grid** — canvas + **`LessonPracticeSidebar`**  
- **Writing section:** **Clear** / **Check**, **`WritingFeedbackPanel`**, **`LessonCompleteOverlay`**

## Motion

- **Dashboard:** progress rings animate **`stroke-dashoffset`** on mount (300ms delay, 100ms stagger per card)  
- **Marketing hero:** RTL **clip-path** reveal on mockup glyph  
- **Lesson complete overlay:** Framer Motion staggered spring entrance, progress bar width animation  
- **`prefers-reduced-motion`:** transitions minimized in scoped CSS shells  

## Accessibility

- Inline feedback uses **`role="status"`** and **`aria-live="polite"`**  
- Complete overlay: **`role="dialog"`**, **`aria-modal="true"`**  
- Demo and lesson canvases: descriptive **`aria-label`**  
- Progress rings: **`role="img"`** with percent label  

## Components (reference)

**Marketing:** `MarketingHeader`, `MarketingTrialCTAs`, `LandingHero`, `LandingChallengeSection`, `LandingFeatures`, `LandingPricing`, `LandingFooter`  

**Onboarding:** `OnboardingFlow`, `OnboardingTraceStep`, `OnboardingSparkles`  

**Learn overview:** `LearnHeader`, `DashboardView`, `LessonsView`, `LearnProgressRing`, `LearnSubscriptionCard`  

**Practice (lessons):** `WritingCanvas`, `LessonWritingSection`, `WritingFeedbackPanel`, `LessonCompleteOverlay`  

**Data helpers:** `lib/marketing/demo-challenge.ts`, `lib/marketing/landing-trace.ts`, `lib/learn/dashboard-data.ts`, `lib/learn/lessons-data.ts`, `lib/learn/arabic-deco.ts`, `lib/onboarding/trace-display.ts`, `lib/writing/lesson-complete-visual.ts`
