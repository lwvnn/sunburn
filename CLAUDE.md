# Portfolio — CLAUDE.md

Research notes on `@chenglou/pretext` before writing any portfolio code.

---

## 1. The prepare / layout API in plain English

Pretext splits text measurement into two phases with very different cost profiles:

### `prepare(text, font, options?)` → `PreparedText`

Does all the expensive work **once**:
- Normalises whitespace and segments the string (grapheme clusters, words, bidi runs)
- Measures every segment's pixel width via Canvas `measureText()` — this is the only moment the font engine is touched
- Returns an opaque handle you keep around and reuse

Options (all optional):
- `whiteSpace: 'normal' | 'pre-wrap'` — use `'pre-wrap'` for textarea-style text where spaces, tabs, and `\n` are preserved
- `wordBreak: 'normal' | 'keep-all'` — `'keep-all'` for CJK / mixed-script text
- `letterSpacing: number` — pixel value matching your CSS `letter-spacing`

**Never call `prepare()` again for the same text + font + options.** That defeats the whole point.

### `layout(prepared, maxWidth, lineHeight)` → `{ height, lineCount }`

Does the cheap hot-path work **every time the container width changes**:
- Pure arithmetic over the cached segment widths — zero DOM access, zero reflow
- Returns the wrapped height and the number of lines
- Safe to call on every frame or inside a ResizeObserver callback

```ts
import { prepare, layout } from '@chenglou/pretext'

// Once — cache this per text+font pair
const handle = prepare('Hello, world!', '16px Inter')

// Many times — pure arithmetic, essentially free
const { height, lineCount } = layout(handle, containerWidth, 24)
// On resize: just call layout() again with the new width
const { height: h2 } = layout(handle, newWidth, 24)
```

**Empty-string edge case:** `layout()` returns `{ height: 0, lineCount: 0 }` for an empty string. Browsers still render one line-height worth of space for an empty block, so clamp manually if you need to match that: `Math.max(1, lineCount) * lineHeight`.

---

### Advanced: `prepareWithSegments` + manual-layout APIs

When you need to render to Canvas / SVG / WebGL, or when line widths vary as you go (e.g. text flowing around an image), swap to the richer handle:

| Function | What it does |
|---|---|
| `prepareWithSegments(text, font, opts?)` | Same as `prepare()` but returns a richer handle that exposes segment/cursor data |
| `layoutWithLines(prepared, maxWidth, lineHeight)` | Like `layout()` but also returns an array of `LayoutLine` objects (text + width + cursors), all at a fixed max width |
| `walkLineRanges(prepared, maxWidth, onLine)` | Visits each line via callback without allocating strings — good for binary-search or stats |
| `measureLineStats(prepared, maxWidth)` | Returns `{ lineCount, maxLineWidth }` with no string allocations |
| `measureNaturalWidth(prepared)` | The widest the text naturally wants to be (no wrapping, only hard breaks) |
| `layoutNextLineRange(prepared, cursor, maxWidth)` | Iterator-style: feed it a cursor, get back the next line's range and the new cursor, or `null` when done. **Width can change each call** — this is the variable-width primitive. |
| `materializeLineRange(prepared, range)` | Turns a `LayoutLineRange` (no strings) into a full `LayoutLine` (with `.text`) |

Variable-width loop skeleton (e.g. text flowing around a floated image):

```ts
import { prepareWithSegments, layoutNextLineRange, materializeLineRange } from '@chenglou/pretext'
import type { LayoutCursor } from '@chenglou/pretext'

const prepared = prepareWithSegments(article, '16px Inter')
let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0

while (true) {
  const maxWidth = y < image.bottom ? columnWidth - image.width : columnWidth
  const range = layoutNextLineRange(prepared, cursor, maxWidth)
  if (range === null) break
  const line = materializeLineRange(prepared, range)
  ctx.fillText(line.text, 0, y)
  cursor = range.end
  y += 26
}
```

---

## 2. What Pretext does NOT do

Pretext is a **measurement and layout engine only**. It hands you numbers; what you do with them is entirely your problem.

