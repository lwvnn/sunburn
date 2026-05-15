# Portfolio — Architecture Plan (v2)

A wall of fire — made of constantly-shifting passages from books that shape your character — fills the bottom half of the screen. Your name sits in the top half as a draggable text element. Drag it into the fire; the flames bend to envelop it; after it sits in the fire for ≥3 seconds, it dissolves upward into rising particles. The page then transitions to a final view: just your name and "coming soon".

> **Changes from v1** (in response to review): the fire is now made of book passages (not single chars), which makes Pretext essential to the fire itself. The fire actively reaches toward the name. The dissolve only triggers after a 3-second submersion timer. Touch input is smoothed with a critically-damped spring so finger drags feel buttery, not jaggy. Keyboard interaction removed. Final view simplified.

---

## 1. Rendering surfaces

| Layer | Surface | Why |
|---|---|---|
| Fire (book-text flames) | Full-screen `<canvas>` | Per-glyph color/position control with thousands of glyphs/frame. |
| Name (top half) | Absolutely-positioned `<div>` over the canvas | Native pointer events, no a11y reinvention, easy CSS styling for the burning effect. |
| Particles (during dissolve) | Same canvas as fire | Shares the painter and rAF loop. |
| "Coming soon" view | DOM, fades in after dissolve | Just two text lines — no need for canvas. |

Canvas is sized to viewport with `devicePixelRatio` scaling. The DOM name's CSS coordinates map 1:1 to canvas coordinates after dpr math.

---

## 2. The fire — what it actually is

This is the biggest design choice and the one that makes Pretext essential.

**Concept.** The bottom half is divided into ~12–20 vertical **flame columns**. Each column is a long passage of text from a book the user provides (loaded from `src/corpus/*.txt`). The text is laid out vertically inside the column and **scrolls upward continuously**, creating the rising-flame motion. Per-glyph color and intensity come from a flickering noise field — bright yellow/white at the bottom, cooling through orange and red as text rises, fading to dark smoke at the top.

