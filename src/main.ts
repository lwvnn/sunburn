import "./style.css";
import defaultSettings from "./default-settings.json";

// Seed localStorage with the designed defaults on every load so visitors
// always see the intended visual style, even if they previously tweaked
// values via the dev control panels.
for (const [key, value] of Object.entries(defaultSettings)) {
  localStorage.setItem(key, value as string);
}

// Always start at the top — otherwise a reload mid-page would strand the
// visitor inside the scroll-lock with no way to advance.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);
window.addEventListener("load", () => window.scrollTo(0, 0));

document.body.classList.add("ui-hidden");
window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "s" || e.key === "S" || e.key === "ы" || e.key === "Ы") {
    document.body.classList.toggle("ui-hidden");
  }
});

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
import quotesCapsLinked from "./corpus/quotes_caps_linked.json";

// Build the word → { phrase, source } lookup once at module init.  Last
// entry wins on duplicate words.  Empty phrase is a valid "no entry" —
// the stripe gate in fire.ts skips rendering when the phrase is empty.
type LinkedEntry = { phrase: string; source: string };
const linkedByWord = new Map<string, LinkedEntry>();
for (const e of quotesCapsLinked as ReadonlyArray<{
  word: string;
  phrase: string;
  source: string;
}>) {
  if (e.word && e.phrase) {
    linkedByWord.set(e.word, { phrase: e.phrase, source: e.source ?? "" });
  }
}
const EMPTY_LINKED: LinkedEntry = { phrase: "", source: "" };
function linkedForWord(w: string): LinkedEntry {
  return linkedByWord.get(w) ?? EMPTY_LINKED;
}

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
  // `squint` flattens the top of the repel hole — it made the eye taller
  // below center than above, so the geometric centre (where the pupil text
  // is drawn) sat in the upper portion of the visible hole and the pupil
  // couldn't appear to look down at the cursor.  Symmetric hole now.
};

const leftRepelEffect = createCursorEffect();
leftRepelEffect.setParams(sideRepelParams);

const rightRepelEffect = createCursorEffect();
rightRepelEffect.setParams(sideRepelParams);


// Decorative eyes — 5 non-interactive repel holes that pop open one at a
// time as the central eye collects coloured words, and all close once the
// central eye reaches 5.  Smaller field / amp than the side eyes so they
// read as a row of "subordinate" pupils.
const DECOR_EYE_COUNT = 5;
const decorRepelParams = {
  effect: "repel" as const,
  fieldR: 120,
  amp: 30,
  noiseAmp: 0.0,
  fadeSpeed: 0.5,
  squint: 0.45,
};
const decorEyeEffects = Array.from({ length: DECOR_EYE_COUNT }, () => {
  const e = createCursorEffect();
  e.setParams(decorRepelParams);
  return e;
});
const decorEyeActuals = new Array<number>(DECOR_EYE_COUNT).fill(0);
const decorEyeVelocities = new Array<number>(DECOR_EYE_COUNT).fill(0);

// ── Final-scene wall eyes ─────────────────────────────────────────────────
// 15 decor-style repel eyes laid out in a hex grid (3 rows × 5 cols, even
// rows offset by half a cell).  Each eye is bound to one of the 15
// collected words; on cursor hover the canvas pupil swaps from 'O' to
// that word.  Same rendering technique as the decorative eyes — repel
// hole punched into the fire, pupil drawn by fire.ts on top.
const WALL_EYE_COUNT = 15;
const wallRepelParams = {
  effect: "repel" as const,
  fieldR: 140,
  amp: 36,
  noiseAmp: 0.0,
  fadeSpeed: 0.5,
  squint: 0.45,
};
const wallEyeEffects = Array.from({ length: WALL_EYE_COUNT }, () => {
  const e = createCursorEffect();
  e.setParams(wallRepelParams);
  return e;
});
const wallEyeActuals = new Array<number>(WALL_EYE_COUNT).fill(0);
const wallEyeVelocities = new Array<number>(WALL_EYE_COUNT).fill(0);
const wallEyeWords: string[] = new Array<string>(WALL_EYE_COUNT).fill("");
let wallActive = false;
// Stripe state — smoothed 0..1 intensity (driven by whether the cursor is
// over a wall eye) and the bound phrase currently being displayed.  The
// phrase is NOT reset when the cursor leaves a hovered eye — we just let
// stripeActual fade to 0 with the old phrase still cached, so transitions
// look uniform.
let stripeActual = 0;
let stripePhrase = "";
let stripeSource = "";
// Hit-test radius for wall-eye hover.  Slightly larger than fire.ts's
// WALL_EYE_HOVER_R = 70 (which drives the in-canvas pupil swap) so the
// closing animation triggers a touch earlier than the word-swap.
const WALL_HOVER_R = 80;
// Chaotic-but-evenly-spaced wall positions, regenerated whenever the
// viewport size changes.  Poisson-disc-style rejection sampling: random
// candidates inside a padded viewport, rejected if closer than `minDist`
// to any already-placed eye.
let wallPositions: ReadonlyArray<{ x: number; y: number }> = [];
let wallPositionsW = 0;
let wallPositionsH = 0;

