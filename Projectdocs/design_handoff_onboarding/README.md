# Handoff: ArabivoWrite Onboarding Flow

## Overview
A mobile-first, install-as-PWA onboarding flow for **ArabivoWrite** — an app that
teaches Arabic handwriting through guided tracing. The flow walks a new user from a
welcome screen, through 5 single-choice profiling questions, a **hands-on "trace your
first letter" moment**, a personalized 1-year projection, and finally account sign-up.
Theme: emerald + white, playful but calm. Works on phone, iPad (with stylus), and desktop.

## Live implementation (ArabivoWrite codebase)

The production app implements this flow at **`/onboarding`** with these **intentional differences** from the prototype’s “done” screen:

| Prototype | Live app |
|-----------|----------|
| Sign up → **Done** screen → app | Sign up → **`/subscribe`** (Stripe plan + Checkout) → **`/lessons`** after payment |
| Optional “Replay onboarding” done state | Signed-in users opening **`/onboarding`** → **`/dashboard`** |
| Apple social button | **Google + email only** (Clerk custom sign-up) |
| Three post-signup trace exercises | **Removed** — only the **one س trace** before projection |
| Internal `screen` state machine | **`?step=`** query params + server-rendered **welcome** |

OAuth callback: **`/onboarding/sso-callback`**. Answers persist to Supabase **`user_onboarding`**. See **`Projectdocs/userflow.md`**, **`features.md`**, **`database.md`**.

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-Babel** — a
working prototype that shows the intended look, copy, and behavior. They are **not meant
to be shipped as-is.** Your task is to **recreate these designs inside the ArabivoWrite
codebase** using its existing stack and conventions (the live site at arabivo.net appears
to be a React/Next-style web app — use whatever it actually uses: components, router,
styling system, form/auth libs). Treat the HTML as the source of truth for *visuals and
interaction*, and re-express it idiomatically in the real app.

The prototype uses an in-browser Babel transpile and 4 separate `.jsx` files only because
it had to run from a single static HTML file. In a real codebase you'd split these into
normal components/modules.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and interactions. Recreate
pixel-faithfully using the codebase's component library. The one placeholder is the
mascot — and the client has chosen to **ship without the mascot**, so you can ignore it
entirely (see Design Tokens → "Chosen configuration").

## Tech notes for re-implementation
- **Fonts (Google Fonts):** `Fredoka` (display: headings, buttons, option labels),
  `Hanken Grotesk` (body/UI text), `Noto Naskh Arabic` (Arabic glyphs). Load 400–700.
- **The trace step is a `<canvas>` interaction** — see "Trace step" below for the full
  algorithm. This is the only non-trivial component; everything else is layout + state.
- **Routing:** the prototype is a single component with an internal `screen` state
  machine. In production, either keep it as one stateful component or map each step to a
  route like `/onboarding?step=N` (the live site already uses `?step=` query params).
- **Persistence:** save the collected answers + auth to wherever the app keeps user state.

---

## Screens / Views

All screens share a centered column, **max-width 560px**, horizontal padding 22px, on a
background wash: `radial-gradient(120% 60% at 50% -10%, #D6EEE0 0%, #F4F9F6 55%)`.
Question/projection/sign-up screens have a **top bar** (back arrow + progress bar).
Welcome and the final "done" screen are vertically centered with no top bar.

### 1. Welcome
- **Purpose:** greet the user, start the flow.
- **Layout:** centered column. (Mascot omitted per client choice.) Wordmark
  "Arabivo**Write**" (the "Write" half in emerald `#0E7A4B`), then a headline, sub-line,
  primary button, and a quiet "Already have an account?" text link.
- **Copy:**
  - Wordmark: `ArabivoWrite`
  - H1: `👋 Let's teach your hand to write Arabic.` ("write Arabic." in emerald)
  - Sub: `Calm, guided tracing that builds real muscle memory — one beautiful letter at a time.`
  - Primary button: `Let's go!`
  - Link: `Already have an account?`
- **H1 type:** Fredoka 600, `clamp(24px, 6.6vw, 32px)`, line-height 1.15, max-width 440px,
  `text-wrap: balance`.

### 2–6. Question steps (5 of them)
Single-select. Picking an option highlights it; **Continue** (pinned bottom) is disabled
until something is selected, then advances. Back arrow returns to the previous step.
- **Layout:** H1 title, optional sub-line, then a vertical stack (gap 13px) of option cards.
- **Title type:** Fredoka 600, `clamp(26px, 6.4vw, 34px)`, line-height 1.12,
  `letter-spacing: -.01em`, `text-wrap: balance`.
