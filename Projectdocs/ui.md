# UI Design

**Shipped:** Marketing landing, onboarding, **dashboard**, **`/lessons`**, and **section hubs** (`/lessons/sections/*`) match the learn handoff on **`main`**. **Lesson detail** (`/lessons/[lessonId]`) still uses the **shadcn / Inter** practice shell. Further experiments can land on **`dev`** first — **`github.md`**.

## Design direction

Clean, calm, **minimal**, and **premium**. The learning surface should stay focused: script reference, canvas, and clear actions. Celebration UI after a pass should feel **rewarding** without breaking the emerald system.

Three visual **shells** share the same emerald tokens but different scoped CSS:

| Shell | Routes | CSS | Display fonts |
|-------|--------|-----|----------------|
| **Marketing** | `/`, `/try`, `/daily`, `/subscribe` | `components/marketing/marketing.css` | Fredoka, Hanken Grotesk, Noto Naskh Arabic |
| **Onboarding** | `/onboarding/*` | `components/onboarding/onboarding.css` | Same trio |
| **Learn overview** | `/dashboard`, `/lessons` | `components/learn/learn.css` | Same trio |
| **Learn section hub** | `/lessons/sections/*` | `components/learn/learn.css` | Same trio |
| **Practice (legacy shadcn)** | `/lessons/[id]`, auth | `app/globals.css` + shadcn | Inter, Noto Sans Arabic |

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
- Long challenge strings use a **width-aware canvas guide** (**`fitGuideFontSizePx`**, starting from **`guideFontSizeRatio`**) so glyphs stay on-screen; guide renders **slightly larger than ink** so a faint grey rim remains visible when tracing (**`GUIDE_OVER_INK_SCALE`**, **`CANVAS_INK_LINE_WIDTH_PX`**)  
- Section hub and sidebar reference Arabic scale with **`referenceArabicFontSize`** (letter-count based)  

## Layout patterns

- **Mobile-first** spacing and tap targets  
- **Marketing** (`/`, `/try`, `/daily`, `/subscribe`): **`MarketingHeader`** — wordmark, **Try** (`/#challenge`), **Features**, **Pricing**, **Sign in**, trial CTA; sticky 64px bar with backdrop blur  
- **Onboarding** (`/onboarding`): **`onboarding-root`** — max-width **560px** column; fixed bottom **CTA dock** on question/trace/sign-up steps  
- **Learn overview** (`/dashboard`, `/lessons`): **`LearnHeader`** — wordmark → `/dashboard`, centered **Dashboard / Lessons** tab pills, **UserButton**; 60px sticky bar  
- **Learn section hub** (`/lessons/sections/*`): **`learn-main-section`** max-width column; **`SectionHubView`** — back link, **Continue** / **Next section**, Arabic-first **tappable lesson rows** (**Tap to start** badge, whole card links to **`/lessons/[lessonId]`**)  
- **Learn practice** (lesson detail): **`learn-main-default`** padding wrapper; shadcn **Card** / **Button** components  
- **Auth** (`/sign-in`, `/sign-up`): slim header, centered Clerk card  

## Key surfaces

### Landing (`/`)

- **Hero:** two-column grid — copy + **`MarketingTrialCTAs`** (**Let's go!** → `/onboarding`, **Sign in**); right column animated **سلام** trace mockup card  
- **`#challenge`:** dark band, **`LandingChallengeSection`** — **Today’s word** (UTC daily rotation), honest **0–100%** coverage bar, pass at **88%**; success panel expands **inside card**; streak pill when signed in  
- **`#features`:** six emoji feature cards  
- **`#pricing`:** centered plan card + **`MarketingTrialCTAs`** (`variant="pricing"`)  
- **Footer:** copyright + legal link placeholders  
- Green **primary buttons** use **white text** (link color override in `marketing.css`)

### `/daily` and `/try`

- Same **`LandingChallengeSection`** as **`#challenge`**, **Today’s word** heading, compact layout  
- **`/daily`:** shareable URL for social / “today’s word” content  
- **`/try`:** **← Home** back link (bio links)  
- After pass: streak message (signed in), sign-up CTA (signed out), **`MarketingTrialCTAs`** success variant

### Onboarding

- **Welcome:** centered wordmark, headline, **Let's go!** → **`?step=q0`**  
- **Trace:** **FIRST TRACE** tag, **س** canvas (**`OnboardingTraceStep`**), coverage bar, pinned **Continue**  
- **Sign-up:** Google + email → **`/subscribe`**

### Dashboard (`/dashboard`)

- **Daily challenge card:** today’s Arabic word, transliteration, streak badge (**🔥 n-day**), **Completed today** / **Trace today’s word →** — links to **`/daily`**  
- **Stats row:** three chips — overall %, lessons complete, sections done  
- **Up Next card:** emerald tint, Arabic watermark, mini progress bar, **Continue →** (hidden CTA label on mobile; whole card tappable)  
- **All sections grid:** 2-column unit cards, **SVG progress rings** (staggered mount animation), **In progress** / **✓ Complete** / **Locked** badges  
- **Billing:** **`LearnSubscriptionCard`** when subscribed  

### Lessons (`/lessons`)

- Intro copy with **Good** / **Excellent** in bold  
- Per **unit block:** header with Arabic watermark, unit badge (**✓ Complete** or **n / total**), grid of **section cards**  
- **Section card:** title, status badge, description, **progress dots**, count label; links to next lesson  

### Section hub (`/lessons/sections/[sectionId]`)

- **Back link** → **`/lessons`**  
- **Header:** unit eyebrow, section title, description  
- **Actions:** **Continue →** (first incomplete unlocked lesson), **Next section →** when all items done  
- **Lesson list:** each row shows **large Arabic** (responsive size), lesson title, English note, status badge (**✓ Done** / **Tap to start** / **Locked**); unlocked rows are full-width tap targets (mobile-friendly)  

### Lesson detail (shadcn — not yet full handoff)

- Breadcrumb back to section hub; **`lg+` two-column grid** — canvas + **`LessonPracticeSidebar`**  
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

**Daily challenge / data:** `lib/daily-challenge/`, `lib/marketing/demo-challenge.ts`, `lib/marketing/landing-trace.ts`, `app/actions/daily-challenge.ts`  

**Learn overview:** `LearnHeader`, `DashboardView`, `DashboardDailyChallengeCard`, `LessonsView`, `SectionHubView`, `LearnProgressRing`, `LearnSubscriptionCard`  

**Practice (lessons):** `WritingCanvas`, `LessonWritingSection`, `LessonPracticeSidebar`, `WritingFeedbackPanel`, `LessonCompleteOverlay`  

**Data helpers:** `lib/daily-challenge/`, `lib/marketing/demo-challenge.ts`, `lib/marketing/landing-trace.ts`, `lib/learn/dashboard-data.ts`, `lib/learn/lessons-data.ts`, `lib/learn/arabic-deco.ts`, `lib/onboarding/trace-display.ts`, `lib/writing/lesson-display.ts` (`fitGuideFontSizePx`, `referenceArabicFontSize`), `lib/writing/lesson-complete-visual.ts`
