// Live editor for the scroll-arc keyframes.  Bottom-left of the viewport.
// Every change is persisted by the underlying store.
//
// v2 improvements:
//   - Every slider has a paired text input for precise manual entry.
//   - Sliders fire on 'input' (continuous) for immediate visual feedback.
//   - "save" button persists the current keyframes as defaults for future resets.
//   - Wider slider tracks and larger thumb for easier scrubbing.

import type { FireParams } from './fire'
import type { ScrollArc, ScrollKeyframe } from './scroll-arc'

/** Which FireParams can be set per keyframe.  Add a new line and the row
 *  appears for every existing AND every future keyframe automatically. */
interface ParamDef {
  key: keyof FireParams
  label: string
  min: number
  max: number
  step: number
  /** Decimal places for the display / manual input. */
  decimals: number
}
const PARAM_DEFS: ParamDef[] = [
  { key: 'flameRadialReach', label: 'flame reach', min: 0,    max: 1,   step: 0.001, decimals: 3 },
  { key: 'sphereRadiusFrac', label: 'sphere r',    min: 0,    max: 2,   step: 0.001, decimals: 3 },
  { key: 'sphereCxFrac',     label: 'sphere x',    min: -0.5, max: 1.5, step: 0.001, decimals: 3 },
  { key: 'sphereCyFrac',     label: 'sphere y',    min: -5,   max: 5,   step: 0.001, decimals: 3 },
]

const COLLAPSE_KEY = 'scroll-arc-collapsed-v1'

