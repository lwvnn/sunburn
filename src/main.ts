import "./style.css";
import defaultSettings from "./default-settings.json";

// Seed localStorage with the designed defaults on every load so visitors
// always see the intended visual style, even if they previously tweaked
// values via the dev control panels.
for (const [key, value] of Object.entries(defaultSettings)) {
  localStorage.setItem(key, value as string);
}

import type { FireParams } from "./fire";
import { createFire } from "./fire";
import { mountControls } from "./controls";
import { createName } from "./name";
import { mountNameControls } from "./name-controls";
import { createCursorEffect } from "./cursor-effects";
import { mountCursorEffectControls } from "./cursor-effects-controls";
import { createScrollArc } from "./scroll-arc";
import { mountScrollArcControls } from "./scroll-arc-controls";
import { mountPostFxControls } from "./post-fx-controls";
import { firePhaseFor } from "./sections";
import { NUMERIC_KEYS } from "./scroll-arc";
import { mountSectionNav } from "./section-nav";
import quotes from "./corpus/quotes.json";
import quotesCaps from "./corpus/quotes_caps.json";

// ─── Corpus ────────────────────────────────────────────────────────────────
// Build the fire's text source by Fisher-Yates-shuffling the quotes pool
// once per page load and joining with a soft separator.  The fire renderer
// streams through this string linearly, but a fresh shuffle each session
// keeps the order surprising.
function shuffleAndJoin(pool: string[]): string {
  const a = pool.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join(" • ");
}
const corpus = shuffleAndJoin(quotes);

// ─── DOM ────────────────────────────────────────────────────────────────────

const canvas = document.querySelector<HTMLCanvasElement>("#fire")!;
const ctx = canvas.getContext("2d", { alpha: true })!;

// ─── Sizing (devicePixelRatio aware) ────────────────────────────────────────

function sizeCanvas(): { w: number; h: number } {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

let { w, h } = sizeCanvas();

// ─── Fire ───────────────────────────────────────────────────────────────────

const fire = createFire(corpus, w, h);

const name = createName(w, h);
mountNameControls(name);
// Name is now a pure DOM overlay (see syncNameDOM below) rather than a
// canvas-rendered mask cutout — no fire-interaction wiring.

const cursorEffect = createCursorEffect();
mountCursorEffectControls(cursorEffect);
fire.setCursorEffect(cursorEffect);

const centerRepelEffect = createCursorEffect();
centerRepelEffect.setParams({
  effect: "repel",
  fieldR: 1550,
  amp: 73,
  noiseAmp: 0.0,
  fadeSpeed: 0.5,
});

const sideRepelParams = {
  effect: "repel" as const,
  fieldR: 250,
  amp: 50,
  noiseAmp: 0.0,
  fadeSpeed: 0.5,
  squint: 0.45,
};

const leftRepelEffect = createCursorEffect();
leftRepelEffect.setParams(sideRepelParams);

const rightRepelEffect = createCursorEffect();
rightRepelEffect.setParams(sideRepelParams);

const scrollArc = createScrollArc();
mountControls(fire, scrollArc);
mountScrollArcControls(scrollArc);
mountPostFxControls(fire);
mountSectionNav(scrollArc);

// Body height grows / shrinks with the checkpoint count so each section
// gets its own slice of scroll runway.  `--runway-per-section-vh` is the
// per-checkpoint travel; total height = (N - 1) × that + 100vh viewport
// (the trailing viewport is the destination of the last checkpoint).
function syncRunwayHeight(): void {
  const n = scrollArc.getKeyframes().length;
  const perSection = 200; // vh per gap between checkpoints
  const totalVh = Math.max(100, (n - 1) * perSection + 100);
  document.body.style.minHeight = `${totalVh}vh`;
}
syncRunwayHeight();
scrollArc.subscribe(syncRunwayHeight);

// ─── Resize ─────────────────────────────────────────────────────────────────

let resizeRaf = 0;
window.addEventListener("resize", () => {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    const next = sizeCanvas();
    w = next.w;
    h = next.h;
    fire.resize(w, h);
    name.resize(w, h);
  });
});

