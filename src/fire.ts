// Fire renderer — bottom half of viewport.
//
// The fire is real text (the source string passed in), reflowed every frame
// to fit the dynamic flame shape. Per row, we sample a per-column "flame
// top" curve (two noise octaves for graphic tongues) to find the spans of
// row that lie inside the flame. Each span is fed to Pretext's variable-
// width line API, which returns a fresh line of text sized for that exact
// span — so words stay whole instead of being clipped by an opacity mask.
//
// A global cursor advances through the source over time so text continually
// streams into the visible flame shape.
//
// Pretext is essential here, not decorative: `layoutNextLineRange` is the
// hot path, called once per (row × tongue) every frame.
//
// All drawing on a single 2D canvas — thousands of glyphs/frame.

import {
  prepareWithSegments,
  layoutNextLineRange,
  materializeLineRange,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext'
import { createNoise2D } from 'simplex-noise'
import type { CursorEffect } from './cursor-effects'
import quotesCaps from './corpus/quotes_caps.json'

const COLORED_WORDS_COUNT = 15
const createWordSet = () => {
  const set = new Set<number>()
  while (set.size < Math.min(COLORED_WORDS_COUNT, quotesCaps.length)) {
    set.add(Math.floor(Math.random() * quotesCaps.length))
  }
  return set
}
const mainColoredWords = createWordSet()
const leftColoredWords = createWordSet()
const rightColoredWords = createWordSet()

const createEyeWordList = (coloredSet: Set<number>) => {
  const list = Array.from(coloredSet);
  let extra = 45; // Add 45 regular words to mix (ratio 1:3, so roughly every 4th word is colored)
  while(extra > 0) {
      const r = Math.floor(Math.random() * quotesCaps.length);
      if (!coloredSet.has(r)) {
          list.push(r);
          extra--;
      }
  }
  return list.sort(() => Math.random() - 0.5);
}

const mainEyeWords = createEyeWordList(mainColoredWords);
const leftEyeWords = createEyeWordList(leftColoredWords);
const rightEyeWords = createEyeWordList(rightColoredWords);

const leftEyeModules = import.meta.glob('./images/left/*.{svg,png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
const rightEyeModules = import.meta.glob('./images/right/*.{svg,png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });

const LEFT_EYE_IMAGE_URLS = Object.values(leftEyeModules) as string[];
const RIGHT_EYE_IMAGE_URLS = Object.values(rightEyeModules) as string[];

let leftEyeImagesData: ImageData[] = [];
let rightEyeImagesData: ImageData[] = [];
let eyeImagesLoaded = false;

function loadEyeImages() {
  if (eyeImagesLoaded || typeof document === 'undefined') return;
  eyeImagesLoaded = true;

  const loadTo = (urls: string[], targetArray: ImageData[], label: string) => {
    urls.forEach(url => {
      const img = new Image();
      img.onload = () => {
        console.log(`Successfully loaded image for ${label} eye:`, url);
        const cvs = document.createElement('canvas');
        cvs.width = 400;
        cvs.height = 400;
        const ctx = cvs.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, 400, 400);
          targetArray.push(ctx.getImageData(0, 0, 400, 400));
        }
      };
      img.onerror = (err) => {
        console.error(`Failed to load image for ${label} eye:`, url, err);
      };
      img.src = url;
    });
  };

  loadTo(LEFT_EYE_IMAGE_URLS, leftEyeImagesData, 'left');
  loadTo(RIGHT_EYE_IMAGE_URLS, rightEyeImagesData, 'right');
}

if (typeof window !== 'undefined') {
  loadEyeImages();
}

// ─── Live-tunable params ───────────────────────────────────────────────────

export interface FireParams {
  // Font / text shape — changes to family / size / weight / letterSpacing
  // re-prepare the text via Pretext (segment widths depend on them).
  fontFamily: string
  fontSize: number
  fontWeight: number
  /** Vertical distance between rendered rows, px. Cheap to change. */
  lineHeight: number
  /** Extra horizontal spacing between graphemes, px (matches CSS). */
  letterSpacing: number
  /** Scroll speed of the text inside the flames, px/sec. */
  textScrollSpeed: number
  /** Fire band as fraction of viewport height. */
  fireBandFrac: number
  /** Mean fraction of band the flames occupy at rest (0..1). */
  tongueBase: number
  // Big slow tongues.
  tongueBigAmp: number
  tongueBigSx: number
  tongueBigSt: number
  // Medium wobble layered on top.
  tongueMedAmp: number
  tongueMedSx: number
  tongueMedSt: number
  // Per-cell flicker noise inside the flame body.
  flickerAmp: number
  flickerSx: number
  flickerSy: number
  flickerSt: number
  /** Master scale multiplier for flickerSx AND flickerSy.  Lets you blend
   *  the overall noise size between scroll-arc checkpoints without
   *  rotating the pattern — keeping the Sx/Sy ratio fixed and only
   *  varying flickerScale preserves the noise's aspect, so polar-mapped
   *  noise (sphere mode) doesn't swirl while interpolating. */
  flickerScale: number
  /** How the flicker noise is sampled in sphere mode:
   *    cartesian — nFlick((x - cx) * Sx, (y - cy) * Sy + phase).
   *                Pattern follows the canvas: zooms uniformly under
   *                scale changes, no angular drift while blending.
   *                Looks like wandering pixel-grid speckle.
   *    polar     — nFlick(angle * Sx * K, radius * Sy − phase).
   *                Pattern follows the corona: features radiate from
   *                the sphere centre into wedges/rings.  Visually
   *                richer but the angular phase shifts when Sx
   *                changes, so scale blends induce a slight rotation.
   *  Ignored when sphere mode is off — legacy band mode is always
   *  Cartesian along the screen axes. */
  flickerMode: FlickerMode
  /** Constant added to the flicker signal AFTER curve, BEFORE amplitude.
   *  Negative biases the corona toward dimmer cells, positive toward
   *  brighter — shifts the "average colour" of the texture. */
  flickerBias: number
  /** Gamma exponent applied to |flicker| while preserving sign.
   *  1 = linear (default).  >1 squashes mid-values toward 0 → softer,
   *  more even texture.  <1 pushes mid-values toward ±1 → punchier,
   *  more saturated speckle. */
  flickerContrast: number
  /** Vertical fade band near each tongue's tip (px). Smaller = sharper edges. */
  tipFadePx: number
  // ── Eclipse / sphere mode ────────────────────────────────────────────────
  // When enabled, flames burn radially OUTWARD from a giant black sphere
  // instead of rising in horizontal bands. fireBandFrac is ignored; the
  // tongue noise drives flame *length* (in pixels) per angle around the
  // sphere. tongueBigSx / tongueMedSx are reinterpreted as angular
  // frequencies (multiplied by a constant), so the existing tongue sliders
  // shape the corona naturally.
  /** If true: fire is a corona around a black sphere (eclipse look). */
  sphereEnabled: boolean
  /** Sphere center X as fraction of viewport width. */
  sphereCxFrac: number
  /** Sphere center Y as fraction of viewport height. >1 puts center below the viewport. */
  sphereCyFrac: number
  /** Sphere radius as fraction of min(viewportW, viewportH). */
  sphereRadiusFrac: number
  /** Max flame length (beyond sphere edge) as fraction of min(viewportW, viewportH). */
  flameRadialReach: number
  // ── Central peak (extra-tall tongue aimed at one angle) ─────────────────
  // Multiplies the per-angle flame length by a bell centred on
  // `centerPeakAngle`, so a single tongue stretches taller than its
  // neighbours.  Width and curve sharpness shape the falloff into the
  // surrounding flames.  Amp = 1 disables the effect (no boost).
  /** Length multiplier at the peak's centre.  1 = no boost; 2 = twice as
   *  long as the surrounding tongues; etc. */
  centerPeakAmp: number
  /** Angular half-width of the peak (radians).  Beyond this the boost is
   *  back to 1.  ~0.3 ≈ a single tongue; π = the entire corona. */
  centerPeakWidth: number
  /** Falloff exponent on the bell.  1 = linear, 2 = quadratic (smooth top,
   *  sharp shoulders), 0.5 = sharp top, gradual shoulders.  Higher = more
   *  isolated peak; lower = wider plateau. */
  centerPeakSmoothness: number
  /** Angle the peak is aimed at, in degrees.  −90 = straight up (the top
   *  of the visible sphere for the default eclipse setup). */
  centerPeakAngleDeg: number
  /** Width (px) of the alpha ramp-up at the sphere's edge.  Like tipFadePx
   *  but on the inner boundary — text right at the surface fades to zero
   *  and reaches full opacity `sphereFadePx` px away.  0 disables. */
  sphereFadePx: number
  // Palette stops — hex strings (#rrggbb).
  /** Base / coldest ember at the very bottom of intensity. */
  colorBase: string
  /** Lower-mid (deep red zone). */
  colorLow: string
  /** Hot orange-yellow zone (most of a tongue's body). */
  colorHot: string
  /** Tip / hottest core at the top of intensity. */
  colorTip: string
  /** Color for words appearing in the main eye */
  wordColorMain: string
  /** Color for words appearing in the left eye */
  wordColorLeft: string
  /** Color for words appearing in the right eye */
  wordColorRight: string
  /** Degrees per second to rotate the hue of low / hot / tip stops.
   *  0 = static palette.  colorBase is held fixed so the dark anchor of
   *  the gradient doesn't drift. */
  colorHueShiftSpeed: number
  // ── Glow post-pass ───────────────────────────────────────────────────────
  /** Overall glow strength (0..1).  0 disables the entire post-pass. */
  glowOpacity: number
  /** Blur radius (device px) of the tight inner glow. */
  glowRadius: number
  /** Wider-halo mix (0..1).  Adds a second softer blur pass at
   *  radius · (1 + softness · 3) px to feather the glow outward. */
  glowSoftness: number
  /** Colour the glow is tinted with via `source-in`.  All fire pixels get
   *  recoloured to this before being blurred and added back over. */
  glowColor: string
  // ── Pixelation overlay (applied in main.ts, after fire + name) ───────────
  /** Output "pixel" size in CSS pixels.  1 = no pixelation.  >1 averages
   *  this many CSS pixels of the rendered scene into a single chunky
   *  block, giving an old-game / low-res look that covers the corona AND
   *  the name overlay (it's a global post-pass on the whole canvas). */
  pixelSize: number
  // ── CRT scanlines (applied in main.ts, after pixelation) ─────────────────
  /** Darkness of the scanline stripes (0..1).  0 disables the overlay. */
  scanlineOpacity: number
  /** Spacing between scanlines, in CSS pixels.  3 ≈ classic CRT density. */
  scanlineSpacing: number
  /** Upward scroll speed of the scanlines, in CSS px/sec.  0 = static. */
  scanlineSpeed: number
  // ── Swirl (sphere mode only) ─────────────────────────────────────────────
  /** Maximum swirl angle (radians).  A noise field sampled at each
   *  character's position is multiplied by this value, so tips twist in
   *  different directions instead of rotating uniformly.  0 = no swirl. */
  swirlStrength: number
  /** Spatial frequency of the swirl noise (per CSS pixel).  Lower = bigger
   *  blobs of coherent swirl; higher = finer, more chaotic swirl. */
  swirlScale: number
  /** Rate at which the noise field drifts (noise-space units / sec).
   *  Higher = tips wave faster. */
  swirlSpeed: number
  /** Where along the corona (0 = sphere edge, 1 = flame tip) the swirl
   *  begins to apply.  Below this fraction the character is unaffected;
   *  above it the swirl ramps back up to full strength at the tip. */
  swirlStart: number
  /** Which noise-field flavour drives the swirl. */
  swirlType: SwirlType
  // ── Curl repel points (localised repulsion zones in the corona) ─────────
  // A small number of repel centres sit around the sphere at mid-corona
  // radius and slowly drift over time.  Each one pushes nearby chars
  // radially OUTWARD from ITS centre, creating local "blown out" spots —
  // some flame regions bulge outward while neighbours stay calm.  Falloff
  // is a gaussian so the effect blends smoothly into the rest of the
  // corona.  Negative strengths attract instead of repel.
  //
  // Per-vortex strength and radius are RANDOMISED within the [min, max]
  // ranges you set — each vortex picks a deterministic value seeded by
  // its index, so the pattern is stable frame-to-frame but each vortex
  // has its own character.
  /** Min per-vortex push amplitude in CSS px.  Set both min/max to 0 to disable. */
  curlStrengthMin: number
  /** Max per-vortex push amplitude in CSS px.  Negative = attract. */
  curlStrengthMax: number
  /** Number of vortices evenly distributed around the sphere — your
   *  "frequency" control: more vortices = curls appear more often. */
  curlCount: number
  /** Min falloff radius of a vortex in CSS px (its zone of influence). */
  curlRadiusMin: number
  /** Max falloff radius of a vortex in CSS px. */
  curlRadiusMax: number
  /** Min distance of a vortex centre from the sphere surface as a fraction
   *  of the local flame length.  0 = right at the surface, 1 = at the flame
   *  tip.  Set both min/max equal for a fixed distance, or spread them for
   *  vortices at varied depths along the corona. */
  curlDistanceMin: number
  /** Max fractional distance of a vortex centre from the sphere surface. */
  curlDistanceMax: number
  /** Angular drift rate of the vortex pattern around the sphere (rad/sec). */
  curlDriftSpeed: number
  // ── White-noise grain overlay (applied as a post-pass in main.ts) ──────
  /** Master opacity of the grain layer (0 disables it). */
  grainOpacity: number
  /** Size of each grain pixel block in device px.  1 = pure single-pixel
   *  noise, larger values make the texture chunkier / more visible. */
  grainScale: number
  /** Frames between noise reshuffles.  1 = fresh noise every frame
   *  (most film-like), higher = the same noise persists longer (calmer). */
  grainSpeed: number
}

/** Noise-field flavours for the swirl effect:
 *
 *  simplex    — 2-D simplex sampled at (x, y) world position.  Smooth,
 *               organic chaos.  Adjacent characters see similar values.
 *  turbulence — fBm: three octaves of simplex summed.  More fractal,
 *               flickery detail than plain simplex.
 *  radial     — simplex sampled at (distance-from-sphere, time).  Same
 *               radius → same swirl, so the corona forms concentric
 *               bands that twist together.
 *  angular    — simplex sampled at (angle-around-sphere, time).  Same
 *               angle → same swirl, so the corona forms radial spokes.
 *  pulse      — sin(t · speed · 2π).  Pure time-driven oscillation;
 *               every character swings the same direction at once.
 */
/** Flicker noise sampling modes — see `FireParams.flickerMode`. */
export type FlickerMode = 'cartesian' | 'polar'

export const FLICKER_MODES: readonly FlickerMode[] = ['cartesian', 'polar']

export type SwirlType =
  | 'simplex'
  | 'turbulence'
  | 'radial'
  | 'angular'
  | 'pulse'

export const SWIRL_TYPES: readonly SwirlType[] = [
  'simplex',
  'turbulence',
  'radial',
  'angular',
  'pulse',
]

export const FIRE_DEFAULTS: FireParams = {
  fontFamily: '"Cormorant Garamond", "Garamond", serif',
  fontSize: 20,
  fontWeight: 100,
  lineHeight: 20,
  letterSpacing: 0,
  textScrollSpeed: 10,
  fireBandFrac: 0.9,
  tongueBase: 0.55,
  tongueBigAmp: 0.29,
  tongueBigSx: 0.025,
  tongueBigSt: 0.2,
  tongueMedAmp: 0.21,
  tongueMedSx: 0.05,
  tongueMedSt: 0.4,
  flickerAmp: 0.33,
  flickerSx: 0.069,
  flickerSy: 0.001,
  flickerSt: 0.85,
  flickerScale: 1,
  flickerMode: 'cartesian',
  flickerBias: 0.5,
  flickerContrast: 1.25,
  tipFadePx: 0,
  sphereEnabled: true,
  sphereCxFrac: 0.50,
  sphereCyFrac: 1.86,
  sphereRadiusFrac: 1.09,
  flameRadialReach: 0.53,
  centerPeakAmp: 1,
  centerPeakWidth: 0.28,
  centerPeakSmoothness: 1.0,
  centerPeakAngleDeg: -90,
  sphereFadePx: 25,
  colorBase: '#0a0000',
  colorLow: '#a10800',
  colorHot: '#f28300',
  colorTip: '#ffed7a',
  wordColorMain: '#a80000',
  wordColorLeft: '#0000ff',
  wordColorRight: '#ffaa00',
  colorHueShiftSpeed: 0,
  glowOpacity: 0.35,
  glowRadius: 17,
  glowSoftness: 0.27,
  glowColor: '#ff8800',
  pixelSize: 1,
  scanlineOpacity: 0,
  scanlineSpacing: 2,
  scanlineSpeed: 30,
  swirlStrength: 0.052,
  swirlScale: 0.0012,
  swirlSpeed: 0.5,
  swirlStart: 0.09,
  swirlType: 'turbulence',
  curlStrengthMin: 0,
  curlStrengthMax: 0,
  curlCount: 6,
  curlRadiusMin: 70,
  curlRadiusMax: 120,
  curlDistanceMin: 0.4,
  curlDistanceMax: 0.55,
  curlDriftSpeed: 0.05,
  grainOpacity: 0.08,
  grainScale: 1,
  grainSpeed: 2,
}

/** Default colors tuned for a light (white-ish) background — deeper and more saturated. */
export const FIRE_DEFAULTS_LIGHT: Pick<
  FireParams,
  'colorBase' | 'colorLow' | 'colorHot' | 'colorTip' | 'wordColorMain' | 'wordColorLeft' | 'wordColorRight'
> = {
  colorBase: '#1c0000',
  colorLow: '#7a1100',
  colorHot: '#cc4d00',
  colorTip: '#e8a000',
  wordColorMain: '#a80000',
  wordColorLeft: '#0000ff',
  wordColorRight: '#ffaa00',
}

// ─── Types ──────────────────────────────────────────────────────────────────

/** Sampling step (px) along x for the per-column flame-top curve. Smaller is
 *  smoother but more work; 6 px gives clearly-defined tongues. */
const FLAME_SAMPLE_STEP = 6

/** Minimum span width (px) we'll bother laying text into. Below this Pretext
 *  may struggle to fit even a single character. */
const MIN_SPAN_W = 4

/** Number of angular slots used to pre-sample radial flame length around the
 *  sphere. 360 gives 1° resolution — comfortably smooth at any visible size. */
const NUM_ANGLES = 360
const TWO_PI = Math.PI * 2

/** Constant that maps tongueBigSx / tongueMedSx (originally per-pixel scales)
 *  into angular noise frequencies in sphere mode. Picked so the existing
 *  defaults give roughly 6 / 20 tongues around the sphere. */
const RADIAL_NOISE_K = 300

/**
 * Boolean cutout interface — anything implementing it can be plugged into
 * fire as a "no-fire zone".  isInside should return true at any (x, y) in
 * CSS pixels that the fire must NOT render.  Used to punch the centred name
 * out of the corona the same way the sphere does (spans split at the mask
 * boundary instead of being painted-over with destination-out).
 */
export interface FireMask {
  isInside(x: number, y: number): boolean
}

export interface Fire {
  /** Caller is expected to clear the canvas before this each frame. */
  draw(ctx: CanvasRenderingContext2D, timeMs: number): void
  resize(viewportW: number, viewportH: number): void
  /** Update one or more tunable params. Cheap; takes effect next frame. */
  setParams(partial: Partial<FireParams>): void
  /** Read the current params (mutable; treat as read-only). */
  getParams(): Readonly<FireParams>
  /**
   * Tell the fire where the cursor is in CSS pixels. Pass `active=false` to
   * release any influence (cursor left the page / pointer cancelled).
   */
  setCursor(x: number, y: number, active: boolean): void
  /**
   * Plug in a boolean cutout (or pass null to clear).  Each frame the row
   * scan asks the mask whether each sample point is inside; in-flame spans
   * split at the boundary so flame text never crosses into masked pixels.
   */
  setMask(mask: FireMask | null): void
  /**
   * Plug in a cursor-effect controller (or pass null to remove).  The
   * effect drives per-character displacement around the pointer and
   * supplies the fade-in/out rate.  When null, characters render at their
   * natural positions.
   */
  setCursorEffect(effect: CursorEffect | null): void
  /**
   * Plug in additional cursor effects anchored permanently to the center,
   * left, and right of the sphere, with an explicit strength parameter.
   */
  /** Permanently anchor three repels (main, left, right) and explicitly control their strength. */
  setCenterRepels(main: CursorEffect | null, left: CursorEffect | null, right: CursorEffect | null, strength: number, lookStrength?: number, leftStrength?: number, rightStrength?: number): void
  /** Decorative non-interactive eyes — N repel effects with N matching strengths.
   *  Positions are derived inside the fire (evenly spaced arc above the
   *  central eye) so they scale with the viewport.  Pupils are never drawn. */
  setDecorEyes(effects: ReadonlyArray<CursorEffect | null>, strengths: ReadonlyArray<number>): void
  /** Final-scene wall of eyes — each eye carries an explicit viewport-CSS-pixel
   *  position, a strength (0..1), and a "bound word" that replaces its 'O'
   *  pupil whenever the cursor is within ~70 px of the eye centre.
   *  Renders with the same decor-eye technique (repel hole + canvas pupil),
   *  not a separate DOM overlay. */
  setWallEyes(eyes: ReadonlyArray<{
    effect: CursorEffect | null
    x: number
    y: number
    strength: number
    word: string
    /** CSS colour for the word when the eye is hovered.  Matches the
     *  colour the word had during its original collection (main / left /
     *  right palette entry).  Optional — falls back to the palette tip. */
    wordColor?: string
  }>): void
  /** Final-scene "glowing horizontal stripe".  When `t > 0` the fire
   *  pass renders the bound `phrase` (looped) inside a thin Y-band at
   *  viewport centre, with `source` printed dimmer on a second line
   *  beneath the phrase.  The corpus outside the band fades out with
   *  `t`.  `t` is the smoothed 0..1 intensity, driven by main.ts based
   *  on whether the cursor is over a wall eye. */
  setStripe(t: number, phrase: string, source: string): void
  getCollectedWords(): { main: string[]; left: string[]; right: string[] }
  /**
   * Read the live `colorTip` palette stop with the current hue rotation
   * applied (same math the glow post-pass uses), returned as an
   * `rgb(r, g, b)` string suitable for direct use in CSS / canvas.
   * `timeMs` should be the rAF timestamp so the rotation matches the
   * current frame.
   */
  getCurrentTipColor(timeMs: number): string
  isInProgressEyeHovered(): boolean
}

// ─── Cursor interaction tunables ────────────────────────────────────────────
//
// Two layers cooperate:
//  (1) A SMALL avoid + engulf perturbation on the 1-D flame-top curve. This
//      is the "shape" effect — flames part around the cursor's column.
//  (2) A 2-D flow field around the cursor that displaces individual rendered
//      characters radially outward. This is the "whip" effect — letters bend
//      around the cursor like fluid streamlines around a stone.

/** Half-width (px) of the central avoidance well below the cursor. */
const CURSOR_AVOID_SIGMA = 28
/** Strength of the avoidance well (subtracted from flameFrac, 0..1). */
const CURSOR_AVOID_AMP = 0.18
/** Half-width (px) of each engulfment lobe rising on either side of the cursor. */
const CURSOR_ENGULF_SIGMA = 32
/** Distance (px) from the cursor to each engulfment lobe's peak. */
const CURSOR_ENGULF_OFFSET = 52
/** Strength of each engulfment lobe (added to flameFrac, 0..1 each). */
const CURSOR_ENGULF_AMP = 0.28
/** Vertical falloff (px) — how far above the fire band the shape effect still applies. */
const CURSOR_Y_FALLOFF = 150

// Cursor flow field — radius, amplitude, border noise, fade speed and the
// 5-way effect selector all live in `cursor-effects.ts` now.  Pass an
// instance via `fire.setCursorEffect(...)`.

// ─── Implementation ─────────────────────────────────────────────────────────

export function createFire(
  text: string,
  viewportW: number,
  viewportH: number,
): Fire {
  const nBig = createNoise2D()
  const nMed = createNoise2D()
  const nFlick = createNoise2D()
  /** Drives the noise-based tip swirl (sphere mode). */
  const nSwirl = createNoise2D()
  /** Smoothly-moving 2D noise used to wobble the per-letter offsets of
   *  the words drawn inside the final-wall pupils on hover. */
  const nWallWord = createNoise2D()

  // Offscreen scratch canvas used by the glow post-pass — resized to match
  // the main canvas's device-pixel buffer on demand.
  // (Glow post-pass removed — its scratch canvas is no longer needed.)

  const params: FireParams = { ...FIRE_DEFAULTS }

  let w = viewportW
  let h = viewportH

  // ── Font + Pretext handle ────────────────────────────────────────────────
  // Compose canvas font shorthand from the live params. Changes to family,
  // size, weight or letterSpacing all require re-preparing the text — Pretext
  // measures every segment with the actual font, so its segment widths are
  // baked-in.
  function fontShorthand(scale: number = 1.0): string {
    return `${params.fontWeight} ${params.fontSize * scale}px ${params.fontFamily}`
  }

  let prepared = prepareWithSegments(text, fontShorthand(), {
    letterSpacing: params.letterSpacing,
  })

  // ── Stripe state ──────────────────────────────────────────────────────
  // The final-scene "glowing horizontal stripe" is drawn through the same
  // pretext-driven fire pass as the corpus — just with a separately
  // prepared text source (the bound phrase) at a scaled-up font size, and
  // the row-walk constrained to a thin Y band around the viewport centre.
  // Off when stripeT == 0.
  const PHRASE_FONT_SCALE = 1.8
  let stripeT = 0
  let stripePhrase = ''
  let stripeSource = ''
  let phrasePrepared: PreparedTextWithSegments | null = null
  let phrasePreparedText = ''
  let stripeCursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  function rebuildPhrasePrepared(): void {
    if (!stripePhrase) {
      phrasePrepared = null
      phrasePreparedText = ''
      stripeCursor = { segmentIndex: 0, graphemeIndex: 0 }
      return
    }
    // Loop the phrase with a soft separator so layoutNextLineRange has an
    // infinite stream to walk (matches the corpus pattern in main.ts).
    const looped = stripePhrase + ' • '
    phrasePrepared = prepareWithSegments(looped, fontShorthand(PHRASE_FONT_SCALE), {
      letterSpacing: params.letterSpacing,
    })
    phrasePreparedText = stripePhrase
    stripeCursor = { segmentIndex: 0, graphemeIndex: 0 }
  }

  // Offscreen 2D context purely for cached per-character width measurement.
  // Two parallel caches — one at the corpus font size, one at the scaled
  // phrase font size — so the stripe rows can pull correct widths without
  // disturbing the corpus cache.
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')!
  const charWidthCache = new Map<string, number>()
  const phraseMeasureCanvas = document.createElement('canvas')
  const phraseMeasureCtx = phraseMeasureCanvas.getContext('2d')!
  const phraseCharWidthCache = new Map<string, number>()

  function applyMeasureCtxFont(): void {
    measureCtx.font = fontShorthand()
    // Canvas letterSpacing is supported in modern browsers; cast through
    // unknown so older lib.dom typings don't trip the build.
    ;(measureCtx as unknown as { letterSpacing?: string }).letterSpacing =
      `${params.letterSpacing}px`
    phraseMeasureCtx.font = fontShorthand(PHRASE_FONT_SCALE)
    ;(phraseMeasureCtx as unknown as { letterSpacing?: string }).letterSpacing =
      `${params.letterSpacing}px`
  }
  applyMeasureCtxFont()

  function charWidth(ch: string): number {
    let cw = charWidthCache.get(ch)
    if (cw === undefined) {
      cw = measureCtx.measureText(ch).width + params.letterSpacing
      charWidthCache.set(ch, cw)
    }
    return cw
  }

  function phraseCharWidth(ch: string): number {
    let cw = phraseCharWidthCache.get(ch)
    if (cw === undefined) {
      cw = phraseMeasureCtx.measureText(ch).width + params.letterSpacing
      phraseCharWidthCache.set(ch, cw)
    }
    return cw
  }

  /** Re-prep Pretext + clear measurement caches when font changes. */
  function recomputeFont(): void {
    prepared = prepareWithSegments(text, fontShorthand(), {
      letterSpacing: params.letterSpacing,
    })
    // Phrase prepared handle uses the SCALED font shorthand — rebuild too.
    if (phrasePreparedText) {
      const looped = phrasePreparedText + ' • '
      phrasePrepared = prepareWithSegments(looped, fontShorthand(PHRASE_FONT_SCALE), {
        letterSpacing: params.letterSpacing,
      })
      stripeCursor = { segmentIndex: 0, graphemeIndex: 0 }
    }
    applyMeasureCtxFont()
    charWidthCache.clear()
    phraseCharWidthCache.clear()
    // Cursor positions are still segment indices into the same source text,
    // and segment indexing is text-shape-invariant, so they remain valid.
  }

  // ── Scroll state ──────────────────────────────────────────────────────────
  // The scroll cursor is the cursor each frame's render starts from. It
  // advances over time so text appears to flow through the flame shape.
  let scrollCursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let scrollAccum = 0
  let prevTimeMs = 0

  // Phase accumulators for every speed-driven parameter.  These integrate
  // `dt × smoothed_speed` each frame so motion stays continuous through
  // scroll-arc checkpoint blends.  See `smTongueBigSt` etc. below for the
  // damped-speed values that feed in here — they prevent the noise
  // pattern from "blasting" forward when the user transitions between
  // two checkpoints with very different speed settings.
  let phaseTongueBig = 0
  let phaseTongueMed = 0
  let phaseFlicker = 0
  let phaseSwirl = 0
  let phaseCurlDrift = 0
  let phaseHue = 0  // degrees, modded into [0, 360) at read sites

  // Low-pass-filtered copies of every *_speed param.  Each frame they
  // chase the live param value with a ~1.5-second time constant; phase
  // advances by the smoothed rate, not the raw one.  Result: speed
  // changes between checkpoints take a couple of seconds to fully
  // apply — a "slow and steady blend" instead of an instant jump that
  // would visibly blast the noise pattern forward.
  let smTongueBigSt   = params.tongueBigSt
  let smTongueMedSt   = params.tongueMedSt
  let smFlickerSt     = params.flickerSt
  let smRadialReachBoost = 0
  // Timestamp the moment the central eye finishes its 5 words.  Used to
  // hold the in-progress boost (flicker speed + radial reach) for the hold
  // window, then ease it out slowly in lockstep with the decorative-eye
  // close in main.ts.  −1 = not yet completed.
  let mainCompletedAtMs = -1
  const MAIN_HOLD_MS_FIRE = 1500
  let smSwirlSpeed    = params.swirlSpeed
  let smCurlDriftSpeed = params.curlDriftSpeed
  let smHueShiftSpeed  = params.colorHueShiftSpeed

  // ── Cursor state ──────────────────────────────────────────────────────────
  let cursorX = 0
  let cursorY = 0
  let cursorActive = false
  let inProgressEyeHovered = false
  let activeWordIndex = -1
  let activeWordEndTime = 0
  let activeWordEyeIndex = -1
  /**
   * Raw linear interpolant that chases 0 (inactive) or 1 (active).
   * A smoothstep is applied before use to get ease-in / ease-out.
   */
  let cursorStrengthRaw = 0

  let centerRepelEffect: CursorEffect | null = null
  let leftRepelEffect: CursorEffect | null = null
  let rightRepelEffect: CursorEffect | null = null
  let centerRepelStrength = 0
  let leftRepelStrength = 0
  let rightRepelStrength = 0
  let pupilLookStrength = 1
  // Decorative eyes: non-interactive repel effects with caller-controlled
  // strengths.  Positions are computed in the draw loop based on current
  // viewport (cx_s / h) so they scale.
  let decorEyeEffects: ReadonlyArray<CursorEffect | null> = []
  let decorEyeStrengths: ReadonlyArray<number> = []
  // Final-scene wall — empty until triggerEndingSequence wires it.
  type WallEye = {
    effect: CursorEffect | null
    x: number
    y: number
    strength: number
    word: string
    wordColor?: string
  }
  let wallEyes: ReadonlyArray<WallEye> = []
  const WALL_EYE_HOVER_R = 70
  // Smoothed per-pupil offsets so each wall pupil eases toward the
  // cursor instead of snapping.  Grows on demand to match wallEyes.length.
  const wallPupilOffsets: Array<{ x: number; y: number }> = []

  // Main eye is now the last to open — closed until the right eye has
  // collected its 5 words.
  let mainEyeActual = 0;
  let mainEyeVelocity = 0;

  const collectedWords = {
    main: new Set<string>(),
    left: new Set<string>(),
    right: new Set<string>(),
  }
  const collectedWordsList = {
    main: [] as string[],
    left: [] as string[],
    right: [] as string[],
  }

  let mainPupilChar = 'O'
  let leftPupilChar = 'O'
  let rightPupilChar = 'O'
  
  let mainPupilMinDist = Infinity
  let leftPupilMinDist = Infinity
  let rightPupilMinDist = Infinity

  const pupilOffsets = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ]

  // ── Optional boolean mask (e.g. centred name) ─────────────────────────────
  let mask: FireMask | null = null

  // ── Optional cursor-effect controller ─────────────────────────────────────
  let cursorEffect: CursorEffect | null = null
  // Fallback fade speed (1/sec) used only when no effect is plugged in.
  const FALLBACK_FADE_SPEED = 3.5

  // ── Per-frame flame-top sample buffer ─────────────────────────────────────
  let flameTopAt = new Float32Array(0)
  let numSamples = 0
  function ensureSampleBuffer(): void {
    const need = Math.ceil(w / FLAME_SAMPLE_STEP) + 2
    if (flameTopAt.length < need) flameTopAt = new Float32Array(need)
    numSamples = need
  }
  ensureSampleBuffer()

  /** Linearly interpolate the flame-top y at any x, using the sampled buffer. */
  function flameTopAtX(x: number): number {
    if (x <= 0) return flameTopAt[0]
    const f = x / FLAME_SAMPLE_STEP
    const i0 = Math.floor(f)
    if (i0 >= numSamples - 1) return flameTopAt[numSamples - 1]
    const i1 = i0 + 1
    const frac = f - i0
    return flameTopAt[i0] * (1 - frac) + flameTopAt[i1] * frac
  }

  // ── Per-frame radial flame-length buffer (sphere mode) ────────────────────
  // Pre-sampled flame length (px) per angular slot around the sphere. Indexed
  // 0..NUM_ANGLES-1 mapping [-π, π] linearly. Refilled every frame in radial
  // mode; ignored otherwise.
  const flameLenByAngle = new Float32Array(NUM_ANGLES)

  // Pre-computed curl vortices.  Each vortex stores [x, y, strength, radius]
  // so per-vortex randomisation costs nothing in the per-char inner loop.
  // Refilled each frame inside the sphere block.
  let curlCenters = new Float32Array(0)
  let numCurls = 0

  /** Deterministic [0, 1) hash from an integer index + a salt.  Used to
   *  pick per-vortex strength and radius from their [min, max] ranges so
   *  the same vortex gets the same value frame-to-frame. */
  function vortexHash01(idx: number, salt: number): number {
    let x = (idx ^ salt) >>> 0
    x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0
    x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0
    x = (x ^ (x >>> 16)) >>> 0
    return (x % 100000) / 100000
  }

  /** Wrapped linear interpolation of flame length at any angle in [-π, π]. */
  function flameLenAtAngle(angle: number): number {
    // Normalise angle to [0, NUM_ANGLES).
    let f = ((angle + Math.PI) / TWO_PI) * NUM_ANGLES
    f = ((f % NUM_ANGLES) + NUM_ANGLES) % NUM_ANGLES
    const i0 = Math.floor(f)
    const i1 = (i0 + 1) % NUM_ANGLES
    const frac = f - i0
    return flameLenByAngle[i0] * (1 - frac) + flameLenByAngle[i1] * frac
  }

  // ── Palette + HSL cache for live hue rotation ─────────────────────────
  // 72-entry LUT sampled by intensity.  Built from the four colour stops;
  // when colorHueShiftSpeed > 0 the low / hot / tip stops are rotated in
  // HSL space every frame so the corona breathes through the spectrum.
  // hexToHsl is run only when a stop changes (cheap setParams hook) — the
  // hot path is just hslToRgb + buildPalette.
  let hslBase: [number, number, number] = hexToHsl(params.colorBase)
  let hslLow:  [number, number, number] = hexToHsl(params.colorLow)
  let hslHot:  [number, number, number] = hexToHsl(params.colorHot)
  let hslTip:  [number, number, number] = hexToHsl(params.colorTip)
  let palette = buildPaletteWithHueShift(0)
  function refreshHslCache(): void {
    hslBase = hexToHsl(params.colorBase)
    hslLow  = hexToHsl(params.colorLow)
    hslHot  = hexToHsl(params.colorHot)
    hslTip  = hexToHsl(params.colorTip)
  }
  function buildPaletteWithHueShift(deg: number): Array<{ fill: string; a: number }> {
    return buildPalette(
      72,
      hslToRgb(hslBase[0],       hslBase[1], hslBase[2]),
      hslToRgb(hslLow[0]  + deg, hslLow[1],  hslLow[2]),
      hslToRgb(hslHot[0]  + deg, hslHot[1],  hslHot[2]),
      hslToRgb(hslTip[0]  + deg, hslTip[1],  hslTip[2]),
    )
  }
  function rebuildPalette(): void {
    refreshHslCache()
    palette = buildPaletteWithHueShift(0)
  }

  return {
    draw(ctx, timeMs) {
      inProgressEyeHovered = false
      mainPupilMinDist = Infinity
      leftPupilMinDist = Infinity
      rightPupilMinDist = Infinity
      
      ctx.font = fontShorthand()
      ctx.textBaseline = 'top'
      ;(ctx as unknown as { letterSpacing?: string }).letterSpacing =
        `${params.letterSpacing}px`

      const lineHeight = params.lineHeight
      const sphereOn = params.sphereEnabled && params.sphereRadiusFrac > 0

      // ── Sphere geometry (only used when sphereOn) ───────────────────────
      const minDim = Math.min(w, h)
      const cx_s = w * params.sphereCxFrac
      const cy_s = h * params.sphereCyFrac
      const R_s  = sphereOn ? minDim * params.sphereRadiusFrac : 0
      const R2_s = R_s * R_s

      // ── Time delta ───────────────────────────────────────────────────────
      const dt = prevTimeMs > 0 ? Math.min(0.1, (timeMs - prevTimeMs) / 1000) : 0
      prevTimeMs = timeMs

      const SPEED_SMOOTH_TAU = 1.5  // seconds — heavier = slower blends
      const sk = 1 - Math.exp(-dt / SPEED_SMOOTH_TAU)

      let inProgressIdx = -1
      if (collectedWordsList.main.length < 5) inProgressIdx = 0
      else if (collectedWordsList.left.length < 5) inProgressIdx = 1
      else if (collectedWordsList.right.length < 5) inProgressIdx = 2

      let isHoveringInProgressNow = false
      if (cursorActive && inProgressIdx !== -1) {
        let px = cx_s
        let py = h * 0.8
        // Strength of the eye that "owns" the in-progress slot — must be
        // open before its hover boost (flame radial reach + flicker speed)
        // is allowed to fire.
        let openStrength = centerRepelStrength
        if (inProgressIdx === 1) {
          px = cx_s - w * 0.15
          py = h * 0.85
          openStrength = leftRepelStrength
        } else if (inProgressIdx === 2) {
          px = cx_s + w * 0.15
          py = h * 0.85
          openStrength = rightRepelStrength
        }
        isHoveringInProgressNow =
          openStrength > 0.2 && Math.hypot(cursorX - px, cursorY - py) < 60
      }

      // Eye-hover effects (left-eye shape masks, right-eye image masks, the
      // main-eye dim-on-side-hover) require the side eye to actually be
      // open.  The repel strengths come from main.ts via setCenterRepels —
      // they ride introOpen × *EyeActual, so a small-but-not-zero threshold
      // reliably distinguishes "open" from "still closed / mid-spring".
      const EYE_OPEN_EFFECT_THRESHOLD = 0.2
      const isLeftEyeHovered = cursorActive
        && leftRepelStrength > EYE_OPEN_EFFECT_THRESHOLD
        && collectedWordsList.left.length < 5
        && Math.hypot(cursorX - (cx_s - w * 0.15), cursorY - (h * 0.85)) < 60;
      const isRightEyeHoveredRaw = cursorActive
        && rightRepelStrength > EYE_OPEN_EFFECT_THRESHOLD
        && collectedWordsList.right.length < 5
        && Math.hypot(cursorX - (cx_s + w * 0.15), cursorY - (h * 0.85)) < 60;
      // Right eye flickers between its image-mask animation and the regular
      // flame for a chaotic, jittery feel.  Toggled at ~150 ms so it beats
      // against the 200 ms image-cycle and never quite syncs up.
      const rightEyeFlickerOn = Math.floor(timeMs / 150) % 2 === 0;
      const isRightEyeHovered = isRightEyeHoveredRaw && rightEyeFlickerOn;
      
      // Latch the moment the central eye finishes — drives the post-
      // completion slow-decay timing below.
      const mainDone = collectedWordsList.main.length >= 5
      if (mainDone && mainCompletedAtMs < 0) mainCompletedAtMs = timeMs
      const sinceMainDone = mainCompletedAtMs >= 0 ? timeMs - mainCompletedAtMs : -1
      const inMainHold = mainCompletedAtMs >= 0 && sinceMainDone < MAIN_HOLD_MS_FIRE
      const inPostMainDecay = mainCompletedAtMs >= 0 && !inMainHold

      // Flicker speed & radial reach normally ramp in/out over 0.3–0.5 s.
      // After the central eye finishes:
      //  • freeze the current value during the hold window (so the boost
      //    doesn't visibly drain while the user is taking in the 5 decor
      //    eyes), and then
      //  • ease the return to baseline over ~1.5 s — matched to the slow
      //    decor-close spring in main.ts so the entire stage decays as one.
      const baseFlickerTau = isHoveringInProgressNow
        ? 0.3
        : (inPostMainDecay ? 1.5 : 0.5)
      const flickerTau = inMainHold ? Infinity : baseFlickerTau
      const skFlicker = flickerTau === Infinity ? 0 : 1 - Math.exp(-dt / flickerTau)

      const baseRadialTau = isHoveringInProgressNow
        ? 0.3
        : (inPostMainDecay ? 1.5 : 0.5)
      const radialTau = inMainHold ? Infinity : baseRadialTau
      const skRadial = radialTau === Infinity ? 0 : 1 - Math.exp(-dt / radialTau)

      const targetRadialReachBoost = isHoveringInProgressNow ? 1 : 0
      smRadialReachBoost += (targetRadialReachBoost - smRadialReachBoost) * skRadial

      const maxFlameR = sphereOn ? minDim * (params.flameRadialReach + smRadialReachBoost) : 0

      const getRepelFade = (rx: number, ry: number) => {
        if (!sphereOn) return 1
        const dist = Math.hypot(rx - cx_s, ry - cy_s)
        return Math.max(0, Math.min(1, (dist - R_s) / 40 + 0.5))
      }

      // Main eye is open by default; it dims/closes only while a side eye is
      // being hovered.  The actual gating by the eye-open sequence is done in
      // main.ts via centerEyeActual (no per-frame work needed here).
      const targetMainOpen = (isLeftEyeHovered || isRightEyeHoveredRaw) ? 0 : 1;
      mainEyeVelocity += (targetMainOpen - mainEyeActual) * 0.1;
      mainEyeVelocity *= 0.8;
      mainEyeActual += mainEyeVelocity;

      const fadeMain = getRepelFade(cx_s, h * 0.8) * Math.max(0, mainEyeActual);
      const fadeLeft = getRepelFade(cx_s - w * 0.15, h * 0.85)
      const fadeRight = getRepelFade(cx_s + w * 0.15, h * 0.85)

      // In sphere mode the band is the full viewport. Otherwise fall back to
      // the legacy bottom-band geometry driven by fireBandFrac.
      const fireBottom = h
      const fireTop = sphereOn ? 0 : h * (1 - params.fireBandFrac)
      const bandH = fireBottom - fireTop
      if (bandH <= 0) return

      // First, low-pass each speed param toward its live value
      smTongueBigSt    += (params.tongueBigSt        - smTongueBigSt)    * sk
      smTongueMedSt    += (params.tongueMedSt        - smTongueMedSt)    * sk
      
      const targetFlickerSt = params.flickerSt + (isHoveringInProgressNow ? 3 : 0)
      smFlickerSt      += (targetFlickerSt           - smFlickerSt)      * skFlicker
      smSwirlSpeed     += (params.swirlSpeed         - smSwirlSpeed)     * sk
      smCurlDriftSpeed += (params.curlDriftSpeed     - smCurlDriftSpeed) * sk
      smHueShiftSpeed  += (params.colorHueShiftSpeed - smHueShiftSpeed)  * sk

      // Integrate phase using the SMOOTHED speeds — never the raw param.
      phaseTongueBig += dt * smTongueBigSt
      phaseTongueMed += dt * smTongueMedSt
      phaseFlicker   += dt * smFlickerSt
      phaseSwirl     += dt * smSwirlSpeed
      phaseCurlDrift += dt * smCurlDriftSpeed
      phaseHue       += dt * smHueShiftSpeed
      // Keep hue in [0, 360) so the modulo at read time stays cheap and
      // the accumulator can't drift to a float-precision danger zone over
      // long sessions.
      if (phaseHue >= 360) phaseHue -= 360 * Math.floor(phaseHue / 360)
      else if (phaseHue < 0) phaseHue += 360 * Math.ceil(-phaseHue / 360)

      // ── Hue rotation ─────────────────────────────────────────────────────
      // Rebuild the palette LUT each frame with the integrated hue offset.
      // Only the low/hot/tip stops rotate; base stays anchored.  72 stop
      // rebuild is ~µs-scale.
      const hueDeg = phaseHue
      if (params.colorHueShiftSpeed > 0) {
        palette = buildPaletteWithHueShift(hueDeg)
      }

      // ── Cursor strength — smooth ease-in / ease-out ───────────────────────
      // Lerp the raw value toward 0 or 1, then apply a smoothstep so the
      // transition accelerates out of 0 and decelerates into 1 (and vice-versa).
      const cursorTarget = cursorActive ? 1 : 0
      cursorStrengthRaw +=
        (cursorTarget - cursorStrengthRaw) *
        Math.min(
          1,
          dt *
            (cursorEffect ? cursorEffect.getParams().fadeSpeed : FALLBACK_FADE_SPEED),
        )
      // smoothstep: 3t² − 2t³  (true ease-in / ease-out)
      const ce =
        cursorStrengthRaw * cursorStrengthRaw * (3 - 2 * cursorStrengthRaw)
      // textScrollSpeed (slider 0..150) interpreted as "stream advance rate".
      // Divide so values feel similar to the old px/sec scroll.
      scrollAccum += dt * params.textScrollSpeed * 0.18
      while (scrollAccum >= 1) {
        const step = layoutNextLineRange(prepared, scrollCursor, 240)
        if (step === null) {
          scrollCursor = { segmentIndex: 0, graphemeIndex: 0 }
        } else {
          scrollCursor = step.end
        }
        scrollAccum -= 1
      }

      // ── Sample the flame-top curve along x ──────────────────────────────
      // Cursor effect strength fades with vertical distance from the fire's
      // top edge. When the cursor is inside or near the band, full strength;
      // far above, no influence at all.
      ensureSampleBuffer()
      // Vertical proximity fade × eased temporal fade together drive every
      // cursor effect this frame.  `cursorYWeight` is already 0 when the
      // eased value is negligible, so the inner loops need only check it once.
      let cursorYWeight = 0
      if (ce > 0.001) {
        if (cursorY >= fireTop) {
          cursorYWeight = ce
        } else {
          const dAbove = fireTop - cursorY
          cursorYWeight =
            ce *
            Math.exp(-(dAbove * dAbove) / (CURSOR_Y_FALLOFF * CURSOR_Y_FALLOFF))
        }
      }
      const cursorOn = cursorYWeight > 0.002

      if (sphereOn) {
        // Pre-sample radial flame length (px) for each angular slot. The
        // existing big/med tongue noise drives length-around-sphere; cos/sin
        // inputs give a naturally periodic signal so there's no seam at ±π.
        const sxBig = params.tongueBigSx * RADIAL_NOISE_K
        const sxMed = params.tongueMedSx * RADIAL_NOISE_K
        // Central-peak bell, prepared once per frame.  Wrapped angular
        // distance to the peak angle determines a [0..1] weight that we
        // shape with `centerPeakSmoothness`, then mix between 1 (no
        // boost) and `centerPeakAmp` (full boost).  When amp == 1 we
        // skip the per-slot work entirely.
        const peakActive = params.centerPeakAmp !== 1
        const peakAngle = (params.centerPeakAngleDeg * Math.PI) / 180
        const peakHalf = Math.max(0.001, params.centerPeakWidth)
        const peakSharp = Math.max(0.05, params.centerPeakSmoothness)
        const peakBoost = params.centerPeakAmp - 1
        for (let a = 0; a < NUM_ANGLES; a++) {
          const angle = (a / NUM_ANGLES) * TWO_PI - Math.PI
          const ax = Math.cos(angle)
          const ay = Math.sin(angle)
          let frac =
            params.tongueBase +
            params.tongueBigAmp *
              nBig(ax * sxBig, ay * sxBig + phaseTongueBig) +
            params.tongueMedAmp *
              nMed(
                ax * sxMed + 13.7,
                ay * sxMed + 4.1 + phaseTongueMed,
              )
          if (frac < 0) frac = 0
          else if (frac > 1) frac = 1
          let len = frac * maxFlameR

          if (peakActive) {
            // Shortest angular distance (always in [0, π]) to the peak.
            let d = angle - peakAngle
            if (d > Math.PI) d -= TWO_PI
            else if (d < -Math.PI) d += TWO_PI
            d = d < 0 ? -d : d
            // Normalised radial distance from peak centre, in [0, 1].
            const tN = d >= peakHalf ? 1 : d / peakHalf
            // (1 − t)^smoothness — peaks at t=0 (centre) and zero at t=1
            // (peak edge).  Higher exponent ⇒ sharper, more isolated peak.
            const w = tN >= 1 ? 0 : Math.pow(1 - tN, peakSharp)
            // Apply OUTSIDE the [0, 1] cap so the central peak genuinely
            // shoots past `maxFlameR` — that's how it becomes longer than
            // every other tongue, not just locally taller within its slot.
            len *= 1 + peakBoost * w
          }
          flameLenByAngle[a] = len
        }

        // ── Curl-vortex centre positions ─────────────────────────────────
        // Evenly distributed around the sphere with a slow time-driven
        // angular drift.  Each vortex picks its own STRENGTH, RADIUS, and
        // DISTANCE from the [min, max] ranges via vortexHash01 — same idx
        // always gives the same draw, so the pattern is stable across
        // frames.  Distance is a fraction of the local flame length so
        // vortices stay inside the actual corona regardless of how the
        // flame breathes around them.
        const curlSRange =
          Math.abs(params.curlStrengthMax - params.curlStrengthMin) +
          Math.abs(params.curlStrengthMin) +
          Math.abs(params.curlStrengthMax)
        if (curlSRange > 0 && params.curlCount > 0) {
          const need = params.curlCount
          // 4 floats per vortex: x, y, strength, radius.
          if (curlCenters.length < need * 4) {
            curlCenters = new Float32Array(need * 4)
          }
          numCurls = need
          const drift = phaseCurlDrift
          const sMin = params.curlStrengthMin
          const sMax = params.curlStrengthMax
          const rMin = params.curlRadiusMin
          const rMax = params.curlRadiusMax
          const dMin = params.curlDistanceMin
          const dMax = params.curlDistanceMax
          for (let v = 0; v < need; v++) {
            const ang = (v / need) * TWO_PI + drift
            const tS = vortexHash01(v, 0xa53f0b1d)
            const tR = vortexHash01(v, 0x6c2f7e9b)
            const tD = vortexHash01(v, 0x3fa9e4c7)
            const s = sMin + (sMax - sMin) * tS
            const r = rMin + (rMax - rMin) * tR
            const d = dMin + (dMax - dMin) * tD
            // Use the global maxFlameR (stable per frame, doesn't flicker
            // with the per-angle noise) so each vortex keeps the SAME
            // radial distance it was hash-assigned for its whole lifetime
            // on screen — no jumping every frame as the corona's noise
            // field breathes around it.
            const radial = R_s + maxFlameR * d
            curlCenters[v * 4]     = cx_s + Math.cos(ang) * radial
            curlCenters[v * 4 + 1] = cy_s + Math.sin(ang) * radial
            curlCenters[v * 4 + 2] = s
            curlCenters[v * 4 + 3] = Math.max(1, r)
          }
        } else {
          numCurls = 0
        }
      } else {
        for (let i = 0; i < numSamples; i++) {
          const x = i * FLAME_SAMPLE_STEP
          let flameFrac =
            params.tongueBase +
            params.tongueBigAmp *
              nBig(x * params.tongueBigSx, phaseTongueBig) +
            params.tongueMedAmp *
              nMed(
                x * params.tongueMedSx + 13.7,
                phaseTongueMed + 4.1,
              )

          if (cursorOn) {
            // Avoidance well + two engulfment lobes ±CURSOR_ENGULF_OFFSET away.
            const dx = x - cursorX
            const avoid =
              -CURSOR_AVOID_AMP *
              Math.exp(
                -(dx * dx) / (CURSOR_AVOID_SIGMA * CURSOR_AVOID_SIGMA),
              )
            const dl = dx + CURSOR_ENGULF_OFFSET
            const dr = dx - CURSOR_ENGULF_OFFSET
            const lobeL = Math.exp(
              -(dl * dl) / (CURSOR_ENGULF_SIGMA * CURSOR_ENGULF_SIGMA),
            )
            const lobeR = Math.exp(
              -(dr * dr) / (CURSOR_ENGULF_SIGMA * CURSOR_ENGULF_SIGMA),
            )
            const engulf = CURSOR_ENGULF_AMP * (lobeL + lobeR)
            flameFrac += (avoid + engulf) * cursorYWeight
          }

          if (flameFrac < 0) flameFrac = 0
          else if (flameFrac > 1) flameFrac = 1
          flameTopAt[i] = fireBottom - bandH * flameFrac
        }
      }

      let lastFill = ''
      let lastAlpha = -1

      // Layout cursor for this frame. Cloned so we don't mutate scrollCursor.
      let cursor: LayoutCursor = { ...scrollCursor }
      // Same idea for the phrase stream that fills the stripe band when
      // active.  Persists across frames via `stripeCursor` (set at the end
      // of the row loop), so the phrase flows upward like the main fire.
      let stripeRowCursor: LayoutCursor = { ...stripeCursor }
      const stripeActive = stripeT > 0.001 && phrasePrepared !== null
      // Thin horizontal band (~100 px tall) centred on the viewport.
      const STRIPE_HALF_H = 50
      const stripeTopY = h / 2 - STRIPE_HALF_H
      const stripeBotY = h / 2 + STRIPE_HALF_H

      // Pre-measure the centred phrase, wrapping it into multiple lines
      // when it's too wide for the viewport.  Same font and scale the
      // stripe rows already use, so the phrase reads as part of the same
      // fire layer — just laid out across as many lines as it needs.
      const PHRASE_CENTER_FONT = fontShorthand(PHRASE_FONT_SCALE)
      const phraseCenterPx = params.fontSize * PHRASE_FONT_SCALE
      const PHRASE_MAX_WIDTH_FRAC = 0.72
      const maxPhraseLineWidth = w * PHRASE_MAX_WIDTH_FRAC
      // Each entry is { text, widths } for a wrapped line.  Single-line
      // phrases produce a single entry; long phrases get word-wrapped.
      const phraseLines: Array<{ text: string; widths: number[]; lineW: number }> = []
      let phraseMaxLineW = 0
      if (stripeActive && stripePhrase) {
        // Measure total width as a single line first — most phrases fit.
        const allWidths: number[] = []
        let totalW = 0
        for (let k = 0; k < stripePhrase.length; k++) {
          const cw = phraseCharWidth(stripePhrase[k])
          allWidths.push(cw)
          totalW += cw
        }
        if (totalW <= maxPhraseLineWidth) {
          phraseLines.push({ text: stripePhrase, widths: allWidths, lineW: totalW })
          phraseMaxLineW = totalW
        } else {
          // Greedy word-wrap.  Split keeps whitespace separators so we
          // can rebuild the line text exactly.
          const tokens = stripePhrase.split(/(\s+)/).filter((s) => s.length > 0)
          let curText = ''
          let curWidths: number[] = []
          let curW = 0
          const pushLine = (): void => {
            // Trim trailing whitespace from the assembled line so a line
            // break can't leave a stray space at the end.
            let endIdx = curText.length
            while (endIdx > 0 && /\s/.test(curText[endIdx - 1])) endIdx--
            const trimmedText = curText.slice(0, endIdx)
            const trimmedWidths = curWidths.slice(0, endIdx)
            const trimmedW = trimmedWidths.reduce((a, b) => a + b, 0)
            if (trimmedText.length > 0) {
              phraseLines.push({ text: trimmedText, widths: trimmedWidths, lineW: trimmedW })
              if (trimmedW > phraseMaxLineW) phraseMaxLineW = trimmedW
            }
          }
          for (let ti = 0; ti < tokens.length; ti++) {
            const tok = tokens[ti]
            const tokWidths: number[] = []
            let tokW = 0
            for (let k = 0; k < tok.length; k++) {
              const cw = phraseCharWidth(tok[k])
              tokWidths.push(cw)
              tokW += cw
            }
            if (curW + tokW > maxPhraseLineWidth && curText.length > 0) {
              pushLine()
              // Skip pure-whitespace tokens at the start of a new line.
              if (/^\s+$/.test(tok)) {
                curText = ''
                curWidths = []
                curW = 0
              } else {
                curText = tok
                curWidths = tokWidths.slice()
                curW = tokW
              }
            } else {
              curText += tok
              for (let k = 0; k < tokWidths.length; k++) curWidths.push(tokWidths[k])
              curW += tokW
            }
          }
          if (curText.length > 0) pushLine()
        }
      }
      // Eye-shaped (elliptical) clearing centred on the phrase block
      // (centre line of all wrapped phrase lines).  Wide horizontally so
      // the widest phrase line fits well inside, tall enough to also
      // envelop the source line below.  Chars inside the ellipse get a
      // pure vertical push (away from the phrase line); strength fades
      // smoothly from centre to boundary so the corners taper to points.
      //
      // Multi-line phrases need a wider field AND more push, because
      // each extra line roughly doubles the area that has to be cleared.
      // `lineExcess` is the number of wrapped lines beyond the first.
      const sourceLinePx = params.fontSize * 0.95
      const phraseLineSpacing = phraseCenterPx * 1.15
      const phraseBlockH = phraseLines.length * phraseLineSpacing
      const phraseBlockHalfH = phraseBlockH / 2
      const sourceGap = phraseCenterPx * 0.45
      const phraseCx = w / 2
      const phraseCy = h / 2
      const ellipseCy = phraseCy
      const lineExcess = Math.max(0, phraseLines.length - 1)
      // A (horizontal) — margin scales with the phrase width itself
      // (≈ 18 % of the widest line) plus a small fixed cushion that
      // grows for multi-line phrases.  Short phrases get a tight,
      // proportional clearing instead of swimming in empty space, while
      // long phrases keep generous elongation past their ends.
      const ellipseA =
        phraseMaxLineW * 0.59 +
        phraseCenterPx * (1.5 + lineExcess * 1.4)
      // B (vertical) — extends past the source baseline below the phrase
      // block, then mirrored above by the symmetric ellipse.
      const distToBottom =
        phraseBlockHalfH + sourceGap + sourceLinePx / 2 + phraseCenterPx * 0.4
      const ellipseB = Math.max(
        phraseBlockHalfH + phraseCenterPx * 0.8,
        distToBottom,
      )
      // Base amp unchanged for single-line phrases (per request); each
      // extra wrapped line adds 50 % so the push reaches past the taller
      // block.
      const phraseClearAmp = 55 * (1 + lineExcess * 0.5)

      // Iterate rows bottom → top. As cursor advances through the corpus
      // within a frame, lower rows hold earlier-in-stream text and upper
      // rows hold later. Combined with scrollCursor advancing over time,
      // text appears to migrate upward — flames rising.
      const numRows = Math.ceil(bandH / lineHeight) + 1
      for (let r = 0; r < numRows; r++) {
        const screenY = fireBottom - lineHeight - r * lineHeight
        if (screenY < fireTop - lineHeight) break

        // Per-row stripe decision: is this row inside the stripe band?
        // If yes, it's filled with the phrase regardless of sphere/mask;
        // if no AND stripeT > 0, its corpus content fades with stripeT.
        const inStripeRow =
          stripeActive && screenY >= stripeTopY && screenY <= stripeBotY
        const rowAlphaMult = inStripeRow ? 1 : 1 - stripeT
        // Per-row width function so the stripe rows measure at the scaled
        // phrase font size and corpus rows stay on the corpus cache.
        const rowCharWidth = inStripeRow ? phraseCharWidth : charWidth
        // Switch the canvas font for stripe rows so the bigger glyphs
        // render at the same scale Pretext used to lay them out.
        ctx.font = inStripeRow ? fontShorthand(PHRASE_FONT_SCALE) : fontShorthand()

        // Walk the sample buffer once, processing each in-flame span as
        // we encounter its right edge. A span is a contiguous x-range
        // where this row's screenY is below the column's flame top.
        let inSpan = false
        let spanStart = 0
        for (let i = 0; i <= numSamples; i++) {
          const x = i < numSamples ? i * FLAME_SAMPLE_STEP : w + 1
          let inside: boolean
          if (isLeftEyeHovered) {
            const size = Math.min(w, h) * 0.3;
            const shapeIndex = Math.floor(timeMs / 200) % 8;
            const ddx = x - cx_s;
            const centerY = h / 2;
            const ddyCenter = screenY - centerY;
            
            if (shapeIndex === 0) {
                // Inverted pyramid / triangle
                inside = ddyCenter >= -size && ddyCenter <= size && Math.abs(ddx) <= size * (1 - (ddyCenter + size) / (2 * size));
            } else if (shapeIndex === 1) {
                // Ring
                const dist = Math.sqrt(ddx*ddx + ddyCenter*ddyCenter);
                inside = dist >= size * 0.85 && dist <= size;
            } else if (shapeIndex === 2) {
                // Circle
                const dist = Math.sqrt(ddx*ddx + ddyCenter*ddyCenter);
                inside = dist <= size;
            } else if (shapeIndex === 3) {
                // X mark
                const thickness = size * 0.2; // 0.15 * sqrt(2) approx
                inside = Math.abs(ddx) <= size && Math.abs(ddyCenter) <= size && 
                         Math.abs(Math.abs(ddx) - Math.abs(ddyCenter)) <= thickness;
            } else if (shapeIndex === 4) {
                // Three vertical stripes
                inside = Math.abs(ddyCenter) <= size && (
                         Math.abs(ddx) <= size * 0.15 || 
                         Math.abs(ddx - size * 0.6) <= size * 0.15 || 
                         Math.abs(ddx + size * 0.6) <= size * 0.15);
            } else if (shapeIndex === 5) {
                // Outline square
                const maxDist = Math.max(Math.abs(ddx), Math.abs(ddyCenter));
                inside = maxDist >= size * 0.85 && maxDist <= size;
            } else if (shapeIndex === 6) {
                // I-Ching hexagram (Hexagram 64: alternating broken/solid)
                const yNorm = (ddyCenter + size) / (2 * size);
                const unit = 1 / 17;
                let inHexLine = false;
                const hexLines = [false, true, false, true, false, true]; // top to bottom
                for (let i = 0; i < 6; i++) {
                    const lineTop = i * 3 * unit;
                    const lineBottom = lineTop + 2 * unit;
                    if (yNorm >= lineTop && yNorm <= lineBottom) {
                        if (hexLines[i]) {
                            inHexLine = Math.abs(ddx) <= size; // solid
                        } else {
                            inHexLine = Math.abs(ddx) <= size && Math.abs(ddx) > size * 0.15; // broken
                        }
                        break;
                    }
                }
                inside = inHexLine;
            } else {
                // Progression cluster — 5 small squares (center + 4 cardinal).
                // Each square is shown only once the corresponding word slot
                // has been collected on the left eye, so the cluster grows
                // 1 → 5 as the user fills the left-eye quota.  Order:
                //   1: center  2: top  3: right  4: bottom  5: left
                const half = size * 0.16;  // half-width of each small square
                const off  = size * 0.62;  // centre-to-centre offset to a cardinal square
                const count = collectedWordsList.left.length;
                let hit = false;
                if (count >= 1 && Math.abs(ddx) <= half && Math.abs(ddyCenter) <= half) hit = true;
                if (!hit && count >= 2 && Math.abs(ddx) <= half && Math.abs(ddyCenter + off) <= half) hit = true;
                if (!hit && count >= 3 && Math.abs(ddx - off) <= half && Math.abs(ddyCenter) <= half) hit = true;
                if (!hit && count >= 4 && Math.abs(ddx) <= half && Math.abs(ddyCenter - off) <= half) hit = true;
                if (!hit && count >= 5 && Math.abs(ddx + off) <= half && Math.abs(ddyCenter) <= half) hit = true;
                inside = hit;
            }
            if (inside && x >= w) inside = false;
          } else if (isRightEyeHovered && rightEyeImagesData.length > 0) {
            const size = Math.min(w, h) * 0.55;
            const ddx = x - cx_s;
            const centerY = h / 2;
            const ddyCenter = screenY - centerY;
            if (Math.abs(ddx) <= size && Math.abs(ddyCenter) <= size) {
                const u = (ddx + size) / (2 * size);
                const v = (ddyCenter + size) / (2 * size);
                const imgIndex = Math.floor(timeMs / 200) % rightEyeImagesData.length;
                const imgData = rightEyeImagesData[imgIndex];
                const px = Math.floor(u * imgData.width);
                const py = Math.floor(v * imgData.height);
                const idx = (py * imgData.width + px) * 4 + 3;
                inside = imgData.data[idx] > 128;
            } else {
                inside = false;
            }
            if (inside && x >= w) inside = false;
          } else if (sphereOn) {
            // Inside the annular flame zone around the sphere.
            const ddx = x - cx_s
            const ddy = screenY - cy_s
            const dd2 = ddx * ddx + ddy * ddy
            if (dd2 <= R2_s || x >= w) {
              inside = false
            } else {
              const dd = Math.sqrt(dd2)
              const flameLen = flameLenAtAngle(Math.atan2(ddy, ddx))
              inside = dd < R_s + flameLen
            }
          } else {
            const ft = i < numSamples ? flameTopAt[i] : Infinity
            inside = screenY > ft + 2 && x < w
          }
          // Boolean cutout: split the span at the mask boundary so flame
          // text never crosses into pixels claimed by (e.g.) the name.
          if (inside && mask !== null && mask.isInside(x, screenY)) {
            inside = false
          }
          // Stripe band override — once the stripe is at least half-faded
          // in, the band fills the entire row width regardless of any
          // sphere / eye / mask cutouts.  Same column-edge clamp as the
          // other branches.
          if (inStripeRow && stripeT > 0.5) {
            inside = x < w
          }
          if (inside && !inSpan) {
            spanStart = x
            inSpan = true
          } else if (!inside && inSpan) {
            const spanEnd = Math.min(x, w)
            inSpan = false
            const spanW = spanEnd - spanStart
            if (spanW >= MIN_SPAN_W) {
              // Keep filling the span until the leftover width is too
              // small for another line.  A single layoutNextLineRange call
              // returns text that fits in `spanW` but stops at a word
              // boundary — the remainder (often 50-200 px) goes empty.
              // Across many adjacent rows that all share a span edge
              // (notably the right edge of the canvas, or a sphere/mask
              // boundary), those remainders stack into a visible vertical
              // strip of emptiness.  Re-asking Pretext for a fresh line at
              // the leftover width fills that strip in.
              let charX = spanStart
              let fills = 0
              // The first fill uses the full span (already ≥ MIN_SPAN_W);
              // continuations drop to a much smaller threshold so the
              // last few pixels at the right of every span fill in too.
              // Pretext breaks at grapheme boundaries when a word can't
              // fit, and the no-progress guard below catches the case
              // where it can't fit anything at all — so this is safe.
              // Cap is generous so short looped sources (e.g. a stripe
              // phrase like "Blame! • ", only ~120 px per cycle at the
              // scaled phrase font) can still fill a wide row.  The
              // no-progress safety check below makes the loop terminate
              // cleanly even when this many iterations isn't needed.
              fillLoop: while (fills++ < 64) {
                const remaining = spanEnd - charX
                const minW = fills === 1 ? MIN_SPAN_W : 4
                if (remaining < minW) break
                // Per-row dispatch — stripe rows pull from the phrase
                // handle/cursor, all other rows pull from the corpus.
                const rowPrepared = inStripeRow ? phrasePrepared! : prepared
                const rowCursor = inStripeRow ? stripeRowCursor : cursor
                const range = layoutNextLineRange(rowPrepared, rowCursor, remaining)
                if (range === null) {
                  // Source exhausted — wrap and try the rest next iteration.
                  if (inStripeRow) {
                    stripeRowCursor = { segmentIndex: 0, graphemeIndex: 0 }
                  } else {
                    cursor = { segmentIndex: 0, graphemeIndex: 0 }
                  }
                  continue
                }
                // Safety: if Pretext can't advance, bail rather than spin.
                if (range.end.segmentIndex === rowCursor.segmentIndex &&
                    range.end.graphemeIndex === rowCursor.graphemeIndex) {
                  break fillLoop
                }

                const txt = materializeLineRange(rowPrepared, range).text

                let unkernedWidth = 0
                for (let c = 0; c < txt.length; c++) {
                  const ch = txt[c]
                  unkernedWidth += (ch === ' ' || ch === '\t' || ch === '\n') ? rowCharWidth(' ') : rowCharWidth(ch)
                }
                const correctionRatio = unkernedWidth > 0 ? range.width / unkernedWidth : 1

                for (let c = 0; c < txt.length; c++) {
                  const ch = txt[c]
                  const cw = ((ch === ' ' || ch === '\t' || ch === '\n') ? rowCharWidth(' ') : rowCharWidth(ch)) * correctionRatio

                  if (ch === ' ' || ch === '\t' || ch === '\n') {
                    charX += cw
                    continue
                  }

                  // Heat at this cell. In sphere mode it's based on radial
                  // distance from the sphere edge — hottest right at the
                  // surface, fading to nothing at the flame tip. In legacy
                  // mode it's the same vertical mapping along each tongue.
                  let localHot: number
                  let tipFade: number
                  if (isLeftEyeHovered || isRightEyeHovered) {
                    localHot = 0.5;
                    tipFade = 1.0;
                  } else if (sphereOn) {
                    const ddx = charX - cx_s
                    const ddy = screenY - cy_s
                    const dd = Math.sqrt(ddx * ddx + ddy * ddy)
                    const flameLen = flameLenAtAngle(Math.atan2(ddy, ddx))
                    localHot =
                      flameLen > 1
                        ? clamp01(1 - (dd - R_s) / flameLen)
                        : 0
                    // Outer tipFade: 0 at the flame tip, ramps to 1 inward.
                    // Inner sphereFade: 0 at the sphere surface, ramps to 1
                    // outward. Multiplied so text fades on *both* boundaries
                    // — gives a soft halo of corona instead of a hard rim
                    // right against the sphere edge.
                    const tipF = clamp01(
                      params.tipFadePx > 0
                        ? (R_s + flameLen - dd) / params.tipFadePx
                        : 1,
                    )
                    const innerF = clamp01(
                      params.sphereFadePx > 0
                        ? (dd - R_s) / params.sphereFadePx
                        : 1,
                    )
                    tipFade = tipF * innerF
                  } else {
                    const ftAtX = flameTopAtX(charX)
                    const tongueH = fireBottom - ftAtX
                    localHot = tongueH > 1 ? (screenY - ftAtX) / tongueH : 1
                    tipFade = clamp01(
                      params.tipFadePx > 0
                        ? (screenY - ftAtX) / params.tipFadePx
                        : 1,
                    )
                  }

                  // Raw simplex noise in [-1, 1] — base flicker signal.
                  // In sphere mode we sample in POLAR coords (angle, radius):
                  //   X axis: angle around sphere   → flickerSx · 200 cycles
                  //                                   per radian
                  //   Y axis: distance from centre  → flickerSy cycles per px
                  //                                   MINUS time × flickerSt
                  // Subtracting time from the radial axis makes the noise
                  // pattern drift OUTWARD predictably.  The seam where
                  // atan2 wraps at ±π is hidden by sampling both sides and
                  // smooth-blending across a small wrap-zone.
                  // In legacy band mode we keep the original bottom→top
                  // scroll (time added to Y).
                  let flickerRaw: number
                  // Master scaler multiplies both Sx and Sy so the noise
                  // aspect ratio stays fixed when only the overall size
                  // blends between checkpoints.
                  const fScale = params.flickerScale
                  const flickerSxE = params.flickerSx * fScale
                  const flickerSyE = params.flickerSy * fScale
                  if (sphereOn && params.flickerMode === 'polar') {
                    // POLAR — sample noise at (angle × Sx · K, radius × Sy).
                    // Gives the noise a radial / wedge character that
                    // hugs the corona's geometry.  The angular phase
                    // shifts under scale changes, so blending Sx /
                    // flickerScale induces a slight rotation — use the
                    // cartesian mode if that bothers you.
                    const fdx = charX - cx_s
                    const fdy = screenY - cy_s
                    const fdd = Math.sqrt(fdx * fdx + fdy * fdy)
                    const fang = Math.atan2(fdy, fdx)
                    const angScale = flickerSxE * 200
                    const radCoord = fdd * flickerSyE - phaseFlicker
                    const s1 = nFlick(fang * angScale, radCoord)
                    // Hide the ±π wrap with a smoothstep blend across a
                    // narrow seam zone.
                    const seamDist = Math.PI - Math.abs(fang)
                    const SEAM_W = 0.6 // radians
                    if (seamDist < SEAM_W) {
                      const fang2 = fang > 0 ? fang - TWO_PI : fang + TWO_PI
                      const s2 = nFlick(fang2 * angScale, radCoord)
                      const x = 1 - seamDist / SEAM_W
                      const b = x * x * (3 - 2 * x) * 0.5
                      flickerRaw = s1 * (1 - b) + s2 * b
                    } else {
                      flickerRaw = s1
                    }
                  } else if (sphereOn) {
                    // CARTESIAN in sphere mode — sampled relative to the
                    // sphere centre so the texture travels with the
                    // corona, but uses real-space (x, y) axes so scale
                    // changes just zoom uniformly (no angular rotation).
                    flickerRaw = nFlick(
                      (charX  - cx_s) * flickerSxE,
                      (screenY - cy_s) * flickerSyE + phaseFlicker,
                    )
                  } else {
                    // Legacy band mode — always screen-axis Cartesian.
                    flickerRaw = nFlick(
                      charX  * flickerSxE,
                      screenY * flickerSyE + phaseFlicker,
                    )
                  }
                  // Gamma curve (signed): pow(|f|, contrast) · sign(f).
                  // contrast=1 is a no-op; the conditional skips the Math.pow
                  // call for the common case.
                  const flickerCurved = params.flickerContrast === 1
                    ? flickerRaw
                    : (flickerRaw < 0 ? -1 : flickerRaw > 0 ? 1 : 0) *
                      Math.pow(Math.abs(flickerRaw), params.flickerContrast)
                  // Bias shifts the centre of the distribution; amplitude
                  // scales the whole thing into the intensity equation.
                  const flicker = flickerCurved + params.flickerBias
                  let intensity =
                    localHot * 0.78 + flicker * params.flickerAmp + 0.06
                  intensity = clamp01(intensity)

                  const bucket = Math.min(
                    palette.length - 1,
                    (intensity * (palette.length - 1)) | 0,
                  )
                  const entry = palette[bucket]
                  // Per-row stripe blend: non-stripe rows fade with stripeT.
                  const alpha = entry.a * tipFade * rowAlphaMult
                  if (alpha < 0.025) {
                    charX += cw
                    continue
                  }
                  const alphaQ = ((alpha * 64) | 0) / 64

                  if (entry.fill !== lastFill) {
                    ctx.fillStyle = entry.fill
                    lastFill = entry.fill
                  }
                  if (alphaQ !== lastAlpha) {
                    ctx.globalAlpha = alphaQ
                    lastAlpha = alphaQ
                  }

                  // ── 2-D flow displacement around the cursor ─────────────
                  // Push characters radially outward from the cursor along a
                  // profile that peaks at half-radius. The result: chars near
                  // the cursor curve around it like fluid streamlines.
                  //
                  // The field boundary is made organic by sampling a separate
                  // simplex-noise layer at the character's world position —
                  // this warps the effective radius per-character so the
                  // border looks like a flickering energy field rather than a
                  // hard circle.
                  // ── Swirl (sphere mode only) ─────────────────────────────
                  // Rotate the character's position around the sphere
                  // centre by a noise-driven angle.
                  //
                  //   sdn  = (dd - R) / flameLen   — 0 at sphere, 1 at tip
                  //   wT   = clamp((sdn - swirlStart) / (1 - swirlStart)) ²
                  //          — tip-concentrated weight that ALSO masks out
                  //            everything below swirlStart fraction so the
                  //            base of the corona stays untouched.
                  //   angle = sampleSwirl(...) · swirlStrength · wT
                  //
                  // sampleSwirl branches on swirlType to choose how the
                  // noise field is sampled.
                  let drawX = charX
                  let drawY = screenY
                  if (sphereOn && params.swirlStrength !== 0) {
                    const sdx = charX - cx_s
                    const sdy = screenY - cy_s
                    const sdd2 = sdx * sdx + sdy * sdy
                    if (sdd2 > 1e-6) {
                      const sdd = Math.sqrt(sdd2)
                      const sAng = Math.atan2(sdy, sdx)
                      const sFL = flameLenAtAngle(sAng)
                      const sdn = sFL > 1
                        ? clamp01((sdd - R_s) / sFL)
                        : 1
                      // Remap sdn so that swirl only starts at `swirlStart`
                      // fraction along the corona.  Denominator guard keeps
                      // swirlStart ≈ 1 from blowing up.
                      const denom = 1 - params.swirlStart
                      const swirlT =
                        denom > 0.001
                          ? clamp01((sdn - params.swirlStart) / denom)
                          : 0
                      const tipWeight = swirlT * swirlT

                      let noiseVal = 0
                      const ss = params.swirlScale
                      // phaseSwirl is the integrated swirl phase — using it
                      // (instead of t × swirlSpeed) keeps the field continuous
                      // when swirlSpeed blends between scroll-arc checkpoints.
                      const sPh = phaseSwirl
                      switch (params.swirlType) {
                        case 'simplex':
                          noiseVal = nSwirl(
                            charX  * ss,
                            screenY * ss + sPh,
                          )
                          break
                        case 'turbulence': {
                          // 3-octave fBm: smooth base + finer detail.  The
                          // 1.4× / 2.0× rate multipliers are applied to the
                          // accumulated phase so the higher octaves still
                          // evolve faster than the base octave.
                          const n0 = nSwirl(charX * ss,       screenY * ss       + sPh)
                          const n1 = nSwirl(charX * ss * 2.1, screenY * ss * 2.1 + sPh * 1.4)
                          const n2 = nSwirl(charX * ss * 4.3, screenY * ss * 4.3 + sPh * 2.0)
                          noiseVal = n0 * 0.6 + n1 * 0.3 + n2 * 0.1
                          break
                        }
                        case 'radial':
                          noiseVal = nSwirl(sdd * ss, sPh)
                          break
                        case 'angular':
                          noiseVal = nSwirl(sAng * (ss * 200), sPh)
                          break
                        case 'pulse':
                          noiseVal = Math.sin(sPh * TWO_PI)
                          break
                      }

                      // Reduce rotation in narrow angular regions (the sides
                      // of the visible arc) where the band is too thin to
                      // absorb swirl displacement — quadratic falloff with
                      // the local flame length keeps the apex's swirl punch
                      // while calming the sides where gaps used to appear.
                      // No destination-band clamp: that produces vertical
                      // stacking at narrow spike tips by forcing many chars
                      // onto the same near-zero rotation.  Letting tip chars
                      // overshoot slightly past the band reads as a natural
                      // flame flare instead.
                      const lenWeight = maxFlameR > 1
                        ? (sFL / maxFlameR) * (sFL / maxFlameR)
                        : 1
                      // Suppress swirl as the stripe activates so the
                      // horizontal text line in the band stays straight
                      // instead of riding the sphere's noise rotation.
                      const effectiveSwirlStrength = isRightEyeHovered
                        ? 0
                        : params.swirlStrength * (1 - stripeT)
                      const angleOffset =
                        noiseVal * effectiveSwirlStrength * tipWeight * lenWeight
                      const cosA = Math.cos(angleOffset)
                      const sinA = Math.sin(angleOffset)
                      drawX = cx_s + sdx * cosA - sdy * sinA
                      drawY = cy_s + sdx * sinA + sdy * cosA
                    }
                  }

                  // ── Curl vortices (repel) ────────────────────────────────
                  // Push the char radially OUTWARD from each nearby vortex
                  // centre.  Each vortex carries its own amplitude (px) +
                  // radius (drawn from the [min, max] ranges), so the corona
                  // has a varied set of mild / strong repulsion points (and
                  // negative strengths attract instead).  Falloff is a
                  // gaussian so the effect dies off smoothly past 3σ.
                  if (numCurls > 0) {
                    for (let v = 0; v < numCurls; v++) {
                      const vx = curlCenters[v * 4]
                      const vy = curlCenters[v * 4 + 1]
                      const vS = curlCenters[v * 4 + 2]
                      const vR = curlCenters[v * 4 + 3]
                      if (vS === 0) continue
                      const sig2 = vR * vR
                      const cutoff2 = sig2 * 9
                      const cdx = drawX - vx
                      const cdy = drawY - vy
                      const cd2 = cdx * cdx + cdy * cdy
                      if (cd2 > cutoff2 || cd2 < 0.25) continue
                      const influence = Math.exp(-cd2 / (2 * sig2))
                      const cd = Math.sqrt(cd2)
                      const push = vS * influence
                      drawX += (cdx / cd) * push
                      drawY += (cdy / cd) * push
                    }
                  }

                  // Per-character displacement from the cursor field. The
                  // effect choice and its tunables live in the
                  // CursorEffect module; we just hand it the character +
                  // cursor + time + ce and take the new draw position
                  // back.  Reads the swirled position so cursor effects
                  // compose with the swirl naturally.
                  // Fade out the mouse repel effect if it crosses inside the giant black sphere
                  // Also fade with the stripe so the cursor-driven warp
                  // doesn't curve the horizontal stripe line.
                  let effectiveCe = ce * (1 - stripeT)
                  if (sphereOn && cursorEffect && effectiveCe > 0.001) {
                    const dx_c = cursorX - cx_s
                    const dy_c = cursorY - cy_s
                    const dist_c = Math.sqrt(dx_c * dx_c + dy_c * dy_c)
                    // Fade out over 40 pixels across the sphere boundary (R_s)
                    const mouseFade = Math.max(0, Math.min(1, (dist_c - R_s) / 40 + 0.5))
                    effectiveCe *= mouseFade
                  }

                  if (cursorEffect && effectiveCe > 0.001) {
                    const out = cursorEffect.displace(
                      drawX,
                      drawY,
                      cursorX,
                      cursorY,
                      timeMs,
                      effectiveCe
                    )
                    drawX = out[0]
                    drawY = out[1]
                  }

                  // All eye repel fields (main / sides / decor / wall) get
                  // attenuated with the stripe so they don't warp the
                  // horizontal phrase band.  Pupil rendering passes later
                  // still use full strength for opacity, so eyes stay
                  // visible — only the char-displacement halo dims out.
                  const eyeRepelMult = 1 - stripeT

                  // Constant center repel effect (like the mouse effect but anchored to the middle)
                  if (centerRepelStrength > 0.001 || leftRepelStrength > 0.001 || rightRepelStrength > 0.001) {
                    if (centerRepelEffect && fadeMain > 0) {
                      const out = centerRepelEffect.displace(
                        drawX, drawY, cx_s, h * 0.8, timeMs, centerRepelStrength * fadeMain * eyeRepelMult
                      )
                      drawX = out[0]; drawY = out[1]
                    }
                    if (leftRepelEffect && fadeLeft > 0) {
                      const out = leftRepelEffect.displace(
                        drawX, drawY, cx_s - w * 0.15, h * 0.85, timeMs, leftRepelStrength * fadeLeft * eyeRepelMult
                      )
                      drawX = out[0]; drawY = out[1]
                    }
                    if (rightRepelEffect && fadeRight > 0) {
                      const out = rightRepelEffect.displace(
                        drawX, drawY, cx_s + w * 0.15, h * 0.85, timeMs, rightRepelStrength * fadeRight * eyeRepelMult
                      )
                      drawX = out[0]; drawY = out[1]
                    }
                  }

                  // Decorative eyes — purely visual repel holes laid out on
                  // a bowl-shaped arc above the central eye (middle eye sags
                  // toward the central one, outer eyes ride higher).
                  // Pupils are drawn later, looking straight ahead.
                  const decorN = decorEyeEffects.length
                  for (let di = 0; di < decorN; di++) {
                    const ds = (decorEyeStrengths[di] ?? 0) * eyeRepelMult
                    if (ds <= 0.001) continue
                    const eff = decorEyeEffects[di]
                    if (!eff) continue
                    const [eyeX, eyeY] = decorEyePos(di, decorN, cx_s, w, h)
                    const out = eff.displace(drawX, drawY, eyeX, eyeY, timeMs, ds)
                    drawX = out[0]; drawY = out[1]
                  }

                  // Final-scene wall eyes — same displacement technique as
                  // the decor eyes, but with caller-supplied positions and
                  // bound-word pupils (drawn later in the pupil pass).
                  const wallN = wallEyes.length
                  for (let wi = 0; wi < wallN; wi++) {
                    const we = wallEyes[wi]
                    const wallS = we.strength * eyeRepelMult
                    if (wallS <= 0.001 || !we.effect) continue
                    const out = we.effect.displace(
                      drawX, drawY, we.x, we.y, timeMs, wallS,
                    )
                    drawX = out[0]; drawY = out[1]
                  }

                  // Phrase-centre elliptical mask + pure vertical push.
                  // The mask defines an eye-shaped clearing (wide and
                  // tapered at the corners); inside it, every char is
                  // pushed straight up or down away from the phrase
                  // line.  Pure vertical direction guarantees the
                  // phrase ends get cleared too — radial push would
                  // weaken to horizontal there and leave them covered.
                  if (inStripeRow && stripeT > 0 && ellipseA > 0 && ellipseB > 0) {
                    const relX = drawX - phraseCx
                    const relY = drawY - ellipseCy
                    const nx = relX / ellipseA
                    const ny = relY / ellipseB
                    const normSq = nx * nx + ny * ny
                    if (normSq < 1) {
                      // Linear-in-normSq falloff — strong inside, smooth
                      // to zero at the boundary.  Stays generous near
                      // the phrase ends where a squared profile would
                      // taper too quickly.
                      const push = (1 - normSq) * phraseClearAmp * stripeT
                      // Pure vertical push, away from the phrase line.
                      if (relY <= 0) drawY -= push
                      else drawY += push
                    }
                  }

                  if (centerRepelStrength > 0.001 || leftRepelStrength > 0.001 || rightRepelStrength > 0.001) {
                    
                    // Track which character is closest to each pupil center
                    if (fadeMain > 0) {
                      const dx_main = drawX - cx_s
                      const dy_main = drawY - (h * 0.8)
                      const dist_main = dx_main*dx_main + dy_main*dy_main
                      if (dist_main < mainPupilMinDist) {
                        mainPupilMinDist = dist_main
                        mainPupilChar = ch
                      }
                    }

                    if (fadeLeft > 0) {
                      const dx_left = drawX - (cx_s - w * 0.15)
                      const dy_left = drawY - (h * 0.85)
                      const dist_left = dx_left*dx_left + dy_left*dy_left
                      if (dist_left < leftPupilMinDist) {
                        leftPupilMinDist = dist_left
                        leftPupilChar = ch
                      }
                    }

                    if (fadeRight > 0) {
                      const dx_right = drawX - (cx_s + w * 0.15)
                      const dy_right = drawY - (h * 0.85)
                      const dist_right = dx_right*dx_right + dy_right*dy_right
                      if (dist_right < rightPupilMinDist) {
                        rightPupilMinDist = dist_right
                        rightPupilChar = ch
                      }
                    }
                  }

                  ctx.fillText(ch, drawX, drawY)
                  charX += cw
                }

                if (inStripeRow) stripeRowCursor = range.end
                else cursor = range.end
              }
            }
          }
        }
      }

      // Persist the phrase cursor across frames so the stripe text flows
      // upward continuously, like the corpus.
      stripeCursor = stripeRowCursor

      // ── Centred phrase ──────────────────────────────────────────────────
      // Each wrapped phrase line drawn glyph-by-glyph in the same font +
      // tip palette colour the stripe pretext uses.  Together with the
      // ellipse displacement above it reads as the phrase "pushing apart"
      // the looped stripe — same way the wall-eye pupil punches its hole
      // through the surrounding fire.  The source is printed below the
      // phrase block, smaller and italic, with reduced alpha.
      if (stripeActive && phraseLines.length > 0) {
        ctx.save()
        ctx.fillStyle = palette[palette.length - 1].fill
        ctx.globalAlpha = stripeT
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.font = PHRASE_CENTER_FONT
        // Vertically centre the multi-line block on the phrase line.
        const firstLineCy = phraseCy - phraseBlockHalfH + phraseLineSpacing / 2
        for (let li = 0; li < phraseLines.length; li++) {
          const line = phraseLines[li]
          const lineY = firstLineCy + li * phraseLineSpacing
          let glyphX = phraseCx - line.lineW / 2
          for (let k = 0; k < line.text.length; k++) {
            ctx.fillText(line.text[k], glyphX, lineY)
            glyphX += line.widths[k]
          }
        }
        // Source line — below the phrase block, italic, dimmer.
        if (stripeSource) {
          const sourceY = phraseCy + phraseBlockHalfH + sourceGap
          ctx.textAlign = 'center'
          ctx.font = `italic 400 ${sourceLinePx}px ${params.fontFamily}`
          ctx.globalAlpha = stripeT * 0.6
          ctx.fillText(stripeSource, phraseCx, sourceY)
        }
        ctx.restore()
      }

      // ── Draw stable pupils ────────────────────────────────────────────────
      let bgWordToDraw: string | null = null
      let bgWordColor: string | null = null

      const anyDecorActive = decorEyeStrengths.some(s => s > 0.001)
      const anyWallActive = wallEyes.some(e => e.strength > 0.001)
      if (centerRepelStrength > 0 || leftRepelStrength > 0 || rightRepelStrength > 0 || anyDecorActive || anyWallActive) {
        ctx.save()
        // Use the brightest color (the tip of the flame)
        ctx.fillStyle = palette[palette.length - 1].fill
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // (Removed legacy "look at the in-progress eye after finishing" logic
        //  along with the hard-coded +80 y nudge it applied to the side-eye
        //  look targets — all three main pupils now simply track the cursor.)

        const drawPupil = (char: string, px: number, py: number, pupilIndex: number, repelFade: number) => {
          if (repelFade <= 0) return

          let inProgressIdx = -1
          if (collectedWordsList.main.length < 5) inProgressIdx = 0
          else if (collectedWordsList.left.length < 5) inProgressIdx = 1
          else if (collectedWordsList.right.length < 5) inProgressIdx = 2

          const lookDx = cursorX - px
          const lookDy = cursorY - py
          const lookDist = Math.sqrt(lookDx * lookDx + lookDy * lookDy)
          const cursorDist = lookDist

          let targetOx = 0
          let targetOy = 0

          if (lookDist > 0 && cursorActive) {
            const maxLook = (pupilIndex === 0 ? 55 : 35) * pupilLookStrength // Pushed further out, especially for center eye
            const lookAmt = Math.min(lookDist / 300, 1) * maxLook
            targetOx = (lookDx / lookDist) * lookAmt
            targetOy = (lookDy / lookDist) * lookAmt
          }

          // Smooth organic tracking via simple lerp
          pupilOffsets[pupilIndex].x += (targetOx - pupilOffsets[pupilIndex].x) * 0.15
          pupilOffsets[pupilIndex].y += (targetOy - pupilOffsets[pupilIndex].y) * 0.15

          let charToDraw = char
          let isHoveringWord = false
          let hoveredWordIndex = -1

          if (cursorDist < 60 && cursorActive && pupilIndex === inProgressIdx) {
            // Pick a new word if we aren't currently locked, or if the lock expired
            if (timeMs > activeWordEndTime) {
              const list = pupilIndex === 0 ? mainEyeWords : (pupilIndex === 1 ? leftEyeWords : rightEyeWords);
              activeWordIndex = list[Math.floor(timeMs / 400) % list.length]; // pseudo-random word from the fast-appearance list
              activeWordEndTime = timeMs + 400 // lock for at least 400ms on screen
              activeWordEyeIndex = pupilIndex // bind lock to this specific eye
            }
          }

          // While the right eye is the active word source, mirror its word
          // through the left eye too (left pupil shows the same caps-word).
          const isLeftMirroringRight = pupilIndex === 1 && activeWordEyeIndex === 2
          if (activeWordIndex !== -1
              && timeMs <= activeWordEndTime
              && (pupilIndex === activeWordEyeIndex || isLeftMirroringRight)) {
            isHoveringWord = true
            hoveredWordIndex = activeWordIndex
            charToDraw = quotesCaps[hoveredWordIndex]
          }

          // Strobe effect: alternate color and black if hovering
          if (isHoveringWord) {
            ctx.font = fontShorthand(pupilIndex === 0 ? 1.10 : 1.05) // Main eye +10%, side eyes +5%
            if (pupilIndex === inProgressIdx || pupilIndex === activeWordEyeIndex) inProgressEyeHovered = true

            let isColored = false
            let color = '#ffffff'
            let darkColor = '#000000' // Black for non-colored words

            // For coloring purposes, the left eye mirrors the right eye when
            // mirroring, so it reuses the right-eye colour rules.  Collection
            // is gated on actually BEING that eye (not the mirror), so the
            // right eye still owns the count.
            const colorPupilIndex = isLeftMirroringRight ? 2 : pupilIndex

            if (colorPupilIndex === 0 && mainColoredWords.has(hoveredWordIndex)) {
              isColored = true
              color = params.wordColorMain
              if (pupilIndex === 0 && collectedWordsList.main.length < 5 && !collectedWords.main.has(charToDraw)) {
                collectedWords.main.add(charToDraw)
                collectedWordsList.main.push(charToDraw)
              }
            } else if (colorPupilIndex === 1 && leftColoredWords.has(hoveredWordIndex)) {
              isColored = true
              color = params.wordColorLeft
              if (pupilIndex === 1 && collectedWordsList.left.length < 5 && !collectedWords.left.has(charToDraw)) {
                collectedWords.left.add(charToDraw)
                collectedWordsList.left.push(charToDraw)
              }
            } else if (colorPupilIndex === 2 && rightColoredWords.has(hoveredWordIndex)) {
              isColored = true
              color = params.wordColorRight
              if (pupilIndex === 2 && collectedWordsList.right.length < 5 && !collectedWords.right.has(charToDraw)) {
                collectedWords.right.add(charToDraw)
                collectedWordsList.right.push(charToDraw)
              }
            }

            if (isColored) {
              const rgb = hexToRgb(color)
              const dr = Math.floor(rgb[0] * 0.3)
              const dg = Math.floor(rgb[1] * 0.3)
              const db = Math.floor(rgb[2] * 0.3)
              darkColor = `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`
            }

            const isVisibleCycle = Math.floor(timeMs / 50) % 2 === 0
            const finalColor = isVisibleCycle ? color : darkColor
            ctx.fillStyle = finalColor

            if (isColored) {
              bgWordToDraw = charToDraw
              bgWordColor = finalColor
            }
          } else {
            ctx.font = fontShorthand() // Restore normal size for 'O'
            ctx.fillStyle = palette[palette.length - 1].fill
          }

          const strength = pupilIndex === 0 ? centerRepelStrength : (pupilIndex === 1 ? leftRepelStrength : rightRepelStrength)
          ctx.globalAlpha = Math.min(1, strength * 3) * repelFade
          ctx.fillText(charToDraw, px + pupilOffsets[pupilIndex].x, py + pupilOffsets[pupilIndex].y)
        }

        drawPupil(mainPupilChar, cx_s, h * 0.8, 0, fadeMain)
        drawPupil(leftPupilChar, cx_s - w * 0.15, h * 0.85, 1, fadeLeft)
        drawPupil(rightPupilChar, cx_s + w * 0.15, h * 0.85, 2, fadeRight)

        // Decorative pupils — one per decor eye, looking straight ahead (no
        // cursor tracking, no offset).  Sized like the side-eye pupils and
        // tinted with the same palette tip.
        ctx.font = fontShorthand()
        ctx.fillStyle = palette[palette.length - 1].fill
        const decorN2 = decorEyeEffects.length
        for (let di = 0; di < decorN2; di++) {
          const ds = decorEyeStrengths[di] ?? 0
          if (ds <= 0.001) continue
          const [eyeX, eyeY] = decorEyePos(di, decorN2, cx_s, w, h)
          ctx.globalAlpha = Math.min(1, ds * 3)
          ctx.fillText('O', eyeX, eyeY)
        }

        // Final-scene wall pupils — 'O' by default; the bound word when
        // the cursor is within WALL_EYE_HOVER_R of the eye centre.  The
        // 'O' pupil tracks the cursor (same lerp-on-offset pattern as the
        // main eye), so the wall feels alive even when no eye is hovered.
        const wallN2 = wallEyes.length
        if (wallN2 > 0) {
          const baseFont = fontShorthand()
          // Word font matches the fire's body font (Cormorant Garamond)
          // at a slightly bigger size so it reads clearly inside the hole.
          const wordFont = `700 22px ${params.fontFamily}`
          // Ensure the per-pupil smoothing buffer keeps up with the wall.
          while (wallPupilOffsets.length < wallN2) {
            wallPupilOffsets.push({ x: 0, y: 0 })
          }
          for (let wi = 0; wi < wallN2; wi++) {
            const we = wallEyes[wi]
            if (we.strength <= 0.001) continue
            ctx.fillStyle = palette[palette.length - 1].fill
            ctx.globalAlpha = Math.min(1, we.strength * 3)

            const lookDx = cursorX - we.x
            const lookDy = cursorY - we.y
            const lookDist = Math.sqrt(lookDx * lookDx + lookDy * lookDy)
            const isHover =
              cursorActive && lookDist < WALL_EYE_HOVER_R

            // Cursor-tracking offset (lerped for organic motion).  Match
            // the side-pupil tuning: maxLook 35 px, falls off past ~300 px.
            let targetOx = 0
            let targetOy = 0
            if (lookDist > 0 && cursorActive) {
              const maxLook = 35 * pupilLookStrength
              const lookAmt = Math.min(lookDist / 300, 1) * maxLook
              targetOx = (lookDx / lookDist) * lookAmt
              targetOy = (lookDy / lookDist) * lookAmt
            }
            const off = wallPupilOffsets[wi]
            off.x += (targetOx - off.x) * 0.15
            off.y += (targetOy - off.y) * 0.15

            if (isHover && we.word) {
              ctx.font = wordFont
              // Word stays centred on the eye — no offset; it'd shift the
              // text out of the hole the repel field opened.
              // Colour matches the source-eye palette (main / left / right).
              ctx.fillStyle = we.wordColor ?? palette[palette.length - 1].fill
              // Per-letter jitter — small, smoothly-moving 2D noise sampled
              // per character index + slow time axis.  Letters are drawn
              // individually with a left baseline so we control x precisely.
              ctx.textAlign = 'left'
              const letters = we.word
              let totalW = 0
              const widths: number[] = new Array(letters.length)
              for (let li = 0; li < letters.length; li++) {
                widths[li] = ctx.measureText(letters[li]).width
                totalW += widths[li]
              }
              const tNoise = timeMs * 0.0014
              const amp = 1.8
              let xCursor = we.x - totalW / 2
              for (let li = 0; li < letters.length; li++) {
                const jx = nWallWord(li * 0.7, tNoise) * amp
                const jy = nWallWord(li * 0.7 + 100, tNoise) * amp
                ctx.fillText(letters[li], xCursor + jx, we.y + jy)
                xCursor += widths[li]
              }
              ctx.textAlign = 'center'
            } else {
              ctx.font = baseFont
              ctx.fillStyle = palette[palette.length - 1].fill
              ctx.fillText('O', we.x + off.x, we.y + off.y)
            }
          }
        }

        ctx.restore()
      }

      ctx.globalAlpha = 1

      // (Removed: Glow post-pass — params.glowOpacity / glowRadius /
      // glowSoftness / glowColor remain in FireParams for the controls
      // panel but are no longer rendered.)

      if (bgWordToDraw && bgWordColor) {
        ctx.save()
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = bgWordColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'

        const baseSize = 100
        ctx.font = `900 ${baseSize}px Inter, sans-serif`
        const metrics = ctx.measureText(bgWordToDraw)
        
        const textWidth = metrics.width || 1
        const textHeight = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) || baseSize
        
        ctx.translate(w / 2, h / 2)
        ctx.scale(w / textWidth, h / textHeight)
        
        // Offset Y to perfectly center the bounding box vertically
        const yOffset = (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2 || 0
        ctx.fillText(bgWordToDraw, 0, yOffset)
        
        ctx.restore()
      }
    },

    resize(nextW, nextH) {
      w = nextW
      h = nextH
      ensureSampleBuffer()
    },

    setParams(partial) {
      Object.assign(params, partial)
      // Color stops → cheap palette rebuild.
      if (
        'colorBase' in partial ||
        'colorLow' in partial ||
        'colorHot' in partial ||
        'colorTip' in partial
      ) {
        rebuildPalette()
      }
      // Font shape → re-prepare via Pretext + clear width cache.
      if (
        'fontFamily' in partial ||
        'fontSize' in partial ||
        'fontWeight' in partial ||
        'letterSpacing' in partial
      ) {
        recomputeFont()
      }
    },

    getParams() {
      return params
    },

    setCursor(x, y, active) {
      cursorX = x
      cursorY = y
      cursorActive = active
    },

    setMask(m) {
      mask = m
    },

    setCursorEffect(e) {
      cursorEffect = e
    },
    setCenterRepels(main, left, right, strength, lookStrength = 1, leftStrength = strength, rightStrength = strength) {
      centerRepelEffect = main
      leftRepelEffect = left
      rightRepelEffect = right
      centerRepelStrength = strength
      pupilLookStrength = lookStrength
      leftRepelStrength = leftStrength
      rightRepelStrength = rightStrength
    },

    setDecorEyes(effects, strengths) {
      decorEyeEffects = effects
      decorEyeStrengths = strengths
    },

    setWallEyes(eyes) {
      wallEyes = eyes
    },

    setStripe(t, phrase, source) {
      stripeT = t
      // Rebuild the phrase-prepared handle only when the text actually
      // changes — prepare is the expensive call, layout is the cheap one.
      if (phrase !== stripePhrase) {
        stripePhrase = phrase
        rebuildPhrasePrepared()
      }
      stripeSource = source
    },

    getCollectedWords() {
      return collectedWordsList
    },

    getCurrentTipColor(_timeMs) {
      // Reads the integrated `phaseHue` accumulator that the draw loop
      // advances each frame, so the tip-colour cycle stays continuous when
      // colorHueShiftSpeed blends between scroll-arc checkpoints.
      const rgb = hslToRgb(hslTip[0] + phaseHue, hslTip[1], hslTip[2])
      return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    },
    isInProgressEyeHovered() { return inProgressEyeHovered },
  }
}

