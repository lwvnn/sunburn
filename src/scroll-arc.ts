// Editable storage for the scroll-driven section checkpoints.
//
// Each checkpoint is a FULL snapshot of every numeric FireParam (strings,
// booleans and colours are global and live on the fire instance itself —
// they are deliberately NOT stored here, so changing a colour doesn't get
// "captured" by the active section).
//
// Checkpoints are kept in scroll-position order.  Their `at` values are
// re-distributed uniformly across [0, 1] whenever the list is mutated so
// the user only thinks in terms of "section N of M", not absolute scroll
// fractions.
//
// The store owns:
//   - the ordered list of checkpoints
//   - the index of the active checkpoint (what the controls panel writes
//     into, what the section-nav arrows highlight)
//
// Persisted to localStorage under SCHEMA_KEY.  Old v1 blobs are migrated
// on first load by filling missing numeric keys from FIRE_DEFAULTS.

import { FIRE_DEFAULTS } from './fire'
import type { FireParams } from './fire'
import committedDefaults from './scroll-arc-defaults.json'

/** Keys of FireParams whose runtime values are numbers. */
export type NumericFireParamKey = {
  [K in keyof FireParams]: FireParams[K] extends number ? K : never
}[keyof FireParams]

/** Numeric params that are GLOBAL — they describe a treatment of the
 *  whole corona (all speed-driven motion + the post-FX layer) and so
 *  don't belong on per-section keyframes.  Edits to these write
 *  directly to the Fire instance via fire.setParams and persist in
 *  the fire-controls / post-fx-controls localStorage blobs, not in
 *  scroll-arc.  Adding a key here automatically excludes it from
 *  interpolation and from the checkpoint payload. */
export const GLOBAL_NUMERIC_KEYS = [
  // *_speed family — phase rates for the various noise fields.
  'textScrollSpeed',
  'tongueBigSt',
  'tongueMedSt',
  'flickerSt',
  'swirlSpeed',
  'curlDriftSpeed',
  'colorHueShiftSpeed',
  'scanlineSpeed',
  'grainSpeed',
  // Post-FX layer — pixelation, CRT scanlines, glow, film grain.  These
  // describe a global treatment of the canvas, not a section-specific
  // look, so they belong in the post-fx-controls panel rather than
  // in a per-section keyframe.
  'pixelSize',
  'scanlineOpacity',
  'scanlineSpacing',
  'glowOpacity',
  'glowRadius',
  'glowSoftness',
  'grainOpacity',
  'grainScale',
] as const

export type GlobalNumericKey = (typeof GLOBAL_NUMERIC_KEYS)[number]
/** Numeric params that DO live on each checkpoint and interpolate
 *  between them as the user scrolls. */
export type KeyframeNumericKey = Exclude<NumericFireParamKey, GlobalNumericKey>

const GLOBAL_KEY_SET: ReadonlySet<string> = new Set<string>(GLOBAL_NUMERIC_KEYS)
export function isGlobalNumericKey(k: string): k is GlobalNumericKey {
  return GLOBAL_KEY_SET.has(k)
}

/** Numeric keys that ARE interpolated across scroll-arc checkpoints.
 *  Equal to all numeric FireParams keys minus GLOBAL_NUMERIC_KEYS. */
export const NUMERIC_KEYS: readonly KeyframeNumericKey[] =
  (Object.keys(FIRE_DEFAULTS) as Array<keyof FireParams>).filter(
    (k) => typeof FIRE_DEFAULTS[k] === 'number' && !GLOBAL_KEY_SET.has(k),
  ) as KeyframeNumericKey[]

export type CheckpointParams = Record<KeyframeNumericKey, number>

export interface ScrollKeyframe {
  /** Stable identifier — survives reorder/insert.  Used by section-nav. */
  id: string
  /** Scroll progress where this checkpoint pins values, 0..1.  Re-derived
   *  on every mutation as `index / (count - 1)`. */
  at: number
  /** Full numeric param snapshot. */
  params: CheckpointParams
  /** Optional human-readable label.  Reserved for the future when we want
   *  named sections ("intro", "about", "work"). */
  label?: string
}

const SCHEMA_KEY = 'scroll-arc-v2'
const LEGACY_KEY_V1 = 'scroll-arc-v1'
const ACTIVE_INDEX_KEY = 'scroll-arc-v2-active'