- **Sub type:** Hanken Grotesk, 16px, color `#5C6B63`.
- **Option card:** see Components → Option card.

The 5 questions (id · title · sub · options as `emoji | label`):

1. **level** — "How much Arabic can you read right now?" — sub "Be honest — there's a perfect starting point for everyone."
   - 🌱 I can't read it yet · 🔤 I know some letters · 📖 I can read slowly · 🦉 I read pretty fluently
2. **why** — "Why do you want to write Arabic?" — sub "This shapes the words you'll trace first."
   - 🕌 Read & write the Quran · 🫶 Reconnect with my heritage · ✈️ Travel & everyday life · 🎓 Study or work
3. **experience** — "Have you ever written Arabic by hand?" — sub "No wrong answers — we meet you where you are."
   - 🆕 Never, totally new · 🏫 A little, back in school · ✍️ I practise now and then · 🔁 I write fairly regularly
4. **time** — "How much time can you give it each day?" — sub "Small, steady reps beat long cramming."
   - ⏱️ 5 min · ⌛ 10 min · ⏰ 20 min · 🔥 30 min+
5. **goal** — "Where do you want to be in a year?" — sub "Your daily plan adapts to this goal."
   - 📝 Write my name & the basics · 💬 Write words & short phrases · 📄 Write full sentences smoothly · 🎨 Beautiful, flowing handwriting

### 7. Trace step ("Now — trace your first letter ✍️")
The signature moment. User traces a faded Arabic letter; coverage is measured live.
- **Copy:** H1 `Now — trace your first letter ✍️`; sub `Follow the glowing outline below.
  Finger, stylus or mouse — whatever you've got.`
- **Card** (white, rounded 20px, shadow): header row with `FIRST TRACE` tag (left, 12px
  800 letter-spacing .14em, color `#8B9991`) and the transliteration `sīn` (right, Noto
  Naskh Arabic italic, `#5C6B63`).
- **Canvas area:** height `clamp(240px, 42vh, 340px)`, rounded 14px, with faint horizontal
  ruled guide lines (3 bands). Two stacked canvases: a **guide** canvas (faded dashed
  glyph) and an **ink** canvas (user strokes, `touch-action: none`).
- **Default glyph:** `س` (Arabic letter *sīn*), transliteration `sīn`, success text
  `the letter sīn`.
- **Hint** (before first stroke): pill "Start here & trace the glow" with a pulsing dot.
- **Footer:** `↺ Clear` button (left), progress bar (middle), `NN%` (right).
- **Success:** at ≥50% coverage → badge "🎉 You wrote the letter sīn!" + a sparkle burst;
  primary button label changes to "Beautiful — keep going". Button is enabled once the
  user has made any stroke (`Continue`); before any stroke it reads "Trace to continue"
  and is disabled.
- See **Interactions → Trace algorithm** for the exact coverage logic.

### 8. Projection ("Here's your year with ArabivoWrite ✨")
Personalized payoff using the level + goal + time answers.
- **Sub:** `You'll go from {LEVEL} to {GOAL} with just {TIME}/day.` — {LEVEL} emerald,
  {GOAL} amber `#D9820A`, {TIME} emerald. Maps:
  - level index → `['absolute beginner','early beginner','intermediate reader','advanced reader']`
  - goal index → `['confident basics','words & short phrases','full smooth sentences','beautiful handwriting']`
  - time index → `['5 min','10 min','20 min','30 min']`
- **Chart card:** white rounded card. An SVG rising polyline (emerald `#0E7A4B`, 2.6px,
  rounded caps, `vector-effect: non-scaling-stroke`) over 4 faint gridlines, stretched to
  fill (`preserveAspectRatio="none"`). Line points in a `0 0 100 90` viewBox:
  `(8,78)(24,70)(38,60)(52,56)(66,42)(80,30)(94,16)`.
  - Endpoint dots are **CSS-positioned overlays** (not SVG circles, to avoid distortion):
    start dot emerald 11px at `left:8%, top:86.7%`; end dot amber `#F4A024` 13px with 2.5px
    white border + soft shadow at `left:94%, top:17.8%`.
  - Axis row: `Today / Month 6 / Month 12` (Fredoka 500, 13px, `#8B9991`, nowrap).
  - Caption: `Your handwriting, projected`.