// ─── Palette ────────────────────────────────────────────────────────────────

type RGB = [number, number, number]

/** Compute the (x, y) position of the i-th decorative eye out of `n`,
 *  laid out on a dome-shaped arc above the central eye.  The middle eye
 *  rides highest; the outer eyes hang lower.  Shared by the per-character
 *  displacement loop and the pupil-draw pass so both agree on where each
 *  eye lives. */
function decorEyePos(i: number, n: number, cx: number, w: number, h: number): [number, number] {
  const tt = n > 1 ? i / (n - 1) : 0.5
  const s = (tt - 0.5) * 2          // -1 (leftmost) … +1 (rightmost)
  const eyeX = cx + s * w * 0.35    // wide spread — bigger gaps than the side eyes
  // Concave-down dome: middle eye at h*0.40 (top), outer eyes sag down to
  // h*0.62.  Stronger arch than before — the row now visibly bows over
  // the central eye instead of riding nearly level.
  const eyeY = h * 0.40 + h * 0.22 * s * s
  return [eyeX, eyeY]
}

function buildPalette(
  stops: number,
  base: RGB, low: RGB, hot: RGB, tip: RGB,
): Array<{ fill: string; a: number }> {
  // Four user-controlled stops, distributed so the hot zone occupies most of
  // the visible body of a tongue.
  const keys: Array<[number, RGB]> = [
    [0.0,  base],
    [0.35, low],
    [0.72, hot],
    [1.0,  tip],
  ]
  const out: Array<{ fill: string; a: number }> = []
  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1)
    let lo = keys[0]
    let hi = keys[keys.length - 1]
    for (let k = 0; k < keys.length - 1; k++) {
      if (t >= keys[k][0] && t <= keys[k + 1][0]) {
        lo = keys[k]
        hi = keys[k + 1]
        break
      }
    }
    const lt = (t - lo[0]) / Math.max(1e-6, hi[0] - lo[0])
    const r = (lo[1][0] + (hi[1][0] - lo[1][0]) * lt) | 0
    const g = (lo[1][1] + (hi[1][1] - lo[1][1]) * lt) | 0
    const b = (lo[1][2] + (hi[1][2] - lo[1][2]) * lt) | 0
    // Alpha bias: hot end fully opaque, tongue base ~25% so the bottom of
    // the band reads as glowing rather than blocky.
    const a = clamp01(0.25 + 0.75 * t)
    out.push({ fill: `rgb(${r},${g},${b})`, a })
  }
  return out
}