function injectStyles(): void {
  if (document.getElementById('scroll-arc-styles')) return
  const css = `
    #scroll-arc {
      position: fixed;
      bottom: 12px;
      left: 12px;
      z-index: 9999;
      width: 260px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(18, 18, 18, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
      user-select: none;
      -webkit-user-select: none;
    }
    #scroll-arc header {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 10px; cursor: pointer;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: rgba(255, 255, 255, 0.90);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    #scroll-arc header .chev { transition: transform 150ms ease-out; font-size: 9px; opacity: 0.7; }
    #scroll-arc.collapsed header { border-bottom: none; }
    #scroll-arc.collapsed header .chev { transform: rotate(-90deg); }
    #scroll-arc.collapsed .body { display: none; }
    #scroll-arc header .title { flex: 1; }
    #scroll-arc .body { padding: 8px 10px 10px; max-height: 70vh; overflow-y: auto; }

    #scroll-arc .kf {
      margin-bottom: 8px;
      padding: 6px 8px 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.03);
    }
    #scroll-arc .kf-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 4px;
    }
    #scroll-arc .kf-index {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.75);
      font-size: 10px;
    }
    #scroll-arc .kf-del {
      width: 18px; height: 18px; padding: 0;
      display: inline-flex; align-items: center; justify-content: center;
      font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 50%;
      cursor: pointer; line-height: 1;
    }
    #scroll-arc .kf-del:hover { background: rgba(255, 255, 255, 0.14); }
    #scroll-arc .kf-del:disabled {
      opacity: 0.3; cursor: not-allowed;
    }

    #scroll-arc .row { margin: 4px 0; }
    #scroll-arc .row .label-line {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 2px; gap: 4px;
    }
    #scroll-arc .row label { opacity: 0.6; flex-shrink: 0; }

    /* ── Text input for manual parameter entry ──────────────────────────── */
    #scroll-arc input.val {
      width: 56px;
      font: inherit;
      text-align: right;
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.90);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 3px;
      padding: 1px 4px;
      font-variant-numeric: tabular-nums;
      -moz-appearance: textfield;
    }
    #scroll-arc input.val::-webkit-outer-spin-button,
    #scroll-arc input.val::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    #scroll-arc input.val:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.45);
      background: rgba(255, 255, 255, 0.12);
    }

    /* ── Slider — wider track, larger thumb for precision ───────────────── */
    #scroll-arc input[type="range"] {
      width: 100%; height: 18px; -webkit-appearance: none; appearance: none;
      background: transparent; margin: 0; cursor: pointer;
    }
    #scroll-arc input[type="range"]::-webkit-slider-runnable-track {
      height: 3px; background: rgba(255, 255, 255, 0.20); border-radius: 1.5px;
    }
    #scroll-arc input[type="range"]::-moz-range-track {
      height: 3px; background: rgba(255, 255, 255, 0.20); border-radius: 1.5px;
    }
    #scroll-arc input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 14px; height: 14px; border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      margin-top: -5.5px; cursor: pointer; border: none;
    }
    #scroll-arc input[type="range"]::-moz-range-thumb {
      width: 14px; height: 14px; border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      cursor: pointer; border: none;
    }

    #scroll-arc .add-btn {
      display: block;
      width: 100%;
      padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px dashed rgba(255, 255, 255, 0.25);
      border-radius: 4px;
      cursor: pointer;
      letter-spacing: 0.05em; text-transform: lowercase;
      margin-bottom: 8px;
    }
    #scroll-arc .add-btn:hover  { background: rgba(255, 255, 255, 0.14); }
    #scroll-arc .actions {
      display: flex; gap: 6px; padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #scroll-arc .actions button {
      flex: 1; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px; cursor: pointer;
      letter-spacing: 0.05em; text-transform: lowercase;
    }
    #scroll-arc .actions button:hover  { background: rgba(255, 255, 255, 0.14); }
    #scroll-arc .actions button:active { background: rgba(255, 255, 255, 0.22); }

    /* ── Light theme overrides ────────────────────────────────────────── */
    body.theme-light #scroll-arc {
      color: rgba(0, 0, 0, 0.82);
      background: rgba(245, 245, 245, 0.88);
      border-color: rgba(0, 0, 0, 0.15);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    }
    body.theme-light #scroll-arc header {
      color: rgba(0, 0, 0, 0.88);
      border-bottom-color: rgba(0, 0, 0, 0.12);
    }
    body.theme-light #scroll-arc .kf {
      border-color: rgba(0, 0, 0, 0.12);
      background: rgba(0, 0, 0, 0.03);
    }
    body.theme-light #scroll-arc .row label { opacity: 0.55; }
    body.theme-light #scroll-arc input.val {
      background: rgba(0, 0, 0, 0.04);
      color: rgba(0, 0, 0, 0.82);
      border-color: rgba(0, 0, 0, 0.15);
    }
    body.theme-light #scroll-arc input.val:focus {
      border-color: rgba(0, 0, 0, 0.40);
      background: rgba(0, 0, 0, 0.08);
    }
    body.theme-light #scroll-arc input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #scroll-arc input[type="range"]::-moz-range-track {
      background: rgba(0, 0, 0, 0.18);
    }
    body.theme-light #scroll-arc input[type="range"]::-webkit-slider-thumb,
    body.theme-light #scroll-arc input[type="range"]::-moz-range-thumb {
      background: rgb(80, 80, 80); box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
    }
    body.theme-light #scroll-arc .actions button,
    body.theme-light #scroll-arc .add-btn,
    body.theme-light #scroll-arc .kf-del {
      background: rgba(0, 0, 0, 0.05); border-color: rgba(0, 0, 0, 0.18);
    }
    body.theme-light #scroll-arc .actions button:hover,
    body.theme-light #scroll-arc .add-btn:hover,
    body.theme-light #scroll-arc .kf-del:hover {
      background: rgba(0, 0, 0, 0.10);
    }
  `
  const style = document.createElement('style')
  style.id = 'scroll-arc-styles'
  style.textContent = css
  document.head.appendChild(style)
}

function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}
function saveCollapsed(v: boolean): void {
  try {
    localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0')
  } catch {
    /* ignore */
  }
}

/** Default values used by the "add keyframe" button: midpoint between
 *  min and max for each param, scroll position 0.5. */