- **Stat pill** (emerald tint `#E7F4ED`, rounded 18px): `**9 in 10** learners who trace
  **daily** with ArabivoWrite hit their handwriting goal within a year.` — bold parts emerald.
  ⚠️ Placeholder marketing copy — replace with a real, substantiated stat.
- **Primary button:** `Create my free account`.

### 9. Sign up ("Save your progress 🔒")
- **Sub:** `Create a free account so your streak and plan are always here.`
- **Social buttons** (stacked, white, 1.5px border, rounded 14px, `white-space:nowrap`):
  `Continue with Google` (color Google "G"), `Continue with Apple` (black apple mark).
- **Divider:** `or sign up with email` (faint, hairlines either side).
- **Fields** (label Fredoka 600 14px + input): **Name** (`Your name`), **Email**
  (`you@email.com`), **Password** (`At least 6 characters`). Input: 1.5px border `#E1EBE5`,
  rounded 14px, 16px text; focus → emerald border + 3px `rgba(14,122,75,.14)` ring.
- **Validation:** enable submit only when name non-empty, email matches `/\S+@\S+\.\S+/`,
  password length ≥ 6.
- **Fineprint:** `By continuing you agree to our Terms & Privacy Policy.` (links emerald).
- **Primary button:** `Start my first session` (disabled until valid).

### 10. Done ("You're all set! 🎉")
- Centered. Sparkle burst on entry. (Mascot omitted.)
- **H1:** `You're all set! 🎉` · **Sub:** `Your personalised tracing plan is ready. Let's
  write something beautiful.`
- **Chips** (emerald-tint pills, staggered pop-in): `Plan ready` · `Day 1 unlocked` · `1 letter traced`.
- **Primary button:** `Start my first session →` (→ navigate into the actual app).
- **Link:** `Replay onboarding` (resets the flow).

---

## Interactions & Behavior

### Navigation / state machine
- State: `screen` ∈ `welcome | q | trace | projection | signup | done`; `qi` (0–4 question
  index); `answers` (object keyed by question id → selected option index).
- **next():** welcome→q(0); q→next q, or →trace after q4; trace→projection;
  projection→signup; signup→done.
- **back():** reverses; q(0)→welcome; trace→q(4); etc. The done screen's "Replay" resets
  `screen=welcome, qi=0, answers={}`.
- **Progress bar** fills across the 7-segment flow `['q0','q1','q2','q3','q4','trace','projection']`:
  `progress = (indexOf(currentKey)+1) / 7 * 100`. Welcome/sign-up/done aren't counted toward
  the bar (sign-up still shows the bar full).

### Animations / transitions (respect `prefers-reduced-motion`)
- **Step entrance:** fade + 14px rise, `.42s cubic-bezier(.2,.8,.3,1)`. ⚠️ Base/resting
  state must be `opacity:1` so SSR/print/reduced-motion never hide content.
- **Option select:** card lifts on hover (`translateY(-2px)`); selected state animates a
  checkmark badge in (`scale .5→1`, spring easing).
- **Primary button:** chunky "pushable" style — 6px solid bottom shadow in `--brand-deep`;
  on `:active` it translates down 4px and the shadow shrinks. Disabled = tint bg, no shadow.
- **Trace success:** badge pops in; 7 amber `✦` sparkles fly outward `.9s` ease-out.
- **Hint pill:** gentle 2.2s float; the dot pulses a 1.6s expanding ring.

### Trace algorithm (the important part)
1. On mount (after `document.fonts.ready`), size both canvases to the wrapper using
   `devicePixelRatio` (capped at 2.5) and `ctx.setTransform(dpr,0,0,dpr,0,0)`.
2. **Guide canvas:** draw the glyph centered, font-size `min(h*0.82, w*0.6)` Noto Naskh
   Arabic, filled `rgba(14,122,75,0.14)` + a dashed stroke `rgba(14,122,75,0.32)` (dash `5 7`).
3. **Build a coverage mask:** read the guide canvas `ImageData`; over a grid of `CELL=12px`
   cells, mark a cell as "on" if its center pixel alpha > 18. Store the set of on-cells and
   the total count.
4. **Drawing:** pointer/touch on the ink canvas draws an emerald (`#0E7A4B`) round-cap line
   of width `BRUSH=22`. For each move segment, interpolate points (~every 4px) and "stamp":
   mark every guide cell within `BRUSH/2` radius of the point as covered.