// ─── Loop ───────────────────────────────────────────────────────────────────

// ── Pixelation overlay ────────────────────────────────────────────────────
// After fire + name have rendered, optionally downscale the whole canvas to
// a tiny offscreen with smoothing (averages CSS-pixel blocks), then upscale
// back over the main canvas with imageSmoothingEnabled=false to get hard
// nearest-neighbour blocks.  pixelSize is read live from fire's params, so
// the existing controls panel drives this with no extra plumbing.
const pxCanvas = document.createElement("canvas");
const pxCtx = pxCanvas.getContext("2d")!;

function applyPixelation(): void {
  const ps = fire.getParams().pixelSize;
  if (ps <= 1) return;
  const fullW = canvas.width; // device pixels
  const fullH = canvas.height;
  // "Pixel" size is expressed in CSS pixels — divide the CSS width.
  const smallW = Math.max(1, Math.floor(w / ps));
  const smallH = Math.max(1, Math.floor(h / ps));
  if (pxCanvas.width !== smallW) pxCanvas.width = smallW;
  if (pxCanvas.height !== smallH) pxCanvas.height = smallH;

  // Downscale (smoothing on → averages blocks for a cleaner pixel mosaic).
  pxCtx.imageSmoothingEnabled = true;
  pxCtx.setTransform(1, 0, 0, 1, 0, 0);
  pxCtx.clearRect(0, 0, smallW, smallH);
  pxCtx.drawImage(canvas, 0, 0, fullW, fullH, 0, 0, smallW, smallH);

  // Replace the main canvas with a nearest-neighbour upscale of the small
  // buffer.  setTransform(1) so the drawImage destination rect is in
  // device pixels — covers the whole canvas regardless of DPR.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, fullW, fullH);
  ctx.drawImage(pxCanvas, 0, 0, smallW, smallH, 0, 0, fullW, fullH);
  ctx.restore();
  ctx.imageSmoothingEnabled = true;
}

// ── CRT scanline overlay ──────────────────────────────────────────────────
// Tiny `1 × spacing*dpr` pattern canvas with a single 1-device-pixel dark
// row at the top; the rest is transparent.  Painted as a fillStyle pattern
// over the entire main canvas after pixelation, so it sits on top of fire,
// name, glow, and any blocky pixelation — exactly like a real CRT mask.
//
// The pattern is cached and only rebuilt when opacity / spacing change, so
// the per-frame cost is one fillRect.
const slPatternCanvas = document.createElement("canvas");
const slPatternCtx = slPatternCanvas.getContext("2d")!;
let slPattern: CanvasPattern | null = null;
let slLastOpacity = -1;
let slLastSpacing = -1;
let slLastDpr = -1;

function rebuildScanlinePattern(opacity: number, spacingCss: number): void {
  const dpr = window.devicePixelRatio || 1;
  // Spacing in device pixels — 1 device-pixel-tall scanline every `spacingCss`
  // CSS pixels gives a crisp, DPR-aware stripe even on retina displays.
  const spacingDev = Math.max(2, Math.round(spacingCss * dpr));
  slPatternCanvas.width = 1;
  slPatternCanvas.height = spacingDev;
  slPatternCtx.clearRect(0, 0, 1, spacingDev);
  slPatternCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  slPatternCtx.fillRect(0, 0, 1, 1);
  slPattern = ctx.createPattern(slPatternCanvas, "repeat");
  slLastOpacity = opacity;
  slLastSpacing = spacingCss;
  slLastDpr = dpr;
}

