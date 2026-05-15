import './style.css'
import type { FireParams } from './fire'
import { createFire } from './fire'
import { mountControls } from './controls'
import { createName } from './name'
import { mountNameControls } from './name-controls'
import { createCursorEffect } from './cursor-effects'
import { mountCursorEffectControls } from './cursor-effects-controls'
import { createScrollArc } from './scroll-arc'
import { mountScrollArcControls } from './scroll-arc-controls'
import quotes from './corpus/quotes.json'

// ─── Corpus ────────────────────────────────────────────────────────────────
// Build the fire's text source by Fisher-Yates-shuffling the quotes pool
// once per page load and joining with a soft separator.  The fire renderer
// streams through this string linearly, but a fresh shuffle each session
// keeps the order surprising.
function shuffleAndJoin(pool: string[]): string {
  const a = pool.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.join(' ')
}
const corpus = shuffleAndJoin(quotes)

// ─── DOM ────────────────────────────────────────────────────────────────────

const canvas = document.querySelector<HTMLCanvasElement>('#fire')!
const ctx = canvas.getContext('2d', { alpha: true })!

// ─── Sizing (devicePixelRatio aware) ────────────────────────────────────────

function sizeCanvas(): { w: number; h: number } {
  const dpr = window.devicePixelRatio || 1
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { w, h }
}

let { w, h } = sizeCanvas()

// ─── Fire ───────────────────────────────────────────────────────────────────

const fire = createFire(corpus, w, h)
mountControls(fire)

const name = createName(w, h)
mountNameControls(name)
fire.setMask(name)

const cursorEffect = createCursorEffect()
mountCursorEffectControls(cursorEffect)
fire.setCursorEffect(cursorEffect)

const scrollArc = createScrollArc()
mountScrollArcControls(scrollArc)

// ─── Resize ─────────────────────────────────────────────────────────────────

let resizeRaf = 0
window.addEventListener('resize', () => {
  if (resizeRaf) return
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0
    const next = sizeCanvas()
    w = next.w
    h = next.h
    fire.resize(w, h)
    name.resize(w, h)
  })
})

// ─── Loop ───────────────────────────────────────────────────────────────────

// ── Pixelation overlay ────────────────────────────────────────────────────
// After fire + name have rendered, optionally downscale the whole canvas to
// a tiny offscreen with smoothing (averages CSS-pixel blocks), then upscale
// back over the main canvas with imageSmoothingEnabled=false to get hard
// nearest-neighbour blocks.  pixelSize is read live from fire's params, so
// the existing controls panel drives this with no extra plumbing.
const pxCanvas = document.createElement('canvas')
const pxCtx = pxCanvas.getContext('2d')!

function applyPixelation(): void {
  const ps = fire.getParams().pixelSize
  if (ps <= 1) return
  const fullW = canvas.width  // device pixels
  const fullH = canvas.height
  // "Pixel" size is expressed in CSS pixels — divide the CSS width.
  const smallW = Math.max(1, Math.floor(w / ps))
  const smallH = Math.max(1, Math.floor(h / ps))
  if (pxCanvas.width !== smallW)  pxCanvas.width  = smallW
  if (pxCanvas.height !== smallH) pxCanvas.height = smallH

  // Downscale (smoothing on → averages blocks for a cleaner pixel mosaic).
  pxCtx.imageSmoothingEnabled = true
  pxCtx.setTransform(1, 0, 0, 1, 0, 0)
  pxCtx.clearRect(0, 0, smallW, smallH)
  pxCtx.drawImage(canvas, 0, 0, fullW, fullH, 0, 0, smallW, smallH)

  // Replace the main canvas with a nearest-neighbour upscale of the small
  // buffer.  setTransform(1) so the drawImage destination rect is in
  // device pixels — covers the whole canvas regardless of DPR.
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, fullW, fullH)
  ctx.drawImage(pxCanvas, 0, 0, smallW, smallH, 0, 0, fullW, fullH)
  ctx.restore()
  ctx.imageSmoothingEnabled = true
}