/** Parse a raw blob (from JSON file or localStorage) into a clean
 *  ScrollKeyframe[].  Returns null if the blob isn't a usable array of
 *  at least 2 entries. */
function parseKeyframes(parsed: unknown): ScrollKeyframe[] | null {
  if (!Array.isArray(parsed) || parsed.length < 2) return null
  const list: ScrollKeyframe[] = parsed.map((k: unknown) => {
    const rec = (k ?? {}) as Record<string, unknown>
    return {
      id: typeof rec.id === 'string' ? rec.id : makeId(),
      at: typeof rec.at === 'number' ? rec.at : 0,
      params: normaliseParams(rec.params),
      ...(typeof rec.label === 'string' ? { label: rec.label } : {}),
    }
  })
  redistribute(list)
  return list
}

function fullDefaults(): CheckpointParams {
  const out = {} as CheckpointParams
  for (const k of NUMERIC_KEYS) out[k] = FIRE_DEFAULTS[k] as number
  return out
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** Starting checkpoints — two so we have something to interpolate
 *  between by default.  Both seeded from FIRE_DEFAULTS. */
function makeFallbackKeyframes(): ScrollKeyframe[] {
  return [
    { id: makeId(), at: 0, params: fullDefaults() },
    { id: makeId(), at: 1, params: fullDefaults() },
  ]
}

/** Load defaults from the committed JSON file.  These are the "global"
 *  defaults — same for every visitor — and `save` writes back to this
 *  file (via download).  Falls through to hard-coded fallbacks if the
 *  file is empty / unreadable. */
function loadCommittedDefaults(): ScrollKeyframe[] {
  return parseKeyframes(committedDefaults) ?? makeFallbackKeyframes()
}

export interface ScrollArc {
  getKeyframes(): readonly ScrollKeyframe[]
  /** Index of the checkpoint the controls panel is currently editing. */
  getActiveIndex(): number
  /** Switch which checkpoint is "active" (and therefore being written into
   *  by the fire-controls panel).  Caller is responsible for any scroll
   *  animation it wants to play to bring that checkpoint into view. */
  setActiveIndex(i: number): void
  /** Write one numeric param into the currently-active checkpoint. */
  setActiveParam(key: KeyframeNumericKey, value: number): void
  /** Batch-write a partial param set into the currently-active checkpoint.
   *  Useful for the copy/paste flow — applies all changes with one
   *  persist + emit instead of N. */
  setActiveParams(partial: Partial<CheckpointParams>): void
  /** Append a new checkpoint at the end, copying the current state of the
   *  last one so the addition is visually a no-op until the user edits.
   *  The new checkpoint becomes the active one. */
  appendKeyframe(): void
  /** Drop a checkpoint.  Bails if the list would shrink below 2 (we need
   *  at least 2 to interpolate). */
  removeKeyframe(index: number): void
  /** Wipe the persisted checkpoints and restore either saved defaults
   *  (if the user has saved any) or the hard-coded defaults. */
  reset(): void
  /** Persist the current list as the new "saved defaults" for future
   *  resets and fresh sessions. */
  saveAsDefaults(): void
  /** Subscribe to mutations.  Returns an unsubscribe callback. */
  subscribe(cb: () => void): () => void
}

function cloneParams(p: CheckpointParams): CheckpointParams {
  const out = {} as CheckpointParams
  for (const k of NUMERIC_KEYS) out[k] = p[k]
  return out
}

/** Fill any missing numeric keys with FIRE_DEFAULTS.  Used both on legacy
 *  v1 migration and to repair partially-persisted v2 blobs. */
function normaliseParams(input: unknown): CheckpointParams {
  const out = fullDefaults()
  if (input && typeof input === 'object') {
    for (const k of NUMERIC_KEYS) {
      const v = (input as Record<string, unknown>)[k]
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v
    }
  }
  return out
}

/** Distribute `at` evenly across [0, 1] so positions follow index order. */
function redistribute(kfs: ScrollKeyframe[]): void {
  if (kfs.length === 1) {
    kfs[0].at = 0
    return
  }
  const last = kfs.length - 1
  for (let i = 0; i <= last; i++) kfs[i].at = i / last
}

function loadV2(): ScrollKeyframe[] | null {
  try {
    const raw = localStorage.getItem(SCHEMA_KEY)
    if (!raw) return null
    return parseKeyframes(JSON.parse(raw))
  } catch {
    return null
  }
}

/** v1 blob = `[{ at, params: Partial<FireParams> }, ...]`.  Migrate by
 *  filling missing numeric keys from FIRE_DEFAULTS and giving each entry
 *  a fresh id. */
function loadV1Legacy(): ScrollKeyframe[] | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY_V1)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length < 2) return null
    const list: ScrollKeyframe[] = parsed.map((k: unknown) => {
      const rec = (k ?? {}) as Record<string, unknown>
      return {
        id: makeId(),
        at: typeof rec.at === 'number' ? rec.at : 0,
        params: normaliseParams(rec.params),
      }
    })
    list.sort((a, b) => a.at - b.at)
    redistribute(list)
    return list
  } catch {
    return null
  }
}

