// Waterfall renderer — top half (or configurable fraction) of viewport.
//
// Structural mirror of fire.ts for a falling-water aesthetic:
//  • Band at the TOP of the screen; text streams hang downward.
//  • Each column's "stream bottom" (the falling tip) is driven by the same
//    two-octave noise that drives fire tongues — slow big columns + medium
//    wobble layered on top.
//  • Text flows TOP → BOTTOM: characters materialise at the surface and fall
//    toward the tip. Achieved by iterating rows bottom-first with the Pretext
//    cursor so each character's row-index increases by 1 each frame.
//  • Palette defaults to cool blues / teals / near-white foam; all 4 stops
//    are user-controlled, same as fire.
//  • Cursor interaction: streams part around the cursor (avoid + engulf lobes)
//    and characters bend around it via the same 2-D flow-field whip, with the
//    same ease-in/ease-out temporal fade and organic noisy border.
//
// All drawing on a single 2D canvas.

import {
  prepareWithSegments,
  layoutNextLineRange,
  materializeLineRange,
  type LayoutCursor,
} from '@chenglou/pretext'
import { createNoise2D } from 'simplex-noise'

// ─── Live-tunable params ───────────────────────────────────────────────────

export interface WaterfallParams {
  fontFamily: string
  fontSize: number
  fontWeight: number
  /** Vertical distance between rendered rows, px. */
  lineHeight: number
  /** Extra horizontal spacing between graphemes, px. */
  letterSpacing: number
  /** Speed at which text streams downward (higher = faster). */
  textScrollSpeed: number
  /** Waterfall band as fraction of viewport height (from the top edge). */
  waterBandFrac: number
  /** Mean fraction of the band the streams reach at rest (0..1). */
  streamBase: number
  // Big slow stream columns.
  streamBigAmp: number
  streamBigSx: number
  streamBigSt: number
  // Medium wobble layered on top.
  streamMedAmp: number
  streamMedSx: number
  streamMedSt: number
  // Per-cell ripple noise inside the stream body.
  rippleAmp: number
  rippleSx: number
  rippleSy: number
  rippleSt: number
  /** Vertical fade band near each stream's falling tip (px). */
  tipFadePx: number
  // Palette stops — hex strings (#rrggbb).
  /** Deepest / darkest colour (low-intensity cells near the falling tip). */
  colorBase: string
  /** Lower-mid (deep water zone). */
  colorLow: string
  /** Mid-bright (body of the stream). */
  colorHot: string
  /** Brightest — foam at the source / top of each stream. */
  colorTip: string
}

export const WATERFALL_DEFAULTS: WaterfallParams = {
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: 7,
  fontWeight: 200,
  lineHeight: 20,
  letterSpacing: 0,
  textScrollSpeed: 55,
  waterBandFrac: 0.45,
  streamBase: 0.55,
  streamBigAmp: 0.30,
  streamBigSx: 0.0035,
  streamBigSt: 0.40,
  streamMedAmp: 0.16,
  streamMedSx: 0.012,
  streamMedSt: 0.85,
  rippleAmp: 0.28,
  rippleSx: 0.045,
  rippleSy: 0.06,
  rippleSt: 1.2,
  tipFadePx: 24,
  colorBase: '#001a2e',
  colorLow: '#003d6b',
  colorHot: '#00a8cc',
  colorTip: '#c8e8ff',
}

/** Default colours tuned for a light (white-ish) background. */
export const WATERFALL_DEFAULTS_LIGHT: Pick<
  WaterfallParams,
  'colorBase' | 'colorLow' | 'colorHot' | 'colorTip'
