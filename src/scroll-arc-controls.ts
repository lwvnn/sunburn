// Live editor for the scroll-arc keyframes.  Bottom-left of the viewport,
// violet accent so it's distinguishable from the orange fire / cream name /
// cyan cursor panels.  Every change is persisted by the underlying store.

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
}
const PARAM_DEFS: ParamDef[] = [
  { key: 'flameRadialReach', label: 'flame reach', min: 0,    max: 1,   step: 0.001 },
  { key: 'sphereRadiusFrac', label: 'sphere r',    min: 0,    max: 2,   step: 0.001 },
  // Sphere centre position — matches the ranges in the fire-controls
  // panel so a value tuned there can be pasted into a keyframe verbatim.
  { key: 'sphereCxFrac',     label: 'sphere x',    min: -0.5, max: 1.5, step: 0.001 },
  { key: 'sphereCyFrac',     label: 'sphere y',    min: -5,   max: 5,   step: 0.001 },
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
      width: 240px;
      font: 11px/1.3 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(220, 200, 255, 0.92);
      background: rgba(14, 4, 24, 0.82);
      border: 1px solid rgba(180, 120, 255, 0.30);
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
      color: rgba(200, 160, 255, 0.95);
      border-bottom: 1px solid rgba(180, 120, 255, 0.22);
    }
    #scroll-arc header .chev { transition: transform 150ms ease-out; font-size: 9px; opacity: 0.7; }
    #scroll-arc.collapsed header { border-bottom: none; }
    #scroll-arc.collapsed header .chev { transform: rotate(-90deg); }
    #scroll-arc.collapsed .body { display: none; }
    #scroll-arc header .title { flex: 1; }
    #scroll-arc .body { padding: 8px 10px 10px; max-height: 65vh; overflow-y: auto; }

    #scroll-arc .kf {
      margin-bottom: 8px;
      padding: 6px 8px 8px;
      border: 1px solid rgba(180, 120, 255, 0.18);
      border-radius: 4px;
      background: rgba(180, 120, 255, 0.05);
    }
    #scroll-arc .kf-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 4px;
    }
    #scroll-arc .kf-index {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(200, 160, 255, 0.85);
      font-size: 10px;
    }
    #scroll-arc .kf-del {
      width: 18px; height: 18px; padding: 0;
      display: inline-flex; align-items: center; justify-content: center;
      font: inherit; color: inherit;
      background: rgba(180, 120, 255, 0.10);
      border: 1px solid rgba(180, 120, 255, 0.30);
      border-radius: 50%;
      cursor: pointer; line-height: 1;
    }
    #scroll-arc .kf-del:hover { background: rgba(180, 120, 255, 0.22); }
    #scroll-arc .kf-del:disabled {
      opacity: 0.3; cursor: not-allowed;
    }

    #scroll-arc .row { margin: 4px 0; }
    #scroll-arc .row .label-line {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 2px; gap: 8px;
    }
    #scroll-arc .row label { opacity: 0.78; }
    #scroll-arc .row .val {
      font-variant-numeric: tabular-nums;
      color: rgba(200, 160, 255, 0.95);
      opacity: 0.95;
    }
    #scroll-arc input[type="range"] {
      width: 100%; height: 14px; -webkit-appearance: none; appearance: none;
      background: transparent; margin: 0;
    }
    #scroll-arc input[type="range"]::-webkit-slider-runnable-track {
      height: 2px; background: rgba(180, 120, 255, 0.28); border-radius: 1px;
    }
    #scroll-arc input[type="range"]::-moz-range-track {
      height: 2px; background: rgba(180, 120, 255, 0.28); border-radius: 1px;
    }
    #scroll-arc input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(200, 160, 255);
      box-shadow: 0 0 8px rgba(180, 120, 255, 0.6);
      margin-top: -5px; cursor: pointer; border: none;
    }
    #scroll-arc input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 50%;
      background: rgb(200, 160, 255);
      box-shadow: 0 0 8px rgba(180, 120, 255, 0.6);
      cursor: pointer; border: none;
    }

    #scroll-arc .add-btn {
      display: block;
      width: 100%;
      padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(180, 120, 255, 0.10);
      border: 1px dashed rgba(180, 120, 255, 0.35);
      border-radius: 4px;
      cursor: pointer;
      letter-spacing: 0.05em; text-transform: lowercase;
      margin-bottom: 8px;
    }
    #scroll-arc .add-btn:hover  { background: rgba(180, 120, 255, 0.20); }
    #scroll-arc .actions {
      display: flex; gap: 6px; padding-top: 8px;
      border-top: 1px solid rgba(180, 120, 255, 0.22);
    }
    #scroll-arc .actions button {
      flex: 1; padding: 5px 8px; font: inherit; color: inherit;
      background: rgba(180, 120, 255, 0.10);
      border: 1px solid rgba(180, 120, 255, 0.30);
      border-radius: 4px; cursor: pointer;
      letter-spacing: 0.05em; text-transform: lowercase;
    }
    #scroll-arc .actions button:hover  { background: rgba(180, 120, 255, 0.20); }
    #scroll-arc .actions button:active { background: rgba(180, 120, 255, 0.32); }

    /* ── Light theme overrides ────────────────────────────────────────── */
    body.theme-light #scroll-arc {
      color: rgba(50, 20, 80, 0.92);
      background: rgba(248, 240, 255, 0.88);
      border-color: rgba(120, 70, 200, 0.28);
      box-shadow: 0 6px 24px rgba(60, 30, 100, 0.18);
    }
    body.theme-light #scroll-arc header {
      color: rgba(90, 50, 160, 0.95);
      border-bottom-color: rgba(120, 70, 200, 0.22);
    }
    body.theme-light #scroll-arc .kf {
      border-color: rgba(120, 70, 200, 0.22);
      background: rgba(120, 70, 200, 0.05);
    }
    body.theme-light #scroll-arc .row .val { color: rgba(90, 50, 160, 0.95); }
    body.theme-light #scroll-arc input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #scroll-arc input[type="range"]::-moz-range-track {
      background: rgba(120, 70, 200, 0.30);
    }
    body.theme-light #scroll-arc input[type="range"]::-webkit-slider-thumb,
    body.theme-light #scroll-arc input[type="range"]::-moz-range-thumb {
      background: rgb(120, 70, 200); box-shadow: 0 0 6px rgba(120, 70, 200, 0.40);
    }
    body.theme-light #scroll-arc .actions button,
    body.theme-light #scroll-arc .add-btn,
    body.theme-light #scroll-arc .kf-del {
      background: rgba(120, 70, 200, 0.08); border-color: rgba(120, 70, 200, 0.30);
    }
    body.theme-light #scroll-arc .actions button:hover,
    body.theme-light #scroll-arc .add-btn:hover,
    body.theme-light #scroll-arc .kf-del:hover {
      background: rgba(120, 70, 200, 0.18);
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

  // Reset button.
  const actions = document.createElement('div')
  actions.className = 'actions'
  const resetBtn = document.createElement('button')
  resetBtn.textContent = 'reset'
  resetBtn.title = 'Restore default keyframes'
  resetBtn.addEventListener('click', () => arc.reset())
  const copyBtn = document.createElement('button')
  copyBtn.textContent = 'copy'
  copyBtn.title = 'Copy current keyframes as JSON'
  copyBtn.addEventListener('click', async () => {
    const json = JSON.stringify(arc.getKeyframes(), null, 2)
    try {
      await navigator.clipboard.writeText(json)
      const orig = copyBtn.textContent
      copyBtn.textContent = 'copied'
      setTimeout(() => {
        copyBtn.textContent = orig
      }, 900)
    } catch {
      console.log(json)
    }
  })
  actions.append(resetBtn, copyBtn)
  body.appendChild(actions)

  // ── Render ─────────────────────────────────────────────────────────────
  // Rebuild every keyframe card on each store change.  Cheap (a few rows
  // each) and avoids the bookkeeping of incremental updates.
  function render(): void {
    kfsContainer.innerHTML = ''
    const kfs = arc.getKeyframes()
    kfs.forEach((kf, idx) => renderCard(kf, idx, kfs.length))
  }

  function renderCard(kf: ScrollKeyframe, idx: number, total: number): void {
    const card = document.createElement('div')
    card.className = 'kf'

    // Header: "KF n  ×"
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

    // `at` slider (scroll progress 0..1)
    const atRow = document.createElement('div')
    atRow.className = 'row'
    const atLine = document.createElement('div')
    atLine.className = 'label-line'
    const atLbl = document.createElement('label')
    atLbl.textContent = 'at'
    const atVal = document.createElement('span')
    atVal.className = 'val'
    atVal.textContent = (kf.at * 100).toFixed(0) + '%'
    atLine.append(atLbl, atVal)
    const atIn = document.createElement('input')
    atIn.type = 'range'
    atIn.min = '0'
    atIn.max = '1'
    atIn.step = '0.01'
    atIn.value = String(kf.at)
    atIn.addEventListener('input', () => {
      const v = Number(atIn.value)
      atVal.textContent = (v * 100).toFixed(0) + '%'
      // setAt re-sorts; let the subscriber re-render to reflect the
      // (potentially different) index.
      arc.setAt(idx, v)
    })
    atRow.append(atLine, atIn)
    card.appendChild(atRow)

    // Per-param sliders.
    for (const def of PARAM_DEFS) {
      const v = (kf.params as Record<string, number | undefined>)[
        def.key as string
      ]
      const row = document.createElement('div')
      row.className = 'row'
      const labelLine = document.createElement('div')
      labelLine.className = 'label-line'
      const label = document.createElement('label')
      label.textContent = def.label
      const valSpan = document.createElement('span')
      valSpan.className = 'val'
      valSpan.textContent = typeof v === 'number' ? v.toFixed(2) : '–'
      labelLine.append(label, valSpan)
      const input = document.createElement('input')
      input.type = 'range'
      input.min = String(def.min)
      input.max = String(def.max)
      input.step = String(def.step)
      input.value = String(typeof v === 'number' ? v : (def.min + def.max) / 2)
      input.addEventListener('input', () => {
        const nv = Number(input.value)
        valSpan.textContent = nv.toFixed(2)
        arc.setParam(idx, def.key, nv)
      })
      row.append(labelLine, input)
      card.appendChild(row)
    }

    kfsContainer.appendChild(card)
  }

  render()
  const unsubscribe = arc.subscribe(render)

  parent.appendChild(panel)

  return {
    destroy() {
      unsubscribe()
      panel.remove()
    },
  }
}
