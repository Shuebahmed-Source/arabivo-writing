# Handoff: Dashboard & Lessons Pages — ArabivoWrite

## Overview

Hi-fi redesigns of two pages for **ArabivoWrite** (write.arabivo.net):

1. **Dashboard** (`/dashboard`) — learning overview: stats chips, "Up Next" continue card, section cards with animated progress rings.
2. **Lessons** (`/lessons`) — full curriculum in sections with sub-lesson cards, progress dots, and completion badges.

## Live implementation (ArabivoWrite codebase)

The production app implements these pages with real progress data:

| Prototype | Live app |
|-----------|----------|
| Inline `SECTIONS` array | **`getLearnDashboardUnitCards`**, **`getLearnLessonsBlocks`** from **`lib/learn/`** + **`lib/progress/`** |
| Section cards on dashboard | **Four unit cards** (Arabic letters, letter forms, simple words, challenge words) linking to **`/lessons#<unitId>`** |
| Lesson cards on `/lessons` | **Section cards** within each unit block (Letters I–V, etc.) linking to first incomplete **`/lessons/[lessonId]`** |
| Nav avatar placeholder | Clerk **`UserButton`** in **`LearnHeader`** |
| Billing | **`LearnSubscriptionCard`** on dashboard when subscribed (Stripe portal) |

**Not yet restyled:** **`/lessons/sections/[sectionId]`** and **`/lessons/[lessonId]`** still use the shadcn practice shell (Inter); they share **`LearnHeader`** and **`learn-main-default`** padding only.

Implementation: **`app/(learn)/`**, **`components/learn/`**, **`components/layout/learn-header.tsx`**, **`lib/learn/`**. Shared fonts/CSS with marketing and onboarding (Fredoka, Hanken Grotesk, Noto Naskh Arabic).

---

## About the Design Files

`Dashboard.html` and `Lessons.html` are **high-fidelity HTML prototypes** — design references showing intended look, layout, typography, spacing, color, and interactions. They are **not production code** to ship directly.

Your task: **recreate these designs in the existing ArabivoWrite codebase**, using its established routing, auth context, and real data APIs — not the prototype's inline data.

**Fidelity: High.** Match colors, spacing, typography, and interactions from the prototypes. Open both `.html` files in a browser to inspect hover states, animations, and the Tweaks panel.

---

## Design Tokens

All already established in the existing landing page — reuse, don't invent new values.

```css
--brand:       #0E7A4B;   /* primary green */
--brand-deep:  #0A5C39;   /* button shadow / dark green */
--brand-tint:  #E7F4ED;   /* green bg tint */
--brand-tint2: #D6EEE0;   /* deeper tint / avatar bg */
--ink:         #15231C;   /* primary text */
--muted:       #5C6B63;   /* secondary text */
--faint:       #8B9991;   /* tertiary / placeholder */
--line:        #E1EBE5;   /* borders, dividers */
--card:        #FFFFFF;   /* card backgrounds */
--bg:          #F4F9F6;   /* page background */
--amber:       #B86E1F;   /* in-progress / warning */
--amber-tint:  #FEF0E0;   /* amber bg tint */
--amber-tint2: #F5DFB8;   /* amber border tint */
```

**Fonts (Google Fonts):**
```
Fredoka:wght@400;500;600;700
Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;1,400
Noto+Naskh+Arabic:wght@400;500;600;700
```

**Border radii:** 10px (nav pills) · 12px (buttons) · 14px (stat chips) · 16px (lesson cards) · 18px (section cards) · 20px (continue card) · 999px (all badges/pills)

**Shadows:**
```
Card default:   0 1px 0 rgba(21,35,28,.03), 0 4px 14px -8px rgba(21,35,28,.07)
Card hover:     0 1px 0 rgba(21,35,28,.04), 0 12px 28px -8px rgba(21,35,28,.13)
Continue card:  0 6px 24px -8px rgba(14,122,75,.14)
Continue hover: 0 14px 36px -8px rgba(14,122,75,.22)
Primary button: 0 4px 0 var(--brand-deep)
```

---

