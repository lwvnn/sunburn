// Single source of truth for the page's section layout.
//
// The site has three sections separated by two transition zones.  Scroll
// progress `sp ∈ [0, 1]` falls into one of five ranges:
//
//   S1 fire intro    [0.00 .. 0.25]
//   T1 fire→gallery  [0.25 .. 0.33]   ← fire slides up, gallery slides up from below
//   S2 gallery       [0.33 .. 0.60]
//   T2 gallery→fire  [0.60 .. 0.68]   ← gallery slides up out, fire returns from below
//   S3 fire return   [0.68 .. 1.00]
//
// Snap targets are at the start of each major section so the page settles
// at clean boundaries.  Everything else is derived from these constants.

export const S1_END = 0.25
export const T1_END = 0.33
export const S2_END = 0.60
export const T2_END = 0.68
// S3 runs T2_END → 1.0

/** Scroll-progress targets the spring snap pulls toward.  Order: start of
 *  S1, S2, S3 — i.e. the boundaries the user "settles into". */
export const SNAP_TARGETS: readonly number[] = [0, T1_END, T2_END]
/** Maximum distance (in scroll-progress units) at which the snap will
 *  engage toward a target.  Beyond this from every target the user is
 *  "free-scrolling" mid-section and snap does nothing. */
export const SNAP_PULL_RANGE = 0.1

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/** Smoothstep 3t²−2t³ for eased transitions. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Vertical shift of the fire canvas as a fraction of the viewport
 *  height.  −1 = fully above the viewport, 0 = home, +1 = fully below.
 *  The schedule: stay home during S1, ramp 0 → −1 across T1, sit at
 *  −1 across S2 (skipped from rendering), jump to +1 at the start of T2,
 *  ramp +1 → 0 across T2, stay home during S3. */
export function fireShiftFor(sp: number): number {
  if (sp <= S1_END) return 0
  if (sp <= T1_END) {
    const local = (sp - S1_END) / (T1_END - S1_END)
    return -smoothstep(clamp01(local))
  }
  if (sp <= S2_END) return -1 // off-screen above; renderer should skip
  if (sp <= T2_END) {
    // Returns from BELOW (+1 → 0) for the visual "fire comes back from
    // beneath the gallery as it scrolls up" effect.
    const local = (sp - S2_END) / (T2_END - S2_END)
    return 1 - smoothstep(clamp01(local))
  }
  return 0
}

/** Vertical shift of the gallery section, in viewport-height fractions.
 *  +1 = fully below viewport, 0 = home, −1 = fully above. */
export function galleryShiftFor(sp: number): number {
  if (sp <= S1_END) return 1
  if (sp <= T1_END) {
    const local = (sp - S1_END) / (T1_END - S1_END)
    return 1 - smoothstep(clamp01(local))
  }
  if (sp <= S2_END) return 0
  if (sp <= T2_END) {
    const local = (sp - S2_END) / (T2_END - S2_END)
    return -smoothstep(clamp01(local))
  }
  return -1
}

/** Remap `sp` so the fire renderer's "0 → 1 keyframe arc" plays once
 *  during S1 (intro) and again during S3 (return).  During the gallery
 *  range we return whatever the most recent fire-visible value was so
 *  there's no spurious mutation while the fire isn't on screen. */
export function firePhaseFor(sp: number): number {
  if (sp <= S1_END) return sp / S1_END
  if (sp <= T1_END) return 1
  if (sp <= T2_END) return 0
  return (sp - T2_END) / (1 - T2_END)
}

/** True when the fire canvas is sufficiently in view that drawing it
 *  produces visible pixels — used to skip `fire.draw()` while it's
 *  parked off-screen above. */
export function fireIsVisible(sp: number): boolean {
  const shift = fireShiftFor(sp)
  return shift > -0.999 && shift < 0.999
}

/** Find the nearest snap target to `sp`, returning that target plus its
 *  distance.  Caller decides whether to engage (typically by comparing
 *  the distance to SNAP_PULL_RANGE). */
export function nearestSnapTarget(sp: number): {
  target: number
  distance: number
} {
  let best = SNAP_TARGETS[0]
  let bestDist = Math.abs(sp - best)
  for (let i = 1; i < SNAP_TARGETS.length; i++) {
    const d = Math.abs(sp - SNAP_TARGETS[i])
    if (d < bestDist) {
      best = SNAP_TARGETS[i]
      bestDist = d
    }
  }
  return { target: best, distance: bestDist }
}
