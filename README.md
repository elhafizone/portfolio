# Mohammed Al-Hafiz — Portfolio

Personal portfolio for **Mohammed Al-Hafiz**, Creative Designer & WordPress Developer.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · GSAP + ScrollTrigger · Lenis.

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint
```

---

## Before this goes live

Everything below is deliberately empty rather than invented. Nothing in the UI
fakes a value: unset links are hidden, unset project slots are labelled as
reserved, and the contact form refuses to claim a message was sent when no
inbox is connected.

### 1. `config/site.ts`

| Field | What to put there |
| --- | --- |
| `siteConfig.url` | The production domain. Feeds canonical, OpenGraph, sitemap and robots. |
| `contactConfig.email` | Public contact address. Empty = the Email link is not rendered. |
| `contactConfig.whatsapp` | International format, digits only. |
| `contactConfig.linkedin` / `.mostaql` / `.behance` | Full profile URLs. |
| `contactConfig.location` | Optional, shown in the footer. |

Any channel left as `''` simply does not appear — there are no dead links.

### 2. `data/testimonials.ts` — already done

Six client reviews are transcribed **verbatim** from the public Mostaql profile
at `https://mostaql.com/u/Kamali-MGD`, which the Reviews section links to so a
visitor can verify every quote, name and number.

Each review is stored in the client's original Arabic with `verbatim: true`, and
rendered in a real `<blockquote>` with `lang="ar" dir="rtl"`. The English
underneath is stored separately as `textEn` and is always labelled
**"Translation"** — it is never presented as the client's own words.

The profile is listed under محمد الكمالي, one of Mohammed’s two family names.
The ratings panel says so beneath the verify link — see "Two family names, one
person" below.

### 3. `data/projects.ts` — the important one

There are **four placeholder project slots**, each with `isPlaceholder: true`.
The UI marks them honestly ("Reserved slot", "Awaiting case study") and shows a
standing notice that these are not published client work.

To publish a real project:

1. Put the image in `public/work/` at the size given in section 4.
2. Fill in `title`, `category`, `year`, `description`, `technologies`, `image`,
   `imageAlt`, and `url` / `caseStudyUrl`.
3. Set `isPlaceholder: false`.

The "reserved slot" labelling disappears automatically. **Do not flip
`isPlaceholder` to `false` on an entry whose copy is still invented** — the flag
is the only thing keeping the section truthful.

### 4. Images to prepare

`data/images.ts` is the single source of truth. Every slot shows a **numbered
placeholder in the live page** stating its own required size, so the site itself
is the brief.

| # | What | Size (px) | Ratio | Save as | Wire up in |
|---|---|---|---|---|---|
| 01 | Hero visual (beside the headline) | 1400 × 1400 | 1:1 | `public/hero/hero-visual.webp` | `data/images.ts` → `heroImage` + `heroImageAlt` |
| 02 | WordPress business website | 1800 × 1200 | 3:2 | `public/work/project-01.webp` | `data/projects.ts` → `projects[0].image` |
| 03 | WooCommerce store | 1800 × 1200 | 3:2 | `public/work/project-02.webp` | `projects[1].image` |
| 04 | Brand / visual identity | 1800 × 1200 | 3:2 | `public/work/project-03.webp` | `projects[2].image` |
| 05 | Booking / service website | 1800 × 1200 | 3:2 | `public/work/project-04.webp` | `projects[3].image` |
| 06 | Portrait of Mohammed | 1200 × 1500 | 4:5 | `public/about/portrait.webp` | `data/profile.ts` → `profile.portrait` |
| 07 | Social share card | 1200 × 630 | 1.91:1 | `public/og.jpg` | `data/images.ts` → `ogImage` |

Slot 01 is the most important one — it is the first thing a visitor sees and it
carries the hero on its own now that the 3D object has been removed.

Sizes are 2× the largest display size, so they stay sharp on retina screens.
Next.js generates the smaller responsive variants and the AVIF/WebP encodings
automatically — supply one high-quality source per slot.

Slots 02–05 share one aspect ratio deliberately: the same file serves both the
desktop horizontal rail and the stacked mobile card, with no second crop.

Remember to set `imageAlt` alongside `image` — an empty alt on a project shot is
an accessibility regression.

### 5. Contact form delivery

`app/api/contact/route.ts` validates the payload and hands it to whichever
provider is configured by environment variable:

```bash
# Option A — email via Resend
RESEND_API_KEY=re_xxx
CONTACT_TO_EMAIL=you@yourdomain.com
CONTACT_FROM_EMAIL=hello@yourdomain.com   # optional

# Option B — any webhook (Zapier, Make, n8n, a WordPress endpoint…)
CONTACT_WEBHOOK_URL=https://…
```

With neither set, the route returns **501** and the form tells the visitor the
inbox is not connected yet. It never reports a false success.

### 6. Analytics (optional)

```bash
NEXT_PUBLIC_ANALYTICS_ID=…
```

Nothing loads unless this is set. The integration point is in
`config/site.ts` (`analyticsConfig`); wire in the provider script when needed.

---

## What the content is based on

All biographical and skills content comes from information supplied by Mohammed
Al-Hafiz. Deliberately **not** present anywhere in this codebase:

- employer names, job titles at named companies, or employment dates
- degrees, certifications or awards
- client names, logos, revenue figures or project result metrics
- a fabricated portrait (the About section uses a typographic identity plate
  instead; set `profile.portrait` to swap in a real photograph)
- invented or paraphrased review text presented as a quotation

