// Standalone control window for the GLOBAL post-FX layer:
//   - pixelation block size
//   - CRT scanline opacity + spacing
//   - glow opacity + radius + softness
//   - film-grain opacity + scale
//
// These don't belong on per-section keyframes (they describe a global
// treatment of the canvas, not a section-specific look), and the *_speed
// post-FX params stay in the main fire-controls window — see the
// GLOBAL_NUMERIC_KEYS list in scroll-arc.ts for the canonical split.
//
// The panel writes directly to `fire.setParams` and persists its own
// slider state in a dedicated localStorage blob so it survives reloads
// without colliding with the main fire-controls' persistence.

import type { Fire, FireParams } from './fire'
import { FIRE_DEFAULTS } from './fire'

interface SliderDef {
  key:
    | 'pixelSize'
    | 'scanlineOpacity'
    | 'scanlineSpacing'
    | 'glowOpacity'
    | 'glowRadius'
    | 'glowSoftness'
    | 'grainOpacity'
    | 'grainScale'
  label: string
  min: number
  max: number
  step: number
  format?: (v: number) => string
}

const SLIDERS: SliderDef[] = [
  // ── Pixelation ────────────────────────────────────────────────────────
  { key: 'pixelSize',       label: 'pixel size',      min: 1, max: 12, step: 1 },
  // ── Scanlines ─────────────────────────────────────────────────────────
  { key: 'scanlineOpacity', label: 'scanline alpha',  min: 0, max: 1,  step: 0.01 },
  { key: 'scanlineSpacing', label: 'scanline gap',    min: 1, max: 12, step: 1 },
  // ── Glow ──────────────────────────────────────────────────────────────
  { key: 'glowOpacity',     label: 'glow opacity',    min: 0, max: 1,  step: 0.01 },
  { key: 'glowRadius',      label: 'glow radius',     min: 0, max: 80, step: 1 },
  { key: 'glowSoftness',    label: 'glow softness',   min: 0, max: 1,  step: 0.01 },
  // ── Grain ─────────────────────────────────────────────────────────────
  { key: 'grainOpacity',    label: 'grain opacity',   min: 0, max: 1,  step: 0.01 },
  { key: 'grainScale',      label: 'grain scale',     min: 1, max: 6,  step: 1 },
]

const STORAGE_KEY = 'post-fx-controls-v1'

interface PersistedState {
  params: Partial<FireParams>
  collapsed: boolean
}

function loadPersisted(): PersistedState {
  const fallback: PersistedState = { params: {}, collapsed: true }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      params: parsed.params ?? {},
      collapsed: parsed.collapsed ?? true,
    }
  } catch {
    return fallback
  }
}

function savePersisted(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota / private mode — ignore */
  }
}

function injectStyles(): void {
  if (document.getElementById('post-fx-controls-styles')) return
  const css = `
    #post-fx-controls {
      position: fixed;
      bottom: 12px;
      right: 12px;
      z-index: 9999;
      width: 220px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(18, 18, 18, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      user-select: none;
      -webkit-user-select: none;
    }
    #post-fx-controls header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px;
      cursor: pointer;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.90);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    #post-fx-controls header .chev {
      transition: transform 150ms ease-out;
      font-size: 9px;
      opacity: 0.7;
    }
    #post-fx-controls.collapsed header { border-bottom: none; }
    #post-fx-controls.collapsed header .chev { transform: rotate(-90deg); }
    #post-fx-controls.collapsed .body { display: none; }
    #post-fx-controls header .title { flex: 1; }
    #post-fx-controls .body { padding: 8px 10px 10px; max-height: 60vh; overflow-y: auto; }
    #post-fx-controls .row { margin: 6px 0; }
    #post-fx-controls .row .label-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
      gap: 8px;
    }
    #post-fx-controls .row label { opacity: 0.78; }
    #post-fx-controls .row .val {
      font: inherit;
      font-variant-numeric: tabular-nums;
      color: rgba(255, 255, 255, 0.90);
      opacity: 0.95;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 2px;
      padding: 1px 4px;
      width: 60px;
      text-align: right;
      cursor: text;
      outline: none;
    }
    #post-fx-controls .row .val:hover { border-color: rgba(255, 255, 255, 0.18); }
    #post-fx-controls .row .val:focus {
      border-color: rgba(255, 255, 255, 0.55);
      background: rgba(255, 255, 255, 0.06);
    }
    body.theme-light #post-fx-controls .row .val:hover { border-color: rgba(0, 0, 0, 0.22); }
    body.theme-light #post-fx-controls .row .val:focus {
      border-color: rgba(0, 0, 0, 0.65);
      background: rgba(0, 0, 0, 0.06);
    }
    #post-fx-controls input[type="range"] {
      width: 100%;
      height: 14px;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      margin: 0;
    }
    #post-fx-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 2px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 1px;
    }
    #post-fx-controls input[type="range"]::-moz-range-track {
      height: 2px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 1px;
    }
    #post-fx-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px; height: 12px;
      border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      margin-top: -5px;
      cursor: pointer;
      border: none;
    }
    #post-fx-controls input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px;
      border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      cursor: pointer;
      border: none;
    }
    #post-fx-controls .actions {
      display: flex;
      gap: 6px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #post-fx-controls button {
      flex: 1;
      padding: 5px 8px;
      font: inherit;
      color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px;
      cursor: pointer;
      letter-spacing: 0.05em;
      text-transform: lowercase;
    }
    #post-fx-controls button:hover  { background: rgba(255, 255, 255, 0.14); }
    #post-fx-controls button:active { background: rgba(255, 255, 255, 0.20); }

    body.theme-light #post-fx-controls {
      color: rgba(0, 0, 0, 0.92);
      background: rgba(245, 245, 245, 0.88);
      border-color: rgba(0, 0, 0, 0.28);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
    }
    body.theme-light #post-fx-controls header {
      color: rgba(0, 0, 0, 0.95);
      border-bottom-color: rgba(0, 0, 0, 0.20);
    }
    body.theme-light #post-fx-controls .actions {
      border-top-color: rgba(0, 0, 0, 0.20);
    }
    body.theme-light #post-fx-controls input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #post-fx-controls input[type="range"]::-moz-range-track {
      background: rgba(0, 0, 0, 0.28);
    }
    body.theme-light #post-fx-controls input[type="range"]::-webkit-slider-thumb,
    body.theme-light #post-fx-controls input[type="range"]::-moz-range-thumb {
      background: rgb(80, 80, 80);
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
    }
    body.theme-light #post-fx-controls .row .val { color: rgba(0, 0, 0, 0.95); }
    body.theme-light #post-fx-controls button {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #post-fx-controls button:hover {
      background: rgba(0, 0, 0, 0.18);
    }
  `
  const style = document.createElement('style')
  style.id = 'post-fx-controls-styles'
  style.textContent = css
  document.head.appendChild(style)
}

