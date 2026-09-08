# Mohammed Al-Hafiz — Portfolio

Personal portfolio for **Mohammed Al-Hafiz**, Creative Designer & WordPress Developer.

Bilingual (Arabic default, English at `/en`) · Next.js 15 App Router · React 19 ·
TypeScript · Tailwind CSS · GSAP + ScrollTrigger · Lenis · raw WebGL2.

```bash
npm run dev          # http://localhost:3210
npm run typecheck    # tsc --noEmit
npm run lint

npm run build:prod   # production build  -> .next-prod
npm run start:prod   # serve it          -> http://localhost:3211
```

> **Never run `npm run build` while `npm run dev` is running.** They share
> `.next`, so the build deletes the chunks the dev server is serving and it
> throws `MODULE_NOT_FOUND` on every request until restarted. `build:prod` and
> `start:prod` write to `.next-prod` for exactly this reason — use those.

---

## Environment

Copy `.env.example` to `.env.local` and fill it in. `.env.local` is gitignored;
**the same variables must also be set on the host**, or production falls back to
the placeholder domain.

| Variable | Effect if missing |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Site becomes unindexable.** Falls back to `https://example.com`, and `indexable` flips false → `robots.txt` serves `Disallow: /` and every page carries `noindex, nofollow`. |
| `CONTACT_TO_EMAIL` + `RESEND_API_KEY` | Contact form answers `501` and tells the visitor it is not connected. |
| `CONTACT_FROM_EMAIL` | Optional. Until the domain is DNS-verified in Resend, mail sends from Resend's shared `onboarding@resend.dev`, which is more likely to be filtered as spam. |
| `CONTACT_WEBHOOK_URL` | Alternative to Resend — POSTs the enquiry as JSON. |
| `NEXT_PUBLIC_ANALYTICS_ID` | Nothing loads. Analytics is opt-in. |

The `noindex` fallback is deliberate: a preview or temporary host must never
outrank the real domain.

---

## Bilingual architecture

Arabic is the **default** locale and is served **without a prefix**.

```
/         → rewritten internally to /ar    (URL stays "/")
/ar       → 308 redirect to /              (one canonical address per page)
/en       → served as-is
```

| File | Role |
| --- | --- |
| `lib/i18n.ts` | Locale list, default, `dir` map, `localePath()`. The single source of truth. |
| `middleware.ts` | The rewrite/redirect above. Metadata routes (`opengraph-image`, `icon`) are excluded — they are assets, and redirecting them made social crawlers take a 308 hop for the share card. |
| `data/content/en.ts` | **Defines the dictionary shape.** Deliberately not `as const`: a const assertion would make every value its own literal type and Arabic could never satisfy it. |
| `data/content/ar.ts` | Typed `Dictionary`, so a missing or renamed key **fails the build** instead of silently falling back to English. |
| `components/i18n/LocaleProvider.tsx` | `useLocale()` → `{ locale, dir, isRtl, t, fill, other }`. |

Facts (names, dates, employers, URLs) stay in `data/*.ts`, never in the
dictionaries, so a translation cannot quietly change one.

### Arabic typography — the non-obvious parts

Arabic is not "the same design, mirrored". Three things genuinely break:

1. **Negative letter-spacing.** Latin display type is tightened to `-0.045em`
   here. Arabic letters join; tightening collides the joins. Reset to `normal`.
2. **Positive letter-spacing** on micro labels (`0.18em`) pulls *connected*
   letters apart into disconnected glyphs. Reset to `normal`.
3. **Almarai has no weight between 400 and 700.** The design uses 500 for
   headings and 600 for the accent word, and CSS resolves a missing 500
   *downwards* — so Arabic headings silently rendered at body weight. The RTL
   block in `globals.css` restates every display level at a weight the family
   actually ships (700 headings, 800 accent, 700 for `.font-medium`).

Direction itself is handled by `dir` on `<html>` plus logical properties
(`ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`). Only what CSS cannot express
logically is listed in the RTL block: `transform-origin`, the hover underline
sweep, and the horizontal rail's travel direction.

---

## The hero water surface

`components/hero/RippleField.tsx` — a procedural gradient with a real fluid
surface on it, in raw WebGL2 (no three.js).

The height field integrates the **damped 2D wave equation** on the GPU with an
explicit finite-difference scheme, plus a **viscosity** term
(`nu * laplacian(v)`, the Navier–Stokes momentum diffusion) so short wavelengths
dissipate faster than long ones and ripples soften as they spread. Because the
medium is simulated rather than the individual ripples, interference and
reflection fall out for free.

- **`WAVE_SPEED` must stay ≤ 0.5.** It is the Courant number; the scheme is
  conditionally stable and diverges above the CFL limit. Held at 0.28.
- **`VISCOSITY` is the softness dial** (0.11; stable to 0.25).
- The pointer adds to **velocity**, not height — a momentum kick, which is why
  the disturbance leaves as an expanding ring. It is applied along the segment
  swept since the last frame, so fast movement leaves a continuous wake.
- Boundaries **absorb** via a sponge layer, so waves leave instead of echoing.
- **No opacity is ever applied to the text.** See the note in `lib/animations.ts`.

The canvas is `position: absolute; inset: 0` — out of flow, so it cannot feed
back into layout. An earlier WebGL hero measured its own container while the
container sized itself from content, and the hero grew on every resize.

Falls back to a matching CSS gradient under reduced motion or without WebGL2.
The reason is readable from the DOM as `data-ripple` on the host element.

---

