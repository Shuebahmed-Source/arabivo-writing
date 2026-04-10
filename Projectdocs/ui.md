# UI Design

## Design direction

Clean, calm, **minimal**, and **premium**. The learning surface should stay focused: script reference, canvas, and clear actions. Celebration UI after a pass should feel **rewarding** without breaking the emerald system.

## Theme

- **Primary:** Emerald / green accent (`oklch`-based tokens in `app/globals.css`, aligned with shadcn variables)  
- **Neutrals:** Soft backgrounds, subtle borders, light rings on cards  
- **Feedback states:** Stronger emerald emphasis for **Excellent** / **Good**; muted card for **Try again**  
- **Lesson complete overlay:** Full-screen **`background/92` + backdrop blur**; primary-colored **progress bar**; badge circle uses **primary / emerald / teal / lime / cyan** tints chosen deterministically from `lessonId`  

## Typography

- **UI:** Inter (`next/font`)  
- **Arabic:** Noto Sans Arabic; large display size on lesson detail; `font-arabic` utility for RTL text  
- Lesson feedback uses a clear **title + supporting sentence** hierarchy  
- Complete screen: small-caps **“Lesson complete”**, large **short lesson title** (from `getLessonShortTitle`)  

## Layout patterns

- **Mobile-first** spacing and tap targets (`min-h-11` / `min-h-12` on primary actions where needed)  
- **Marketing** (`/`, `/subscribe`): **MarketingHeader** — logo, Pricing (`#pricing`), Sign in, Start learning  
- **Learn** (`/dashboard`, `/lessons`, section hubs, lesson detail): **SiteHeader** — logo → dashboard, Dashboard + Lessons nav, **UserButton** / sign-in  
- **Auth** (`/sign-in`, `/sign-up`): slim header, centered Clerk card  

## Key surfaces

- **Landing:** Hero uses **`TrialFunnelCTAs`**: **signed in** → one primary (checkout); **signed out** → primary + **Sign in** (same funnel via **`redirect_url=/subscribe`**). **Pricing** lives in the header link to **`#pricing`**, not a third hero link. **`#pricing`** block repeats CTAs for users who scrolled for plan copy  
- **Dashboard:** Unit cards with **Available / Locked**, **completed / total**, thin **progress bar**; **Billing** card only when subscribed (portal)  
- **Lessons (`/lessons`):** Per-unit headings; **section cards** in a responsive grid (title, description, **Progress x/y**, **Done** / **Locked**, chevron when navigable)  
- **Section hub (`/lessons/sections/[sectionId]`):** Back to all lessons, title + description, **Continue**, optional **Next section**, list of items as cards (link when unlocked)  
- **Lesson detail:** Compact **Back to section**; unit · **section** link; title + badges; **`lg+` two-column grid** — **Practice writing** + canvas (primary column) and a denser **Lesson reference** sidebar (Arabic, transliteration, meaning) with **`lg:sticky`**; smaller padding than early MVP  
- **Writing section:** Card with instructions, canvas (rounded, subtle border/inner shadow), **WritingFeedbackPanel** after Check, **Clear** / **Check** (disabled while complete overlay is open); thicker smoothed strokes on canvas (see codebase)  
- **Lesson complete overlay (`LessonCompleteOverlay`):** Top bar — back to section, centered section title, **position/total**; animated progress bar; **icon in tinted circle** (Lucide icon from `lessonId` hash); **LESSON COMPLETE** + headline; **Result** card with **Excellent!** / **Good effort!** and faint Arabic watermark; **Practice again** (outline) + **Next** (primary)  

## Motion (Framer Motion)

- Overlay: **fade** of full-screen shell  
- **Staggered** spring entrance for icon (scale + slight rotate), text blocks, result card, buttons  
- Progress fill: **width** animation from 0 → target ratio  
- **`AnimatePresence`** for mount/unmount of overlay  
- **`useEffect`** locks **body scroll** while overlay is open  

## Accessibility

- Inline feedback uses **`role="status"`** and **`aria-live="polite"`**; panel remount key increments on repeat Check for screen reader updates  
- Complete overlay: **`role="dialog"`**, **`aria-modal="true"`**, labelled heading and result line  
- Canvas has an **`aria-label`** describing practice purpose  

## Components (reference)

- shadcn: **Button**, **Card**, **Badge**, **Separator**  
- Custom: **WritingCanvas**, **LessonWritingSection**, **WritingFeedbackPanel**, **LessonCompleteOverlay**  
- **lib/writing/lesson-complete-visual.ts** — icon + tint selection per `lessonId`  
