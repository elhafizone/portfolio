# ORI Level 2: roaming companion + intelligent guide

Date: 2026-11-11 · Branch: `ori-level-2` · Status: draft for owner approval

## Intent

ORI (the 3D three.js character already live on hafizone.dev, Level 1) should feel like it *lives on the
page*, not like a sticker in a corner, and it should help a visitor find the right work or service.
The owner wants a smart interface that belongs to the site's UX, not a ChatGPT-style chat widget.

## What exists (Level 1, on `main`, live since 2026-11-09)

- `components/ori/OriCompanion.tsx` mounted in `components/layout/SiteShell.tsx` after the intro.
- `public/ori/ORI.glb` (1.6 MB, 13 clips: Idle_Float, Look_Around, Look_At_Target, Curious, Happy,
  Surprised, Think, Point, Present, Wave, Celebrate, Magic_Charge, Magic_Release) + face morphs via
  `components/ori/oriControls.ts`.
- Fixed box bottom-left (`fixed bottom-3 left-3`), `pointer-events: none`, reads document events;
  eyes/head follow pointer and hovered controls; blinks; waves on arrival; one reaction per section
  (`work, services, process, reviews, contact`); Celebrate when clicked; reduced motion = one still frame.

## Goals

### A. Roaming (owner's words: "it floats on the site and moves around even without scrolling; when you scroll it moves down")

1. **Free wandering, owner chose "freely" over "only important places".** While the visitor is idle,
   ORI flies between waypoints anywhere in the viewport, unhurried (a waypoint every ~4–8 s, travel
   ~1.5–3 s), with ease-in/out, a slight bank/tilt toward the travel direction, and Idle_Float playing.
2. **Scroll follow.** ORI stays on screen while scrolling but is *not glued*: scrolling pushes it
   (it lags with scroll velocity, as if dragged by air) then it drifts back to its path. When scrolling
   stops it resumes wandering.
3. **Section moments.** The existing section reactions stay; on the first entry of a section, ORI
   flies to a spot beside that section's heading/first card before playing the clip (Point at a
   project in `#work`, Present at `#services`, etc.).
4. **Never in the way.** The ORI box stays `pointer-events: none` except ORI's own hit area and the
   bubble. ORI avoids parking over the currently hovered/focused control and over the bubble; it never
   covers the navbar. Waypoint picking prefers side gutters at desktop widths but may cross the page.
5. **Mobile (< 768px).** Smaller box, slower, waypoints limited to the lower band of the screen.
6. **Reduced motion.** No roaming, no scroll lag: ORI stays still in the bottom corner (current behaviour).
7. **Pauses.** Pause the render loop when the tab is hidden; keep the current lazy loading.

### B. Guide (Level 2)

Interaction mode chosen by owner: **option 3 — ready buttons + free typing**.

1. **Opening.** Click/tap on ORI (or keyboard: a visually-hidden "Talk to ORI" button reachable by Tab)
   opens a speech bubble anchored next to ORI. While the bubble is open ORI stops wandering and parks
   so the bubble is fully on screen. Esc / close button / click outside closes it; wandering resumes.
2. **Greeting.** AR: "أهلاً، أنا ORI. تدوّر على شيء معيّن؟" · EN: "Hey, I'm ORI. Looking for something specific?"
   Language = the page locale (`ar` at `/`, `en` at `/en`); free-text replies follow the visitor's language.
3. **Ready buttons (no AI, instant, free).** Four chips, answered from local data:
   - أبغى متجر إلكتروني / I want an online store → service `woocommerce`
   - موقع لعيادة أو شركة / A site for a clinic or business → project `dr-helmi` (+ `pets-vet`)
   - موقع لعلامتي التجارية / A site for my brand → project `haboob`
   - ورّني أعمالك / Show me your work → scroll to `#work`, ORI flies there and Points
   Wording is my call; the owner can change it (see open questions).
4. **Replies.** One or two short sentences + 1–2 cards. A card shows type (project/service), title,
   one line, and an action: project → its `url` (new tab) or `caseStudyUrl` if set; service → scroll to
   `#services` (and highlight the matching item). ORI plays a matching clip (Present/Point/Happy) and
   mood while replying, Think while waiting.
