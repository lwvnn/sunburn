// Live tuning panel for the cursor flow field.  Mirrors controls.ts in
// shape but lives in its OWN window at the bottom-right of the viewport
// and persists under its own localStorage key, so its sliders don't
// pollute the fire panel.  Cyan accent so it's visually distinct from the
// orange fire panel and the cream name panel.

import type {
  CursorEffect,
  CursorEffectParams,
  CursorEffectType,
} from './cursor-effects'
import {
  CURSOR_EFFECT_DEFAULTS,
  CURSOR_EFFECT_TYPES,
} from './cursor-effects'

type NumericKey = 'fieldR' | 'amp' | 'noiseAmp' | 'fadeSpeed'

interface SliderDef {
  key: NumericKey
  label: string
  min: number
  max: number
  step: number
  format?: (v: number) => string
}

const SLIDERS: SliderDef[] = [
  { key: 'fieldR',    label: 'field radius',  min: 0,   max: 400, step: 1    },
  { key: 'amp',       label: 'strength',      min: 0,   max: 200, step: 1    },
  { key: 'noiseAmp',  label: 'border noise',  min: 0,   max: 1,   step: 0.01 },
  { key: 'fadeSpeed', label: 'fade /s',       min: 0.5, max: 12,  step: 0.1  },
]

const STORAGE_KEY = 'cursor-effect-controls-v1'

interface PersistedState {
  params: Partial<CursorEffectParams>
  collapsed: boolean
}

function loadPersisted(): PersistedState {
  const fallback: PersistedState = { params: {}, collapsed: false }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const p = JSON.parse(raw) as Partial<PersistedState>
    return {
      params:    p.params    ?? {},
      collapsed: p.collapsed ?? false,
    }
  } catch { return fallback }
}