/** Convert "#rrggbb" → [h°, s, l] with h in [0, 360), s/l in [0, 1]. */
function hexToHsl(hex: string): [number, number, number] {
  const rgb = hexToRgb(hex)
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r)      h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else                h = (r - g) / d + 4
    h *= 60
  }
  return [h, s, l]
}

/** Convert HSL (h°, s ∈ [0,1], l ∈ [0,1]) → [r, g, b] in [0, 255]. */
function hslToRgb(h: number, s: number, l: number): RGB {
  h = (((h % 360) + 360) % 360) / 360
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  function hue2rgb(t: number): number {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [
    Math.round(hue2rgb(h + 1 / 3) * 255),
    Math.round(hue2rgb(h)         * 255),
    Math.round(hue2rgb(h - 1 / 3) * 255),
  ]
}

/** Parse "#rrggbb" or "#rgb" into [r, g, b]. Falls back to black on bad input. */
function hexToRgb(hex: string): [number, number, number] {
  if (typeof hex !== 'string') return [0, 0, 0]
  let s = hex.trim()
  if (s.startsWith('#')) s = s.slice(1)
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2]
  if (s.length !== 6) return [0, 0, 0]
  const n = parseInt(s, 16)
  if (Number.isNaN(n)) return [0, 0, 0]
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}
