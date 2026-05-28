// Section list panel — bottom-left of the viewport.
//
// Per-key sliders moved out (the fire-controls panel now writes directly
// into the active checkpoint via scroll-arc.setActiveParam).  This panel
// is the place to:
//   - see every checkpoint in order
//   - click one to jump there
//   - delete one
//   - reset the whole arc, or save the current arc as defaults

import type { ScrollArc } from './scroll-arc'

const COLLAPSE_KEY = 'scroll-arc-collapsed-v1'

function injectStyles(): void {
  if (document.getElementById('scroll-arc-styles')) return
  const css = `
    #scroll-arc {
      position: fixed;
      bottom: 12px;
      left: 12px;
      z-index: 9999;
      width: 220px;
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
    #scroll-arc .body { padding: 8px 10px 10px; max-height: 60vh; overflow-y: auto; }

    #scroll-arc .kf {
      display: flex; align-items: center; justify-content: space-between;
      padding: 5px 8px;
      margin-bottom: 4px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.03);
      cursor: pointer;
    }
    #scroll-arc .kf:hover { background: rgba(255, 255, 255, 0.08); }
    #scroll-arc .kf.active {
      border-color: rgba(255, 255, 255, 0.55);
      background: rgba(255, 255, 255, 0.12);
    }
    #scroll-arc .kf-label {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.85);
    }
    #scroll-arc .kf-at {
      opacity: 0.5;
      font-variant-numeric: tabular-nums;
      font-size: 10px;
    }
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

    body.theme-light #scroll-arc {
      color: rgba(0, 0, 0, 0.82);
      background: rgba(255, 255, 255, 0.92);
      border-color: rgba(0, 0, 0, 0.16);
    }
    body.theme-light #scroll-arc header {
      color: rgba(0, 0, 0, 0.90);
      border-bottom-color: rgba(0, 0, 0, 0.10);
    }
    body.theme-light #scroll-arc .kf {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.10);
    }
    body.theme-light #scroll-arc .kf.active {
      background: rgba(0, 0, 0, 0.14);
      border-color: rgba(0, 0, 0, 0.55);
    }
    body.theme-light #scroll-arc .actions button {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.18);
    }
  `
  const el = document.createElement('style')
  el.id = 'scroll-arc-styles'
  el.textContent = css
  document.head.appendChild(el)
}

function scrollToCheckpoint(at: number): void {
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (max <= 0) return
  window.scrollTo({ top: at * max, behavior: 'smooth' })
}

export interface ScrollArcControlsHandle {
  destroy(): void
}

export function mountScrollArcControls(
  scrollArc: ScrollArc,
  parent: HTMLElement = document.body,
): ScrollArcControlsHandle {
  injectStyles()

  const panel = document.createElement('div')
  panel.id = 'scroll-arc'
  if (localStorage.getItem(COLLAPSE_KEY) === '1') panel.classList.add('collapsed')

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
    try {
      localStorage.setItem(
        COLLAPSE_KEY,
        panel.classList.contains('collapsed') ? '1' : '0',
      )
    } catch { /* ignore */ }
  })
  panel.appendChild(header)

  const body = document.createElement('div')
  body.className = 'body'
  panel.appendChild(body)

  const list = document.createElement('div')
  list.className = 'list'
  body.appendChild(list)

  const actions = document.createElement('div')
  actions.className = 'actions'

  const saveBtn = document.createElement('button')
  saveBtn.textContent = 'save'
  saveBtn.title =
    'Download scroll-arc-defaults.json — replace the file in src/ and commit to share with all visitors'
  saveBtn.addEventListener('click', () => {
    scrollArc.saveAsDefaults()
    const prev = saveBtn.textContent
    saveBtn.textContent = 'downloaded'
    setTimeout(() => { saveBtn.textContent = prev }, 1200)
  })

  const resetBtn = document.createElement('button')
  resetBtn.textContent = 'reset'
  resetBtn.title = 'Restore committed defaults from scroll-arc-defaults.json'
  resetBtn.addEventListener('click', () => {
    scrollArc.reset()
    scrollToCheckpoint(0)
  })

  actions.append(saveBtn, resetBtn)
  body.appendChild(actions)

  function render(): void {
    list.innerHTML = ''
    const kfs = scrollArc.getKeyframes()
    const active = scrollArc.getActiveIndex()
    kfs.forEach((kf, i) => {
      const row = document.createElement('div')
      row.className = 'kf' + (i === active ? ' active' : '')
      const label = document.createElement('span')
      label.className = 'kf-label'
      label.textContent = kf.label ?? `section ${i + 1}`
      const at = document.createElement('span')
      at.className = 'kf-at'
      at.textContent = kf.at.toFixed(2)
      row.append(label, at)
      row.addEventListener('click', () => {
        scrollArc.setActiveIndex(i)
        scrollToCheckpoint(kf.at)
      })
      list.appendChild(row)
    })
  }

  const unsubscribe = scrollArc.subscribe(render)
  render()

  parent.appendChild(panel)

  return {
    destroy() {
      unsubscribe()
      panel.remove()
    },
  }
}