5. **Free typing (AI).** Input under the chips, max 300 chars. Sent to a new route `app/api/ori/route.ts`
   which calls the Claude API (`claude-haiku-5-5`, cheapest/fastest) with:
   - a system prompt: ORI's persona (light, brief, helpful, the brand voice of Mohammed Al-Hafiz),
     the full catalogue built server-side from `data/projects.ts` + services copy from the dictionaries
     (ids, titles, categories, descriptions, both languages), and rules: recommend only catalogue items,
     max 2 items, reply in the visitor's language, 1–3 sentences, off-topic → polite redirect to the work.
   - the last ≤ 6 turns of this bubble session (kept in component state only, no storage).
   - structured output `{ reply: string, items: { type: 'project'|'service', id: string }[] }`;
     the server drops any id not in the catalogue.
   Rendering is the same card UI as the chips.
6. **Cost & abuse limits.** Per-IP in-memory limit (10 messages / hour) and a global daily cap
   (e.g. 300 requests/day) in the Node process; `max_tokens` ~300. Over the limit, or API error, or
   missing key → ORI answers with a friendly fallback line + the four chips again. No streaming needed.
7. **Key.** `ANTHROPIC_API_KEY` server env var only (never `NEXT_PUBLIC_`), added to `.env.example`.
   The owner creates the key in the Anthropic Console and pastes it into Hostinger's environment
   variables himself; Claude only explains the steps. If the key is absent the free-text box is hidden.

## Non-goals

- Level 3: asking for project details, building a brief, sending leads to WhatsApp/email.
- Saving conversations, analytics on chats, accounts.
- Changing the GLB, the character's look, or the colour calibration question (still open from Level 1).
- Recommending anything not on the site (old spec's SAN-MIA / WanderMetric / Egittosi are not in `data/projects.ts`).

## Anti-goals (failure even if it "works")

- Looks/behaves like a generic chatbot widget (bubble icon, big chat panel, "How can I help you today?").
- ORI blocks a click, hides text the visitor is reading for long, or makes the page janky/slow
  (Lighthouse performance on the homepage must not drop noticeably; no extra JS on first load).
- ORI invents projects, prices, or promises.
- Broken RTL: the bubble must use logical properties, `dir` from the locale, Arabic font/line-height.

## Constraints

- Next.js 15 app router, React 19, three 0.170, Tailwind, GSAP already present. No new runtime
  dependency except the official `@anthropic-ai/sdk` (server only).
- Bilingual AR (default, RTL) / EN; copy for chips/greeting/fallbacks lives in `data/content/ar.ts` / `en.ts`.
- Hosting: Hostinger Node.js app; never push or deploy without the owner's explicit approval.
- Accessibility: bubble is a labelled dialog-like region, focus moves into it on open and back on
  close, chips are real buttons, live region announces ORI's reply.

## Decisions settled after builder check (my calls, owner may override)

- **Other pages (articles).** ORI roams everywhere `SiteShell` mounts it. Chips/cards that target
  homepage anchors navigate to `/{locale}#work` or `/{locale}#services` (`/en#…` for English); on
  arrival ORI flies to the target. No bubble state survives the navigation. Section moments only run
  where the sections exist.
- **Limits are best-effort.** In-memory limits may reset on a Hostinger restart or multiply across
  workers; the hard cost ceiling is a monthly spend limit the owner sets in the Anthropic Console
  (part of the key setup steps). No external store.
- **Privacy line.** One small line under the input: AR "رسالتك تُعالَج بالذكاء الاصطناعي ولا تُحفَظ." /
  EN "Your message is processed by AI and not stored."
- **Guide without 3D.** The "Talk to ORI" button and bubble work before the GLB loads, if WebGL
  fails, and under reduced motion (ORI still, bubble opens normally). Guide UI code is lazy-loaded
  after the intro, like the scene, so first-load JS doesn't grow.
- **Celebrate.** Clicking ORI opens the bubble and plays Wave + happy mood (greeting); Celebrate
  moves to when a visitor opens a recommended card.

## Open questions for the owner

- Chip wording and which project/service each chip shows (current wording is my guess).
- The calibrated-vs-literal colours question from Level 1 (out of scope here, still open).

## Left to the builder

- Waypoint algorithm, easing curves, exact timings, scroll-lag spring constants.
- Whether to move the canvas box via CSS transform on the wrapper (preferred: compositor-only) vs
  moving the camera.
- Bubble visual design within the site's existing design language (its colours, type, radii).
- Splitting OriCompanion into smaller modules (roam, guide UI, three scene).
