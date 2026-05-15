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
} from '@chenglou/pretext'
import { createNoise2D } from 'simplex-noise'
import type { CursorEffect } from './cursor-effects'

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
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 15,
  fontWeight: 400,
  lineHeight: 16,
  letterSpacing: 0,
  textScrollSpeed: 13,
  fireBandFrac: 0.9,
  tongueBase: 0.61,
  tongueBigAmp: 0.34,
  tongueBigSx: 0.1000,
  tongueBigSt: 0.2,
  tongueMedAmp: 0.25,
  tongueMedSx: 0.05,
  tongueMedSt: 0.65,
  flickerAmp: 0.33,
  flickerSx: 0.008,
  flickerSy: 0.001,
  flickerSt: 0.85,
  flickerBias: 0.5,
  flickerContrast: 1.25,
  tipFadePx: 578,
  sphereEnabled: true,
  sphereCxFrac: 0.50,
  sphereCyFrac: 1.86,
  sphereRadiusFrac: 1.28,
  flameRadialReach: 0.44,
  sphereFadePx: 17,
  colorBase: '#a3a3a3',
  colorLow: '#000000',
  colorHot: '#6b5798',
  colorTip: '#dedede',
  colorHueShiftSpeed: 0,
  glowOpacity: 0.4,
  glowRadius: 23,
  glowSoftness: 0.29,
  glowColor: '#ff8800',
  pixelSize: 1,
  scanlineOpacity: 0.5,
  scanlineSpacing: 2,
  swirlStrength: 0.052,
  swirlScale: 0.0012,
  swirlSpeed: 0.35,
  swirlStart: 0.11,
  swirlType: 'turbulence',
}

/** Default colors tuned for a light (white-ish) background — deeper and more saturated. */
export const FIRE_DEFAULTS_LIGHT: Pick<
  FireParams,
  'colorBase' | 'colorLow' | 'colorHot' | 'colorTip'
> = {
  colorBase: '#1c0000',
  colorLow: '#7a1100',
  colorHot: '#cc4d00',
  colorTip: '#e8a000',
}

// ─── Types ──────────────────────────────────────────────────────────────────

/** Sampling step (px) along x for the per-column flame-top curve. Smaller is
 *  smoother but more work; 6 px gives clearly-defined tongues. */
const FLAME_SAMPLE_STEP = 6

/** Minimum span width (px) we'll bother laying text into. Below this Pretext
 *  may struggle to fit even a single character. */
