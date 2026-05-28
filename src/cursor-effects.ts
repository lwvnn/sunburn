// Cursor field — per-character displacement around the pointer.
//
// Owns the cursor-effect params (effect type, radius, amplitude, border
// noise, fade speed) and a `displace()` function the fire renderer calls
// once per rendered character.  Five distinct effects share the same field
// geometry (organic noise-warped radius, parabolic / falloff profile) but
// move characters differently:
//
//   whip    — radial OUTWARD, parabolic 4t(1-t) profile (peaks at mid-r).
//             Characters bend AROUND the cursor like fluid streamlines.
//   repel   — radial OUTWARD, (1-t)² falloff.  Strongest at the centre,
//             so chars are pushed away in an explosive burst.
//   attract — radial INWARD, (1-t)² falloff.  Pulls chars toward the
//             cursor — a tiny gravity well of text.
//   swirl   — TANGENTIAL (perpendicular to radial), (1-t)² falloff.
//             Characters orbit, giving a slow vortex.
//   pulse   — radial outward but modulated by a sine wave whose phase
//             travels OUTWARD over time.  A series of expanding rings.

import { createNoise2D } from 'simplex-noise'

export type CursorEffectType =
  | 'whip'
  | 'repel'
  | 'attract'
  | 'swirl'
  | 'pulse'

export const CURSOR_EFFECT_TYPES: readonly CursorEffectType[] = [
  'whip',
  'repel',
  'attract',
  'swirl',
  'pulse',
]

export interface CursorEffectParams {
  effect: CursorEffectType
  /** Outer radius (px) of the field.  0 disables the effect. */
  fieldR: number
  /** Peak displacement (px) at the field's strongest point. */
  amp: number
  /** Organic-border noise amplitude (0..1).  0 = perfect circle. */
  noiseAmp: number
  /** Rate (1/sec) at which the field fades in / out as the cursor
   *  enters / leaves the page. */
  fadeSpeed: number
  /** Amount to weaken the upward push (0..1). 0 = round hole, >0 flattens top. */
  squint?: number
}

export const CURSOR_EFFECT_DEFAULTS: CursorEffectParams = {
  effect: 'repel',
  fieldR: 400,
  amp: 65,
  noiseAmp: 0.0,
  fadeSpeed: 0.5,
}

// Spatial / temporal scale of the border noise. Kept as module constants —
// these never really need tuning per-effect.
const BORDER_NOISE_SX = 0.016
const BORDER_NOISE_SY = 0.016
const BORDER_NOISE_ST = 0.55

export interface CursorEffect {
  getParams(): Readonly<CursorEffectParams>
  setParams(partial: Partial<CursorEffectParams>): void
  /**
   * Returns the displaced position for a single character.
   * `ce` is the eased cursor strength (0..1) — the renderer owns it so all
   * cursor-driven things share the same fade curve.
   */
  displace(
    charX: number,
    charY: number,
    cursorX: number,
    cursorY: number,
    timeMs: number,
    ce: number
  ): readonly [number, number]
}

export function createCursorEffect(): CursorEffect {
  const params: CursorEffectParams = { ...CURSOR_EFFECT_DEFAULTS }
  const nBorder = createNoise2D()

  return {
    getParams: () => params,
    setParams: (p) => {
      Object.assign(params, p)
    },
    displace(charX, charY, cursorX, cursorY, timeMs, ce) {
      if (ce <= 0.001 || params.fieldR <= 0) return [charX, charY]

      const ddx = charX - cursorX
      const ddy = charY - cursorY
      const dd2 = ddx * ddx + ddy * ddy
      // Avoid div-by-zero on the cursor itself.
      if (dd2 < 0.25) return [charX, charY]

      const t = timeMs * 0.001
      const borderNoise = nBorder(
        charX * BORDER_NOISE_SX,
        charY * BORDER_NOISE_SY + t * BORDER_NOISE_ST,
      )
      const effR = params.fieldR * (1 + params.noiseAmp * borderNoise)
      if (dd2 >= effR * effR) return [charX, charY]

      const dd = Math.sqrt(dd2)
      const lt = dd / effR // 0 at cursor, 1 at field edge
      const ux = ddx / dd
      const uy = ddy / dd

      switch (params.effect) {
        case 'whip': {
          // 4 t (1 - t) — parabola, peaks at t = 0.5.
          const s = 4 * lt * (1 - lt) * params.amp * ce
          return [charX + ux * s, charY + uy * s]
        }
        case 'repel': {
          // (1 - t)² — strongest at the cursor, smoothly decays outward.
          const inv = 1 - lt
          let s = inv * inv * params.amp * ce
          // Weaken the upper part of the repel effect (uy < 0)
          if (params.squint && uy < 0) {
            s *= (1 + uy * params.squint) // reduces by up to 'squint' fraction straight up to flatten the top of the hole
          }
          return [charX + ux * s, charY + uy * s]
        }
        case 'attract': {
          const inv = 1 - lt
          const s = inv * inv * params.amp * ce
          return [charX - ux * s, charY - uy * s]
        }
        case 'swirl': {
          // Tangent = rotate radial unit vector by 90°: (-uy, ux).
          const inv = 1 - lt
          const s = inv * inv * params.amp * ce
          return [charX - uy * s, charY + ux * s]
        }
        case 'pulse': {
          // Outward-traveling sine wave; 3 full wavelengths across the
          // field, phase advancing 5 rad/sec.  The (1-t) envelope keeps
          // the field edge clean.
          const phase = lt * Math.PI * 6 - t * 5
          const s = Math.sin(phase) * (1 - lt) * params.amp * ce
          return [charX + ux * s, charY + uy * s]
        }
        default:
          return [charX, charY]
      }
    },
  }
}