function applyScanlines(): void {
  const p = fire.getParams();
  const opacity = p.scanlineOpacity;
  const spacing = p.scanlineSpacing;
  if (opacity <= 0 || spacing < 1) return;
  const dpr = window.devicePixelRatio || 1;
  if (
    !slPattern ||
    opacity !== slLastOpacity ||
    spacing !== slLastSpacing ||
    dpr !== slLastDpr
  ) {
    rebuildScanlinePattern(opacity, spacing);
  }
  if (!slPattern) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = slPattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

// ── White-noise grain overlay ────────────────────────────────────────────
// A small offscreen tile of random white pixels is regenerated every
// `grainSpeed` frames and tiled across the canvas with additive blending.
// Cheap because the tile is tiny (TILE × TILE) — the additive blit is the
// only per-frame cost and it's a single fillRect.
const GRAIN_TILE = 256;
const grainCanvas = document.createElement("canvas");
grainCanvas.width = GRAIN_TILE;
grainCanvas.height = GRAIN_TILE;
const grainCtx = grainCanvas.getContext("2d")!;
let grainPattern: CanvasPattern | null = null;
let grainFrameCounter = 0;

function rebuildGrainTile(): void {
  // Each pixel: chance to be a bright speck; otherwise transparent.  The
  // alpha distribution skews bright, giving a sparse "shot noise" feel
  // rather than a uniform haze (which 'lighter' would wash out anyway).
  const img = grainCtx.createImageData(GRAIN_TILE, GRAIN_TILE);
  const data = img.data;
  for (let i = 0; i < GRAIN_TILE * GRAIN_TILE; i++) {
    const v = Math.random();
    // ~40 % of pixels are lit; the rest stay transparent.
    const alpha = v < 0.6 ? 0 : Math.round((v - 0.6) * 2.5 * 255);
    const idx = i * 4;
    data[idx] = 255;
    data[idx + 1] = 255;
    data[idx + 2] = 255;
    data[idx + 3] = alpha;
  }
  grainCtx.putImageData(img, 0, 0);
  grainPattern = ctx.createPattern(grainCanvas, "repeat");
}

function applyGrain(): void {
  const p = fire.getParams();
  if (p.grainOpacity <= 0) return;
  const reshuffleEvery = Math.max(1, Math.round(p.grainSpeed));
  if (!grainPattern || grainFrameCounter >= reshuffleEvery) {
    rebuildGrainTile();
    grainFrameCounter = 0;
  } else {
    grainFrameCounter++;
  }
  if (!grainPattern) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // Optional chunkier grain: when grainScale > 1 the pattern is upscaled
  // by that factor, producing larger "pixels" of noise.
  const scale = Math.max(1, p.grainScale | 0);
  if (scale !== 1) ctx.scale(scale, scale);
  ctx.globalAlpha = p.grainOpacity;
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grainPattern;
  ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
  ctx.restore();
}

// ── Wheel inertia ────────────────────────────────────────────────────────
// Native wheel scrolling is replaced by a velocity integrator.  Inertia
// is time-based so the page moves at the same speed regardless of frame
// rate — a heavy fire-rendering segment doesn't make scrolling feel stiffer.
//
// scrollVelocity is stored in "px per 60fps-frame" to keep the wheel-delta
// scale familiar; advance/decay are normalised by dt × 60.
const SCROLL_FRICTION = 0.95; // per 60fps-frame
const WHEEL_SCALE = 0.25;
let scrollVelocity = 0;
let inertiaLastT = performance.now();

window.addEventListener(
  "wheel",
  (e: WheelEvent) => {
    const delta =
      e.deltaMode === 1
        ? e.deltaY * 16
        : e.deltaMode === 2
          ? e.deltaY * window.innerHeight
          : e.deltaY;
    scrollVelocity += delta * WHEEL_SCALE;
    e.preventDefault();
  },
  { passive: false },
);

window.addEventListener(
  "touchstart",
  () => {
    scrollVelocity = 0;
  },
  { passive: true },
);

function updateInertia(t: number): void {
  // dt in 60fps-equivalent frames.  Clamped so a paused tab / first frame
  // can't fling the page forward.
  const dt60 = Math.min(4, ((t - inertiaLastT) / 1000) * 60);
  inertiaLastT = t;
  if (Math.abs(scrollVelocity) < 0.1) {
    scrollVelocity = 0;
    return;
  }
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) {
    scrollVelocity = 0;
    return;
  }
  let next = window.scrollY + scrollVelocity * dt60;
  if (next < 0) {
    next = 0;
    scrollVelocity = 0;
  } else if (next > max) {
    next = max;
    scrollVelocity = 0;
  }
  window.scrollTo(0, next);
  scrollVelocity *= Math.pow(SCROLL_FRICTION, dt60);
}