## Shared Nav

Both pages share identical sticky nav.

| Property | Value |
|---|---|
| Height | 60px |
| Background | `rgba(244,249,246,.92)` + `backdrop-filter: blur(14px)` |
| Border | `1px solid var(--line)` bottom |
| Sticky | `top: 0`, `z-index: 100` |
| Padding | `0 clamp(20px, 5vw, 64px)` |

**Wordmark (left):** Fredoka 600 19px — "Arabivo" in `var(--ink)`, "Write" in `var(--brand)` bold · links to `/`

**Tab pills (center):** Hanken Grotesk 14px 500 · padding `7px 16px` · border-radius `10px`
- Active: bg `var(--brand)`, color `#fff`, weight 600
- Inactive: color `var(--muted)` · hover: bg `var(--brand-tint)`, color `var(--ink)`

**Avatar (right):** 36×36px circle · profile photo · fallback SVG silhouette on `var(--brand-tint2)`

---

## Screen 1: Dashboard (`/dashboard`)

**Layout:** max-width 900px centered · padding `clamp(36px,6vh,60px) clamp(20px,4vw,44px) 100px` · flex column `gap: 28px`

### Page Header
- Title: Fredoka 600, `clamp(28px,4vw,38px)`, `var(--ink)`, tracking `-0.015em`
- Subtitle: Hanken Grotesk 15px, `var(--muted)`, line-height 1.55, max-width 460px

### Stats Row
Three equal-flex chips in a flex row, `gap: 12px`, each `flex: 1`, `min-width: 120px`.

**Chip:** bg `var(--card)` · border `1.5px solid var(--line)` · border-radius 14px · padding `16px 20px`

| Chip | Value | Suffix | Label | Number color |
|---|---|---|---|---|
| 1 | Overall % complete | `%` | OVERALL PROGRESS | `var(--brand)` |
| 2 | Lessons done | ` / {total}` | LESSONS COMPLETE | `var(--ink)` |
| 3 | Sections done | ` / {total}` | SECTIONS DONE | `var(--ink)` |

- Number: Fredoka 600, 27px
- Suffix: Fredoka 500, 15px, `var(--faint)`
- Label: Hanken Grotesk 600, 11px, `var(--faint)`, uppercase, letter-spacing `0.07em`

### "Up Next" Continue Card
Shown when user has an in-progress section. Full-width, links to that section's lessons.

**Container:** bg `var(--brand-tint)` · border `1.5px solid var(--brand-tint2)` · border-radius 20px · padding `26px 28px` · overflow hidden · shadow + hover lift (see tokens above)

**Arabic watermark** (absolute, non-interactive):
- `position: absolute` · right `-8px` · top `50%` `translateY(-50%)`
- Noto Naskh Arabic 700, 130px · color `var(--brand)` · opacity `0.07`
- `direction: rtl` · `user-select: none` · `pointer-events: none`
- Text: the section's `arabicDeco` string (see Section Data table)

**Left body** (flex: 1, z-index: 1, flex-direction: column, gap: 8px):
- Eyebrow: `"UP NEXT"` · Hanken Grotesk 700, 11px · uppercase · letter-spacing `0.14em` · `var(--brand)`
- Title: section name · Fredoka 600, 22px, `var(--ink)`
- Description: 14px, `var(--muted)`, line-height 1.45, max-width 400px
- Progress row:
  - Label `"N of M lessons"` · Hanken Grotesk 12px 600 `var(--brand)`
  - Bar: height 5px · track `rgba(14,122,75,.15)` · fill `linear-gradient(90deg, var(--brand), #1aa066)` · border-radius 999px · max-width 180px

**Right CTA** (flex-shrink: 0, z-index: 1):
- "Continue →" · Fredoka 600, 15px, `#fff`
- bg `var(--brand)` · hover `#0f8853` · border-radius 12px · padding `12px 22px`
- Shadow `0 4px 0 var(--brand-deep)` · active: `translateY(3px)`, shadow `0 1px 0 var(--brand-deep)`
- **Hidden on mobile** (`< 640px`) — whole card remains tappable

