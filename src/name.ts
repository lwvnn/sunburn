// Centred name renderer that doubles as a *boolean cutout* the fire can
// query.
//
// Surfaces:
//
//   1. An offscreen mask canvas.  Whenever params or viewport size change,
//      the name's silhouette (text + an optional round-stroked halo for
//      padding + the outline width) is drawn in solid white on a transparent
//      canvas.  The alpha channel is pulled via getImageData once and
//      cached, so the fire's hot row-scan can ask `isInside(x, y)` for an
//      O(1) lookup.
//
//   2. The on-screen draw, which paints the letters in the chosen colour
//      plus optional outline plus an optional time-varying glitch effect.
//      The fire has already declined to render anything inside the
//      silhouette, so the page background shows through where the cutout
//      sits — no destination-out needed.
//
// Glitch effects share a single (intensity, speed) pair so the panel stays
// compact.  Five variants:
//
//   none      — clean fillText.
//   chromatic — RGB channel split with a time-pulsing offset (additive
//               blending; the union of the three channels reads as white).
//   slice     — VHS-style horizontal slice shifts (random per-slice offsets
//               that refresh `speed` times per second).
//   scramble  — each glyph has an intensity-weighted chance of being
//               replaced by a random "glitch" character.
//   jitter    — each glyph wobbles by a small random offset.

import type { FireMask } from './fire'

export type NameGlitch =
  | 'none'
  | 'chromatic'
  | 'slice'
  | 'scramble'
  | 'jitter'

export const NAME_GLITCH_TYPES: readonly NameGlitch[] = [
  'none',
  'chromatic',
  'slice',
  'scramble',
  'jitter',
]

export interface NameParams {
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  letterSpacing: number
  cxFrac: number
  cyFrac: number
  /** Fill colour of the name text. Ignored by `chromatic` (RGB hardcoded). */
  color: string
  /** Halo (px) added around the silhouette when building the cutout mask. */
  maskPadding: number
  // ── Outline ────────────────────────────────────────────────────────────
  /** Stroke colour. Used only when strokeWidth > 0. */
  strokeColor: string
  /** Outline thickness in px. 0 = no outline. */
  strokeWidth: number
  // ── Glitch ─────────────────────────────────────────────────────────────
  /** Glitch effect type. */
  glitch: NameGlitch
  /** Glitch strength (0..1). */
  glitchIntensity: number
  /** Glitch animation rate (Hz). */
  glitchSpeed: number
  // ── Independent visual scale (applied via CSS transform) ───────────────
  /** Horizontal scale of the rendered name — stretches the glyphs wider
   *  without changing the font size or the layout's mask metrics.  1 = no
   *  change, 2 = double width, 0.5 = half. */
  scaleX: number
  /** Vertical scale of the rendered name — taller / shorter glyphs without
   *  changing font size.  1 = no change. */
  scaleY: number
}

export const NAME_DEFAULTS: NameParams = {
  text: 'ELVIN SAAN',
  fontFamily: '"Cormorant Garamond", "Garamond", serif',
  fontSize: 48,
  fontWeight: 100,
  letterSpacing: 7.1,
  cxFrac: 0.5,
  cyFrac: 0.045,
  color: '#ffffff',
  maskPadding: 0,
  strokeColor: '#ffffff',
  strokeWidth: 0,
  glitch: 'none',
  glitchIntensity: 0.17,
  glitchSpeed: 3.8,
  scaleX: 1,
  scaleY: 1,
}

export interface NameRenderer extends FireMask {
  /** `timeMs` drives glitch animation. Pass the rAF timestamp.
   *  `colorOverride` temporarily replaces `params.color` for this draw —
   *  used by main.ts to fade the name toward black when the white
   *  next-page section slides up behind it (without mutating the
   *  user-saved colour). */
  draw(
    ctx: CanvasRenderingContext2D,
    timeMs?: number,
    colorOverride?: string,
  ): void
  resize(w: number, h: number): void
  setParams(partial: Partial<NameParams>): void
  getParams(): Readonly<NameParams>
}

// Glyphs used by the `scramble` effect.
const SCRAMBLE_CHARS =
  '!@#$%^&*()_+-=ЭЬВИНWX[]{}|;:.<>?/~`№§ΩÆØ∂ƒ˙∆˚¬…æ•¶¥£¢‹›«»€1'

/** Fast deterministic hash → [0, 1). */
function rand01(n: number): number {
  let x = (n | 0) ^ 0x9e3779b9
  x = (x ^ 61) ^ (x >>> 16)
  x = (x + (x << 3)) | 0
  x = x ^ (x >>> 4)
  x = Math.imul(x, 0x27d4eb2d)
  x = x ^ (x >>> 15)
  return ((x >>> 0) % 100000) / 100000
}