let globalStrobeFramesLeft = 0;
let hasStrobed = false;
// removed sideEyesVelocity
let targetLeftOpen = 0;
let leftEyeActual = 0;
let leftEyeVelocity = 0;

let targetRightOpen = 0;
let rightEyeActual = 0;
let rightEyeVelocity = 0;

let hasTriggeredEnding = false;

function triggerEndingSequence(collected: {
  main: string[];
  left: string[];
  right: string[];
}) {
  const endDiv = document.createElement("div");
  endDiv.id = "collected-columns";

  const col = document.createElement("div");
  col.className = "word-col";
  col.style.color = "#ffffff";

  const allWords = [...collected.main, ...collected.left, ...collected.right];

  allWords.forEach((w) => {
    const el = document.createElement("div");
    el.textContent = w;
    col.appendChild(el);
  });

  endDiv.appendChild(col);

  // Create marquee container
  const marqueeContainer = document.createElement("div");
  marqueeContainer.className = "marquee-container";

  const createMarqueeTrack = (sizeClass: string, reverse: boolean = false) => {
    const track = document.createElement("div");
    track.className = `marquee-track ${sizeClass} ${reverse ? "reverse" : ""}`;

    const createContent = () => {
      const content = document.createElement("div");
      content.className = "marquee-content";

      const addSeparator = () => {
        const sep = document.createElement("span");
        sep.textContent = "•";
        sep.style.color = "rgba(255, 255, 255, 0.3)";
        content.appendChild(sep);
      };

      const addWords = (words: string[]) => {
        words.forEach((w) => {
          const span = document.createElement("span");
          span.textContent = w;
          span.style.color = "#ffffff";
          content.appendChild(span);
          addSeparator();
        });
      };
      
      addWords(quotesCaps);

      return content;
    };

    track.appendChild(createContent());
    track.appendChild(createContent());
    return track;
  };

  marqueeContainer.appendChild(createMarqueeTrack("track-large"));
  marqueeContainer.appendChild(createMarqueeTrack("track-small", true)); // reverse direction for variety
  marqueeContainer.appendChild(createMarqueeTrack("track-small"));

  endDiv.appendChild(marqueeContainer);

  document.body.appendChild(endDiv);
}

function frame(t: number): void {
  requestAnimationFrame(frame);
  updateInertia(t);
  applyScrollProgress(t);
  ctx.clearRect(0, 0, w, h);
  // ── Fire pass ────────────────────────────────────────────────────────
  fire.draw(ctx, t);

  // Publish the live (hue-rotated) tip palette colour to a CSS variable so
  // DOM widgets (e.g. the floating menu) can tint themselves to match the
  // corona's tips in real time.
  document.documentElement.style.setProperty(
    "--tip-color",
    fire.getCurrentTipColor(t),
  );

  // Name fades from 0 → 1 between checkpoint 0 and checkpoint 1,
  // then stays at 1 for all subsequent checkpoints.
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const sp = maxScroll > 0 ? clamp01(window.scrollY / maxScroll) : 0;
  const arcKfsFrame = scrollArc.getKeyframes();
  const fadeEnd = arcKfsFrame.length >= 2 ? arcKfsFrame[1].at : 1.0;
  const nameAlpha = fadeEnd > 1e-6 ? clamp01(sp / fadeEnd) : 1;
  syncNameDOM(nameAlpha);

  applyPixelation();
  applyScanlines();
  applyGrain();

  // One-time global strobe flash when first hovering over the central eye
  if (fire.isInProgressEyeHovered() && !hasStrobed) {
    hasStrobed = true;
    globalStrobeFramesLeft = 11; // 11 frames of strobing (a bit longer)
  }

  if (globalStrobeFramesLeft > 0) {
    globalStrobeFramesLeft--;
    document.body.style.filter =
      globalStrobeFramesLeft % 2 === 0 ? "invert(100%)" : "none";
  } else {
    document.body.style.filter = "none";
  }
}

// ─── Name overlay (DOM, not canvas) ────────────────────────────────────────
const nameEl = document.getElementById("name");
let lastNameKey = "";
let lastNameColor = "";
let lastNameOpacity = -1;