function savePersisted(s: PersistedState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

function injectStyles(): void {
  if (document.getElementById('cursor-controls-styles')) return
  const css = `
    #cursor-controls {
      position: fixed;
      bottom: 12px;
      right: 12px;
      z-index: 9999;
      width: 240px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(18, 18, 18, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      user-select: none;
      -webkit-user-select: none;
    }
    #cursor-controls header {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 10px; cursor: pointer;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: rgba(255, 255, 255, 0.90);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    #cursor-controls header .chev { transition: transform 150ms ease-out; font-size: 9px; opacity: 0.7; }
    #cursor-controls.collapsed header { border-bottom: none; }
    #cursor-controls.collapsed header .chev { transform: rotate(-90deg); }
    #cursor-controls.collapsed .body { display: none; }
    #cursor-controls header .title { flex: 1; }
    #cursor-controls .body { padding: 8px 10px 10px; max-height: 65vh; overflow-y: auto; }
    #cursor-controls .row { margin: 6px 0; }
    #cursor-controls .row .label-line {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 2px; gap: 8px;
    }
    #cursor-controls .row label { opacity: 0.78; }
    #cursor-controls .row .val {
      font-variant-numeric: tabular-nums;
      color: rgba(255, 255, 255, 0.90);
      opacity: 0.95;
    }

    #cursor-controls .effect-row { margin: 0 0 10px; }
    #cursor-controls .effect-row select {
      width: 100%; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 4px;
      letter-spacing: 0.04em;
      cursor: pointer;
      appearance: none;
      text-transform: uppercase;
    }
    #cursor-controls .effect-row select:hover { background: rgba(255, 255, 255, 0.12); }
    #cursor-controls .effect-row select option { background: #1a1a1a; color: rgba(255, 255, 255, 0.85); }

    #cursor-controls input[type="range"] {
      width: 100%; height: 14px; -webkit-appearance: none; appearance: none;
      background: transparent; margin: 0;
    }
    #cursor-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 2px; background: rgba(255, 255, 255, 0.20); border-radius: 1px;
    }
    #cursor-controls input[type="range"]::-moz-range-track {
      height: 2px; background: rgba(255, 255, 255, 0.20); border-radius: 1px;
    }
    #cursor-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      margin-top: -5px; cursor: pointer; border: none;
    }
    #cursor-controls input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      cursor: pointer; border: none;
    }

    #cursor-controls .actions {
      display: flex; gap: 6px; margin-top: 10px; padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #cursor-controls button {
      flex: 1; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px; cursor: pointer; letter-spacing: 0.05em; text-transform: lowercase;
    }
    #cursor-controls button:hover  { background: rgba(255, 255, 255, 0.14); }
    #cursor-controls button:active { background: rgba(255, 255, 255, 0.22); }

    /* ── Light theme overrides ────────────────────────────────────────── */
    body.theme-light #cursor-controls {
      color: rgba(0, 0, 0, 0.92);
      background: rgba(245, 245, 245, 0.88);
      border-color: rgba(0, 0, 0, 0.28);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
    }
    body.theme-light #cursor-controls header {
      color: rgba(0, 0, 0, 0.95);
      border-bottom-color: rgba(0, 0, 0, 0.22);
    }
    body.theme-light #cursor-controls .actions { border-top-color: rgba(0, 0, 0, 0.22); }
    body.theme-light #cursor-controls .row .val { color: rgba(0, 0, 0, 0.95); }
    body.theme-light #cursor-controls input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #cursor-controls input[type="range"]::-moz-range-track {
      background: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #cursor-controls input[type="range"]::-webkit-slider-thumb,
    body.theme-light #cursor-controls input[type="range"]::-moz-range-thumb {
      background: rgb(80, 80, 80); box-shadow: 0 0 6px rgba(0, 0, 0, 0.40);
    }
    body.theme-light #cursor-controls button,
    body.theme-light #cursor-controls .effect-row select {
      background: rgba(0, 0, 0, 0.08); border-color: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #cursor-controls button:hover,
    body.theme-light #cursor-controls .effect-row select:hover {
      background: rgba(0, 0, 0, 0.18);
    }
    body.theme-light #cursor-controls .effect-row select option {
      background: #f5f5f5; color: rgba(0, 0, 0, 0.92);
    }
  `
  const style = document.createElement('style')
  style.id = 'cursor-controls-styles'
  style.textContent = css
  document.head.appendChild(style)
}

function defaultFormat(step: number): (v: number) => string {
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : step >= 0.001 ? 3 : 4
  return v => v.toFixed(decimals)
}

export interface CursorEffectControlsHandle { destroy(): void }

export function mountCursorEffectControls(
  cursor: CursorEffect,
  parent: HTMLElement = document.body,
): CursorEffectControlsHandle {
  injectStyles()

  const persisted = loadPersisted()
  if (Object.keys(persisted.params).length > 0) cursor.setParams(persisted.params)

  const panel = document.createElement('div')
  panel.id = 'cursor-controls'
  if (persisted.collapsed) panel.classList.add('collapsed')

  // ── Header ──────────────────────────────────────────────────────────────
  const header = document.createElement('header')
  const chev   = document.createElement('span')
  chev.className   = 'chev'
  chev.textContent = '▼'
  const title  = document.createElement('span')
  title.className   = 'title'
  title.textContent = 'cursor — field'
  header.append(chev, title)

  header.addEventListener('click', () => {
    panel.classList.toggle('collapsed')
    persisted.collapsed = panel.classList.contains('collapsed')
    savePersisted(persisted)
  })

  panel.appendChild(header)

  // ── Body ──────────────────────────────────────────────────────────────
  const body = document.createElement('div')
  body.className = 'body'

  // Effect-type dropdown (5 variants).
  const effectRow = document.createElement('div')
  effectRow.className = 'effect-row'
  const effectSelect = document.createElement('select')
  effectSelect.title = 'Field effect'
  for (const t of CURSOR_EFFECT_TYPES) {
    const opt = document.createElement('option')
    opt.value       = t
    opt.textContent = t
    effectSelect.appendChild(opt)
  }
  effectSelect.value = cursor.getParams().effect
  effectSelect.addEventListener('change', () => {
    const v = effectSelect.value as CursorEffectType
    cursor.setParams({ effect: v })
    persisted.params.effect = v
    savePersisted(persisted)
  })
  effectRow.appendChild(effectSelect)
  body.appendChild(effectRow)

  // Sliders.
  const rows: Array<{ def: SliderDef; input: HTMLInputElement; val: HTMLSpanElement }> = []

  for (const def of SLIDERS) {
    const row       = document.createElement('div')
    row.className   = 'row'
    const labelLine = document.createElement('div')
    labelLine.className = 'label-line'
    const label     = document.createElement('label')
    label.textContent = def.label
    const val = document.createElement('span')
    val.className = 'val'
    labelLine.append(label, val)

    const input   = document.createElement('input')
    input.type    = 'range'
    input.min     = String(def.min)
    input.max     = String(def.max)
    input.step    = String(def.step)
    const current = cursor.getParams()[def.key as keyof CursorEffectParams] as number
    input.value   = String(current)
    const fmt     = def.format ?? defaultFormat(def.step)
    val.textContent = fmt(current)

    input.addEventListener('input', () => {
      const v = Number(input.value)
      val.textContent = fmt(v)
      cursor.setParams({ [def.key]: v } as Partial<CursorEffectParams>)
      persisted.params[def.key as keyof CursorEffectParams] = v as any
      savePersisted(persisted)
    })

    row.append(labelLine, input)
    body.appendChild(row)
    rows.push({ def, input, val })
  }

  // Actions.
  const actions = document.createElement('div')
  actions.className = 'actions'

  const resetBtn = document.createElement('button')
  resetBtn.textContent = 'reset'
  resetBtn.addEventListener('click', () => {
    cursor.setParams({ ...CURSOR_EFFECT_DEFAULTS })
    persisted.params = {}
    savePersisted(persisted)
    effectSelect.value = CURSOR_EFFECT_DEFAULTS.effect
    for (const { def, input, val } of rows) {
      const v = CURSOR_EFFECT_DEFAULTS[def.key as keyof CursorEffectParams] as number
      input.value     = String(v)
      val.textContent = (def.format ?? defaultFormat(def.step))(v)
    }
  })

  const copyBtn = document.createElement('button')
  copyBtn.textContent = 'copy'
  copyBtn.addEventListener('click', async () => {
    const json = JSON.stringify(cursor.getParams(), null, 2)
    try {
      await navigator.clipboard.writeText(json)
      const orig = copyBtn.textContent
      copyBtn.textContent = 'copied'
      setTimeout(() => { copyBtn.textContent = orig }, 900)
    } catch { console.log(json) }
  })

  actions.append(resetBtn, copyBtn)
  body.appendChild(actions)
  panel.appendChild(body)
  parent.appendChild(panel)

  return { destroy() { panel.remove() } }
}