**Why this works as fire:**
- Upward scroll = rising flames
- Color gradient = heat dissipation
- Per-glyph noise modulation = flicker
- Occasional random char-swaps in hot zones = sparks / volatility
- Column width variation per row (using Pretext's variable-width API) = flame-shape irregularity, not rigid rectangles

**Why Pretext is essential here:**
- For each column, `prepareWithSegments(passage, FIRE_FONT)` once at boot per passage.
- Per frame per column: `layoutNextLineRange(prepared, cursor, lineWidth)` for each visible line, where `lineWidth` varies per line (driven by a noise field + envelopment toward the name). This is the variable-width API doing exactly what the README describes — flowing text around dynamic obstacles, per-line, every frame.
- `materializeLineRange` is called only for lines actually drawn this frame.
- No DOM measurement, no reflow — measurement happens inside Pretext's pure-arithmetic hot path.

**Column data structure:**
```
FlameColumn {
  passageIndex: number              // which book passage this column reads
  preparedHandle: PreparedTextWithSegments
  cursor: LayoutCursor              // where in the passage we currently are
  scrollOffset: number              // sub-pixel y offset for smooth scroll
  baseX: number                     // column's screen-x center
  baseWidth: number                 // column's natural width
  scrollSpeed: number               // px/sec — varies per column for parallax
  hueShift: number                  // small per-column color variation
}
```

When `cursor` runs past the end of the passage, it loops back to the start. To keep things visually live, every ~10 seconds a column may pick a different passage and re-`prepareWithSegments`.

**Corpus loading.** Plain text files in `src/corpus/`, imported as raw strings via Vite's `?raw` import. Each is a snippet (a few KB) — we don't need full books, just enough that no loop is visible within ~30 seconds.

---

## 3. State — what lives where

```
AppState {
  phase: 'idle' | 'dragging' | 'dissolving' | 'final'

  viewport: { w, h, dpr, fireTopY }   // fireTopY = h * 0.5

  name: {
    text: string
    font: string                       // e.g. 'bold 64px Inter'
    lineHeight: number
    preparedHandle: PreparedTextWithSegments    // Pretext, computed once
    glyphPositions: { char, x, y }[]   // local to name's top-left
    width: number
    height: number
    homePos: { x, y }                  // resting position
    inputPos: { x, y }                 // raw pointer target (touch / mouse)
    pos: { x, y }                      // smoothed render position (what the loop uses)
    velocity: { x, y }                 // for spring smoothing
    dragging: boolean
    pointerType: 'touch' | 'mouse' | 'pen'
    submergedTime: number              // seconds spent in fire (with hysteresis)
    charringLevel: number              // 0..1 — visual burn progress, derived from submergedTime
  }

  fire: {
    columns: FlameColumn[]
    passages: PreparedTextWithSegments[]  // pool, all prepared once
    palette: HotPalette                // sampled by (heat, noise) → rgba
    glyphCellH: number                 // line height in flames
    noiseField: NoiseFieldState        // tiny perlin-ish state, animates over time
  }

  particles: Particle[]
  dissolveStartedAt: number | null
  reducedMotion: boolean               // prefers-reduced-motion snapshot
}
```

One flat object. The rAF loop reads it; pointer handlers write to `name.inputPos`, `name.dragging`, `name.pointerType`. Everything else flows through the loop.

---

## 4. Pretext's role (updated)

| Where | Call | Frequency |
|---|---|---|
| Name | `prepareWithSegments(name.text, name.font)` | Once at boot |
| Name | `layoutWithLines(handle, ∞, lineHeight)` → derive per-glyph (x, y) | Once at boot, again on font/text change only |
| Fire | `prepareWithSegments(passage, FIRE_FONT)` for each book passage | Once per passage; pool reused across columns |
| Fire | `layoutNextLineRange(handle, cursor, lineWidth)` — variable width per line | Per visible line, every frame |
| Fire | `materializeLineRange(handle, range)` | Only for lines actually drawn |
| Final view | `prepare(text, font)` for "coming soon" sizing | Once |

**Pretext is essential to both the fire and the name.** Without it, the fire's per-line variable-width flow (which is what makes the flames bend and envelop) would require either DOM-measured text per frame (dead on perf) or pre-rendered fixed layouts (dead on visual life).

---

## 5. Touch & mouse — smoothed dragging

The user's requirement: touch drags must be smooth, with <500ms perceived delay, no jaggy snapping.

**Solution: critically-damped spring on the rendered position.**

- Pointer events update `name.inputPos` only (the raw target).
- Each rAF tick, the loop integrates `name.pos` toward `name.inputPos` with a spring:
  ```
  // Critically damped spring (no overshoot, asymptotic settle)
  const stiffness = pointerType === 'touch' ? 180 : 400
  const damping   = 2 * Math.sqrt(stiffness)   // critical damping
  const ax = stiffness * (inputPos.x - pos.x) - damping * velocity.x
  const ay = stiffness * (inputPos.y - pos.y) - damping * velocity.y
  velocity.x += ax * dt
  velocity.y += ay * dt
  pos.x += velocity.x * dt
  pos.y += velocity.y * dt
  ```
- Touch uses softer stiffness (≈300ms settle); mouse uses stiffer (≈100ms settle, basically imperceptible but kills micro-jitter).
- The loop applies `el.style.transform = translate3d(pos.x, pos.y, 0)` to the DOM name. Compositor-only transform; no layout.
- Collision uses `pos` (the smoothed value), not `inputPos`. This is intentional: the visual and the physics agree.

**Why a spring instead of `lerp(pos, target, k)`?** A pure lerp gives an exponential decay that never quite settles; a spring with critical damping settles cleanly and feels more "physical" — heavier objects feel heavier. Both are 4 lines of code; the spring is just better.

**Pointer capture** still happens on `pointerdown` so move events keep flowing when the finger leaves the name's bounds.

**Touch-action.** The name element gets `touch-action: none` to prevent the browser from hijacking touch for scrolling/zooming.

---

## 6. Fire envelops the name

When the name is over (or near) the fire, the flames reach toward it.

**Mechanism: per-line horizontal warp driven by a heat field around the name.**

For each flame column's currently-flowing lines, the per-line x-offset is biased toward the name's center:

```
// For each line at screen-y `y` in column at base-x `cx`:
const dx = name.pos.x + name.width / 2 - cx
const dy = y - (name.pos.y + name.height)   // distance below name's bottom
const proximity = exp(-(dy * dy) / (2 * 80 * 80))   // gaussian falloff vertically, σ=80px
const horizontalReach = clamp(dx, -120, 120) * proximity * envelopStrength
const lineXOffset = horizontalReach
const lineWidth   = baseWidth * (1 - 0.3 * proximity)   // narrow as it reaches
```

Result: lines closest below the name bend horizontally toward it, and narrow as they reach (so the column tapers like a real flame tongue). Lines far from the name flow straight up. The envelopment is continuous — no discrete state change — so it looks alive even when the name is just hovering.

**`envelopStrength`** ramps from 0 → 1 as the name enters the fire (over ~200ms), giving a "the flames notice you" feel. It also amplifies during the 3-second submersion (see §7).

**Heat boost.** Columns under the name also get hotter (palette shifted brighter), so the envelopment is both motion and color.

---

## 7. The 3-second submersion timer

Trigger condition for dissolve: name has been in the fire for ≥3 seconds of accumulated time.

**Definition of "in the fire":** the name's bounding box overlaps the fire region by more than 12 px (overlap = `nameRect.bottom - viewport.fireTopY > 12`).

**Hysteresis** so brief lifts don't lose all progress, but sustained removal does:
```
const inFire = nameRect.bottom - fireTopY > 12
if (inFire) {
  submergedTime += dt
} else {
  // Decay roughly half as fast as accumulation, so a 1s lift costs 0.5s
  submergedTime = max(0, submergedTime - dt * 0.5)
}
charringLevel = clamp(submergedTime / 3, 0, 1)
if (submergedTime >= 3) → enter 'dissolving'
```

**Visual feedback during the 3 seconds** so the user *sees* the timer rather than guessing:
- The name's color shifts from its base color → smoldering orange → near-black at the edges as `charringLevel` rises.
- The bottom edge of the name starts emitting tiny ember particles (a trickle, ramping with `charringLevel`).
- The DOM name gets a `text-shadow` glow that brightens with `charringLevel`.
- The fire's `envelopStrength` amplifies as `charringLevel` rises — flames wrap higher around the name, clearly committing.

If the user yanks the name out before 3s, all of this decays back to baseline. They feel the heat but escape.

---

## 8. The dissolve transition

Same as v1 in mechanics, only the trigger changed. On `submergedTime >= 3`:

1. **Spawn particles.** One per glyph at its current world position (`name.pos + glyphPositions[i]`).
2. Velocity: rising (`vy ∈ [-60, -140] px/s`), slight horizontal drift (`vx ∈ [-20, 20] px/s`).
3. Each particle: starts as the original glyph, swaps to a random char from the *current* hottest book passage at 60% life (so the name literally becomes the books), color interpolates name→yellow→red→smoke, alpha fades to 0 over ~1.5s.
4. **Hide the DOM name** with a 200ms opacity fade; particles started on the same pixels so the eye sees continuity.
5. Fire keeps burning underneath at maximum envelopment.
6. When the last particle dies (`particles.length === 0`), enter `'final'` phase.

---

## 9. The final view

Per the requirement: just the name and "coming soon".

- DOM container fades in (600ms), centered.
- Two lines: the name (large) and "coming soon" (smaller, lower opacity).
- Fire dims to ~25% opacity behind it — it stays alive as ambience but recedes.
- No interaction. End state.

The sized text uses Pretext's `prepare()` for accurate measurement so it's perfectly centered without DOM reads.

---

## 10. The render loop

One rAF, started at boot:

```
function frame(t) {
  requestAnimationFrame(frame)
  const dt = clamp((t - lastT) / 1000, 0, 1/30)   // cap dt at 33ms
  lastT = t

  // Always
  updateName(dt)              // spring smoothing → pos, velocity
  updateFire(dt)              // scroll cursors, animate noise field
  applyEnvelopment()          // recompute per-line warps based on name.pos
  applyCharring()             // update name.charringLevel CSS vars

  // Phase-gated
  if (phase === 'dragging' || phase === 'idle' && nameOverFire()) {
    updateSubmersion(dt)      // run the 3-second timer
    if (name.submergedTime >= 3) startDissolve(t)
  }
  if (phase === 'dissolving') {
    updateParticles(dt)
    if (particles.length === 0) startFinal()
  }

  // Render
  ctx.clearRect(0, 0, w, h)
  drawFire(ctx)               // each column flows lines via Pretext
  if (phase === 'dissolving') drawParticles(ctx)
  applyNameTransform()        // DOM transform from name.pos
}
```

DOM updates that happen outside the loop: pointer handlers writing to `inputPos`, the final view's CSS opacity transitions.

---

## 11. Resize handling

1. Resize canvas, recompute `viewport`.
2. Recompute fire columns: count from new width / desired column width. Re-distribute `baseX`. Existing `preparedHandle`s are reused — Pretext doesn't care about width, only the per-frame `lineWidth` argument does.
3. `name.homePos` recomputed (centered horizontally in top half).
4. Don't re-call any `prepareWithSegments`. All passages and the name handle stay valid.

---

## 12. Reduced motion (`prefers-reduced-motion: reduce`)

My choice: **honor it conservatively, not destructively**. The fire is the whole concept, so killing it entirely guts the page. But we can defang the motion:

- Fire scroll speed → 0 (text is static, just sits there with subtle color flicker — no rising motion).
- Noise field flicker amplitude reduced to ~20%.
- Envelopment effect disabled (no warping toward the name).
- Submersion timer reduced to 1 second instead of 3 (less time spent watching motion).
- Dissolve transition replaced with a 400ms cross-fade: name fades out, "coming soon" fades in. No particle storm.
- Spring smoothing on touch stays (it's an input-feel thing, not a decorative motion).

A user who actually has a vestibular condition gets a quiet, readable page. The metaphor (drag name into fire, name disappears, final view) survives intact.

Sampled once at boot via `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, stored in `AppState.reducedMotion`. Not subscribed live — settings changes mid-session are rare enough to ignore.

---

## 13. Mobile-specific concerns

- Tall narrow viewport: bottom-half fire + top-half name still works (this is the normal portrait layout we're already designing for).
- `touch-action: none` on the name so the page doesn't scroll while dragging.
- Lower default column count (e.g. 8 columns on phones vs 16 on desktop) — the per-line Pretext layout is cheap, but `fillText` calls add up.
- The smoothed-spring drag is critical here — raw touch coordinates are jittery on most phones.

---

## 14. Performance budget (rough)

- Fire: ~16 columns × ~40 visible lines × ~30 chars = ~19k `fillText` calls/frame. On desktop: fine. On mid-range phone: monitor; possible mitigation is glyph-atlas pre-rendering (draw chars to an offscreen canvas once, `drawImage` cells per frame).
- Pretext per frame: ~16 columns × ~40 `layoutNextLineRange` calls = 640 calls/frame. The README explicitly bills this as the variable-width hot path; it should be sub-millisecond.
- Particle peak: ~name.length × 1 (e.g. 12 particles for a 12-char name). Trivial.
- Spring + collision: O(1). Trivial.

If frame time creeps over 16ms on target devices, the column-count knob is the first thing to turn down.

---

## 15. File layout (proposed)

```
src/
  main.ts                  // boot, mounts canvas + DOM, starts rAF loop
  state.ts                 // AppState definition + small event emitter
  loop.ts                  // the rAF loop; orchestrates updates + draw
  fire/
    columns.ts             // FlameColumn lifecycle, scroll, passage cycling
    draw.ts                // per-column glyph rendering
    palette.ts             // heat → rgba lookup
    noise.ts               // tiny noise field
  name/
    prepare.ts             // Pretext setup, glyph position extraction
    drag.ts                // pointer handlers, spring smoothing
    char.ts                // charring CSS var updates
  particles/
    spawn.ts
    update.ts
    draw.ts
  final/
    view.ts                // "coming soon" DOM + fade-in
  corpus/
    *.txt                  // book passages, raw imports
```

---

## TL;DR (v2)

- **Surfaces:** one Canvas (fire + particles), one DOM div (draggable name), DOM final view ("name" + "coming soon").
- **Fire is book passages**, laid out per column with Pretext's variable-width API. Scrolls upward, flickers with a noise field, char-swaps for sparks. Pretext is essential here, not just for the name.
- **Touch dragging** uses a critically-damped spring on the rendered position so finger drags are smooth, never jaggy. Mouse uses a stiffer spring for micro-jitter rejection.
- **Fire envelops the name** continuously: per-line horizontal warp + width tapering toward the name's center, scaled by a Gaussian heat field.
- **Dissolve triggers after 3s submersion** (with hysteresis so brief lifts don't fully reset). Visual feedback: name chars char from base color → smoldering orange → near-black, ember particles trickle from the bottom, glow ramps up.
- **Final view:** name + "coming soon", fire dims behind it.
- **Reduced motion:** fire static, no envelopment warp, 1s submersion, dissolve becomes a cross-fade. Metaphor preserved, motion gone.
- **No keyboard interaction** (per request).
- **Single rAF loop** drives everything except raw pointer input and CSS transitions.