/** Push the current name params + opacity to the DOM `#name` element.
 *  Diff-based so identical frames stop short of touching the DOM (style
 *  writes trigger layout in some browsers). */
function syncNameDOM(opacity: number): void {
  if (!nameEl) return;
  const np = name.getParams();
  // Compose a "layout key" — text + font + position.  When it doesn't
  // change frame-to-frame we skip the matching style writes entirely.
  const key =
    np.text +
    "|" +
    np.fontFamily +
    "|" +
    np.fontSize +
    "|" +
    np.fontWeight +
    "|" +
    np.letterSpacing +
    "|" +
    np.cxFrac +
    "|" +
    np.cyFrac +
    "|" +
    np.scaleX +
    "|" +
    np.scaleY;
  if (key !== lastNameKey) {
    nameEl.textContent = np.text;
    nameEl.style.font = `${np.fontWeight} ${np.fontSize}px ${np.fontFamily}`;
    nameEl.style.letterSpacing = `${np.letterSpacing}px`;
    nameEl.style.left = `${np.cxFrac * 100}vw`;
    nameEl.style.top = `${np.cyFrac * 100}vh`;
    // Centring translate first, then independent X/Y scale — order matters
    // (scale happens around the already-centred origin so the name keeps
    // its centre at cxFrac / cyFrac regardless of how stretched it is).
    nameEl.style.transform = `translate(-50%, -50%) scale(${np.scaleX}, ${np.scaleY})`;
    lastNameKey = key;
  }
  if (opacity !== lastNameOpacity) {
    nameEl.style.opacity = opacity.toFixed(3);
    lastNameOpacity = opacity;
  }
  // Use the user's chosen colour straight from name params.
  if (np.color !== lastNameColor) {
    nameEl.style.color = np.color;
    lastNameColor = np.color;
  }
}

requestAnimationFrame(frame);

// ─── Cursor interaction ─────────────────────────────────────────────────────
// Feed pointer position into the fire so flames recoil at the cursor and
// curl around it. Listening on window catches events even though the canvas
// has `pointer-events: none` (it sits below the draggable name + UI panel).

window.addEventListener("pointermove", (e: PointerEvent) => {
  fire.setCursor(e.clientX, e.clientY, true);
});

const releaseCursor = (): void => fire.setCursor(0, 0, false);
window.addEventListener("pointercancel", releaseCursor);
window.addEventListener("blur", releaseCursor);
// Mouse leaving the document → release. Touch lift fires pointerup; we
// also release there for touch, since mouse pointerup shouldn't stop hover.
document.addEventListener("mouseleave", releaseCursor);
window.addEventListener("pointerup", (e: PointerEvent) => {
  if (e.pointerType === "touch") releaseCursor();
});

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
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

// ── Intro overlay ────────────────────────────────────────────────────────
// On page load, flameRadialReach is forced to a 0 → 1 ramp over
// INTRO_DURATION_MS, independent of scroll.  Once the intro completes
// it stops overriding and the scroll-driven value (whatever the keyframes
// say) takes over.  introStartMs is set on the first frame so the timer
// is anchored to "when the rAF loop actually starts running", not to
// module evaluation time.
const INTRO_DURATION_MS = 2500;
let introStartMs = -1;