5. **Coverage** = covered.size / total. Display percent as `min(100, round(coverage*175))`
   (deliberately generous so it feels rewarding). At `coverage ≥ 0.50` → fire success.
6. **Clear** wipes the ink canvas and resets covered set + state. **Resize** rebuilds.

### Responsive
- Single fluid column (`max-width 560px`) — fills small screens, centers on large.
- Type scales with `clamp()`. Hit targets ≥ 44px. Canvas is pointer/stylus/touch friendly
  (`touch-action:none`). Pinned CTA respects `env(safe-area-inset-bottom)`.

---

## State Management
- `screen`, `qi`, `answers{level,why,experience,time,goal → index}` drive the whole flow.
- Sign-up form: `{name,email,pass}` + derived `valid`.
- Trace step (local): `coverage`, `done`, `started`, plus canvas/mask refs (not React state).
- Persist `answers` and the created account to the app's user store; the projection screen
  reads `answers` to compute its copy. Consider persisting the current step to the URL
  (`?step=`) like the existing site so refresh/back work.

---

## Design Tokens

### Chosen configuration (what to ship)
- **Mascot:** OFF (do not implement the mascot).
- **Display font:** Fredoka.
- **Card style:** shadow (the default below).

### Colors
| Token | Hex | Use |
|---|---|---|
| `--brand` | `#0E7A4B` | primary emerald (buttons, accents, wordmark "Write") |
| `--brand-deep` | `#0A5C39` | button bottom-shadow, selected label text |
| `--brand-tint` | `#E7F4ED` | progress track, selected card bg, stat pill, chips |
| `--brand-tint-2` | `#D6EEE0` | bg gradient top, disabled button bg |
| `--ink` | `#15231C` | headings, body |
| `--muted` | `#5C6B63` | sub-text |
| `--faint` | `#8B9991` | tags, placeholders, axis labels |
| `--line` | `#E1EBE5` | borders, hairlines |
| `--card` | `#FFFFFF` | card surfaces |
| `--bg` | `#F4F9F6` | page background base |
| `--amber` | `#F4A024` | projection end dot |
| `--amber-deep` | `#D9820A` | projection "goal" highlight text |

### Typography
- Display (`--font-display`): **Fredoka** 400–700 — headings, buttons, option labels, tags.
- Body (`--font-body`): **Hanken Grotesk** 400–700 — sub-text, inputs, fineprint.
- Arabic (`--font-ar`): **Noto Naskh Arabic** 400–700 — glyphs + transliteration.

### Radius
Cards 20px · canvas/inputs/social 14px · buttons 16px · small buttons 10–12px · pills 999px.

### Shadow (shadow card style)
`0 1px 0 rgba(21,35,28,.04), 0 8px 24px -12px rgba(21,35,28,.18)`.
Button shadow: `0 6px 0 var(--brand-deep), 0 12px 22px -8px rgba(14,122,75,.5)`.

### Spacing
Frame padding 22px · option gap 13px · option padding 18px 20px · card padding ~16–22px ·
step bottom padding 130px (clears the fixed CTA dock).

## Assets
- **No raster assets.** Icons are emoji; the Google/Apple marks and the progress check are
  inline SVG (in the sign-up + option components). The Arabic glyph is rendered live text.
- **Mascot** SVG exists in `data.jsx` but is **not used** in the shipped config — ignore it.

## Files (in this bundle)
- `Arabivo Onboarding.html` — entry point; loads fonts, React, and the 4 scripts below.
- `styles.css` — **all** styles + design tokens (`:root` variables). Your best reference.
- `app.jsx` — flow state machine + Welcome, Question, Projection, SignUp, Done components,
  plus the Tweaks panel wiring (the Tweaks panel is a *design tool* — omit in production).
- `TraceStep.jsx` — the canvas trace component + coverage algorithm.
- `data.jsx` — question content (`ONB_STEPS`), the unused Mascot SVG, and the Sparkles burst.
- `tweaks-panel.jsx` — design-time control panel only; **not part of the product.**

## Suggested prompt for Cursor
> "Implement this onboarding flow in our app (see design_handoff_onboarding/README.md and
> the HTML/CSS/JSX references). Recreate it with our existing components, router, and styling
> system — match the visuals pixel-faithfully. Ship without the mascot, using Fredoka + the
> shadow card style. Pay special attention to the canvas trace step and the coverage algorithm.
> Wire the collected answers and sign-up into our user state. Replace the placeholder '9 in 10'
> stat with a real one."