## Motion rules the codebase enforces

- Every ScrollTrigger comes from a factory in `lib/animations.ts` and lives in a
  `gsap.context()`, so unmounting a section reverts what it created.
- Durations, easings, breakpoints and scroll distances live in `config/motion.ts`.
- No global `overwrite` default. Where two systems animate one region they target
  different elements: the hero entrance owns `[data-hero]`, the scroll transition
  owns `[data-hero-layer]`. Nothing is written by both.
- Scroll scenes are held by CSS `position: sticky`, **never GSAP `pin`**.
  ScrollTrigger reports progress and owns no layout, so a stale trigger can at
  worst leave an index wrong — it cannot make sections overlap.
- `body` uses `overflow-x: clip`, never `hidden`. `hidden` forces the other axis
  to `auto`, turning body into a scroll container and breaking sticky.
- The horizontal rail does **not** use `containerAnimation`. That technique
  assumes the container travels in the negative-x direction; in RTL the track
  travels positive and every panel froze at its from-state. Position is measured
  from the track's own `x`, so LTR and RTL run the identical code path.
- Reveals pre-hide elements only under `html[data-motion="on"]`, which requires
  JS to have run. JS off ⇒ nothing is hidden.

### Motion, degraded

Two conditions drop the motion layer, both leaving the site fully usable:

1. **`prefers-reduced-motion: reduce`**
2. **A stalled frame loop** — `MotionProvider` samples `requestAnimationFrame`
   for 2.5s. Below ~8fps on a *visible* tab it behaves as if reduced motion were
   requested. Hidden tabs are exempt and re-sampled when shown.

Sticky scenes do not render their stage at all when motion is off — they fall
back to list layouts at every width, because a stage that cannot advance would
strand every item after the first.

---

## Content rules

Deliberately **not** present anywhere in this codebase:

- employer names tied to job titles, or employment dates beyond the CV timeline
- degrees, certifications or awards that were not supplied
- revenue figures or project result metrics
- invented or paraphrased review text presented as a quotation

**Client reviews** (`data/testimonials.ts`) are quoted **verbatim** in the Arabic
the clients wrote, in a real `<blockquote>` with `lang`/`dir`. `textEn` is stored
separately and always labelled *Translation* — and is hidden from Arabic readers,
who do not need it. Client names, project titles and the source platform were
removed at Mohammed's request; **do not reintroduce them**, and do not add a
rating figure the site no longer shows a source for.

**Projects** (`data/projects.ts`) are nine live client sites, each linking to the
real thing. `technologies` were read from each site's actual markup. `year` is
`'—'` throughout because launch dates were never supplied, and a plausible year
would be an invented fact.

**Two family names.** Mohammed's full name is محمد أحمد الكمالي محمد الحافظ and
he uses **Al-Kamali** and **Al-Hafiz** interchangeably. The site is branded
Al-Hafiz, matching the logo; both are declared as `alternateName` in the JSON-LD
so the site stays findable under either. To rebrand, change `profile.name` only.

---

## SEO

- Arabic canonical is the bare domain; `hreflang` covers `ar`, `en` and
  `x-default`, emitted from both pages and inside `sitemap.xml`.
- `app/[locale]/opengraph-image.tsx` **generates** the 1200×630 share card at
  build time from the brand tokens. It is deliberately Latin-only: `ImageResponse`
  has no Arabic-capable font unless one is fetched and embedded, and missing
  glyphs would render as tofu.
- `sitemap.ts` reads `siteConfig.contentUpdatedAt`, **not** `new Date()`. Stamping
  the clock tells crawlers the content changed on every deploy, and they learn to
  distrust the field. Bump it when the copy actually changes.
- `app/icon.png` / `app/apple-icon.png` are the logo's "H" alone — the full
  wordmark is illegible at 16px and has the wrong aspect ratio for an icon slot.

---

## Architecture

```
app/
  [locale]/     layout (fonts, metadata, JSON-LD) · page · not-found · opengraph-image
  api/contact/  validation + delivery (Resend or webhook)
  sitemap.ts robots.ts globals.css icon.png apple-icon.png
middleware.ts   locale rewrite/redirect
config/         site.ts (URL, contact, analytics) · motion.ts (durations, easings, breakpoints)
data/
  content/      en.ts (shape) · ar.ts · index.ts (getDictionary, fill)
  profile · projects · services · expertise · experience · process · testimonials · social · images
lib/            i18n · gsap (registration, capability probes) · animations (ScrollTrigger factories) · contact (shared validation)
components/
  i18n/         LocaleProvider
  layout/       Navbar · Footer · SiteShell
  motion/       MotionProvider (Lenis + reduced motion + frame watchdog) · SplitText · Reveal · Parallax · MagneticButton
  hero/         Hero · RippleField
  projects/ services/ expertise/ experience/ process/ testimonials/ about/ contact/
  ui/           Logo · Button · Cursor · Preloader · SectionHeading · ImagePlaceholder
```

## Images

`data/images.ts` is the single source of truth for outstanding image slots. Every
slot renders a **numbered placeholder in the live page** stating its own required
size, so the site itself is the brief. Set `imageAlt` alongside any new `image` —
an empty alt is an accessibility regression.

Project screenshots and the portrait are supplied. The hero no longer takes an
image, and the share card is generated, so **nothing is outstanding**.

## Adding case-study pages

Give a project a `caseStudyUrl` of `/work/<slug>` and add
`app/work/[slug]/page.tsx`. The card links there automatically once
`isPlaceholder` is `false`.