const MIN_SPAN_W = 32

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
   * Read the live `colorTip` palette stop with the current hue rotation
   * applied (same math the glow post-pass uses), returned as an
   * `rgb(r, g, b)` string suitable for direct use in CSS / canvas.
   * `timeMs` should be the rAF timestamp so the rotation matches the
   * current frame.
   */
  getCurrentTipColor(timeMs: number): string
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

  // Offscreen scratch canvas used by the glow post-pass — resized to match
  // the main canvas's device-pixel buffer on demand.
  const glowCanvas = document.createElement('canvas')
  const glowCtx = glowCanvas.getContext('2d')!

  const params: FireParams = { ...FIRE_DEFAULTS }

  let w = viewportW
  let h = viewportH

  // ── Font + Pretext handle ────────────────────────────────────────────────
  // Compose canvas font shorthand from the live params. Changes to family,
  // size, weight or letterSpacing all require re-preparing the text — Pretext
  // measures every segment with the actual font, so its segment widths are
  // baked-in.
  function fontShorthand(): string {
    return `${params.fontWeight} ${params.fontSize}px ${params.fontFamily}`
  }

  let prepared = prepareWithSegments(text, fontShorthand(), {
    letterSpacing: params.letterSpacing,
  })

  // Offscreen 2D context purely for cached per-character width measurement.
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')!
  const charWidthCache = new Map<string, number>()

  function applyMeasureCtxFont(): void {
    measureCtx.font = fontShorthand()
    // Canvas letterSpacing is supported in modern browsers; cast through
    // unknown so older lib.dom typings don't trip the build.
    ;(measureCtx as unknown as { letterSpacing?: string }).letterSpacing =
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

  /** Re-prep Pretext + clear measurement caches when font changes. */
  function recomputeFont(): void {
    prepared = prepareWithSegments(text, fontShorthand(), {
      letterSpacing: params.letterSpacing,
    })
    applyMeasureCtxFont()
    charWidthCache.clear()
    // Cursor positions are still segment indices into the same source text,
    // and segment indexing is text-shape-invariant, so they remain valid.
  }

  // ── Scroll state ──────────────────────────────────────────────────────────
  // The scroll cursor is the cursor each frame's render starts from. It
  // advances over time so text appears to flow through the flame shape.
  let scrollCursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let scrollAccum = 0
  let prevTimeMs = 0

  // ── Cursor state ──────────────────────────────────────────────────────────
  let cursorX = 0
  let cursorY = 0
  let cursorActive = false
  /**
   * Raw linear interpolant that chases 0 (inactive) or 1 (active).
   * A smoothstep is applied before use to get ease-in / ease-out.
   */
  let cursorStrengthRaw = 0

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
      const maxFlameR = sphereOn ? minDim * params.flameRadialReach : 0

      // In sphere mode the band is the full viewport. Otherwise fall back to
      // the legacy bottom-band geometry driven by fireBandFrac.
      const fireBottom = h
      const fireTop = sphereOn ? 0 : h * (1 - params.fireBandFrac)
      const bandH = fireBottom - fireTop
      if (bandH <= 0) return

      const t = timeMs * 0.001

      // ── Hue rotation ─────────────────────────────────────────────────────
      // When colorHueShiftSpeed > 0, rebuild the palette LUT each frame
      // with a time-driven hue offset.  Only the low/hot/tip stops rotate;
      // base stays anchored.  72 stop rebuild is ~µs-scale.
      // `hueDeg` is hoisted so the glow post-pass below can read the same
      // offset — the glow tint follows the live (shifted) tip colour.
      const hueDeg =
        params.colorHueShiftSpeed > 0
          ? (t * params.colorHueShiftSpeed) % 360
          : 0
      if (params.colorHueShiftSpeed > 0) {
        palette = buildPaletteWithHueShift(hueDeg)
      }

      // ── Time-based scroll: advance scrollCursor by ~one line every tick ──
      const dt = prevTimeMs > 0 ? Math.min(0.1, (timeMs - prevTimeMs) / 1000) : 0
      prevTimeMs = timeMs

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
        for (let a = 0; a < NUM_ANGLES; a++) {
          const angle = (a / NUM_ANGLES) * TWO_PI - Math.PI
          const ax = Math.cos(angle)
          const ay = Math.sin(angle)
          let frac =
            params.tongueBase +
            params.tongueBigAmp *
              nBig(ax * sxBig, ay * sxBig + t * params.tongueBigSt) +
            params.tongueMedAmp *
              nMed(
                ax * sxMed + 13.7,
                ay * sxMed + 4.1 + t * params.tongueMedSt,
              )
          if (frac < 0) frac = 0
          else if (frac > 1) frac = 1
          flameLenByAngle[a] = frac * maxFlameR
        }
      } else {
        for (let i = 0; i < numSamples; i++) {
          const x = i * FLAME_SAMPLE_STEP
          let flameFrac =
            params.tongueBase +
            params.tongueBigAmp *
              nBig(x * params.tongueBigSx, t * params.tongueBigSt) +
            params.tongueMedAmp *
              nMed(
                x * params.tongueMedSx + 13.7,
                t * params.tongueMedSt + 4.1,
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

      // Iterate rows bottom → top. As cursor advances through the corpus
      // within a frame, lower rows hold earlier-in-stream text and upper
      // rows hold later. Combined with scrollCursor advancing over time,
      // text appears to migrate upward — flames rising.
      const numRows = Math.ceil(bandH / lineHeight) + 1
      for (let r = 0; r < numRows; r++) {
        const screenY = fireBottom - lineHeight - r * lineHeight
        if (screenY < fireTop - lineHeight) break

        // Walk the sample buffer once, processing each in-flame span as
        // we encounter its right edge. A span is a contiguous x-range
        // where this row's screenY is below the column's flame top.
        let inSpan = false
        let spanStart = 0
        for (let i = 0; i <= numSamples; i++) {
          const x = i < numSamples ? i * FLAME_SAMPLE_STEP : w + 1
          let inside: boolean
          if (sphereOn) {
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
              fillLoop: while (fills++ < 8) {
                const remaining = spanEnd - charX
                const minW = fills === 1 ? MIN_SPAN_W : 4
                if (remaining < minW) break
                const range = layoutNextLineRange(prepared, cursor, remaining)
                if (range === null) {
                  // Source exhausted — wrap and try the rest next iteration.
                  cursor = { segmentIndex: 0, graphemeIndex: 0 }
                  continue
                }
                // Safety: if Pretext can't advance, bail rather than spin.
                if (range.end.segmentIndex === cursor.segmentIndex &&
                    range.end.graphemeIndex === cursor.graphemeIndex) {
                  break fillLoop
                }
                const txt = materializeLineRange(prepared, range).text
                for (let c = 0; c < txt.length; c++) {
                  const ch = txt[c]
                  if (ch === ' ' || ch === '\t' || ch === '\n') {
                    charX += charWidth(' ')
                    continue
                  }
                  const cw = charWidth(ch)

                  // Heat at this cell. In sphere mode it's based on radial
                  // distance from the sphere edge — hottest right at the
                  // surface, fading to nothing at the flame tip. In legacy
                  // mode it's the same vertical mapping along each tongue.
                  let localHot: number
                  let tipFade: number
                  if (sphereOn) {
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
                  const flickerRaw = nFlick(
                    charX  * params.flickerSx,
                    screenY * params.flickerSy + t * params.flickerSt,
                  )
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
                  const alpha = entry.a * tipFade
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
                      const sp = params.swirlSpeed
                      switch (params.swirlType) {
                        case 'simplex':
                          noiseVal = nSwirl(
                            charX  * ss,
                            screenY * ss + t * sp,
                          )
                          break
                        case 'turbulence': {
                          // 3-octave fBm: smooth base + finer detail.
                          const n0 = nSwirl(charX * ss,       screenY * ss       + t * sp)
                          const n1 = nSwirl(charX * ss * 2.1, screenY * ss * 2.1 + t * sp * 1.4)
                          const n2 = nSwirl(charX * ss * 4.3, screenY * ss * 4.3 + t * sp * 2.0)
                          noiseVal = n0 * 0.6 + n1 * 0.3 + n2 * 0.1
                          break
                        }
                        case 'radial':
                          // Same distance from sphere → same swirl angle.
                          noiseVal = nSwirl(sdd * ss, t * sp)
                          break
                        case 'angular':
                          // Same angle around sphere → same swirl.  ang is
                          // in radians [-π, π]; multiplier scales it into
                          // a meaningful number of cycles around the corona.
                          noiseVal = nSwirl(sAng * (ss * 200), t * sp)
                          break
                        case 'pulse':
                          // Pure time oscillation; spatial uniformity.
                          noiseVal = Math.sin(t * sp * TWO_PI)
                          break
                      }

                      const angleOffset =
                        noiseVal * params.swirlStrength * tipWeight
                      const cosA = Math.cos(angleOffset)
                      const sinA = Math.sin(angleOffset)
                      drawX = cx_s + sdx * cosA - sdy * sinA
                      drawY = cy_s + sdx * sinA + sdy * cosA
                    }
                  }

                  // Per-character displacement from the cursor field. The
                  // effect choice and its tunables live in the
                  // CursorEffect module; we just hand it the character +
                  // cursor + time + ce and take the new draw position
                  // back.  Reads the swirled position so cursor effects
                  // compose with the swirl naturally.
                  if (cursorEffect && ce > 0.001) {
                    const out = cursorEffect.displace(
                      drawX,
                      drawY,
                      cursorX,
                      cursorY,
                      timeMs,
                      ce,
                    )
                    drawX = out[0]
                    drawY = out[1]
                  }

                  ctx.fillText(ch, drawX, drawY)
                  charX += cw
                }

                cursor = range.end
              }
            }
          }
        }
      }

      ctx.globalAlpha = 1

      // ── Glow post-pass ───────────────────────────────────────────────────
      // Copy the freshly-drawn fire into the offscreen, tint it with the
      // *current* tip colour (palette stop 4 after live hue rotation — so
      // the glow inherits the same colour cycle as the corona's tips),
      // then blit it back over the main canvas through a blur filter +
      // 'lighter' (additive) compositing.  An optional second pass at a
      // wider radius and lower alpha feathers the halo softer.
      if (params.glowOpacity > 0 && params.glowRadius > 0) {
        const cw = ctx.canvas.width
        const ch = ctx.canvas.height
        if (glowCanvas.width !== cw)  glowCanvas.width  = cw
        if (glowCanvas.height !== ch) glowCanvas.height = ch

        // Live-derived tint = tip stop in HSL space + the same hue offset
        // the palette uses this frame.  When hue rotation is off, hueDeg
        // is 0 and we just use the tip colour as-is.
        const tipRgb = hslToRgb(hslTip[0] + hueDeg, hslTip[1], hslTip[2])
        const glowFill = `rgb(${tipRgb[0]},${tipRgb[1]},${tipRgb[2]})`

        // Snapshot the main canvas onto the offscreen (no transform — we're
        // working in device pixels for the post-pass).
        glowCtx.setTransform(1, 0, 0, 1, 0, 0)
        glowCtx.globalCompositeOperation = 'copy'
        glowCtx.globalAlpha = 1
        glowCtx.filter = 'none'
        glowCtx.drawImage(ctx.canvas, 0, 0)

        // source-in: keep alpha of existing pixels, replace RGB with the
        // glow colour.  The result is a one-colour silhouette of the fire.
        glowCtx.globalCompositeOperation = 'source-in'
        glowCtx.fillStyle = glowFill
        glowCtx.fillRect(0, 0, cw, ch)

        // Composite the tinted offscreen back over the main canvas with a
        // blur, additively.  setTransform(1) so the blur radius is in
        // device pixels (matching the offscreen buffer) — otherwise the
        // DPR transform would re-scale the filter unexpectedly.
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalCompositeOperation = 'lighter'

        // Pass 1 — tight inner glow.
        ctx.filter = `blur(${params.glowRadius}px)`
        ctx.globalAlpha = params.glowOpacity
        ctx.drawImage(glowCanvas, 0, 0)

        // Pass 2 — wider soft halo, only when softness > 0.
        if (params.glowSoftness > 0) {
          const wideR = params.glowRadius * (1 + params.glowSoftness * 3)
          ctx.filter = `blur(${wideR}px)`
          ctx.globalAlpha = params.glowOpacity * params.glowSoftness * 0.7
          ctx.drawImage(glowCanvas, 0, 0)
        }

        ctx.restore()
        ctx.globalAlpha = 1
        ctx.filter = 'none'
        ctx.globalCompositeOperation = 'source-over'
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

    getCurrentTipColor(timeMs) {
      const t = timeMs * 0.001
      const hueDeg =
        params.colorHueShiftSpeed > 0
          ? (t * params.colorHueShiftSpeed) % 360
          : 0
      const rgb = hslToRgb(hslTip[0] + hueDeg, hslTip[1], hslTip[2])
      return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    },
  }
}

// ─── Palette ────────────────────────────────────────────────────────────────

type RGB = [number, number, number]

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