> = {
  colorBase: '#001428',
  colorLow: '#0055aa',
  colorHot: '#0099cc',
  colorTip: '#e8f8ff',
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** Sampling step (px) along x for the per-column stream-bottom curve. */
const STREAM_SAMPLE_STEP = 6
/** Minimum span width (px) we'll bother laying text into. */
const MIN_SPAN_W = 32

// ─── Public interface ────────────────────────────────────────────────────────

export interface Waterfall {
  draw(ctx: CanvasRenderingContext2D, timeMs: number): void
  resize(viewportW: number, viewportH: number): void
  setParams(partial: Partial<WaterfallParams>): void
  getParams(): Readonly<WaterfallParams>
  setCursor(x: number, y: number, active: boolean): void
}

// ─── Cursor interaction tunables ────────────────────────────────────────────

const CURSOR_AVOID_SIGMA    = 28
const CURSOR_AVOID_AMP      = 0.18
const CURSOR_ENGULF_SIGMA   = 32
const CURSOR_ENGULF_OFFSET  = 52
const CURSOR_ENGULF_AMP     = 0.28
/** Vertical falloff (px) below the water band where cursor still has effect. */
const CURSOR_Y_FALLOFF      = 150
const CURSOR_FIELD_R        = 95
const CURSOR_FIELD_AMP      = 36
const CURSOR_FADE_SPEED     = 3.5
const CURSOR_FIELD_NOISE_AMP = 0.38
const CURSOR_FIELD_NOISE_SX  = 0.016
const CURSOR_FIELD_NOISE_SY  = 0.016
const CURSOR_FIELD_NOISE_ST  = 0.55

// ─── Implementation ─────────────────────────────────────────────────────────

export function createWaterfall(
  text: string,
  viewportW: number,
  viewportH: number,
): Waterfall {
  const nBig    = createNoise2D()
  const nMed    = createNoise2D()
  const nRipple = createNoise2D()
  const nCursor = createNoise2D()

  const params: WaterfallParams = { ...WATERFALL_DEFAULTS }

  let w = viewportW
  let h = viewportH

  // ── Font + Pretext handle ──────────────────────────────────────────────────

  function fontShorthand(): string {
    return `${params.fontWeight} ${params.fontSize}px ${params.fontFamily}`
  }

  let prepared = prepareWithSegments(text, fontShorthand(), {
    letterSpacing: params.letterSpacing,
  })

  const measureCanvas = document.createElement('canvas')
  const measureCtx    = measureCanvas.getContext('2d')!
  const charWidthCache = new Map<string, number>()

  function applyMeasureCtxFont(): void {
    measureCtx.font = fontShorthand()
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

  function recomputeFont(): void {
    prepared = prepareWithSegments(text, fontShorthand(), {
      letterSpacing: params.letterSpacing,
    })
    applyMeasureCtxFont()
    charWidthCache.clear()
  }

  // ── Scroll state ──────────────────────────────────────────────────────────

  let scrollCursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let scrollAccum  = 0
  let prevTimeMs   = 0

  // ── Cursor state ──────────────────────────────────────────────────────────

  let cursorX = 0
  let cursorY = 0
  let cursorActive = false
  let cursorStrengthRaw = 0

  // ── Stream-bottom sample buffer ────────────────────────────────────────────

  let streamBotBuf = new Float32Array(0)
  let numSamples   = 0

  function ensureSampleBuffer(): void {
    const need = Math.ceil(w / STREAM_SAMPLE_STEP) + 2
    if (streamBotBuf.length < need) streamBotBuf = new Float32Array(need)
    numSamples = need
  }
  ensureSampleBuffer()

  function streamBotAtX(x: number): number {
    if (x <= 0) return streamBotBuf[0]
    const f  = x / STREAM_SAMPLE_STEP
    const i0 = Math.floor(f)
    if (i0 >= numSamples - 1) return streamBotBuf[numSamples - 1]
    const i1   = i0 + 1
    const frac = f - i0
    return streamBotBuf[i0] * (1 - frac) + streamBotBuf[i1] * frac
  }

  // ── Palette ────────────────────────────────────────────────────────────────

  let palette = buildPalette(72, params)
  function rebuildPalette(): void {
    palette = buildPalette(72, params)
  }

  // ────────────────────────────────────────────────────────────────────────────

  return {
    draw(ctx, timeMs) {
      ctx.font         = fontShorthand()
      ctx.textBaseline = 'top'
      ;(ctx as unknown as { letterSpacing?: string }).letterSpacing =
        `${params.letterSpacing}px`

      const lineHeight  = params.lineHeight
      const waterTop    = 0
      const waterBottom = h * params.waterBandFrac
      const bandH       = waterBottom - waterTop
      if (bandH <= 0) return

      const t = timeMs * 0.001

      // ── Delta time + scroll advance ──────────────────────────────────────
      const dt = prevTimeMs > 0 ? Math.min(0.1, (timeMs - prevTimeMs) / 1000) : 0
      prevTimeMs = timeMs

      scrollAccum += dt * params.textScrollSpeed * 0.18
      while (scrollAccum >= 1) {
        const step = layoutNextLineRange(prepared, scrollCursor, 240)
        scrollCursor = step === null
          ? { segmentIndex: 0, graphemeIndex: 0 }
          : step.end
        scrollAccum -= 1
      }

      // ── Cursor ease-in / ease-out ────────────────────────────────────────
      const cursorTarget   = cursorActive ? 1 : 0
      cursorStrengthRaw   +=
        (cursorTarget - cursorStrengthRaw) * Math.min(1, dt * CURSOR_FADE_SPEED)
      const ce = cursorStrengthRaw * cursorStrengthRaw * (3 - 2 * cursorStrengthRaw)

      // ── Sample the stream-bottom curve along x ───────────────────────────
      // The cursor Y-weight fades off below the water band (cursor below band
      // still nudges the stream tips a little via the Gaussian falloff).
      ensureSampleBuffer()
      let cursorYWeight = 0
      if (ce > 0.001) {
        if (cursorY <= waterBottom) {
          cursorYWeight = ce
        } else {
          const dBelow = cursorY - waterBottom
          cursorYWeight =
            ce * Math.exp(-(dBelow * dBelow) / (CURSOR_Y_FALLOFF * CURSOR_Y_FALLOFF))
        }
      }
      const cursorOn = cursorYWeight > 0.002

      for (let i = 0; i < numSamples; i++) {
        const x = i * STREAM_SAMPLE_STEP
        let streamFrac =
          params.streamBase +
          params.streamBigAmp *
            nBig(x * params.streamBigSx, t * params.streamBigSt) +
          params.streamMedAmp *
            nMed(x * params.streamMedSx + 13.7, t * params.streamMedSt + 4.1)

        if (cursorOn) {
          // Avoidance: shrink stream at cursor column (pull tip up).
          // Engulf: lengthen streams on either side of the cursor.
          const dx    = x - cursorX
          const avoid =
            -CURSOR_AVOID_AMP *
            Math.exp(-(dx * dx) / (CURSOR_AVOID_SIGMA * CURSOR_AVOID_SIGMA))
          const dl    = dx + CURSOR_ENGULF_OFFSET
          const dr    = dx - CURSOR_ENGULF_OFFSET
          const lobeL = Math.exp(-(dl * dl) / (CURSOR_ENGULF_SIGMA * CURSOR_ENGULF_SIGMA))
          const lobeR = Math.exp(-(dr * dr) / (CURSOR_ENGULF_SIGMA * CURSOR_ENGULF_SIGMA))
          streamFrac += (avoid + CURSOR_ENGULF_AMP * (lobeL + lobeR)) * cursorYWeight
        }

        if (streamFrac < 0) streamFrac = 0
        else if (streamFrac > 1) streamFrac = 1
        streamBotBuf[i] = waterTop + bandH * streamFrac
      }

      let lastFill  = ''
      let lastAlpha = -1

      // ── Row iteration: numRows-1 (bottom) → 0 (top) ─────────────────────
      // The layout cursor starts at scrollCursor and is consumed from the
      // BOTTOM row upward. This means upper rows receive text further ahead
      // in the corpus. As scrollCursor advances each frame, every character
      // moves exactly one row down — it entered at the top surface and falls
      // toward the tip.
      let cursor: LayoutCursor = { ...scrollCursor }
      const numRows = Math.ceil(bandH / lineHeight) + 1

      for (let r = numRows - 1; r >= 0; r--) {
        const screenY = waterTop + r * lineHeight
        if (screenY > waterBottom + lineHeight) continue

        let inSpan    = false
        let spanStart = 0

        for (let i = 0; i <= numSamples; i++) {
          const x  = i < numSamples ? i * STREAM_SAMPLE_STEP : w + 1
          const ft = i < numSamples ? streamBotBuf[i]         : -Infinity
          // Inside a stream: this row sits above the falling tip.
          const inside = screenY < ft - 2 && x < w

          if (inside && !inSpan) {
            spanStart = x
            inSpan    = true
          } else if (!inside && inSpan) {
            const spanEnd = Math.min(x, w)
            inSpan        = false
            const spanW   = spanEnd - spanStart

            if (spanW >= MIN_SPAN_W) {
              const range = layoutNextLineRange(prepared, cursor, spanW)
              if (range === null) {
                cursor = { segmentIndex: 0, graphemeIndex: 0 }
              } else {
                const txt = materializeLineRange(prepared, range).text
                let charX = spanStart

                for (let c = 0; c < txt.length; c++) {
                  const ch = txt[c]
                  if (ch === ' ' || ch === '\t' || ch === '\n') {
                    charX += charWidth(' ')
                    continue
                  }
                  const cw = charWidth(ch)

                  // ── Per-character colour / alpha ────────────────────────
                  const sbAtX   = streamBotAtX(charX)
                  const streamH = sbAtX - waterTop
                  // localDepth: 0 at source (top = foam), 1 at falling tip.
                  const localDepth = streamH > 1 ? (screenY - waterTop) / streamH : 0
                  // Intensity highest at the top (foam), fades toward the tip.
                  const ripple = nRipple(
                    charX  * params.rippleSx,
                    screenY * params.rippleSy + t * params.rippleSt,
                  )
                  let intensity = (1 - localDepth) * 0.78 + ripple * params.rippleAmp + 0.06
                  intensity = clamp01(intensity)

                  // Fade out near the falling tip.
                  const tipFade = clamp01(
                    params.tipFadePx > 0 ? (sbAtX - screenY) / params.tipFadePx : 1,
                  )

                  const bucket = Math.min(
                    palette.length - 1,
                    (intensity * (palette.length - 1)) | 0,
                  )
                  const entry  = palette[bucket]
                  const alpha  = entry.a * tipFade
                  if (alpha < 0.025) { charX += cw; continue }

                  const alphaQ = ((alpha * 64) | 0) / 64
                  if (entry.fill !== lastFill) { ctx.fillStyle = entry.fill; lastFill = entry.fill }
                  if (alphaQ !== lastAlpha)    { ctx.globalAlpha = alphaQ;   lastAlpha = alphaQ }

                  // ── 2-D flow displacement (same whip mechanic as fire) ──
                  let drawX = charX
                  let drawY = screenY
                  if (ce > 0.001) {
                    const ddx = charX  - cursorX
                    const ddy = screenY - cursorY
                    const dd2 = ddx * ddx + ddy * ddy
                    if (dd2 > 0.25) {
                      const bNoise = nCursor(
                        charX  * CURSOR_FIELD_NOISE_SX,
                        screenY * CURSOR_FIELD_NOISE_SY + t * CURSOR_FIELD_NOISE_ST,
                      )
                      const effR = CURSOR_FIELD_R * (1 + CURSOR_FIELD_NOISE_AMP * bNoise)
                      if (dd2 < effR * effR) {
                        const dd       = Math.sqrt(dd2)
                        const tt       = dd / effR
                        const strength = 4 * tt * (1 - tt) * CURSOR_FIELD_AMP * ce
                        const inv      = strength / dd
                        drawX = charX  + ddx * inv
                        drawY = screenY + ddy * inv
                      }
                    }
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
    },

    resize(nextW, nextH) {
      w = nextW
      h = nextH
      ensureSampleBuffer()
    },

    setParams(partial) {
      Object.assign(params, partial)
      if ('colorBase' in partial || 'colorLow' in partial ||
          'colorHot'  in partial || 'colorTip' in partial) {
        rebuildPalette()
      }
      if ('fontFamily'    in partial || 'fontSize'      in partial ||
          'fontWeight'    in partial || 'letterSpacing' in partial) {
        recomputeFont()
      }
    },

    getParams() { return params },

    setCursor(x, y, active) {
      cursorX      = x
      cursorY      = y
      cursorActive = active
    },
  }
}

// ─── Palette ────────────────────────────────────────────────────────────────

function buildPalette(
  stops: number,
  params: Pick<WaterfallParams, 'colorBase' | 'colorLow' | 'colorHot' | 'colorTip'>,
): Array<{ fill: string; a: number }> {
  const keys: Array<[number, [number, number, number]]> = [
    [0.00, hexToRgb(params.colorBase)],
    [0.35, hexToRgb(params.colorLow)],
    [0.72, hexToRgb(params.colorHot)],
    [1.00, hexToRgb(params.colorTip)],
  ]
  const out: Array<{ fill: string; a: number }> = []
  for (let i = 0; i < stops; i++) {
    const t  = i / (stops - 1)
    let lo   = keys[0]
    let hi   = keys[keys.length - 1]
    for (let k = 0; k < keys.length - 1; k++) {
      if (t >= keys[k][0] && t <= keys[k + 1][0]) { lo = keys[k]; hi = keys[k + 1]; break }
    }
    const lt = (t - lo[0]) / Math.max(1e-6, hi[0] - lo[0])
    const r  = (lo[1][0] + (hi[1][0] - lo[1][0]) * lt) | 0
    const g  = (lo[1][1] + (hi[1][1] - lo[1][1]) * lt) | 0
    const b  = (lo[1][2] + (hi[1][2] - lo[1][2]) * lt) | 0
    const a  = clamp01(0.25 + 0.75 * t)
    out.push({ fill: `rgb(${r},${g},${b})`, a })
  }
  return out
}

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

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}