**Out of scope by design:**
- Rendering — no DOM writes, no Canvas draw calls, no paint of any kind
- Animation — no `requestAnimationFrame`, no spring physics, no easing
- Resize listening — no `ResizeObserver`; you wire that up and call `layout()` yourself
- CSS cascade — it does not read your stylesheets; you must pass matching `font` and `lineHeight` values manually
- Full CSS text spec — the following are explicitly unsupported:
  - `overflow-wrap: break-word` customisation beyond the default fallback (very narrow widths still break at grapheme boundaries)
  - `line-break` beyond `auto`
  - `font-optical-sizing`, `font-feature-settings`, `font-variation-settings` (variable-font axes only help if reflected in the `font` shorthand string, e.g. via `font-weight`)
  - `tab-size` customisation (always uses browser default `tab-size: 8`)
  - `system-ui` font on macOS (measurement is unreliable — use a named font)
- Hyphenation — soft hyphens (`&shy;`) inserted before `prepare()` are respected as optional break points, but automatic hyphenation is not built in
- Bidi visual rendering — `segLevels` is exposed on the richer handle for custom bidi-aware rendering, but the line-breaking APIs don't use it
- Server-side rendering — mentioned as a future goal, not yet supported
- Rich nested markup trees / general CSS inline formatting — the `rich-inline` helper is intentionally narrow (inline-only, `white-space: normal` only, no nesting)

**Runtime requirements Pretext imposes on you:**
- `Intl.Segmenter` must be available (no polyfill built in)
- Canvas 2D text measurement must be available

---

## 3. The render-loop pattern the demos use

All demos share the same two-phase structure. Pretext never owns the loop; the caller does.

### Phase A — Prepare once (outside any loop)

```ts
// At init time, or whenever the text/font actually changes
const handle = prepare(text, '16px Inter')
```

If you have many items (e.g. a virtual list), prepare all of them upfront and cache the handles in a Map or array. Re-preparation is expensive; re-layout is cheap.

### Phase B — Layout on demand (inside resize / animation callbacks)

**Simple case — DOM height + CSS transitions (e.g. Accordion demo):**
```ts
const ro = new ResizeObserver(([entry]) => {
  const { height } = layout(handle, entry.contentRect.width, LINE_HEIGHT)
  el.style.setProperty('--content-height', `${height}px`)
})
ro.observe(container)
```
Pretext computes the pixel height; CSS `transition` handles the animation. No `requestAnimationFrame` needed.

**Dynamic layout case — Canvas / WebGL per-frame (e.g. Editorial Engine demo):**
```ts
// prepare() is called once before the loop
const handle = prepareWithSegments(text, FONT)

function frame() {
  requestAnimationFrame(frame)

  // Obstacle positions update each frame → line widths change each line
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let y = 0
  while (true) {
    const maxWidth = getLineWidth(y)          // caller computes per-line width
    const range = layoutNextLineRange(handle, cursor, maxWidth)
    if (range === null) break
    const line = materializeLineRange(handle, range)
    ctx.fillText(line.text, x, y)
    cursor = range.end
    y += LINE_HEIGHT
  }
}
requestAnimationFrame(frame)
```

`layoutNextLineRange` is the per-frame hot path — zero DOM measurements, zero string allocations unless you call `materializeLineRange`.

**Virtual list case — measure only, no render inside the loop (e.g. Virtual Scroll demo):**
```ts
// All handles prepared once at data-load time
const handles = items.map(item => prepare(item.text, FONT))

// On scroll or resize: layout() is called for visible items only
function updateVisible(containerWidth: number) {
  for (const handle of visibleHandles) {
    const { height } = layout(handle, containerWidth, LINE_HEIGHT)
    // set DOM height / update virtual offset
  }
}
```

### The invariant across all patterns

```
prepare()  — once per unique (text, font, options) triple
layout()   — every time width changes (resize, scroll into view, frame)
render     — your code, after you have the numbers
```

Pretext gives you numbers. You own the loop, the DOM writes, and the animation.