// ── CRT scanline overlay ──────────────────────────────────────────────────
// Tiny `1 × spacing*dpr` pattern canvas with a single 1-device-pixel dark
// row at the top; the rest is transparent.  Painted as a fillStyle pattern
// over the entire main canvas after pixelation, so it sits on top of fire,
// name, glow, and any blocky pixelation — exactly like a real CRT mask.
//
// The pattern is cached and only rebuilt when opacity / spacing change, so
// the per-frame cost is one fillRect.
const slPatternCanvas = document.createElement('canvas')
const slPatternCtx = slPatternCanvas.getContext('2d')!
let slPattern: CanvasPattern | null = null
let slLastOpacity = -1
let slLastSpacing = -1
let slLastDpr = -1

function rebuildScanlinePattern(opacity: number, spacingCss: number): void {
  const dpr = window.devicePixelRatio || 1
  // Spacing in device pixels — 1 device-pixel-tall scanline every `spacingCss`
  // CSS pixels gives a crisp, DPR-aware stripe even on retina displays.
  const spacingDev = Math.max(2, Math.round(spacingCss * dpr))
  slPatternCanvas.width = 1
  slPatternCanvas.height = spacingDev
  slPatternCtx.clearRect(0, 0, 1, spacingDev)
  slPatternCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`
  slPatternCtx.fillRect(0, 0, 1, 1)
  slPattern = ctx.createPattern(slPatternCanvas, 'repeat')
  slLastOpacity = opacity
  slLastSpacing = spacingCss
  slLastDpr = dpr
}

function applyScanlines(): void {
  const p = fire.getParams()
  const opacity = p.scanlineOpacity
  const spacing = p.scanlineSpacing
  if (opacity <= 0 || spacing < 1) return
  const dpr = window.devicePixelRatio || 1
  if (
    !slPattern ||
    opacity !== slLastOpacity ||
    spacing !== slLastSpacing ||
    dpr !== slLastDpr
  ) {
    rebuildScanlinePattern(opacity, spacing)
  }
  if (!slPattern) return
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = slPattern
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
}

// ── Scroll snapping ───────────────────────────────────────────────────────
// Once the user scrolls past SNAP_THRESHOLD of the runway, ease the rest of
// the way to 100% after they stop interacting.  Scrolling upward (wheel
// delta < 0, touch drag back, or any scroll-event with decreasing scrollY)
// sets `userOverride` so the snap won't re-fire until the user goes back
// below the threshold.  Snap is cancellable mid-animation by wheel/touch.
const SNAP_THRESHOLD = 0.8
/** Idle time after the last scroll event before the snap fires (ms). */
const SNAP_DEBOUNCE_MS = 180
/** Spring stiffness (ω²).  Higher = quicker pull.  At critical damping
 *  (damping = 2·ω) the settle-to-1% time is ≈ 4.6/ω seconds, so
 *  stiffness = 6 ⇒ ≈ 1.88 s natural settle, longer with high initial velocity. */
const SNAP_STIFFNESS = 6
const SNAP_DAMPING = 2 * Math.sqrt(SNAP_STIFFNESS)
/** Settle thresholds: position within this many pixels AND velocity below
 *  this many px/s ⇒ snap is "done". */
const SNAP_SETTLE_DIST = 1
const SNAP_SETTLE_VEL = 1

let snapState: 'idle' | 'snapping' = 'idle'
let snapTargetY = 1
let snapVel = 0            // px / sec — spring's current velocity
let snapLastT = 0          // ms — last advance() timestamp, for dt
let scrollDebounceId: number | undefined
let lastScrollY = window.scrollY
let userOverride = false

function trySnap(): void {
  if (snapState !== 'idle') return
  if (userOverride) return
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (max <= 0) return
  const p = window.scrollY / max
  if (p < SNAP_THRESHOLD || p > 0.999) return
  snapState = 'snapping'
  snapLastT = performance.now()
  snapTargetY = max
  // Seed the spring with the current inertia velocity (per-frame → per-sec)
  // so the moment snap engages, the page is already moving at exactly the
  // speed the user left it at.  Then clear the inertia buffer so the two
  // systems don't both push on scrollY.
  snapVel = scrollVelocity * 60
  scrollVelocity = 0
}

window.addEventListener('scroll', () => {
  const y = window.scrollY
  const prevY = lastScrollY
  lastScrollY = y
  // Ignore scroll events caused by our own animation.
  if (snapState === 'snapping') return

  // Direction: upward user-scroll disables snap until p drops below threshold.
  if (y < prevY) userOverride = true
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (max > 0 && y / max < SNAP_THRESHOLD) userOverride = false

  // Debounced arm — fires snap after a short idle.
  window.clearTimeout(scrollDebounceId)
  scrollDebounceId = window.setTimeout(trySnap, SNAP_DEBOUNCE_MS)
}, { passive: false })

// ── Wheel inertia ────────────────────────────────────────────────────────
// We replace the browser's native wheel scrolling with our own velocity
// integrator: each wheel tick adds to a velocity buffer; updateInertia()
// applies it to window.scrollY each frame with exponential friction.  The
// page keeps gliding after the user stops scrolling.  Native scroll is
// suppressed (passive: false + preventDefault); touch still uses the
// platform's own inertial scrolling.
const SCROLL_FRICTION = 0.95  // per-frame velocity multiplier
const WHEEL_SCALE     = 0.25  // wheel delta → initial velocity factor
let scrollVelocity = 0

window.addEventListener('wheel', (e: WheelEvent) => {
  // Normalise to pixels — some browsers / inputs report lines or pages.
  const delta =
    e.deltaMode === 1 ? e.deltaY * 16 :
    e.deltaMode === 2 ? e.deltaY * window.innerHeight :
    e.deltaY
  // If the snap is currently driving the page, cancel it AND hand its
  // velocity back to the inertia buffer (snapVel is px/sec, inertia is
  // px/frame at ~60fps).  That keeps the motion continuous when the user
  // grabs control mid-snap.
  if (snapState === 'snapping') {
    scrollVelocity = snapVel / 60
    snapVel = 0
    snapState = 'idle'
  }
  scrollVelocity += delta * WHEEL_SCALE
  if (delta < 0) userOverride = true
  e.preventDefault()
}, { passive: false })

window.addEventListener('touchstart', () => {
  if (snapState === 'snapping') {
    snapState = 'idle'
    snapVel = 0
  }
  scrollVelocity = 0
}, { passive: true })

function updateInertia(): void {
  if (snapState === 'snapping') {
    scrollVelocity = 0
    return
  }
  if (Math.abs(scrollVelocity) < 0.1) {
    scrollVelocity = 0
    return
  }
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (max <= 0) { scrollVelocity = 0; return }
  let next = window.scrollY + scrollVelocity
  if (next < 0)        { next = 0;   scrollVelocity = 0 }
  else if (next > max) { next = max; scrollVelocity = 0 }
  window.scrollTo(0, next)
  scrollVelocity *= SCROLL_FRICTION
}

function advanceSnap(t: number): void {
  if (snapState !== 'snapping') return
  // dt in seconds, clamped so a paused tab / first-frame spike can't fire
  // the spring forward through the target in one step.
  const dt = Math.min(0.05, (t - snapLastT) / 1000)
  snapLastT = t
  const y = window.scrollY
  // Critically-damped spring physics, Euler integrated:
  //   F = -k·(y - target) - c·v        // pulls toward target, opposes velocity
  //   v += F · dt
  //   y += v · dt
  // With damping = 2·√k the system reaches the target without overshoot,
  // and any starting velocity (the inertia handoff) decays smoothly to zero.
  const force = SNAP_STIFFNESS * (snapTargetY - y) - SNAP_DAMPING * snapVel
  snapVel += force * dt
  let newY = y + snapVel * dt
  // Numerical guard against any tiny overshoot (when dt is large and v is
  // briefly going forward).
  if (newY > snapTargetY) newY = snapTargetY
  // setting scrollY via scrollTo fires a scroll event, but our handler
  // bails when snapState === 'snapping' so this stays self-contained.
  window.scrollTo(0, newY)
  // Settle: close enough AND slow enough → we're done.
  if (
    Math.abs(snapTargetY - newY) < SNAP_SETTLE_DIST &&
    Math.abs(snapVel) < SNAP_SETTLE_VEL
  ) {
    window.scrollTo(0, snapTargetY)
    snapVel = 0
    snapState = 'idle'
  }
}

// Arm once on load in case the browser restored a non-zero scrollY without
// firing a scroll event (some browsers don't on restoration).
scrollDebounceId = window.setTimeout(trySnap, SNAP_DEBOUNCE_MS)

/** Fraction of scroll over which the name fades in.  Matches MENU_FADE_RANGE
 *  (0.15) so the name and floating menu reveal together at the bottom of
 *  the runway.  Kept as its own literal to avoid a TDZ on module init, since
 *  MENU_FADE_RANGE is declared further down the file. */
const NAME_FADE_RANGE = 0.5

function frame(t: number): void {
  requestAnimationFrame(frame)
  // Order: snap first (overrides velocity → zeros it).  Then inertia.
  // Then the scroll-progress lerp reads whatever scrollY ended up at.
  advanceSnap(t)
  updateInertia()
  applyScrollProgress(t)
  ctx.clearRect(0, 0, w, h)
  fire.draw(ctx, t)

  // Publish the live (hue-rotated) tip palette colour to a CSS variable so
  // DOM widgets (e.g. the floating menu) can tint themselves to match the
  // corona's tips in real time.
  document.documentElement.style.setProperty(
    '--tip-color',
    fire.getCurrentTipColor(t),
  )

  // Name fade-in over the last NAME_FADE_RANGE of scroll.  The mask cutout
  // in the fire stays active throughout (so the dark name-shaped hole is
  // visible from the start) — only the rendered glyphs fade in.  We wrap
  // name.draw in save/restore so the alpha doesn't bleed into the
  // subsequent pixelation / scanline passes.
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  const sp = maxScroll > 0 ? clamp01(window.scrollY / maxScroll) : 0
  const nameAlpha = smoothstep(
    clamp01((sp - (1 - NAME_FADE_RANGE)) / NAME_FADE_RANGE),
  )
  if (nameAlpha > 0.001) {
    ctx.save()
    ctx.globalAlpha = nameAlpha
    name.draw(ctx, t)
    ctx.restore()
  }

  applyPixelation()
  applyScanlines()
}

requestAnimationFrame(frame)

// ─── Cursor interaction ─────────────────────────────────────────────────────
// Feed pointer position into the fire so flames recoil at the cursor and
// curl around it. Listening on window catches events even though the canvas
// has `pointer-events: none` (it sits below the draggable name + UI panel).

window.addEventListener('pointermove', (e: PointerEvent) => {
  fire.setCursor(e.clientX, e.clientY, true)
})

const releaseCursor = (): void => fire.setCursor(0, 0, false)
window.addEventListener('pointercancel', releaseCursor)
window.addEventListener('blur', releaseCursor)
// Mouse leaving the document → release. Touch lift fires pointerup; we
// also release there for touch, since mouse pointerup shouldn't stop hover.
document.addEventListener('mouseleave', releaseCursor)
window.addEventListener('pointerup', (e: PointerEvent) => {
  if (e.pointerType === 'touch') releaseCursor()
})

// ─── Scroll-driven sphere animation ─────────────────────────────────────────
// The body has min-height: 300vh (see style.css) so there's a "runway" of
// scroll to drive the fire's geometry.  Animation is keyframed: each
// keyframe pins a Partial<FireParams> at a specific scroll progress (0 =
// top, 1 = bottom).  At any progress we find the two bracketing keyframes,
// remap progress to a local 0..1 within that segment, ease it, and lerp
// the keys.
//
// Adding a new keyframe / param is just one line.  Sliders for scroll-
// driven keys go out of sync (scroll keeps overriding them) — treat them
// as read-only while scrolling drives the show.

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

// ── Intro overlay ────────────────────────────────────────────────────────
// On page load, flameRadialReach is forced to a 0 → 1 ramp over
// INTRO_DURATION_MS, independent of scroll.  Once the intro completes
// it stops overriding and the scroll-driven value (whatever the keyframes
// say) takes over.  introStartMs is set on the first frame so the timer
// is anchored to "when the rAF loop actually starts running", not to
// module evaluation time.
const INTRO_DURATION_MS = 2500
let introStartMs = -1

function applyScrollProgress(timeMs: number): void {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const raw = max > 0 ? window.scrollY / max : 0
  const p = clamp01(raw)

  // Keyframes come live from the scroll-arc store, so any edit in its
  // panel shows up next frame with no extra wiring.
  const kfs = scrollArc.getKeyframes()
  if (kfs.length < 2) return

  // Find the segment whose [at_i, at_{i+1}] contains p.
  let i = 0
  while (i < kfs.length - 1 && kfs[i + 1].at < p) i++
  const k1 = kfs[i]
  const k2 = kfs[Math.min(i + 1, kfs.length - 1)]
  const span = k2.at - k1.at
  // Local progress within this segment.  Smoothstep eases each segment
  // independently, so every keyframe boundary feels like a soft "settle".
  const localRaw = span > 1e-6 ? (p - k1.at) / span : 0
  const t = smoothstep(clamp01(localRaw))

  // Union of every key mentioned across these two keyframes only — keys
  // present in one segment but not another stay user-tunable elsewhere.
  const keys = new Set<string>([
    ...Object.keys(k1.params),
    ...Object.keys(k2.params),
  ])

  const interp: Partial<FireParams> = {}
  for (const key of keys) {
    const a = (k1.params as Record<string, number | undefined>)[key]
    const b = (k2.params as Record<string, number | undefined>)[key]
    if (typeof a === 'number' && typeof b === 'number') {
      ;(interp as Record<string, number>)[key] = a + (b - a) * t
    } else if (typeof a === 'number') {
      ;(interp as Record<string, number>)[key] = a
    } else if (typeof b === 'number') {
      ;(interp as Record<string, number>)[key] = b
    }
  }

  // Intro overlay: for the first INTRO_DURATION_MS after the rAF loop
  // starts, override flameRadialReach with a smoothstep-eased ramp from 0
  // up to whatever the scroll-driven value for THIS frame is (i.e. the
  // current interp value, which respects KF1 — or whatever segment the
  // user has scrolled into during the intro).  This way the hand-off
  // stays seamless even if the keyframes get edited live.
  if (introStartMs < 0) introStartMs = timeMs
  const introT = clamp01((timeMs - introStartMs) / INTRO_DURATION_MS)
  if (introT < 1) {
    const target = interp.flameRadialReach ?? 0
    interp.flameRadialReach = smoothstep(introT) * target
  }

  fire.setParams(interp)

  // ── Floating bottom menu fade ──────────────────────────────────────────
  // Smoothstep-eased ramp over the last MENU_FADE_RANGE of scroll.  Below
  // the ramp, the menu is fully transparent and non-interactive; above
  // halfway it accepts pointer events.  Pure CSS-variable write — cheap.
  const menuOpacity = smoothstep(
    clamp01((p - (1 - MENU_FADE_RANGE)) / MENU_FADE_RANGE),
  )
  if (menuOpacity !== lastMenuOpacity) {
    document.documentElement.style.setProperty('--menu-opacity', menuOpacity.toFixed(3))
    const interactive = menuOpacity > 0.5
    if (interactive !== lastMenuInteractive) {
      floatingMenu?.classList.toggle('interactive', interactive)
      lastMenuInteractive = interactive
    }
    lastMenuOpacity = menuOpacity
  }
}

/** Fraction of total scroll over which the bottom menu fades in.  0.15 =
 *  starts appearing at 85% scroll, fully solid at 100%. */
const MENU_FADE_RANGE = 0.15
const floatingMenu = document.getElementById('floating-menu')
let lastMenuOpacity = -1
let lastMenuInteractive = false