function defaultFormat(step: number): (v: number) => string {
  const decimals =
    step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : step >= 0.001 ? 3 : 4
  return v => v.toFixed(decimals)
}

export interface PostFxControlsHandle {
  destroy(): void
}

export function mountPostFxControls(
  fire: Fire,
  parent: HTMLElement = document.body,
): PostFxControlsHandle {
  injectStyles()

  const persisted = loadPersisted()

  // Replay any persisted values onto the fire so a returning visitor
  // sees the same post-FX settings they last left.
  if (Object.keys(persisted.params).length > 0) {
    fire.setParams(persisted.params)
  }

  const panel = document.createElement('div')
  panel.id = 'post-fx-controls'
  if (persisted.collapsed) panel.classList.add('collapsed')

  const header = document.createElement('header')
  const chev = document.createElement('span')
  chev.className = 'chev'
  chev.textContent = '▼'
  const title = document.createElement('span')
  title.className = 'title'
  title.textContent = 'post-fx'
  header.append(chev, title)
  header.addEventListener('click', () => {
    panel.classList.toggle('collapsed')
    persisted.collapsed = panel.classList.contains('collapsed')
    savePersisted(persisted)
  })
  panel.appendChild(header)

  const body = document.createElement('div')
  body.className = 'body'

  type Row = { def: SliderDef; input: HTMLInputElement; val: HTMLInputElement }
  const rows: Row[] = []

  for (const def of SLIDERS) {
    const row = document.createElement('div')
    row.className = 'row'

    const labelLine = document.createElement('div')
    labelLine.className = 'label-line'
    const label = document.createElement('label')
    label.textContent = def.label
    // Editable readout — type any number (no min/max cap).  Slider
    // pins at its bounds when the value is out of range; the actual
    // param value is whatever was typed.
    const val = document.createElement('input')
    val.type = 'text'
    val.inputMode = 'decimal'
    val.spellcheck = false
    val.className = 'val'
    val.title = 'Click and type a number — no min/max cap'
    labelLine.append(label, val)

    const input = document.createElement('input')
    input.type = 'range'
    input.min = String(def.min)
    input.max = String(def.max)
    input.step = String(def.step)
    const current = fire.getParams()[def.key]
    input.value = String(current)

    const fmt = def.format ?? defaultFormat(def.step)
    val.value = fmt(current as number)

    const applyValue = (v: number): void => {
      fire.setParams({ [def.key]: v } as Partial<FireParams>)
      ;(persisted.params as Record<string, unknown>)[def.key] = v
      savePersisted(persisted)
    }

    input.addEventListener('input', () => {
      const v = Number(input.value)
      val.value = fmt(v)
      applyValue(v)
    })

    const commitTypedValue = (): void => {
      const v = Number(val.value)
      if (!Number.isFinite(v)) {
        val.value = fmt(Number(input.value))
        return
      }
      input.value = String(v) // browser clamps visually into [min, max]
      val.value = fmt(v)
      applyValue(v)
    }
    val.addEventListener('change', commitTypedValue)
    val.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        val.blur()
      } else if (e.key === 'Escape') {
        val.value = fmt(Number(input.value))
        val.blur()
      }
    })
    val.addEventListener('focus', () => { val.select() })

    row.appendChild(labelLine)
    row.appendChild(input)
    body.appendChild(row)
    rows.push({ def, input, val })
  }

  // ── Reset to defaults ───────────────────────────────────────────────
  const actions = document.createElement('div')
  actions.className = 'actions'
  const resetBtn = document.createElement('button')
  resetBtn.textContent = 'reset'
  resetBtn.title = 'Restore the post-FX layer to FIRE_DEFAULTS'
  resetBtn.addEventListener('click', () => {
    const defaults: Partial<FireParams> = {}
    for (const def of SLIDERS) {
      ;(defaults as Record<string, unknown>)[def.key] = FIRE_DEFAULTS[def.key]
    }
    fire.setParams(defaults)
    persisted.params = {}
    savePersisted(persisted)
    // Sync slider DOM back to defaults.
    for (const { def, input, val } of rows) {
      const dv = FIRE_DEFAULTS[def.key] as number
      input.value = String(dv)
      const fmt = def.format ?? defaultFormat(def.step)
      val.value = fmt(dv)
    }
  })
  actions.appendChild(resetBtn)
  body.appendChild(actions)

  panel.appendChild(body)
  parent.appendChild(panel)

  return {
    destroy() {
      panel.remove()
    },
  }
}