Client feedback is quoted **verbatim** from the public Mostaql profile, in the
Arabic the clients wrote. Client names and project titles appear exactly as the
platform displays them. English translations are labelled as translations.

Ratings are presented as Mostaql platform ratings across six criteria. They are
never relabelled as Google, Trustpilot, or an invented aggregate score. The
"30 projects completed" and "23 client ratings" figures are read off the same
profile, which is linked from the section.

## Two family names, one person

Mohammed's full name is **محمد أحمد الكمالي محمد الحافظ**, and he uses
**Al-Kamali** and **Al-Hafiz** interchangeably.

The site is branded **Mohammed Al-Hafiz**, matching the `hafizone` logo. The
Mostaql profile the reviews link to (`mostaql.com/u/Kamali-MGD`) is listed under
**محمد الكمالي**.

That mismatch is handled explicitly rather than hidden: the ratings panel prints
the profile name directly beneath the "Verify on Mostaql" link, so a visitor
knows before clicking. Both names are also declared as `alternateName` in the
JSON-LD, which keeps the site findable under either.

Everything lives in `data/profile.ts`:

| Field | Purpose |
| --- | --- |
| `name` | The branded name. Feeds navbar, footer, About, title, OpenGraph, JSON-LD. |
| `fullName` | Full legal name. |
| `alternateNames` | Other names in use — emitted as schema.org `alternateName`. |

To rebrand the site to Al-Kamali, change `profile.name` only. Everything
downstream follows, and the note under the verify link keeps making sense
because it prints whichever name the profile is under.

---

## Architecture

```
app/            routes, metadata, sitemap/robots, contact API
config/         site.ts (URLs, contact, analytics) · motion.ts (durations, easings, breakpoints)
data/           profile · projects · services · expertise · experience · process · testimonials · social
lib/            gsap.ts (plugin registration, capability probes) · animations.ts (all ScrollTrigger factories) · contact.ts (shared validation)
components/
  layout/       Navbar · Footer · SiteShell
  motion/       MotionProvider (Lenis + reduced motion + frame watchdog) · SplitText · Reveal · Parallax · MagneticButton
  hero/ projects/ services/ expertise/ experience/ process/ testimonials/ about/ contact/
  webgl/        parked - see "The 3D hero object is parked"
  ui/           Logo · Button · Cursor · Preloader · SectionHeading
```

**Motion rules the codebase enforces:**

- Every ScrollTrigger is created by a factory in `lib/animations.ts` and lives
  inside a `gsap.context()`, so unmounting a section reverts everything it made.
- Durations, easings, breakpoints and scroll distances live in
  `config/motion.ts`. No magic numbers in components.
- No global `overwrite` default. Where two systems animate the same region they
  target different elements: the hero entrance owns inner nodes (`[data-hero]`)
  and the scroll transition owns wrappers (`[data-hero-layer]`). Nothing is
  written by both, so neither can kill the other.
- Scroll-driven scenes are held by CSS `position: sticky`, never GSAP's `pin`.
  ScrollTrigger reports progress and owns no layout, so a stale trigger can at
  worst leave an index wrong — it cannot make scenes overlap each other.
- `body` uses `overflow-x: clip`, never `hidden`. `hidden` forces the other axis
  to compute as `auto`, which turns body into a scroll container and breaks
  sticky positioning.
- The reveal system pre-hides elements **only** under `html[data-motion="on"]`,
  which requires JS to have run and motion to be allowed. JS off ⇒ nothing is
  hidden.

## Motion, degraded

Two independent conditions drop the motion layer, and both leave the site fully
usable:

1. **`prefers-reduced-motion: reduce`** — no smooth scroll, no scroll-linked
   timelines, no custom cursor, no magnetic buttons.
2. **A stalled frame loop** — `MotionProvider` samples `requestAnimationFrame`
   for 2.5s. Below ~8fps on a *visible* tab, it strips the pre-hide states and
   behaves as if reduced motion were requested. A hidden tab is exempt and gets
   re-sampled when it becomes visible, so a page opened in a background tab is
   not penalised.

Critically, the sticky scenes (Selected Work, Services, Process, Client
Feedback) do not render their stage at all when motion is off. They fall back to
the list layouts at every width, because a stage that cannot advance would
strand every item after the first.

## The 3D hero object is parked

`components/webgl/` and `components/hero/HeroVisual.tsx` are still in the repo
but nothing mounts them, so `three` is no longer bundled at all.

It was removed because the canvas sized itself from its container while the
container was `height: 100%` inside the hero grid — each resize fed the next and
the cell crept downward during scroll. To bring it back, mount it inside a box
with a **fixed aspect ratio or fixed pixel height**, never a percentage height,
and re-check that the hero row height stays constant while scrolling.

`three`, `@react-three/fiber` and `@react-three/drei` are kept in
`package.json` for that reason. Remove them if the 3D idea is abandoned.

## Logo

`components/ui/Logo.tsx` owns the asset. To swap it: replace `public/logo.png`
and update `LOGO_ASSET` (`src`, `width`, `height`). Only height is set in CSS,
so the proportions of the supplied lockup are preserved.

## Adding case-study pages

The data model already supports them: give a project a `caseStudyUrl` of
`/work/<slug>` and add `app/work/[slug]/page.tsx`. The project card links there
automatically once `isPlaceholder` is `false`.

## Arabic / RTL later

Copy is centralised in `data/`, the layout uses logical properties
(`padding-inline`, `margin-inline`) in the shared primitives, and `dir` is set
in one place on `<html>` in `app/layout.tsx`. No RTL UI is built yet, but
nothing in the layout blocks it.
