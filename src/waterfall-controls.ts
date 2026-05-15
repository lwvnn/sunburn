// Live tuning panel for the waterfall renderer.
//
// Structural mirror of controls.ts. All params in WaterfallParams get a
// slider or picker; values persist in localStorage under a separate key so
// fire and waterfall sessions don't clobber each other.

import type { Waterfall, WaterfallParams } from './waterfall'
import { WATERFALL_DEFAULTS, WATERFALL_DEFAULTS_LIGHT } from './waterfall'

type Theme = 'dark' | 'light'

interface ColorDef {
  key: 'colorBase' | 'colorLow' | 'colorHot' | 'colorTip'
  label: string
}

const COLOR_PICKERS: ColorDef[] = [
  { key: 'colorBase', label: 'deep' },
  { key: 'colorLow',  label: 'mid'  },
  { key: 'colorHot',  label: 'flow' },
  { key: 'colorTip',  label: 'foam' },
]

const FONT_FAMILIES: Array<{ label: string; stack: string }> = [
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

type NumericWaterfallParamKey = {
  [K in keyof WaterfallParams]: WaterfallParams[K] extends number ? K : never
}[keyof WaterfallParams]

interface SliderDef {
  key: NumericWaterfallParamKey
  label: string
  min: number
  max: number
  step: number
  format?: (v: number) => string
}

const SLIDERS: SliderDef[] = [
  { key: 'fontSize',        label: 'font size',      min: 6,      max: 40,   step: 1      },
  { key: 'fontWeight',      label: 'font weight',    min: 100,    max: 900,  step: 100    },
  { key: 'lineHeight',      label: 'line height',    min: 8,      max: 60,   step: 1      },
  { key: 'letterSpacing',   label: 'letter spacing', min: -3,     max: 12,   step: 0.1   },
  { key: 'textScrollSpeed', label: 'flow speed',     min: 0,      max: 150,  step: 1      },
  { key: 'waterBandFrac',   label: 'band height',    min: 0.2,    max: 0.9,  step: 0.01   },
  { key: 'streamBase',      label: 'stream depth',   min: 0,      max: 1,    step: 0.01   },
  { key: 'streamBigAmp',    label: 'column amp',     min: 0,      max: 0.6,  step: 0.01   },
  { key: 'streamBigSx',     label: 'column width',   min: 0.0005, max: 0.02, step: 0.0005, format: v => v.toFixed(4) },
  { key: 'streamBigSt',     label: 'column speed',   min: 0,      max: 3,    step: 0.05   },
  { key: 'streamMedAmp',    label: 'wobble amp',     min: 0,      max: 0.4,  step: 0.01   },
  { key: 'streamMedSx',     label: 'wobble width',   min: 0.001,  max: 0.05, step: 0.001,  format: v => v.toFixed(3) },
  { key: 'streamMedSt',     label: 'wobble speed',   min: 0,      max: 4,    step: 0.05   },
  { key: 'rippleAmp',       label: 'ripple',         min: 0,      max: 0.6,  step: 0.01   },
  { key: 'rippleSt',        label: 'ripple speed',   min: 0,      max: 4,    step: 0.05   },
  { key: 'tipFadePx',       label: 'tip fade px',    min: 0,      max: 80,   step: 1      },
]

const STORAGE_KEY = 'waterfall-controls-v1'

interface PersistedState {
  params: Partial<WaterfallParams>
  collapsed: boolean
  theme: Theme
  themeColors: Partial<Record<Theme, Pick<WaterfallParams, 'colorBase' | 'colorLow' | 'colorHot' | 'colorTip'>>>
}

function loadPersisted(): PersistedState {
  const fallback: PersistedState = { params: {}, collapsed: false, theme: 'dark', themeColors: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const p = JSON.parse(raw) as Partial<PersistedState>
    return {
      params:      p.params      ?? {},
      collapsed:   p.collapsed   ?? false,
      theme:       p.theme === 'light' ? 'light' : 'dark',
      themeColors: p.themeColors ?? {},
    }
  } catch { return fallback }
}

function savePersisted(s: PersistedState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

function injectStyles(): void {
  if (document.getElementById('waterfall-controls-styles')) return
  const css = `
    #waterfall-controls {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999;
      width: 240px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(200, 232, 255, 0.92);
      background: rgba(0, 10, 20, 0.80);
      border: 1px solid rgba(0, 168, 204, 0.28);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
      user-select: none;
      -webkit-user-select: none;
    }
    #waterfall-controls header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px;
      cursor: pointer;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(140, 220, 255, 0.95);
      border-bottom: 1px solid rgba(0, 168, 204, 0.20);
    }
    #waterfall-controls header .chev { transition: transform 150ms ease-out; font-size: 9px; opacity: 0.7; }
    #waterfall-controls.collapsed header { border-bottom: none; }
    #waterfall-controls.collapsed header .chev { transform: rotate(-90deg); }
    #waterfall-controls.collapsed .body { display: none; }
    #waterfall-controls header .title { flex: 1; }
    #waterfall-controls .body { padding: 8px 10px 10px; max-height: 70vh; overflow-y: auto; }
    #waterfall-controls .row { margin: 6px 0; }
    #waterfall-controls .row .label-line {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 2px; gap: 8px;
    }
    #waterfall-controls .row label { opacity: 0.78; }
    #waterfall-controls .row .val {
      font-variant-numeric: tabular-nums;
      color: rgba(140, 220, 255, 0.95);
      opacity: 0.95;
    }
    #waterfall-controls .font-row { margin: 0 0 8px; }
    #waterfall-controls .font-row select {
      width: 100%; padding: 4px 6px; font: inherit; color: inherit;
      background: rgba(0, 168, 204, 0.10);
      border: 1px solid rgba(0, 168, 204, 0.30);
      border-radius: 4px; cursor: pointer; letter-spacing: 0.04em; appearance: none;
    }
    #waterfall-controls .font-row select:hover { background: rgba(0, 168, 204, 0.18); }
    #waterfall-controls .font-row select option { background: #001a2e; color: rgba(200, 232, 255, 0.92); }

    #waterfall-controls input[type="range"] {
      width: 100%; height: 14px; -webkit-appearance: none; appearance: none;
      background: transparent; margin: 0;
    }
    #waterfall-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 2px; background: rgba(0, 168, 204, 0.28); border-radius: 1px;
    }
    #waterfall-controls input[type="range"]::-moz-range-track {
      height: 2px; background: rgba(0, 168, 204, 0.28); border-radius: 1px;
    }
    #waterfall-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(0, 190, 230);
      box-shadow: 0 0 6px rgba(0, 168, 204, 0.65);
      margin-top: -5px; cursor: pointer; border: none;
    }
    #waterfall-controls input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(0, 190, 230);
      box-shadow: 0 0 6px rgba(0, 168, 204, 0.65);
      cursor: pointer; border: none;
    }
    #waterfall-controls .actions {
      display: flex; gap: 6px; margin-top: 10px; padding-top: 8px;
      border-top: 1px solid rgba(0, 168, 204, 0.20);
    }
    #waterfall-controls button {
      flex: 1; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(0, 168, 204, 0.10);
      border: 1px solid rgba(0, 168, 204, 0.30);
      border-radius: 4px; cursor: pointer; letter-spacing: 0.05em; text-transform: lowercase;
    }
    #waterfall-controls button:hover  { background: rgba(0, 168, 204, 0.20); }
    #waterfall-controls button:active { background: rgba(0, 168, 204, 0.32); }
    #waterfall-controls .theme-btn {
      width: 22px; height: 22px; padding: 0; flex: 0 0 22px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 12px; line-height: 1;
      background: rgba(0, 168, 204, 0.10); border: 1px solid rgba(0, 168, 204, 0.30);
      border-radius: 50%; color: inherit; cursor: pointer; letter-spacing: 0; text-transform: none;
    }
    #waterfall-controls .theme-btn:hover { background: rgba(0, 168, 204, 0.22); }
    #waterfall-controls .colors {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 6px; margin-top: 10px; padding-top: 8px;
      border-top: 1px solid rgba(0, 168, 204, 0.20);
    }
    #waterfall-controls .colors .swatch {
      display: flex; flex-direction: column; align-items: center;
      gap: 4px; font-size: 10px; opacity: 0.85;
    }
    #waterfall-controls .colors input[type="color"] {
      width: 100%; height: 28px; padding: 0;
      border: 1px solid rgba(0, 168, 204, 0.30);
      border-radius: 4px; background: transparent; cursor: pointer;
    }
    #waterfall-controls .colors input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
    #waterfall-controls .colors input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }

    /* ── Light theme overrides ─────────────────────────────────────────── */
    body.theme-light #waterfall-controls {
      color: rgba(0, 30, 60, 0.92);
      background: rgba(230, 245, 255, 0.88);
      border-color: rgba(0, 100, 160, 0.28);
      box-shadow: 0 6px 24px rgba(0, 40, 80, 0.18);
    }
    body.theme-light #waterfall-controls header {
      color: rgba(0, 90, 150, 0.95);
      border-bottom-color: rgba(0, 100, 160, 0.22);
    }
    body.theme-light #waterfall-controls .actions,
    body.theme-light #waterfall-controls .colors { border-top-color: rgba(0, 100, 160, 0.20); }
    body.theme-light #waterfall-controls input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #waterfall-controls input[type="range"]::-moz-range-track {
      background: rgba(0, 100, 160, 0.30);
    }
    body.theme-light #waterfall-controls input[type="range"]::-webkit-slider-thumb,
    body.theme-light #waterfall-controls input[type="range"]::-moz-range-thumb {
      background: rgb(0, 120, 200); box-shadow: 0 0 6px rgba(0, 100, 160, 0.45);
    }
    body.theme-light #waterfall-controls .row .val { color: rgba(0, 100, 160, 0.95); }
    body.theme-light #waterfall-controls button,
    body.theme-light #waterfall-controls .theme-btn {
      background: rgba(0, 100, 160, 0.08); border-color: rgba(0, 100, 160, 0.30);
    }
    body.theme-light #waterfall-controls button:hover,
    body.theme-light #waterfall-controls .theme-btn:hover {
      background: rgba(0, 100, 160, 0.18);
    }
    body.theme-light #waterfall-controls .font-row select {
      background: rgba(0, 100, 160, 0.08); border-color: rgba(0, 100, 160, 0.30);
    }
    body.theme-light #waterfall-controls .font-row select:hover {
      background: rgba(0, 100, 160, 0.16);
    }
    body.theme-light #waterfall-controls .font-row select option {
      background: #e8f4ff; color: rgba(0, 30, 60, 0.92);
    }
  `
  const style = document.createElement('style')
  style.id      = 'waterfall-controls-styles'
  style.textContent = css
  document.head.appendChild(style)
}

function defaultFormat(step: number): (v: number) => string {
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : step >= 0.001 ? 3 : 4
  return v => v.toFixed(decimals)
}

export interface WaterfallControlsHandle {
  destroy(): void
}

export function mountWaterfallControls(
  waterfall: Waterfall,
  parent: HTMLElement = document.body,
): WaterfallControlsHandle {
  injectStyles()

  const persisted = loadPersisted()

  function applyTheme(theme: Theme): void {
    document.body.classList.toggle('theme-dark',  theme === 'dark')
    document.body.classList.toggle('theme-light', theme === 'light')
    const saved  = persisted.themeColors[theme]
    const colors = saved ?? (theme === 'light'
      ? WATERFALL_DEFAULTS_LIGHT
      : {
          colorBase: WATERFALL_DEFAULTS.colorBase,
          colorLow:  WATERFALL_DEFAULTS.colorLow,
          colorHot:  WATERFALL_DEFAULTS.colorHot,
          colorTip:  WATERFALL_DEFAULTS.colorTip,
        })
    waterfall.setParams(colors)
  }

  // Restore persisted non-colour params.
  if (Object.keys(persisted.params).length > 0) {
    const { colorBase: _b, colorLow: _l, colorHot: _h, colorTip: _t, ...rest } = persisted.params
    void _b; void _l; void _h; void _t
    if (Object.keys(rest).length > 0) waterfall.setParams(rest)
  }
  applyTheme(persisted.theme)

  const panel = document.createElement('div')
  panel.id = 'waterfall-controls'
  if (persisted.collapsed) panel.classList.add('collapsed')

  // ── Header ────────────────────────────────────────────────────────────────
  const header = document.createElement('header')
  const chev   = document.createElement('span')
  chev.className   = 'chev'
  chev.textContent = '▼'
  const title  = document.createElement('span')
  title.className   = 'title'
  title.textContent = 'waterfall — tune'

  const themeBtn = document.createElement('button')
  themeBtn.className = 'theme-btn'
  themeBtn.title     = 'Toggle dark / light theme'
  const renderThemeIcon = (): void => { themeBtn.textContent = persisted.theme === 'dark' ? '☾' : '☀' }
  renderThemeIcon()

  header.append(chev, title, themeBtn)

  header.addEventListener('click', () => {
    panel.classList.toggle('collapsed')
    persisted.collapsed = panel.classList.contains('collapsed')
    savePersisted(persisted)
  })

  themeBtn.addEventListener('click', e => {
    e.stopPropagation()
    persisted.theme = persisted.theme === 'dark' ? 'light' : 'dark'
    applyTheme(persisted.theme)
    renderThemeIcon()
    syncColorInputs()
    savePersisted(persisted)
  })

  panel.appendChild(header)

  // ── Body ──────────────────────────────────────────────────────────────────
  const body = document.createElement('div')
  body.className = 'body'

  // Font family dropdown.
  const fontRow    = document.createElement('div')
  fontRow.className = 'font-row'
  const fontSelect  = document.createElement('select')
  fontSelect.title  = 'Font family'

  const currentFamily = String(waterfall.getParams().fontFamily)
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
    waterfall.setParams({ fontFamily: v })
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

    const input   = document.createElement('input')
    input.type    = 'range'
    input.min     = String(def.min)
    input.max     = String(def.max)
    input.step    = String(def.step)
    const current = waterfall.getParams()[def.key]
    input.value   = String(current)
    const fmt     = def.format ?? defaultFormat(def.step)
    val.textContent = fmt(current)

    input.addEventListener('input', () => {
      const v = Number(input.value)
      val.textContent = fmt(v)
      waterfall.setParams({ [def.key]: v } as Partial<WaterfallParams>)
      persisted.params[def.key] = v
      savePersisted(persisted)
    })

    row.append(labelLine, input)
    body.appendChild(row)
    rows.push({ def, input, val })
  }

  // Colour pickers.
  const colorsRow = document.createElement('div')
  colorsRow.className = 'colors'
  const colorInputs: Record<ColorDef['key'], HTMLInputElement> =
    {} as Record<ColorDef['key'], HTMLInputElement>

  for (const def of COLOR_PICKERS) {
    const swatch        = document.createElement('div')
    swatch.className    = 'swatch'
    const input         = document.createElement('input')
    input.type          = 'color'
    input.value         = String(waterfall.getParams()[def.key])
    const label         = document.createElement('span')
    label.textContent   = def.label

    input.addEventListener('input', () => {
      const v = input.value
      waterfall.setParams({ [def.key]: v } as Partial<WaterfallParams>)
      const tc = persisted.themeColors[persisted.theme] ?? {
        colorBase: waterfall.getParams().colorBase,
        colorLow:  waterfall.getParams().colorLow,
        colorHot:  waterfall.getParams().colorHot,
        colorTip:  waterfall.getParams().colorTip,
      }
      tc[def.key] = v
      persisted.themeColors[persisted.theme] = tc
      savePersisted(persisted)
    })

    swatch.append(input, label)
    colorsRow.appendChild(swatch)
    colorInputs[def.key] = input
  }

  function syncColorInputs(): void {
    const p = waterfall.getParams()
    colorInputs.colorBase.value = p.colorBase
    colorInputs.colorLow.value  = p.colorLow
    colorInputs.colorHot.value  = p.colorHot
    colorInputs.colorTip.value  = p.colorTip
  }

  body.appendChild(colorsRow)

  // Actions.
  const actions = document.createElement('div')
  actions.className = 'actions'

  const resetBtn = document.createElement('button')
  resetBtn.textContent = 'reset'
  resetBtn.title       = 'Restore default values'
  resetBtn.addEventListener('click', () => {
    waterfall.setParams({ ...WATERFALL_DEFAULTS })
    persisted.params      = {}
    persisted.themeColors = {}
    savePersisted(persisted)
    applyTheme(persisted.theme)
    for (const { def, input, val } of rows) {
      const v = WATERFALL_DEFAULTS[def.key] as number
      input.value     = String(v)
      val.textContent = (def.format ?? defaultFormat(def.step))(v)
    }
    fontSelect.value = String(WATERFALL_DEFAULTS.fontFamily)
    syncColorInputs()
  })

  const copyBtn = document.createElement('button')
  copyBtn.textContent = 'copy'
  copyBtn.title       = 'Copy current params as JSON'
  copyBtn.addEventListener('click', async () => {
    const json = JSON.stringify(waterfall.getParams(), null, 2)
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