function generateWallPositions(
  vw: number,
  vh: number,
  isExcluded: (x: number, y: number) => boolean = () => false,
): ReadonlyArray<{ x: number; y: number }> {
  const padding = Math.min(vw, vh) * 0.1;
  // ~equal min-distance; tuned so 15 eyes comfortably fit a desktop
  // viewport without crowding.  Falls back to a relaxed value if the
  // first pass can't place all 15.
  let minDist = Math.min(vw, vh) * 0.22;
  const out: Array<{ x: number; y: number }> = [];
  for (let relax = 0; relax < 6 && out.length < WALL_EYE_COUNT; relax++) {
    out.length = 0;
    const md2 = minDist * minDist;
    let attempts = 0;
    while (out.length < WALL_EYE_COUNT && attempts < 5000) {
      attempts++;
      const x = padding + Math.random() * (vw - 2 * padding);
      const y = padding + Math.random() * (vh - 2 * padding);
      // Caller-supplied exclusion zone (central eye + name bbox).
      if (isExcluded(x, y)) continue;
      let ok = true;
      for (let k = 0; k < out.length; k++) {
        const dx = x - out[k].x;
        const dy = y - out[k].y;
        if (dx * dx + dy * dy < md2) {
          ok = false;
          break;
        }
      }
      if (ok) out.push({ x, y });
    }
    // If we couldn't place all 15, loosen the spacing requirement and
    // try again so we still hit exactly WALL_EYE_COUNT.
    minDist *= 0.9;
  }
  return out;
}

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
let scrollLocked = true;
// True only while the post-ending rAF carries the page down to the
// eye-wall; blocks user wheel / touch / key input so the smooth-scroll
// can't be fought.
let autoScrolling = false;

window.addEventListener(
  "wheel",
  (e: WheelEvent) => {
    e.preventDefault();
    if (scrollLocked || autoScrolling) {
      scrollVelocity = 0;
      return;
    }
    const delta =
      e.deltaMode === 1
        ? e.deltaY * 16
        : e.deltaMode === 2
          ? e.deltaY * window.innerHeight
          : e.deltaY;
    scrollVelocity += delta * WHEEL_SCALE;
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

window.addEventListener(
  "touchmove",
  (e: TouchEvent) => {
    if (scrollLocked || autoScrolling) e.preventDefault();
  },
  { passive: false },
);

window.addEventListener(
  "keydown",
  (e: KeyboardEvent) => {
    if (!scrollLocked && !autoScrolling) return;
    const blocked = [
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " ",
      "Spacebar",
    ];
    if (blocked.includes(e.key)) {
      e.preventDefault();
      scrollVelocity = 0;
    }
  },
  { passive: false },
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
// Eye-open order: central → left → right.  Central is open from the intro,
// left unlocks once central collects 5 words, right unlocks once left
// collects 5 words, ending fires once right collects 5 words.
let targetLeftOpen = 0;
let leftEyeActual = 0;
let leftEyeVelocity = 0;

let targetRightOpen = 0;
let rightEyeActual = 0;
let rightEyeVelocity = 0;

// Central eye stays closed for the first FIRST_EYE_DELAY_MS after the fire
// intro begins; flips to 1 once the delay elapses (see applyScrollProgress).
const FIRST_EYE_DELAY_MS = 8000;
let targetCenterOpen = 0;
let centerEyeActual = 0;
let centerEyeVelocity = 0;

// After the central eye collects its 5 words, hold the "completed" tableau
// for MAIN_HOLD_MS before transitioning: keeps all 5 decor eyes open, keeps
// the giant colored-word background visible, and defers the left-eye
// awakening — gives the user a beat to read what just appeared.
const MAIN_HOLD_MS = 1500;
let mainCompletedAt = -1;

let hasTriggeredEnding = false;

// "D" — debug jump straight to the final eye-wall.  Uses whatever has
// been collected so far; tops up to 15 placeholder words from quotesCaps
// so the wall is fully populated even when the user hasn't actually
// played through.
window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key !== "d" && e.key !== "D" && e.key !== "в" && e.key !== "В") return;
  if (hasTriggeredEnding) return;
  hasTriggeredEnding = true;
  const c = fire.getCollectedWords();
  const pickFiller = (existing: string[]): string[] => {
    const need = 5 - existing.length;
    const filler: string[] = [];
    while (filler.length < need) {
      const w =
        quotesCaps[(Math.random() * quotesCaps.length) | 0] as string;
      if (!existing.includes(w) && !filler.includes(w)) filler.push(w);
    }
    return [...existing, ...filler];
  };
  triggerEndingSequence({
    main: pickFiller(c.main),
    left: pickFiller(c.left),
    right: pickFiller(c.right),
  });
});

