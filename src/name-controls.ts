// Live tuning panel for the centered name.  Mirrors controls.ts in shape but
// positioned top-LEFT so it doesn't collide with the fire panel on the right.
// Persists across reloads under its own localStorage key.

import type { NameRenderer, NameParams, NameGlitch } from './name'
import { NAME_DEFAULTS, NAME_GLITCH_TYPES } from './name'

const FONT_FAMILIES: Array<{ label: string; stack: string }> = [
  // Bundled variable fonts (registered via @font-face in style.css).
  { label: 'Inter',           stack: '"Inter", system-ui, sans-serif' },
  { label: 'Space Grotesk',   stack: '"Space Grotesk", system-ui, sans-serif' },
  { label: 'JetBrains Mono',  stack: '"JetBrains Mono", ui-monospace, monospace' },
  { label: 'Uncut Sans',      stack: '"Uncut Sans", system-ui, sans-serif' },
  // System fallbacks.
  { label: 'Georgia',   stack: 'Georgia, "Times New Roman", serif' },
  { label: 'Times',     stack: '"Times New Roman", Times, serif' },
  { label: 'Iowan',     stack: '"Iowan Old Style", Palatino, Georgia, serif' },
  { label: 'Palatino',  stack: 'Palatino, "Book Antiqua", serif' },
  { label: 'Helvetica', stack: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Arial',     stack: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana',   stack: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier',   stack: '"Courier New", Courier, monospace' },
  { label: 'SF Mono',   stack: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' },
]

type NumericNameParamKey = {
  [K in keyof NameParams]: NameParams[K] extends number ? K : never
}[keyof NameParams]

interface SliderDef {
  key: NumericNameParamKey
  label: string
  min: number
  max: number
  step: number
  format?: (v: number) => string
}

const SLIDERS: SliderDef[] = [
  { key: 'fontSize',        label: 'font size',      min: 12,  max: 200, step: 1   },
  { key: 'fontWeight',      label: 'font weight',    min: 100, max: 900, step: 100 },
  { key: 'letterSpacing',   label: 'letter spacing', min: -3,  max: 24,  step: 0.1 },
  { key: 'cxFrac',          label: 'position x',     min: 0,   max: 1,   step: 0.005 },
  { key: 'cyFrac',          label: 'position y',     min: 0,   max: 1,   step: 0.005 },
  { key: 'maskPadding',     label: 'mask halo px',   min: 0,   max: 60,  step: 1   },
  { key: 'strokeWidth',     label: 'outline px',     min: 0,   max: 24,  step: 0.5 },
  { key: 'glitchIntensity', label: 'glitch amount',  min: 0,   max: 1,   step: 0.01 },
  { key: 'glitchSpeed',     label: 'glitch speed',   min: 0,   max: 20,  step: 0.1 },
]

const STORAGE_KEY = 'name-controls-v1'

interface PersistedState {
  params: Partial<NameParams>
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
  if (document.getElementById('name-controls-styles')) return
  const css = `
    #name-controls {
      position: fixed;
      top: 12px;
      left: 12px;
      z-index: 9999;
      width: 240px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(244, 234, 216, 0.92);
      background: rgba(10, 6, 8, 0.78);
      border: 1px solid rgba(244, 234, 216, 0.22);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      user-select: none;
      -webkit-user-select: none;
    }
    #name-controls header {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 10px; cursor: pointer;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: rgba(244, 234, 216, 0.95);
      border-bottom: 1px solid rgba(244, 234, 216, 0.18);
    }
    #name-controls header .chev { transition: transform 150ms ease-out; font-size: 9px; opacity: 0.7; }
    #name-controls.collapsed header { border-bottom: none; }
    #name-controls.collapsed header .chev { transform: rotate(-90deg); }
    #name-controls.collapsed .body { display: none; }
    #name-controls header .title { flex: 1; }
    #name-controls .body { padding: 8px 10px 10px; max-height: 70vh; overflow-y: auto; }
    #name-controls .row { margin: 6px 0; }
    #name-controls .row .label-line {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 2px; gap: 8px;
    }
    #name-controls .row label { opacity: 0.78; }
    #name-controls .row .val {
      font-variant-numeric: tabular-nums;
      color: rgba(244, 234, 216, 0.95);
      opacity: 0.95;
    }

    #name-controls .text-row, #name-controls .font-row { margin: 0 0 8px; }
    #name-controls input[type="text"],
    #name-controls .font-row select {
      width: 100%; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(244, 234, 216, 0.08);
      border: 1px solid rgba(244, 234, 216, 0.24);
      border-radius: 4px;
      letter-spacing: 0.04em;
      box-sizing: border-box;
    }
    #name-controls input[type="text"]:focus,
    #name-controls .font-row select:focus { outline: none; border-color: rgba(244, 234, 216, 0.45); }
    #name-controls .font-row select { cursor: pointer; appearance: none; }
    #name-controls .font-row select:hover { background: rgba(244, 234, 216, 0.14); }
    #name-controls .font-row select option { background: #1a0d04; color: rgba(244, 234, 216, 0.92); }

    #name-controls input[type="range"] {
      width: 100%; height: 14px; -webkit-appearance: none; appearance: none;
      background: transparent; margin: 0;
    }
    #name-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 2px; background: rgba(244, 234, 216, 0.25); border-radius: 1px;
    }
    #name-controls input[type="range"]::-moz-range-track {
      height: 2px; background: rgba(244, 234, 216, 0.25); border-radius: 1px;
    }
    #name-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(244, 234, 216);
      box-shadow: 0 0 6px rgba(244, 234, 216, 0.5);
      margin-top: -5px; cursor: pointer; border: none;
    }
    #name-controls input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(244, 234, 216);
      box-shadow: 0 0 6px rgba(244, 234, 216, 0.5);
      cursor: pointer; border: none;
    }

    #name-controls .colour-row {
      display: flex; align-items: center; gap: 8px;
      margin-top: 10px; padding-top: 8px;
      border-top: 1px solid rgba(244, 234, 216, 0.18);
    }
    #name-controls .colour-row label { opacity: 0.78; flex: 1; }
    #name-controls .colour-row input[type="color"] {
      width: 56px; height: 26px; padding: 0;
      border: 1px solid rgba(244, 234, 216, 0.28);
      border-radius: 4px; background: transparent; cursor: pointer;
    }
    #name-controls .colour-row input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
    #name-controls .colour-row input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }

    #name-controls .actions {
      display: flex; gap: 6px; margin-top: 10px; padding-top: 8px;
      border-top: 1px solid rgba(244, 234, 216, 0.18);
    }
    #name-controls button {
      flex: 1; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(244, 234, 216, 0.08);
      border: 1px solid rgba(244, 234, 216, 0.28);
      border-radius: 4px; cursor: pointer; letter-spacing: 0.05em; text-transform: lowercase;
    }
    #name-controls button:hover  { background: rgba(244, 234, 216, 0.16); }
    #name-controls button:active { background: rgba(244, 234, 216, 0.24); }

    /* ── Light theme overrides ────────────────────────────────────────── */
    body.theme-light #name-controls {
      color: rgba(40, 18, 6, 0.92);
      background: rgba(255, 248, 234, 0.85);
      border-color: rgba(40, 18, 6, 0.22);
      box-shadow: 0 6px 24px rgba(80, 30, 0, 0.18);
    }
    body.theme-light #name-controls header {
      color: rgba(40, 18, 6, 0.95);
      border-bottom-color: rgba(40, 18, 6, 0.18);
    }
    body.theme-light #name-controls .actions,
    body.theme-light #name-controls .colour-row { border-top-color: rgba(40, 18, 6, 0.18); }
    body.theme-light #name-controls input[type="text"],
    body.theme-light #name-controls .font-row select {
      background: rgba(40, 18, 6, 0.06); border-color: rgba(40, 18, 6, 0.22);
    }
    body.theme-light #name-controls input[type="text"]:focus,
    body.theme-light #name-controls .font-row select:focus { border-color: rgba(40, 18, 6, 0.42); }
    body.theme-light #name-controls .font-row select option { background: #fff8ea; color: rgba(40, 18, 6, 0.92); }
    body.theme-light #name-controls input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #name-controls input[type="range"]::-moz-range-track {
      background: rgba(40, 18, 6, 0.28);
    }
    body.theme-light #name-controls input[type="range"]::-webkit-slider-thumb,
    body.theme-light #name-controls input[type="range"]::-moz-range-thumb {
      background: rgb(40, 18, 6); box-shadow: 0 0 6px rgba(40, 18, 6, 0.4);
    }
    body.theme-light #name-controls .row .val { color: rgba(40, 18, 6, 0.95); }
    body.theme-light #name-controls button {
      background: rgba(40, 18, 6, 0.06); border-color: rgba(40, 18, 6, 0.28);
    }
    body.theme-light #name-controls button:hover  { background: rgba(40, 18, 6, 0.14); }
  `
  const style = document.createElement('style')
  style.id = 'name-controls-styles'
  style.textContent = css
  document.head.appendChild(style)
}

function defaultFormat(step: number): (v: number) => string {
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : step >= 0.001 ? 3 : 4
  return v => v.toFixed(decimals)
}

export interface NameControlsHandle { destroy(): void }

export function mountNameControls(
  name: NameRenderer,
  parent: HTMLElement = document.body,
): NameControlsHandle {
  injectStyles()

  const persisted = loadPersisted()
  if (Object.keys(persisted.params).length > 0) {
    name.setParams(persisted.params)
  }

  const panel = document.createElement('div')
  panel.id = 'name-controls'
  if (persisted.collapsed) panel.classList.add('collapsed')

  // ── Header ──────────────────────────────────────────────────────────────
  const header = document.createElement('header')
  const chev   = document.createElement('span')
  chev.className   = 'chev'
  chev.textContent = '▼'
  const title  = document.createElement('span')
  title.className   = 'title'
  title.textContent = 'name — tune'
  header.append(chev, title)

  header.addEventListener('click', () => {
    panel.classList.toggle('collapsed')
    persisted.collapsed = panel.classList.contains('collapsed')
    savePersisted(persisted)
  })

  panel.appendChild(header)

  // ── Body ───────────────────────────────────────────────────────────────
  const body = document.createElement('div')
  body.className = 'body'

  // Text input.
  const textRow = document.createElement('div')
  textRow.className = 'text-row'
  const textInput = document.createElement('input')
  textInput.type  = 'text'
  textInput.placeholder = 'name text'
  textInput.value = String(name.getParams().text)
  textInput.addEventListener('input', () => {
    const v = textInput.value
    name.setParams({ text: v })
    persisted.params.text = v
    savePersisted(persisted)
  })
  textRow.appendChild(textInput)
  body.appendChild(textRow)

  // Font family dropdown.
  const fontRow = document.createElement('div')
  fontRow.className = 'font-row'
  const fontSelect = document.createElement('select')
  fontSelect.title = 'Font family'
  const currentFamily = String(name.getParams().fontFamily)
  const knownStacks   = new Set(FONT_FAMILIES.map(f => f.stack))
  if (!knownStacks.has(currentFamily)) {
    const opt = document.createElement('option')
    opt.value = currentFamily; opt.textContent = '(custom)'
    fontSelect.appendChild(opt)
  }
  for (const f of FONT_FAMILIES) {
    const opt = document.createElement('option')
    opt.value       = f.stack
    opt.textContent = f.label
    opt.style.fontFamily = f.stack
    fontSelect.appendChild(opt)
  }
  fontSelect.value = currentFamily
  fontSelect.addEventListener('change', () => {
    const v = fontSelect.value
    name.setParams({ fontFamily: v })
    persisted.params.fontFamily = v
    savePersisted(persisted)
  })
  fontRow.appendChild(fontSelect)
  body.appendChild(fontRow)

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

    const input  = document.createElement('input')
    input.type   = 'range'
    input.min    = String(def.min)
    input.max    = String(def.max)
    input.step   = String(def.step)
    const current = name.getParams()[def.key]
    input.value  = String(current)
    const fmt    = def.format ?? defaultFormat(def.step)
    val.textContent = fmt(current)

    input.addEventListener('input', () => {
      const v = Number(input.value)
      val.textContent = fmt(v)
      name.setParams({ [def.key]: v } as Partial<NameParams>)
      persisted.params[def.key] = v
      savePersisted(persisted)
    })

    row.append(labelLine, input)
    body.appendChild(row)
    rows.push({ def, input, val })
  }

  // Colour picker.
  const colourRow = document.createElement('div')
  colourRow.className = 'colour-row'
  const colourLabel = document.createElement('label')
  colourLabel.textContent = 'colour'
  const colourInput = document.createElement('input')
  colourInput.type = 'color'
  colourInput.value = String(name.getParams().color)
  colourInput.addEventListener('input', () => {
    const v = colourInput.value
    name.setParams({ color: v })
    persisted.params.color = v
    savePersisted(persisted)
  })
  colourRow.append(colourLabel, colourInput)
  body.appendChild(colourRow)

  // Outline colour picker.
  const strokeRow = document.createElement('div')
  strokeRow.className = 'colour-row'
  const strokeLabel = document.createElement('label')
  strokeLabel.textContent = 'outline'
  const strokeInput = document.createElement('input')
  strokeInput.type  = 'color'
  strokeInput.value = String(name.getParams().strokeColor)
  strokeInput.addEventListener('input', () => {
    const v = strokeInput.value
    name.setParams({ strokeColor: v })
    persisted.params.strokeColor = v
    savePersisted(persisted)
  })
  strokeRow.append(strokeLabel, strokeInput)
  body.appendChild(strokeRow)

  // Glitch-effect dropdown.
  const glitchRow = document.createElement('div')
  glitchRow.className = 'font-row'
  const glitchSelect = document.createElement('select')
  glitchSelect.title = 'Glitch effect'
  for (const g of NAME_GLITCH_TYPES) {
    const opt = document.createElement('option')
    opt.value       = g
    opt.textContent = `glitch: ${g}`
    glitchSelect.appendChild(opt)
  }
  glitchSelect.value = name.getParams().glitch
  glitchSelect.addEventListener('change', () => {
    const v = glitchSelect.value as NameGlitch
    name.setParams({ glitch: v })
    persisted.params.glitch = v
    savePersisted(persisted)
  })
  glitchRow.appendChild(glitchSelect)
  body.appendChild(glitchRow)

  // Actions.
  const actions = document.createElement('div')
  actions.className = 'actions'

  const resetBtn = document.createElement('button')
  resetBtn.textContent = 'reset'
  resetBtn.addEventListener('click', () => {
    name.setParams({ ...NAME_DEFAULTS })
    persisted.params = {}
    savePersisted(persisted)
    textInput.value   = NAME_DEFAULTS.text
    fontSelect.value  = NAME_DEFAULTS.fontFamily
    colourInput.value = NAME_DEFAULTS.color
    strokeInput.value = NAME_DEFAULTS.strokeColor
    glitchSelect.value = NAME_DEFAULTS.glitch
    for (const { def, input, val } of rows) {
      const v = NAME_DEFAULTS[def.key] as number
      input.value     = String(v)
      val.textContent = (def.format ?? defaultFormat(def.step))(v)
    }
  })

  const copyBtn = document.createElement('button')
  copyBtn.textContent = 'copy'
  copyBtn.addEventListener('click', async () => {
    const json = JSON.stringify(name.getParams(), null, 2)
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