function newKeyframeDefaults(): Partial<FireParams> {
  const params: Partial<FireParams> = {}
  for (const def of PARAM_DEFS) {
    ;(params as Record<string, number>)[def.key as string] =
      (def.min + def.max) / 2
  }
  return params
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

export interface ScrollArcControlsHandle {
  destroy(): void
}

export function mountScrollArcControls(
  arc: ScrollArc,
  parent: HTMLElement = document.body,
): ScrollArcControlsHandle {
  injectStyles()

  const panel = document.createElement('div')
  panel.id = 'scroll-arc'
  if (loadCollapsed()) panel.classList.add('collapsed')

  // ── Header ─────────────────────────────────────────────────────────────
  const header = document.createElement('header')
  const chev = document.createElement('span')
  chev.className = 'chev'
  chev.textContent = '▼'
  const title = document.createElement('span')
  title.className = 'title'
  title.textContent = 'scroll arc'
  header.append(chev, title)
  header.addEventListener('click', () => {
    panel.classList.toggle('collapsed')
    saveCollapsed(panel.classList.contains('collapsed'))
  })
  panel.appendChild(header)

  // ── Body ───────────────────────────────────────────────────────────────
  const body = document.createElement('div')
  body.className = 'body'
  panel.appendChild(body)

  const kfsContainer = document.createElement('div')
  kfsContainer.className = 'kfs'
  body.appendChild(kfsContainer)

  // Add-keyframe button — inserts at the midpoint of the widest gap.
  const addBtn = document.createElement('button')
  addBtn.className = 'add-btn'
  addBtn.textContent = '+ add keyframe'
  addBtn.addEventListener('click', () => {
    const kfs = arc.getKeyframes()
    let newAt = 0.5
    if (kfs.length >= 2) {
      let maxGap = 0
      let gapStart = 0
      for (let i = 0; i < kfs.length - 1; i++) {
        const gap = kfs[i + 1].at - kfs[i].at
        if (gap > maxGap) {
          maxGap = gap
          gapStart = kfs[i].at
        }
      }
      newAt = gapStart + maxGap / 2
    }
    arc.addKeyframe(newAt, newKeyframeDefaults())
  })
  body.appendChild(addBtn)

  // ── Actions ────────────────────────────────────────────────────────────
  const actions = document.createElement('div')
  actions.className = 'actions'

  const resetBtn = document.createElement('button')
  resetBtn.textContent = 'reset'
  resetBtn.title = 'Restore saved defaults (or built-in if none saved)'
  resetBtn.addEventListener('click', () => arc.reset())

  const saveBtn = document.createElement('button')
  saveBtn.textContent = 'save'
  saveBtn.title = 'Save current keyframes as new defaults for future resets'
  saveBtn.addEventListener('click', () => {
    arc.saveAsDefaults()
    const orig = saveBtn.textContent!
    saveBtn.textContent = 'saved ✓'
    setTimeout(() => { saveBtn.textContent = orig }, 900)
  })

  const copyBtn = document.createElement('button')
  copyBtn.textContent = 'copy'
  copyBtn.title = 'Copy current keyframes as JSON'
  copyBtn.addEventListener('click', async () => {
    const json = JSON.stringify(arc.getKeyframes(), null, 2)
    try {
      await navigator.clipboard.writeText(json)
      const orig = copyBtn.textContent
      copyBtn.textContent = 'copied ✓'
      setTimeout(() => {
        copyBtn.textContent = orig
      }, 900)
    } catch {
      console.log(json)
    }
  })

  actions.append(resetBtn, saveBtn, copyBtn)
  body.appendChild(actions)

  // ── Self-update suppression ────────────────────────────────────────────
  // When we programmatically update the store (e.g. from a text input
  // change), the store emits a notification that would re-render the panel
  // and yank focus away from the input.  Suppress renders during those
  // controlled writes.
  let suppressRender = false
  function suppress(fn: () => void): void {
    suppressRender = true
    try { fn() } finally { suppressRender = false }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  function render(): void {
    kfsContainer.innerHTML = ''
    const kfs = arc.getKeyframes()
    kfs.forEach((kf, idx) => renderCard(kf, idx, kfs.length))
  }

  function renderCard(kf: ScrollKeyframe, idx: number, total: number): void {
    const card = document.createElement('div')
    card.className = 'kf'

    // ── Header: "KF n  ×" ────────────────────────────────────────────────
    const head = document.createElement('div')
    head.className = 'kf-header'
    const indexLbl = document.createElement('span')
    indexLbl.className = 'kf-index'
    indexLbl.textContent = `kf ${idx + 1}`
    const del = document.createElement('button')
    del.className = 'kf-del'
    del.textContent = '×'
    del.title = 'remove keyframe'
    del.disabled = total <= 2
    del.addEventListener('click', () => arc.removeKeyframe(idx))
    head.append(indexLbl, del)
    card.appendChild(head)

    // ── `at` row: slider + text input ────────────────────────────────────
    const atRow = document.createElement('div')
    atRow.className = 'row'
    const atLine = document.createElement('div')
    atLine.className = 'label-line'
    const atLbl = document.createElement('label')
    atLbl.textContent = 'at %'

    const atValIn = document.createElement('input')
    atValIn.type = 'number'
    atValIn.className = 'val'
    atValIn.min = '0'
    atValIn.max = '100'
    atValIn.step = '0.1'
    atValIn.value = (kf.at * 100).toFixed(1)

    atLine.append(atLbl, atValIn)

    const atIn = document.createElement('input')
    atIn.type = 'range'
    atIn.min = '0'
    atIn.max = '1'
    atIn.step = '0.001'
    atIn.value = String(kf.at)

    // Slider → text sync + store update
    atIn.addEventListener('input', () => {
      const v = Number(atIn.value)
      atValIn.value = (v * 100).toFixed(1)
      // setAt re-sorts; let the subscriber re-render.
      arc.setAt(idx, v)
    })

    // Text → slider sync + store update
    atValIn.addEventListener('change', () => {
      const pct = clamp(Number(atValIn.value) || 0, 0, 100)
      const v = pct / 100
      atValIn.value = pct.toFixed(1)
      atIn.value = String(v)
      arc.setAt(idx, v)
    })

    atRow.append(atLine, atIn)
    card.appendChild(atRow)

    // ── Per-param rows: slider + text input ──────────────────────────────
    for (const def of PARAM_DEFS) {
      const raw = (kf.params as Record<string, number | undefined>)[
        def.key as string
      ]
      const v = typeof raw === 'number' ? raw : (def.min + def.max) / 2
      const row = document.createElement('div')
      row.className = 'row'

      const labelLine = document.createElement('div')
      labelLine.className = 'label-line'
      const label = document.createElement('label')
      label.textContent = def.label

      const valIn = document.createElement('input')
      valIn.type = 'number'
      valIn.className = 'val'
      valIn.min = String(def.min)
      valIn.max = String(def.max)
      valIn.step = String(def.step)
      valIn.value = v.toFixed(def.decimals)

      labelLine.append(label, valIn)

      const input = document.createElement('input')
      input.type = 'range'
      input.min = String(def.min)
      input.max = String(def.max)
      input.step = String(def.step)
      input.value = String(v)

      // Slider → text sync + store update (continuous)
      input.addEventListener('input', () => {
        const nv = Number(input.value)
        valIn.value = nv.toFixed(def.decimals)
        suppress(() => arc.setParam(idx, def.key, nv))
      })

      // Text → slider sync + store update (on commit)
      valIn.addEventListener('change', () => {
        const nv = clamp(Number(valIn.value) || 0, def.min, def.max)
        valIn.value = nv.toFixed(def.decimals)
        input.value = String(nv)
        suppress(() => arc.setParam(idx, def.key, nv))
      })

      row.append(labelLine, input)
      card.appendChild(row)
    }

    kfsContainer.appendChild(card)
  }

  render()
  const unsubscribe = arc.subscribe(() => {
    if (suppressRender) return
    render()
  })

  parent.appendChild(panel)

  return {
    destroy() {
      unsubscribe()
      panel.remove()
    },
  }
}