function triggerEndingSequence(collected: {
  main: string[];
  left: string[];
  right: string[];
}) {
  // Bind the 15 collected words to the 15 wall slots.  Order: main row,
  // left row, right row — mirrors the order eyes opened during the show.
  const allWords = [...collected.main, ...collected.left, ...collected.right];
  for (let i = 0; i < WALL_EYE_COUNT; i++) {
    wallEyeWords[i] = allWords[i] ?? "";
  }
  // Flip the wall on — applyScrollProgress will spring the strengths up
  // and pass an updated WallEye[] to fire each frame.
  wallActive = true;

  // Release the experience-wide scroll lock so the auto-scroll can write
  // scrollY freely, and put user input on the autoScrolling gate so
  // wheel / touch / arrow keys can't fight the animation.
  scrollLocked = false;
  autoScrolling = true;

  const startY = window.scrollY;
  const dur = 1700; // ms — slow enough to read as a deliberate transition.
  const t0 = performance.now();
  function step(t: number): void {
    const k = Math.min(1, (t - t0) / dur);
    // easeInOutCubic — soft start, soft stop.
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    // scrollHeight may shift slightly as layout settles; recompute each
    // step so we always land at the true bottom.
    const endY = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    window.scrollTo(0, startY + (endY - startY) * e);
    if (k < 1) {
      requestAnimationFrame(step);
    } else {
      autoScrolling = false;
    }
  }
  requestAnimationFrame(step);
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

// Mirror the latest pointer position locally — used by the wall-eye
// hover detection in applyScrollProgress (which needs cursor coords in
// the same module that owns the wall springs).
let mainCursorX = 0;
let mainCursorY = 0;
let mainCursorActive = false;
window.addEventListener("pointermove", (e: PointerEvent) => {
  mainCursorX = e.clientX;
  mainCursorY = e.clientY;
  mainCursorActive = true;
  fire.setCursor(e.clientX, e.clientY, true);
});

const releaseCursor = (): void => {
  mainCursorActive = false;
  fire.setCursor(0, 0, false);
};
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
// Hold the fire's grow-in until the black-screen phrase has faded out.
// Must match the `intro-phrase-fade` animation length in style.css.
const PHRASE_DURATION_MS = 13500;
const pageLoadMs = performance.now();
let introStartMs = -1;

// Remove the phrase overlay from the DOM once it has finished fading.
const phraseEl = document.getElementById("intro-phrase");
if (phraseEl) {
  setTimeout(() => phraseEl.classList.add("done"), PHRASE_DURATION_MS);
}

// "A" skips the opening-quote splash: marks the phrase overlay as done and
// arms the fire/eye intro to start on the very next frame.  The fire and
// eye openings then play their normal ramps from here — only the phrase is
// fast-forwarded.
window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key !== "a" && e.key !== "A" && e.key !== "ф" && e.key !== "Ф") return;
  if (phraseEl) phraseEl.classList.add("done");
  if (introStartMs < 0) introStartMs = performance.now();
});

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
  // Anchor the fire's intro to the moment the phrase finishes fading, not
  // to the first rAF tick — otherwise the fire would already be at full
  // reach by the time the user sees it.
  if (introStartMs < 0 && timeMs - pageLoadMs >= PHRASE_DURATION_MS) {
    introStartMs = timeMs;
  }
  if (introStartMs < 0) {
    interp.flameRadialReach = 0;
    fire.setParams(interp);
    return;
  }
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
  // Shared intro ramp — gates every eye's strength so nothing shows up
  // before the intro has played, regardless of which eye is "open".
  const introOpen = u > 0 ? easeOutBack : 0;

  // Pupils start looking around slightly later, smoothly fading in
  // tFrac=1.2 is 2.4s (eyes halfway open), tFrac=1.8 is 3.6s
  let lookStrength = clamp01((tFrac - 1.2) * 1.66);
  lookStrength = smoothstep(lookStrength);

  if (introStartMs >= 0 && timeMs - introStartMs >= FIRST_EYE_DELAY_MS) {
    targetCenterOpen = 1;
  }

  const collected = fire.getCollectedWords();

  // Record the moment the central eye finishes its 5 words and hold all
  // downstream transitions for MAIN_HOLD_MS so the user can take it in.
  const mainCompleted = collected.main.length >= 5;
  if (mainCompleted && mainCompletedAt < 0) mainCompletedAt = timeMs;
  const mainHoldActive = mainCompletedAt >= 0 && timeMs - mainCompletedAt < MAIN_HOLD_MS;
  const mainTransitioned = mainCompleted && !mainHoldActive;

  // Left eye unlocks only once the 5 decorative eyes have actually closed
  // (not merely *started* closing).  Checking the spring outputs keeps the
  // gate honest no matter how slow the close spring is tuned.
  const decorAllClosed = mainTransitioned
    && decorEyeActuals.every((a) => a < 0.05);
  if (decorAllClosed) {
    targetLeftOpen = 1;
  }
  if (collected.left.length >= 5) {
    targetRightOpen = 1;
  }

  // Once the final wall springs into life, close the two SIDE eyes
  // (left / right).  The central eye is intentionally left open — it
  // anchors the composition through the transition.  Placed AFTER the
  // per-stage open-gates above so it cleanly overrides them; the side
  // springs then reverse and ease shut alongside the wall opening.
  if (wallActive) {
    targetLeftOpen = 0;
    targetRightOpen = 0;
  }

  // Left eye spring physics
  leftEyeVelocity += (targetLeftOpen - leftEyeActual) * 0.06;
  leftEyeVelocity *= 0.82;
  leftEyeActual += leftEyeVelocity;

  // Right eye spring physics
  rightEyeVelocity += (targetRightOpen - rightEyeActual) * 0.06;
  rightEyeVelocity *= 0.82;
  rightEyeActual += rightEyeVelocity;

  // Center eye spring physics — deliberately soft (low stiffness, high
  // damping) so the very first opening feels like a slow awakening rather
  // than a snap into place.
  centerEyeVelocity += (targetCenterOpen - centerEyeActual) * 0.012;
  centerEyeVelocity *= 0.94;
  centerEyeActual += centerEyeVelocity;

  const leftStrength = introOpen * Math.max(0, leftEyeActual);
  const rightStrength = introOpen * Math.max(0, rightEyeActual);
  const mainStrength = introOpen * Math.max(0, centerEyeActual);

  fire.setCenterRepels(
    centerRepelEffect,
    leftRepelEffect,
    rightRepelEffect,
    mainStrength,
    lookStrength,
    leftStrength,
    rightStrength,
  );

  // Decorative eyes:
  //  • during collection — one opens per word stored on the central eye;
  //  • during the hold window after the 5th word — all 5 are open so the
  //    user can see them at once;
  //  • after the hold — they all close together with a slow spring so the
  //    farewell reads as deliberate rather than a snap.
  const mainCollected = collected.main.length;
  const decorStrengths = new Array<number>(DECOR_EYE_COUNT);
  for (let i = 0; i < DECOR_EYE_COUNT; i++) {
    let target: number;
    if (mainTransitioned) target = 0;
    else if (mainHoldActive) target = 1;
    else target = i < mainCollected ? 1 : 0;

    // Slower spring on the close (target < actual) so the bow-out reads
    // languid; the opening direction keeps its original snap.
    const isClosing = target < decorEyeActuals[i];
    const k = isClosing ? 0.015 : 0.06;
    const damp = isClosing ? 0.94 : 0.82;
    decorEyeVelocities[i] += (target - decorEyeActuals[i]) * k;
    decorEyeVelocities[i] *= damp;
    decorEyeActuals[i] += decorEyeVelocities[i];
    decorStrengths[i] = introOpen * Math.max(0, decorEyeActuals[i]);
  }
  fire.setDecorEyes(decorEyeEffects, decorStrengths);

  // ── Final wall eyes ───────────────────────────────────────────────────
  // Active only after triggerEndingSequence flipped `wallActive`.
  // Positions: chaotic-but-evenly-spaced (Poisson-disc rejection
  // sampling, generated once per viewport size).  Each eye springs from
  // 0 → 1; strength is gated by introOpen so the wall can't appear
  // before the intro has run.
  if (wallActive) {
    if (
      wallPositions.length !== WALL_EYE_COUNT ||
      wallPositionsW !== w ||
      wallPositionsH !== h
    ) {
      // Exclusion zones — wall eyes shouldn't spawn on top of either the
      // central eye (still open during the wall) or the page-title name.
      const fp = fire.getParams();
      const cx = w * fp.sphereCxFrac;
      const cy = h * 0.8; // matches drawPupil(main, cx_s, h*0.8)
      // Big enough to leave a clear ring of empty space around the central
      // eye + its hover halo.
      const centerR = Math.max(200, Math.min(w, h) * 0.18);
      const cr2 = centerR * centerR;
      // Name bbox + padding — read each (re-)generation so live edits in
      // name-controls take effect.
      const nameRect =
        nameEl && nameEl.offsetWidth > 0 ? nameEl.getBoundingClientRect() : null;
      const namePad = 32;
      const isExcluded = (x: number, y: number): boolean => {
        const dxc = x - cx;
        const dyc = y - cy;
        if (dxc * dxc + dyc * dyc < cr2) return true;
        if (
          nameRect &&
          x >= nameRect.left - namePad &&
          x <= nameRect.right + namePad &&
          y >= nameRect.top - namePad &&
          y <= nameRect.bottom + namePad
        ) {
          return true;
        }
        return false;
      };
      wallPositions = generateWallPositions(w, h, isExcluded);
      wallPositionsW = w;
      wallPositionsH = h;
    }
    const eyes: Array<{
      effect: ReturnType<typeof createCursorEffect> | null;
      x: number;
      y: number;
      strength: number;
      word: string;
      wordColor: string;
    }> = [];
    // Per-eye word colour: indices 0..4 = main (red), 5..9 = left (blue),
    // 10..14 = right (orange).  Mirrors the order words were pushed into
    // wallEyeWords in triggerEndingSequence.
    const fp = fire.getParams();
    const groupColors = [
      fp.wordColorMain,
      fp.wordColorLeft,
      fp.wordColorRight,
    ];

    // Hover hit-test: nearest wall eye within WALL_HOVER_R, or -1.
    let hoverIdx = -1;
    if (mainCursorActive) {
      let bestD2 = WALL_HOVER_R * WALL_HOVER_R;
      for (let i = 0; i < WALL_EYE_COUNT; i++) {
        const pos = wallPositions[i];
        const dxh = mainCursorX - pos.x;
        const dyh = mainCursorY - pos.y;
        const d2 = dxh * dxh + dyh * dyh;
        if (d2 < bestD2) {
          bestD2 = d2;
          hoverIdx = i;
        }
      }
    }

    for (let i = 0; i < WALL_EYE_COUNT; i++) {
      // Hover override: while one eye is hovered, the other 14 close.
      // When no eye is hovered, all 15 open back up.
      const target = hoverIdx < 0 ? 1 : i === hoverIdx ? 1 : 0;
      wallEyeVelocities[i] += (target - wallEyeActuals[i]) * 0.06;
      wallEyeVelocities[i] *= 0.82;
      wallEyeActuals[i] += wallEyeVelocities[i];

      const pos = wallPositions[i];
      const groupIdx = Math.min(2, Math.floor(i / 5));
      eyes.push({
        effect: wallEyeEffects[i],
        x: pos.x,
        y: pos.y,
        strength: introOpen * Math.max(0, wallEyeActuals[i]),
        word: wallEyeWords[i],
        wordColor: groupColors[groupIdx],
      });
    }
    fire.setWallEyes(eyes);

    // Stripe pacing — a touch livelier than the eye springs (k=0.10,
    // damp=0.85) so the fire→stripe morph reads as decisive rather than
    // mushy.  Cache the phrase whenever we have a hover so it lingers
    // through the fade-out when the cursor leaves.
    if (hoverIdx >= 0) {
      const linked = linkedForWord(wallEyeWords[hoverIdx]);
      stripePhrase = linked.phrase;
      stripeSource = linked.source;
    }
    const stripeTarget = hoverIdx >= 0 && stripePhrase.length > 0 ? 1 : 0;
    // Pure exponential approach (no overshoot) — gives a clean fade in /
    // fade out, no flicker from the spring oscillating past 1 (which
    // briefly amplified the displacement field and made chars jitter).
    stripeActual += (stripeTarget - stripeActual) * 0.10;
    if (stripeActual < 0) stripeActual = 0;
    else if (stripeActual > 1) stripeActual = 1;
    fire.setStripe(stripeActual, stripePhrase, stripeSource);
  }

  if (collected.right.length >= 5 && !hasTriggeredEnding) {
    hasTriggeredEnding = true;
    setTimeout(() => {
      triggerEndingSequence(collected);
    }, 400);
  }

  fire.setParams(interp);
}