function loadInitial(): ScrollKeyframe[] {
  return loadV2() ?? loadV1Legacy() ?? loadCommittedDefaults()
}

/** Trigger a browser download of the current keyframes as
 *  `scroll-arc-defaults.json`.  Replace the file at `src/` with this and
 *  commit to share the configuration with every visitor. */
function downloadDefaults(kfs: readonly ScrollKeyframe[]): void {
  const json = JSON.stringify(kfs, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'scroll-arc-defaults.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function loadActiveIndex(max: number): number {
  try {
    const raw = localStorage.getItem(ACTIVE_INDEX_KEY)
    if (raw === null) return 0
    const n = parseInt(raw, 10)
    if (!Number.isFinite(n) || n < 0 || n > max) return 0
    return n
  } catch {
    return 0
  }
}

export function createScrollArc(): ScrollArc {
  let keyframes: ScrollKeyframe[] = loadInitial()
  redistribute(keyframes)
  let activeIndex = loadActiveIndex(keyframes.length - 1)

  const subs = new Set<() => void>()
  function emit(): void {
    for (const s of subs) s()
  }
  function persist(): void {
    try {
      localStorage.setItem(SCHEMA_KEY, JSON.stringify(keyframes))
      localStorage.setItem(ACTIVE_INDEX_KEY, String(activeIndex))
    } catch {
      /* quota / private mode — ignore */
    }
  }

  return {
    getKeyframes: () => keyframes,

    getActiveIndex: () => activeIndex,

    setActiveIndex(i) {
      if (!Number.isFinite(i)) return
      const clamped = Math.max(0, Math.min(keyframes.length - 1, Math.round(i)))
      if (clamped === activeIndex) return
      activeIndex = clamped
      persist()
      emit()
    },

    setActiveParam(key, value) {
      const kf = keyframes[activeIndex]
      if (!kf) return
      if (kf.params[key] === value) return
      kf.params = { ...kf.params, [key]: value }
      persist()
      emit()
    },

    setActiveParams(partial) {
      const kf = keyframes[activeIndex]
      if (!kf) return
      // Filter to known keyframe keys + skip no-op writes.
      const merged: CheckpointParams = { ...kf.params }
      let changed = false
      for (const k of NUMERIC_KEYS) {
        const v = (partial as Record<string, unknown>)[k]
        if (typeof v !== 'number' || !Number.isFinite(v)) continue
        if (merged[k] !== v) {
          merged[k] = v
          changed = true
        }
      }
      if (!changed) return
      kf.params = merged
      persist()
      emit()
    },

    appendKeyframe() {
      const src = keyframes[keyframes.length - 1]
      const seed = src ? cloneParams(src.params) : fullDefaults()
      keyframes = [...keyframes, { id: makeId(), at: 1, params: seed }]
      redistribute(keyframes)
      activeIndex = keyframes.length - 1
      persist()
      emit()
    },

    removeKeyframe(index) {
      if (keyframes.length <= 2) return
      if (index < 0 || index >= keyframes.length) return
      keyframes = keyframes.filter((_, i) => i !== index)
      redistribute(keyframes)
      if (activeIndex >= keyframes.length) activeIndex = keyframes.length - 1
      persist()
      emit()
    },

    reset() {
      keyframes = loadCommittedDefaults()
      activeIndex = 0
      try {
        localStorage.removeItem(SCHEMA_KEY)
      } catch {
        /* ignore */
      }
      persist()
      emit()
    },

    saveAsDefaults() {
      downloadDefaults(keyframes)
    },

    subscribe(cb) {
      subs.add(cb)
      return () => {
        subs.delete(cb)
      }
    },
  }
}