function applyScrollProgress(timeMs: number): void {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const raw = max > 0 ? window.scrollY / max : 0;
  const p = clamp01(raw);

  const firePhase = firePhaseFor(p);

  // Sync active checkpoint to whichever one is closest to the current
  // scroll position.  This is what the fire-controls panel writes into,
  // so scrolling between sections naturally switches "which checkpoint
  // is being edited" without the user having to click anything.
  const arcKfs = scrollArc.getKeyframes();
  if (arcKfs.length > 0) {
    let bestI = 0;
    let bestD = Math.abs(arcKfs[0].at - p);
    for (let k = 1; k < arcKfs.length; k++) {
      const d = Math.abs(arcKfs[k].at - p);
      if (d < bestD) {
        bestI = k;
        bestD = d;
      }
    }
    if (bestI !== scrollArc.getActiveIndex()) scrollArc.setActiveIndex(bestI);
  }

  // Keyframes come live from the scroll-arc store, so any edit in its
  // panel shows up next frame with no extra wiring.
  const kfs = scrollArc.getKeyframes();
  if (kfs.length < 2) return;

  // Find the segment whose [at_i, at_{i+1}] contains firePhase.
  let i = 0;
  while (i < kfs.length - 1 && kfs[i + 1].at < firePhase) i++;
  const k1 = kfs[i];
  const k2 = kfs[Math.min(i + 1, kfs.length - 1)];
  const span = k2.at - k1.at;
  // Linear blend within this segment — no easing.  Each checkpoint stores
  // a full snapshot of numeric FireParams (see scroll-arc.ts), so the
  // union/typecheck dance from the old partial-keys model is gone.
  const t = span > 1e-6 ? clamp01((firePhase - k1.at) / span) : 0;

  const interp: Partial<FireParams> = {};
  for (const key of NUMERIC_KEYS) {
    const a = k1.params[key];
    const b = k2.params[key];
    (interp as Record<string, number>)[key] = a + (b - a) * t;
  }

  // Intro overlay: for the first INTRO_DURATION_MS after the rAF loop
  // starts, override flameRadialReach with a smoothstep-eased ramp from 0
  // up to whatever the scroll-driven value for THIS frame is (i.e. the
  // current interp value, which respects KF1 — or whatever segment the
  // user has scrolled into during the intro).  This way the hand-off
  // stays seamless even if the keyframes get edited live.
  if (introStartMs < 0) introStartMs = timeMs;
  const introT = clamp01((timeMs - introStartMs) / INTRO_DURATION_MS);
  if (introT < 1) {
    const target = interp.flameRadialReach ?? 0;
    interp.flameRadialReach = smoothstep(introT) * target;
  }

  // Open the center repel hole over a longer duration so it opens slower,
  // using an "ease out back" curve for a slight overshoot.
  // We use an unbounded time fraction so the delayed animation can finish
  // even after introT caps at 1.0.
  const tFrac =
    introStartMs >= 0 ? (timeMs - introStartMs) / INTRO_DURATION_MS : 0;
  let u = clamp01((tFrac - 0.8) * 1.25); // Delayed start (1.6s), takes 1.6s to finish
  u = smoothstep(u); // Apply an ease-in so the opening starts slower
  const c1 = 1.2; // Lower coefficient for a gentler overshoot
  const c3 = c1 + 1;
  const easeOutBack = 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  const centerRepelStrength = u > 0 ? easeOutBack : 0;

  // Pupils start looking around slightly later, smoothly fading in
  // tFrac=1.2 is 2.4s (eyes halfway open), tFrac=1.8 is 3.6s
  let lookStrength = clamp01((tFrac - 1.2) * 1.66);
  lookStrength = smoothstep(lookStrength);

  const collected = fire.getCollectedWords();

  if (collected.main.length >= 5) {
    targetLeftOpen = 1;
  }
  if (collected.left.length >= 5) {
    targetRightOpen = 1;
  }

  // Left eye spring physics
  leftEyeVelocity += (targetLeftOpen - leftEyeActual) * 0.06;
  leftEyeVelocity *= 0.82;
  leftEyeActual += leftEyeVelocity;

  // Right eye spring physics
  rightEyeVelocity += (targetRightOpen - rightEyeActual) * 0.06;
  rightEyeVelocity *= 0.82;
  rightEyeActual += rightEyeVelocity;

  const leftStrength = centerRepelStrength * Math.max(0, leftEyeActual);
  const rightStrength = centerRepelStrength * Math.max(0, rightEyeActual);

  fire.setCenterRepels(
    centerRepelEffect,
    leftRepelEffect,
    rightRepelEffect,
    centerRepelStrength,
    lookStrength,
    leftStrength,
    rightStrength,
  );

  if (collected.right.length >= 5 && !hasTriggeredEnding) {
    hasTriggeredEnding = true;
    setTimeout(() => {
      triggerEndingSequence(collected);
    }, 400);
  }

  fire.setParams(interp);
}
