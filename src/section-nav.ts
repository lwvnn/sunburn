// Floating prev/next arrows + section counter + "add section" button.
//
// Clicking ‹ / › sets the active checkpoint and smoothly scrolls the page
// to that checkpoint's `at`.  Clicking + appends a new checkpoint (which
// copies the last one's params), then scrolls to it so the user can edit
// it immediately.
//
// The component subscribes to the scroll-arc store so the counter and
// disabled-state of the arrows stay in sync with whatever the store
// holds, including external mutations (a slider edit, a reset, etc.).

import type { ScrollArc } from './scroll-arc'

const COLLAPSE_KEY = 'section-nav-collapsed-v1'

function injectStyles(): void {
  if (document.getElementById('section-nav-styles')) return
  const css = `
    #section-nav {
      position: fixed;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9998;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      font: 12px/1 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.92);
      background: rgba(18, 18, 18, 0.78);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
      user-select: none;
      -webkit-user-select: none;
    }
    #section-nav button {
      appearance: none;
      background: rgba(255, 255, 255, 0.08);
      color: inherit;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      width: 28px;
      height: 28px;
      padding: 0;
      font: inherit;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    #section-nav button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.18);
    }
    #section-nav button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    #section-nav .counter {
      min-width: 42px;
      text-align: center;
      letter-spacing: 0.06em;
      font-variant-numeric: tabular-nums;
    }
    #section-nav .add { font-size: 16px; }
    #section-nav .remove { font-size: 18px; line-height: 0.7; }
    body.theme-light #section-nav {
      color: rgba(20, 20, 20, 0.92);
      background: rgba(255, 255, 255, 0.85);
      border-color: rgba(0, 0, 0, 0.16);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
    }
    body.theme-light #section-nav button {
      background: rgba(0, 0, 0, 0.06);
      border-color: rgba(0, 0, 0, 0.18);
    }
    body.theme-light #section-nav button:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.14);
    }
  `
  const el = document.createElement('style')
  el.id = 'section-nav-styles'
  el.textContent = css
  document.head.appendChild(el)
}

export interface SectionNavHandle {
  destroy(): void
}

/** Smoothly scroll to the given checkpoint's `at` (0..1). */
function scrollToCheckpoint(at: number): void {
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (max <= 0) return
  const targetY = at * max
  window.scrollTo({ top: targetY, behavior: 'smooth' })
}

export function mountSectionNav(
  scrollArc: ScrollArc,
  parent: HTMLElement = document.body,
): SectionNavHandle {
  injectStyles()

  const root = document.createElement('div')
  root.id = 'section-nav'
  if (localStorage.getItem(COLLAPSE_KEY) === '1') root.style.display = 'none'

  const prev = document.createElement('button')
  prev.className = 'prev'
  prev.title = 'Previous section'
  prev.textContent = '‹'

  const counter = document.createElement('span')
  counter.className = 'counter'

  const next = document.createElement('button')
  next.className = 'next'
  next.title = 'Next section'
  next.textContent = '›'

  const remove = document.createElement('button')
  remove.className = 'remove'
  remove.title = 'Delete current section (need at least 2)'
  remove.textContent = '−'

  const add = document.createElement('button')
  add.className = 'add'
  add.title = 'Append section (copies the current one)'
  add.textContent = '+'

  root.append(prev, counter, next, remove, add)
  parent.appendChild(root)

  function render(): void {
    const kfs = scrollArc.getKeyframes()
    const i = scrollArc.getActiveIndex()
    counter.textContent = `${i + 1} / ${kfs.length}`
    prev.disabled = i <= 0
    next.disabled = i >= kfs.length - 1
    remove.disabled = kfs.length <= 2
  }

  prev.addEventListener('click', () => {
    const i = scrollArc.getActiveIndex()
    if (i <= 0) return
    const target = i - 1
    scrollArc.setActiveIndex(target)
    const at = scrollArc.getKeyframes()[target]?.at
    if (typeof at === 'number') scrollToCheckpoint(at)
  })

  next.addEventListener('click', () => {
    const kfs = scrollArc.getKeyframes()
    const i = scrollArc.getActiveIndex()
    if (i >= kfs.length - 1) return
    const target = i + 1
    scrollArc.setActiveIndex(target)
    const at = scrollArc.getKeyframes()[target]?.at
    if (typeof at === 'number') scrollToCheckpoint(at)
  })

  add.addEventListener('click', () => {
    scrollArc.appendKeyframe()
    const kfs = scrollArc.getKeyframes()
    const last = kfs[kfs.length - 1]
    if (last) scrollToCheckpoint(last.at)
  })

  remove.addEventListener('click', () => {
    const i = scrollArc.getActiveIndex()
    scrollArc.removeKeyframe(i)
    const kfs = scrollArc.getKeyframes()
    const newActive = scrollArc.getActiveIndex()
    const at = kfs[newActive]?.at
    if (typeof at === 'number') scrollToCheckpoint(at)
  })

  const unsubscribe = scrollArc.subscribe(render)
  render()

  return {
    destroy() {
      unsubscribe()
      root.remove()
    },
  }
}