export function createName(
  viewportW: number,
  viewportH: number,
): NameRenderer {
  const params: NameParams = { ...NAME_DEFAULTS }
  let w = viewportW
  let h = viewportH

  function fontShorthand(): string {
    return `${params.fontWeight} ${params.fontSize}px ${params.fontFamily}`
  }

  // ── Mask canvas + cached alpha buffer ──────────────────────────────────
  const maskCanvas = document.createElement('canvas')
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!
  let maskData: Uint8ClampedArray | null = null
  let maskW = 0
  let maskH = 0
  let maskDirty = true

  function rebuildMask(): void {
    const cw = Math.max(1, Math.floor(w))
    const ch = Math.max(1, Math.floor(h))
    if (maskCanvas.width !== cw)  maskCanvas.width  = cw
    if (maskCanvas.height !== ch) maskCanvas.height = ch
    maskCtx.clearRect(0, 0, cw, ch)

    const txt = params.text
    if (txt) {
      const x = w * params.cxFrac
      const y = h * params.cyFrac

      maskCtx.font = fontShorthand()
      maskCtx.textBaseline = 'middle'
      maskCtx.textAlign = 'center'
      ;(maskCtx as unknown as { letterSpacing?: string }).letterSpacing =
        `${params.letterSpacing}px`

      // Cutout = glyph + outline (so the fire avoids the stroked edge too)
      // + maskPadding halo for breathing room.  Round joins/caps soften
      // every corner.  `lineWidth` is doubled because half the stroke
      // sits inside the outline and half outside; we then add the outline
      // thickness itself so the visible stroke fits inside the cutout.
      const strokeHalo = params.maskPadding * 2 + params.strokeWidth
      if (strokeHalo > 0) {
        maskCtx.lineJoin = 'round'
        maskCtx.lineCap  = 'round'
        maskCtx.lineWidth = strokeHalo
        maskCtx.strokeStyle = '#fff'
        maskCtx.strokeText(txt, x, y)
      }
      maskCtx.fillStyle = '#fff'
      maskCtx.fillText(txt, x, y)
    }

    maskData = maskCtx.getImageData(0, 0, cw, ch).data
    maskW = cw
    maskH = ch
    maskDirty = false
  }

  function ensureMask(): void {
    if (maskDirty || !maskData) rebuildMask()
  }

  // ── Per-glyph centre positions for char-level effects ─────────────────
  function centerPositions(
    ctx: CanvasRenderingContext2D,
    txt: string,
    centerX: number,
  ): { positions: number[] } {
    const widths: number[] = []
    let total = 0
    for (let i = 0; i < txt.length; i++) {
      const w = ctx.measureText(txt[i]).width + params.letterSpacing
      widths.push(w)
      total += w
    }
    total -= params.letterSpacing // no trailing pad after final glyph
    const positions: number[] = []
    let cx = centerX - total / 2
    for (let i = 0; i < txt.length; i++) {
      positions.push(cx + widths[i] / 2)
      cx += widths[i]
    }
    return { positions }
  }

  // ── Glitch implementations ─────────────────────────────────────────────

  function drawNone(ctx: CanvasRenderingContext2D, txt: string, x: number, y: number, fillColor: string): void {
    ctx.textAlign = 'center'
    ctx.fillStyle = fillColor
    ctx.fillText(txt, x, y)
  }

  function drawChromatic(
    ctx: CanvasRenderingContext2D,
    txt: string,
    x: number,
    y: number,
    t: number,
  ): void {
    ctx.textAlign = 'center'
    // Pulsing offset: sine driven by glitchSpeed (Hz), magnitude scales
    // with intensity.  +0.4 baseline keeps a visible split even at the
    // sine's zero-crossing.
    const wave = Math.sin(t * params.glitchSpeed * 2 * Math.PI) * 0.6 + 0.4
    const offset = params.glitchIntensity * 14 * wave
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = '#ff0000'
    ctx.fillText(txt, x - offset, y)
    ctx.fillStyle = '#00ff00'
    ctx.fillText(txt, x + offset * 0.3, y + offset * 0.15)
    ctx.fillStyle = '#0000ff'
    ctx.fillText(txt, x + offset, y - offset * 0.1)
    ctx.globalCompositeOperation = 'source-over'
  }

  function drawSlice(
    ctx: CanvasRenderingContext2D,
    txt: string,
    x: number,
    y: number,
    t: number,
    fillColor: string,
  ): void {
    ctx.textAlign = 'center'
    ctx.fillStyle = fillColor
    // Rough text bbox (measureText is reliable for width; height approx
    // from fontSize × line-height ratio).
    const metrics = ctx.measureText(txt)
    const textW = metrics.width + Math.abs(params.letterSpacing) * txt.length
    const textH = params.fontSize * 1.2
    const left = x - textW / 2 - 40
    const top = y - textH / 2
    const numSlices = 12
    const sliceH = textH / numSlices
    // Slice positions refresh `glitchSpeed` times per second.
    const step = Math.floor(t * params.glitchSpeed)
    for (let i = 0; i < numSlices; i++) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(left, top + i * sliceH, textW + 80, sliceH + 1)
      ctx.clip()
      // ~half the slices are dormant; the other half jump randomly.
      const seed = i * 31 + step
      const active = rand01(seed * 7 + 1) < params.glitchIntensity
      const off = active ? (rand01(seed) - 0.5) * params.glitchIntensity * 40 : 0
      ctx.fillText(txt, x + off, y)
      ctx.restore()
    }
  }

  function drawScramble(
    ctx: CanvasRenderingContext2D,
    txt: string,
    x: number,
    y: number,
    t: number,
    fillColor: string,
  ): void {
    const step = Math.floor(t * params.glitchSpeed)
    const { positions } = centerPositions(ctx, txt, x)
    ctx.textAlign = 'center'
    ctx.fillStyle = fillColor
    for (let i = 0; i < txt.length; i++) {
      let ch = txt[i]
      // Preserve whitespace — only scramble visible glyphs.
      if (ch !== ' ' && ch !== '\t') {
        const seed = i * 13 + step
        // Scramble probability scales with intensity, capped at 0.6 so the
        // name stays recognisable even at max.
        if (rand01(seed) < params.glitchIntensity * 0.6) {
          const ri = Math.floor(rand01(seed * 31 + 7) * SCRAMBLE_CHARS.length)
          ch = SCRAMBLE_CHARS[ri]
        }
      }
      ctx.fillText(ch, positions[i], y)
    }
  }

  function drawJitter(
    ctx: CanvasRenderingContext2D,
    txt: string,
    x: number,
    y: number,
    t: number,
    fillColor: string,
  ): void {
    const step = Math.floor(t * params.glitchSpeed)
    const { positions } = centerPositions(ctx, txt, x)
    ctx.textAlign = 'center'
    ctx.fillStyle = fillColor
    const amp = params.glitchIntensity * 12
    for (let i = 0; i < txt.length; i++) {
      const seed = i * 17 + step
      const dx = (rand01(seed) - 0.5) * amp
      const dy = (rand01(seed * 7 + 3) - 0.5) * amp
      ctx.fillText(txt[i], positions[i] + dx, y + dy)
    }
  }

  return {
    isInside(x, y) {
      ensureMask()
      if (!maskData) return false
      const ix = x | 0
      const iy = y | 0
      if (ix < 0 || iy < 0 || ix >= maskW || iy >= maskH) return false
      return maskData[(iy * maskW + ix) * 4 + 3] > 127
    },

    draw(ctx, timeMs = 0, colorOverride) {
      const txt = params.text
      if (!txt) return
      const t = timeMs * 0.001
      const x = w * params.cxFrac
      const y = h * params.cyFrac
      // Single source of truth for "what colour to fill the glyphs with"
      // for this draw — the override wins when supplied, otherwise we
      // respect whatever the user set in the controls panel.
      const fillColor = colorOverride ?? params.color

      ctx.save()
      ctx.font = fontShorthand()
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ;(ctx as unknown as { letterSpacing?: string }).letterSpacing =
        `${params.letterSpacing}px`

      // ── Outline (drawn first so fill / glitch sits on top) ────────────
      if (params.strokeWidth > 0) {
        ctx.lineWidth = params.strokeWidth
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.strokeStyle = params.strokeColor
        ctx.strokeText(txt, x, y)
      }

      // ── Fill / glitch ─────────────────────────────────────────────────
      switch (params.glitch) {
        case 'chromatic': drawChromatic(ctx, txt, x, y, t);            break
        case 'slice':     drawSlice(ctx, txt, x, y, t, fillColor);     break
        case 'scramble':  drawScramble(ctx, txt, x, y, t, fillColor);  break
        case 'jitter':    drawJitter(ctx, txt, x, y, t, fillColor);    break
        case 'none':
        default:          drawNone(ctx, txt, x, y, fillColor);         break
      }

      ctx.restore()
    },

    resize(nextW, nextH) {
      w = nextW
      h = nextH
      maskDirty = true
    },

    setParams(partial) {
      Object.assign(params, partial)
      // Mask only depends on text shape + padding + outline width.  Other
      // params (colour, glitch, etc.) don't invalidate it.
      if (
        'text' in partial || 'fontFamily' in partial || 'fontSize' in partial ||
        'fontWeight' in partial || 'letterSpacing' in partial ||
        'cxFrac' in partial || 'cyFrac' in partial ||
        'maskPadding' in partial || 'strokeWidth' in partial
      ) {
        maskDirty = true
      }
    },

    getParams() {
      return params
    },
  }
}
