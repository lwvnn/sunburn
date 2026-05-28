// Single source of truth for the page's section layout.
//
// The site is now a single fire section.  Scroll progress `sp ∈ [0, 1]`
// drives the fire's keyframed animation linearly across the runway and
// snaps to sp = 0 when the user idles near the top.

/** Maximum distance (in scroll-progress units) at which the snap will
 *  engage toward a target.  Beyond this from every target the user is
 *  "free-scrolling" mid-section and snap does nothing. */
export const SNAP_PULL_RANGE = 0.1

/** Remap `sp` so the fire renderer's "0 → 1 keyframe arc" plays once
 *  across the entire scroll runway. */
export function firePhaseFor(sp: number): number {
  return sp < 0 ? 0 : sp > 1 ? 1 : sp
}

/** Find the snap target nearest `sp` from `targets`.  Callers pass the
 *  live checkpoint positions from scroll-arc — snap targets are the
 *  section boundaries, no global constant required. */
export function nearestSnapTarget(
  sp: number,
  targets: readonly number[],
): { target: number; distance: number } {
  if (targets.length === 0) return { target: sp, distance: Infinity }
  let best = targets[0]
  let bestDist = Math.abs(sp - best)
  for (let i = 1; i < targets.length; i++) {
    const d = Math.abs(sp - targets[i])
    if (d < bestDist) {
      best = targets[i]
      bestDist = d
    }
  }
  return { target: best, distance: bestDist }
}

/** Index in `targets` of the entry closest to `sp`. */
export function nearestSnapIndex(
  sp: number,
  targets: readonly number[],
): number {
  if (targets.length === 0) return -1
  let bestI = 0
  let bestDist = Math.abs(sp - targets[0])
  for (let i = 1; i < targets.length; i++) {
    const d = Math.abs(sp - targets[i])
    if (d < bestDist) {
      bestI = i
      bestDist = d
    }
  }
  return bestI
}
