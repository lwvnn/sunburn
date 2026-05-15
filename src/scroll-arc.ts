// Editable storage for the scroll-driven keyframes.
//
// Owns the array of {at, params} entries, persists it to localStorage,
// and notifies subscribers on every mutation.  main.ts reads the current
// keyframes from `getKeyframes()` each frame; the scroll-arc-controls
// panel writes via the mutation methods.
//
// If the persisted blob is malformed (bad JSON, wrong shape) we fall back
// to DEFAULT_KEYFRAMES rather than crash on load.

import type { FireParams } from './fire'

export interface ScrollKeyframe {
  /** Scroll progress where this keyframe pins values, 0..1. */
  at: number
  /** Param values at this checkpoint.  Only listed keys are scroll-driven. */
  params: Partial<FireParams>
}

/** Starting keyframes — match the current behaviour at module load. */
export const DEFAULT_KEYFRAMES: ScrollKeyframe[] = [
  { at: 0.0, params: { flameRadialReach: 1, sphereRadiusFrac: 0.972, sphereCxFrac: 0.507 } },
  { at: 1.0, params: { flameRadialReach: 1, sphereRadiusFrac: 1.413, sphereCxFrac: 0.507, sphereCyFrac: 2.063 } }
]

const STORAGE_KEY = 'scroll-arc-v1'

export interface ScrollArc {
  getKeyframes(): readonly ScrollKeyframe[]
  /** Replace the whole list.  Sorted by `at` afterwards. */
  setKeyframes(kfs: ScrollKeyframe[]): void
  /** Move keyframe i to a new `at` (re-sorted afterwards).  Returns the
   *  index of the keyframe AFTER sorting so the caller can re-bind UI. */
  setAt(index: number, at: number): number
  /** Set one param value at one keyframe. */
  setParam(index: number, key: keyof FireParams, value: number): void
  /** Append a keyframe.  Caller chooses both `at` and the param values. */
  addKeyframe(at: number, params: Partial<FireParams>): void
  /** Remove keyframe `index`.  No-op if it would leave fewer than 2. */
  removeKeyframe(index: number): void
  /** Reset to DEFAULT_KEYFRAMES and clear persisted state. */
  reset(): void
  /** Subscribe to mutations.  Returns an unsubscribe callback. */
  subscribe(cb: () => void): () => void
}

function deepClone(kfs: readonly ScrollKeyframe[]): ScrollKeyframe[] {
  return kfs.map((k) => ({ at: k.at, params: { ...k.params } }))
}

function loadPersisted(): ScrollKeyframe[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    // Light validation — every entry must have a numeric `at` and a
    // params object.  Anything else falls back to defaults.
    for (const k of parsed) {
      if (typeof k?.at !== 'number' || typeof k?.params !== 'object') return null
    }
    return parsed as ScrollKeyframe[]
  } catch {
    return null
  }
}

export function createScrollArc(): ScrollArc {
  let keyframes: ScrollKeyframe[] =
    loadPersisted() ?? deepClone(DEFAULT_KEYFRAMES)
  // Ensure invariants on whatever we loaded.
  keyframes.sort((a, b) => a.at - b.at)

  const subs = new Set<() => void>()
  function emit(): void {
    for (const s of subs) s()
  }
  function save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keyframes))
    } catch {
      /* quota / private mode — ignore */
    }
  }

  return {
    getKeyframes: () => keyframes,

    setKeyframes(kfs) {
      keyframes = deepClone(kfs)
      keyframes.sort((a, b) => a.at - b.at)
      save()
      emit()
    },

    setAt(index, at) {
      if (!keyframes[index]) return index
      keyframes[index] = { ...keyframes[index], at }
      keyframes.sort((a, b) => a.at - b.at)
      const newIdx = keyframes.findIndex((k) => k.at === at)
      save()
      emit()
      return newIdx >= 0 ? newIdx : index
    },

    setParam(index, key, value) {
      if (!keyframes[index]) return
      keyframes[index] = {
        ...keyframes[index],
        params: { ...keyframes[index].params, [key]: value },
      }
      save()
      emit()
    },

    addKeyframe(at, params) {
      keyframes.push({ at, params: { ...params } })
      keyframes.sort((a, b) => a.at - b.at)
      save()
      emit()
    },

    removeKeyframe(index) {
      if (keyframes.length <= 2) return // need at least 2 to interpolate
      if (!keyframes[index]) return
      keyframes.splice(index, 1)
      save()
      emit()
    },

    reset() {
      keyframes = deepClone(DEFAULT_KEYFRAMES)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      emit()
    },

    subscribe(cb) {
      subs.add(cb)
      return () => {
        subs.delete(cb)
      }
    },
  }
}