### Sections Grid
- Row header: "All sections" (Fredoka 600, 17px, `var(--ink)`) + "View all lessons →" (Hanken Grotesk 500, 13px, `var(--brand)`, hover underline)
- Grid: 2 columns default · 1 column `< 640px` · gap 14px

**Section Card** (links to section on Lessons page):

Container: bg `var(--card)` · border `1.5px solid var(--line)` · border-radius 18px · padding `22px 22px 20px` · overflow hidden · hover: `translateY(-2px)` + shadow + border `#c5d8ce` · in-progress variant: border `var(--amber-tint2)`

Decorative Arabic (absolute, non-interactive): right 12px · top 50% · Noto Naskh 700, 88px · `var(--ink)` opacity `0.04` · direction rtl

Content (flex column, gap 6px):

1. **Title + badge** (flex, align-items flex-start, justify space-between, gap 8px):
   - Title: Fredoka 600, 16px, `var(--ink)` · `flex: 1` `min-width: 0`
   - Badge pill (Hanken Grotesk 700, 11px, border-radius 999px, flex-shrink 0):
     - Complete: bg `var(--brand-tint)` · color `var(--brand-deep)` · "✓ Complete"
     - In progress: bg `var(--amber-tint)` · color `var(--amber)` · "In progress"

2. **Description:** Hanken Grotesk 13px, `var(--muted)`, line-height 1.5

3. **Progress row** (flex, gap 14px, margin-top 12px):
   - **SVG Progress Ring** (52×52px):
     - Circle: cx=26, cy=26, r=20, stroke-width=3.5, stroke-linecap round
     - Track: stroke `var(--line)`
     - Fill: stroke `var(--brand)` (complete) or `var(--amber)` (in-progress)
     - Circumference: `2π × 20 ≈ 125.66`
     - `stroke-dashoffset` = `circumference × (1 - pct/100)`
     - **Mount animation:** start at `stroke-dashoffset: circumference` (empty ring), transition to final value over `0.75s cubic-bezier(0.4,0,0.2,1)`, cards staggered 100ms apart, 300ms delay after mount
     - Rotate -90deg from center so stroke starts at 12 o'clock
     - % label centered over ring: Fredoka 700, 10px, matching stroke color
   - Count: Fredoka 600, 16px, `var(--ink)` — "N / M"
   - Sub-label: Hanken Grotesk 12px, `var(--faint)` — "lessons"

---

## Screen 2: Lessons (`/lessons`)

**Layout:** max-width 960px centered · padding `clamp(36px,6vh,60px) clamp(20px,4vw,44px) 100px` · flex column `gap: 52px`

### Page Header
- Title: Fredoka 600, `clamp(28px,4vw,38px)`, `var(--ink)`
- Body copy: Hanken Grotesk 15px, `var(--muted)`, line-height 1.6, max-width 580px — "Good" and "Excellent" are `<strong>` in `var(--ink)`

### Section Blocks

Each section is a flex column with `gap: 20px`.

**Section header** (position relative · padding-bottom 20px · border-bottom `1.5px solid var(--line)`):

Arabic watermark (absolute, non-interactive):
- right 0 · top 50% translateY(-50%)
- Noto Naskh 700, 80px · opacity 0.055
- color `var(--brand)` if all complete · `var(--amber)` if in progress
- direction rtl

Header content row (flex, align-items flex-start, justify space-between, gap 16px):
- **Left** (flex column, gap 5px, z-index 1):
  - Title: Fredoka 600, 21px, `var(--ink)`, tracking `-0.01em`
  - Description: Hanken Grotesk 14px, `var(--muted)`, line-height 1.5, max-width 520px
- **Right badge** (flex-shrink 0, z-index 1, margin-top 3px · Hanken Grotesk 700, 12px · padding `5px 13px` · border-radius 999px):
  - Complete: bg `var(--brand-tint)` · color `var(--brand-deep)` · "✓ Complete"
  - In progress: bg `var(--amber-tint)` · color `var(--amber)` · "{done} / {total}" (total lessons in section)

**Lesson Grid:** 3 columns · 2 columns `< 660px` · 1 column `< 420px` · gap 12px

**Lesson Card** (links to lesson):

Container: bg `var(--card)` · border `1.5px solid var(--line)` · border-radius 16px · padding `18px 18px 15px` · hover: `translateY(-2px)` + stronger shadow · done hover border `var(--brand-tint2)` · in-progress: border `var(--amber-tint2)` hover border `#e8c070`

Content (flex column, gap 7px):

1. **Title + badge + chevron** (flex, align-items flex-start, justify space-between, gap 8px):
   - Title: Fredoka 600, 15px, `var(--ink)` · `flex: 1` `min-width: 0` · line-height 1.2
   - Right group (flex, align-items center, gap 5px, flex-shrink 0):
     - Badge (Hanken Grotesk 700, 11px, padding `3px 9px`, border-radius 999px):
       - Done: bg `var(--brand-tint)` · color `var(--brand-deep)` · "✓ Done"
       - In progress: bg `var(--amber-tint)` · color `var(--amber)` · "In progress"
       - Available: bg `var(--bg)` · color `var(--faint)` · border `1px solid var(--line)` · "Available"
     - Chevron: `›` · color `var(--faint)` · font-size 16px

2. **Description:** Hanken Grotesk 12.5px, `var(--muted)`, line-height 1.45

3. **Progress dots row** (flex, align-items center, gap 8px, margin-top 6px):
   - One dot per exercise: 5.5×5.5px circle · gap 3px · border-radius 50%
     - Completed: `var(--brand)` · Remaining: `var(--line)`
   - Count label (Hanken Grotesk 600, 11px, **white-space: nowrap**):
     - All done: `"{total} lessons"` · color `var(--brand)`
     - In progress: `"{done} / {total}"` · color `var(--amber)`
     - Not started: `"{done} / {total}"` · color `var(--faint)`

---

## Section & Lesson Data Model

```typescript
interface Section {
  id: string;
  title: string;
  description: string;
  arabicDeco: string;        // decorative watermark text
  lessons: SubLesson[];
}

interface SubLesson {
  id: string;
  title: string;
  description: string;
  completedCount: number;    // exercises the user has passed
  totalCount: number;        // total exercises in this sub-lesson
}

// Derived — never stored
type LessonStatus = 'done' | 'progress' | 'available';
function getStatus(done: number, total: number): LessonStatus {
  if (done === total && total > 0) return 'done';
  if (done > 0) return 'progress';
  return 'available';
}
```

### Arabic Decoration Strings per Section

> ⚠️ Do NOT use `الله` or other sacred/religious text as decorative UI elements.

| Section | `arabicDeco` | Notes |
|---|---|---|
| Arabic letters | `أبجد` | "Abjad" — the traditional alphabet order |
| Letter forms (positions) | `جـ ـجـ ـج` | Jeem in initial, medial, final form |
| Simple words | `سلام` | "Salaam" — hello/peace |
| Challenge words | `صعب` | "Sa'b" — difficult/hard |

---

## Interactions Summary

| Page | Interaction | Behavior |
|---|---|---|
| Dashboard | Mount | Progress rings animate in, staggered 100ms apart, 300ms after mount |
| Dashboard | Continue card | Navigate to in-progress section / first incomplete lesson |
| Dashboard | Section card | Navigate to /lessons#section-id |
| Dashboard | "View all lessons →" | Navigate to /lessons |
| Lessons | Lesson card | Navigate to lesson's first incomplete exercise |
| Both | Card hover | `translateY(-2px)`, stronger shadow, `transition: 0.18s ease` |
| Both | Button active | `translateY(3px)`, reduced shadow |
| Both | Transition | `transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s` |

---

## Files in This Package

| File | Description |
|---|---|
| `HANDOFF_README.md` | This document |
| `Dashboard.html` | Hi-fi prototype of `/dashboard` — open in browser |
| `Lessons.html` | Hi-fi prototype of `/lessons` — open in browser |

Open both HTML files locally in any browser. The Tweaks panel (top-right toolbar) lets you toggle layout options.
