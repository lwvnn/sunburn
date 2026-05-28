// Live tuning panel for the fire renderer.
//
// A small fixed-position card in the top-right corner with sliders for
// every FireParam. Changes apply on the next frame via fire.setParams().
// Values persist across reloads in localStorage so you don't lose a tuning
// session. Collapsible; press the title bar to fold.

import type { Fire, FireParams, SwirlType, FlickerMode } from './fire'
import { FIRE_DEFAULTS, FIRE_DEFAULTS_LIGHT, SWIRL_TYPES, FLICKER_MODES } from './fire'
import type { ScrollArc, CheckpointParams, KeyframeNumericKey } from './scroll-arc'
import { isGlobalNumericKey, NUMERIC_KEYS } from './scroll-arc'

type Theme = 'dark' | 'light'

interface ColorDef {
  key: 'colorBase' | 'colorLow' | 'colorHot' | 'colorTip' | 'wordColorMain' | 'wordColorLeft' | 'wordColorRight'
  label: string
}

const COLOR_PICKERS: ColorDef[] = [
  { key: 'colorBase', label: 'base' },
  { key: 'colorLow', label: 'low' },
  { key: 'colorHot', label: 'hot' },
  { key: 'colorTip', label: 'tip' },
  { key: 'wordColorLeft', label: 'left eye' },
  { key: 'wordColorMain', label: 'main eye' },
  { key: 'wordColorRight', label: 'right eye' },
]

/** Curated list of font-family stacks. system-ui is intentionally omitted —
 *  Pretext flags it as unsafe for layout accuracy on macOS. */
const FONT_FAMILIES: Array<{ label: string; stack: string }> = [
  // Bundled variable fonts (registered via @font-face in style.css).
  { label: 'Inter',           stack: '"Inter", system-ui, sans-serif' },
  { label: 'Space Grotesk',   stack: '"Space Grotesk", system-ui, sans-serif' },
  { label: 'JetBrains Mono',  stack: '"JetBrains Mono", ui-monospace, monospace' },
  { label: 'Uncut Sans',      stack: '"Uncut Sans", system-ui, sans-serif' },
  // Google Fonts serif collection.
  { label: 'Instrument Serif',  stack: '"Instrument Serif", Georgia, serif' },
  { label: 'Bodoni Moda',       stack: '"Bodoni Moda", "Bodoni MT", Georgia, serif' },
  { label: 'Cormorant Garamond',stack: '"Cormorant Garamond", "Garamond", serif' },
  { label: 'Spectral',          stack: '"Spectral", Georgia, serif' },
  { label: 'Libre Baskerville', stack: '"Libre Baskerville", Baskerville, serif' },
  { label: 'DM Serif Display',  stack: '"DM Serif Display", Georgia, serif' },
  { label: 'Playfair Display',  stack: '"Playfair Display", "Didot", Georgia, serif' },
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

/** Keys of FireParams whose values are numbers (slider-controllable). */
type NumericFireParamKey = {
  [K in keyof FireParams]: FireParams[K] extends number ? K : never
}[keyof FireParams]

interface SliderDef {
  key: NumericFireParamKey
  label: string
  min: number
  max: number
  step: number
  /** Optional formatter for the readout. Defaults to `toFixed(step-derived)`. */
  format?: (v: number) => string
}

/*
 * Sliders are grouped by what they SHAPE in the simulation:
 *   1. Sphere & flame — geometry of the eclipse and corona reach
 *   2. Typography     — glyph dimensions + stream rate
 *   3. Tongues        — big / wobble noise that drives flame length
 *   4. Flicker        — per-cell intensity noise (palette modulation)
 *   5. Edges          — alpha fade near sphere surface and flame tip
 *   6. Central peak   — single tongue lifted higher than its neighbours
 *   7. Palette        — colour-stop animation
 *   8. Swirl          — global rotation noise displacing chars
 *   9. Curl vortices  — localised whirlpool eddies with randomised values
 *
 * Each slider edit writes into the active scroll-arc checkpoint, so every
 * row here is per-section.  Globals (font family, swirl type, colour
 * stops) sit outside the array below.
 */
const SLIDERS: SliderDef[] = [
  // ── 1. Sphere & flame geometry ────────────────────────────────────────
  { key: 'sphereCxFrac',     label: 'sphere x',     min: -0.5, max: 1.5, step: 0.001, format: v => v.toFixed(3) },
  { key: 'sphereCyFrac',     label: 'sphere y',     min: -5,   max: 5,   step: 0.001, format: v => v.toFixed(3) },
  { key: 'sphereRadiusFrac', label: 'sphere r',     min: 0,    max: 2,   step: 0.001, format: v => v.toFixed(3) },
  { key: 'flameRadialReach', label: 'flame reach',  min: 0,    max: 1,   step: 0.001, format: v => v.toFixed(3) },

  // ── 2. Typography ─────────────────────────────────────────────────────
  { key: 'fontSize',       label: 'font size',      min: 6,    max: 40,  step: 1   },
  { key: 'fontWeight',     label: 'font weight',    min: 100,  max: 900, step: 100 },
  { key: 'lineHeight',     label: 'line height',    min: 8,    max: 60,  step: 1   },
  { key: 'letterSpacing',  label: 'letter spacing', min: -3,   max: 12,  step: 0.1 },
  { key: 'textScrollSpeed',label: 'scroll px/s',    min: 0,    max: 150, step: 1   },

  // ── 2. Tongues ────────────────────────────────────────────────────────
  { key: 'tongueBase',  label: 'base height',  min: 0,      max: 1,    step: 0.01   },
  { key: 'tongueBigAmp',label: 'tongue amp ⨉', min: 0,      max: 0.6,  step: 0.01   },
  { key: 'tongueBigSx', label: 'tongue width', min: 0.0005, max: 0.1,  step: 0.0005, format: v => v.toFixed(4) },
  { key: 'tongueBigSt', label: 'tongue speed', min: 0,      max: 3,    step: 0.05   },
  { key: 'tongueMedAmp',label: 'wobble amp',   min: 0,      max: 0.4,  step: 0.01   },
  { key: 'tongueMedSx', label: 'wobble width', min: 0.001,  max: 0.05, step: 0.001,  format: v => v.toFixed(3) },
  { key: 'tongueMedSt', label: 'wobble speed', min: 0,      max: 4,    step: 0.05   },

  // ── 3. Flicker ────────────────────────────────────────────────────────
  { key: 'flickerAmp',     label: 'flicker amp',     min: 0,     max: 0.6, step: 0.01 },
  { key: 'flickerBias',    label: 'flicker bias',    min: -0.5,  max: 0.5, step: 0.01 },
  { key: 'flickerContrast',label: 'flicker curve',   min: 0.3,   max: 3,   step: 0.05 },
  { key: 'flickerSx',      label: 'flicker x scale', min: 0.001, max: 0.2, step: 0.001, format: v => v.toFixed(3) },
  { key: 'flickerSy',      label: 'flicker y scale', min: 0.001, max: 0.2, step: 0.001, format: v => v.toFixed(3) },
  { key: 'flickerScale',   label: 'flicker scale',   min: 0.1,   max: 5,   step: 0.01, format: v => v.toFixed(2) },
  { key: 'flickerSt',      label: 'flicker speed',   min: 0,     max: 4,   step: 0.05 },

  // ── 4. Edges ──────────────────────────────────────────────────────────
  { key: 'tipFadePx',    label: 'tip fade px',    min: 0, max: 1000, step: 1 },
  { key: 'sphereFadePx', label: 'sphere fade px', min: 0, max: 80,   step: 1 },

  // ── 5. Central peak (one tongue raised higher than the others) ───────
  { key: 'centerPeakAmp',        label: 'peak length ⨉',  min: 1,    max: 5,   step: 0.01 },
  { key: 'centerPeakWidth',      label: 'peak width rad', min: 0.05, max: 3,   step: 0.01 },
  { key: 'centerPeakSmoothness', label: 'peak falloff',   min: 0.3,  max: 8,   step: 0.05 },
  { key: 'centerPeakAngleDeg',   label: 'peak angle °',   min: -180, max: 180, step: 1    },

  // ── 6. Palette animation ──────────────────────────────────────────────
  { key: 'colorHueShiftSpeed', label: 'hue shift °/s', min: 0, max: 360, step: 1 },

  // ── 7. Swirl (sphere-relative rotation noise) ─────────────────────────
  { key: 'swirlStrength', label: 'swirl amount', min: 0,     max: 5,    step: 0.001 },
  { key: 'swirlScale',    label: 'swirl scale',  min: 0.001, max: 0.05, step: 0.0001, format: v => v.toFixed(3) },
  { key: 'swirlSpeed',    label: 'swirl speed',  min: 0,     max: 4,    step: 0.05  },
  { key: 'swirlStart',    label: 'swirl start',  min: 0,     max: 0.95, step: 0.01  },

  // ── 8. Curl vortices (localised whirlpool eddies) ────────────────────
  // Each vortex picks its own strength + radius + distance from these
  // [min, max] ranges — set min < 0, max > 0 to mix repel and attract.
  { key: 'curlCount',        label: 'curl count',        min: 0,    max: 24,   step: 1    },
  { key: 'curlStrengthMin',  label: 'curl strength min', min: -200, max: 200,  step: 1    },
  { key: 'curlStrengthMax',  label: 'curl strength max', min: -200, max: 200,  step: 1    },
  { key: 'curlRadiusMin',    label: 'curl radius min',   min: 10,   max: 400,  step: 1    },
  { key: 'curlRadiusMax',    label: 'curl radius max',   min: 10,   max: 400,  step: 1    },
  { key: 'curlDistanceMin',  label: 'curl distance min', min: 0,    max: 1.5,  step: 0.01 },
  { key: 'curlDistanceMax',  label: 'curl distance max', min: 0,    max: 1.5,  step: 0.01 },
  { key: 'curlDriftSpeed',   label: 'curl drift',        min: -0.5, max: 0.5,  step: 0.005, format: v => v.toFixed(3) },

  // Non-speed post-FX (grain opacity/scale, glow*, pixelation,
  // scanlines) have moved to the dedicated post-fx-controls panel —
  // they're global to the page rather than per-section.  The *_speed
  // params above are also global at runtime (see GLOBAL_NUMERIC_KEYS
  // in scroll-arc.ts), but they stay here visually because they belong
  // to the same conceptual group as the rest of each section.
]

const STORAGE_KEY = 'fire-controls-v2'

interface PersistedState {
  params: Partial<FireParams>
  collapsed: boolean
  /** Current theme. Persisted across reloads. */
  theme: Theme
  /** Per-theme remembered color choices, so toggling themes restores them. */
  themeColors: Partial<Record<Theme, Pick<FireParams, 'colorBase' | 'colorLow' | 'colorHot' | 'colorTip' | 'wordColorMain' | 'wordColorLeft' | 'wordColorRight'>>>
  /** Per-theme custom page background.  Falls back to the CSS class default
   *  (#0a0608 for dark, #f6efe2 for light) when not set. */
  themeBg: Partial<Record<Theme, string>>
}

function loadPersisted(): PersistedState {
  const fallback: PersistedState = {
    params: {},
    collapsed: false,
    theme: 'dark',
    themeColors: {},
    themeBg: {},
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      params: parsed.params ?? {},
      collapsed: parsed.collapsed ?? false,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      themeColors: parsed.themeColors ?? {},
      themeBg: parsed.themeBg ?? {},
    }
  } catch {
    return fallback
  }
}

function savePersisted(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota / private browsing — ignore */
  }
}

function injectStyles(): void {
  if (document.getElementById('fire-controls-styles')) return
  const css = `
    body.theme-light { --page-bg: #f6efe2; }
    body.theme-light #name,
    body.theme-light #final-name { color: #1a1a1a; }
    body.theme-light #final-soon { color: rgba(26, 13, 4, 0.6); }

    #fire-controls {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999;
      width: 240px;
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
    #fire-controls header {
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
    #fire-controls header .chev {
      transition: transform 150ms ease-out;
      font-size: 9px;
      opacity: 0.7;
    }
    #fire-controls.collapsed header { border-bottom: none; }
    #fire-controls.collapsed header .chev { transform: rotate(-90deg); }
    #fire-controls.collapsed .body { display: none; }
    #fire-controls header .title { flex: 1; }
    #fire-controls .body { padding: 8px 10px 10px; max-height: 70vh; overflow-y: auto; }
    #fire-controls .row { margin: 6px 0; }
    #fire-controls .row .label-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
      gap: 8px;
    }
    #fire-controls .row label { opacity: 0.78; }
    #fire-controls .row .val {
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
    #fire-controls .row .val:hover { border-color: rgba(255, 255, 255, 0.18); }
    #fire-controls .row .val:focus {
      border-color: rgba(255, 255, 255, 0.55);
      background: rgba(255, 255, 255, 0.06);
    }
    body.theme-light #fire-controls .row .val:hover { border-color: rgba(0, 0, 0, 0.22); }
    body.theme-light #fire-controls .row .val:focus {
      border-color: rgba(0, 0, 0, 0.65);
      background: rgba(0, 0, 0, 0.06);
    }
    #fire-controls .font-row {
      margin: 0 0 8px;
    }
    #fire-controls .font-row select {
      width: 100%;
      padding: 4px 6px;
      font: inherit;
      color: inherit;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 4px;
      cursor: pointer;
      letter-spacing: 0.04em;
      appearance: none;
    }
    #fire-controls .font-row select:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    #fire-controls .font-row select option {
      background: #1a1a1a;
      color: rgba(255, 255, 255, 0.85);
    }
    body.theme-light #fire-controls .font-row select {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #fire-controls .font-row select:hover {
      background: rgba(0, 0, 0, 0.18);
    }
    body.theme-light #fire-controls .font-row select option {
      background: #f5f5f5;
      color: rgba(0, 0, 0, 0.92);
    }
    #fire-controls input[type="range"] {
      width: 100%;
      height: 14px;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      margin: 0;
    }
    #fire-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 2px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 1px;
    }
    #fire-controls input[type="range"]::-moz-range-track {
      height: 2px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 1px;
    }
    #fire-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      margin-top: -5px;
      cursor: pointer;
      border: none;
    }
    #fire-controls input[type="range"]::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgb(220, 220, 220);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
      cursor: pointer;
      border: none;
    }
    #fire-controls .actions {
      display: flex;
      gap: 6px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #fire-controls button {
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
    #fire-controls button:hover {
      background: rgba(255, 255, 255, 0.14);
    }
    #fire-controls button:active {
      background: rgba(255, 255, 255, 0.20);
    }

    #fire-controls .theme-btn {
      width: 22px; height: 22px;
      padding: 0;
      flex: 0 0 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      line-height: 1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.20);
      border-radius: 50%;
      color: inherit;
      cursor: pointer;
      letter-spacing: 0;
      text-transform: none;
    }
    #fire-controls .theme-btn:hover { background: rgba(255, 255, 255, 0.14); }

    #fire-controls .colors {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #fire-controls .colors .swatch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      opacity: 0.85;
    }
    #fire-controls .colors input[type="color"] {
      width: 100%;
      height: 28px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
    }
    #fire-controls .colors input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
    #fire-controls .colors input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }

    /* ── Light theme overrides for the panel itself ─────────────────────── */
    body.theme-light #fire-controls {
      color: rgba(0, 0, 0, 0.92);
      background: rgba(245, 245, 245, 0.88);
      border-color: rgba(0, 0, 0, 0.28);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
    }
    body.theme-light #fire-controls header {
      color: rgba(0, 0, 0, 0.95);
      border-bottom-color: rgba(0, 0, 0, 0.20);
    }
    body.theme-light #fire-controls .actions,
    body.theme-light #fire-controls .colors {
      border-top-color: rgba(0, 0, 0, 0.20);
    }
    body.theme-light #fire-controls input[type="range"]::-webkit-slider-runnable-track,
    body.theme-light #fire-controls input[type="range"]::-moz-range-track {
      background: rgba(0, 0, 0, 0.28);
    }
    body.theme-light #fire-controls input[type="range"]::-webkit-slider-thumb,
    body.theme-light #fire-controls input[type="range"]::-moz-range-thumb {
      background: rgb(80, 80, 80);
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
    }
    body.theme-light #fire-controls .row .val { color: rgba(0, 0, 0, 0.95); }
    body.theme-light #fire-controls button,
    body.theme-light #fire-controls .theme-btn {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.30);
    }
    body.theme-light #fire-controls button:hover,
    body.theme-light #fire-controls .theme-btn:hover {
      background: rgba(0, 0, 0, 0.18);
    }
  `
  const style = document.createElement('style')
  style.id = 'fire-controls-styles'
  style.textContent = css
  document.head.appendChild(style)
}

function defaultFormat(step: number): (v: number) => string {
  // Derive a sensible decimal count from the step.
  const decimals =
    step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : step >= 0.001 ? 3 : 4
  return v => v.toFixed(decimals)
}

export interface ControlsHandle {
  /** Remove the panel from the DOM. */
  destroy(): void
}

export function mountControls(
  fire: Fire,
  scrollArc: ScrollArc,
  parent: HTMLElement = document.body,
): ControlsHandle {
  injectStyles()

  const persisted = loadPersisted()

  // ── Theme bootstrap ──────────────────────────────────────────────────────
  // Apply the persisted theme to <body>. If we have remembered colors for
  // this theme, restore them; otherwise fall back to that theme's defaults.
  function applyTheme(theme: Theme): void {
    document.body.classList.toggle('theme-dark', theme === 'dark')
    document.body.classList.toggle('theme-light', theme === 'light')
    const saved = persisted.themeColors[theme]
    const colors =
      saved ??
      (theme === 'light'
        ? FIRE_DEFAULTS_LIGHT
        : {
            colorBase: FIRE_DEFAULTS.colorBase,
            colorLow: FIRE_DEFAULTS.colorLow,
            colorHot: FIRE_DEFAULTS.colorHot,
            colorTip: FIRE_DEFAULTS.colorTip,
            wordColorMain: FIRE_DEFAULTS.wordColorMain,
            wordColorLeft: FIRE_DEFAULTS.wordColorLeft,
            wordColorRight: FIRE_DEFAULTS.wordColorRight,
          })
    fire.setParams(colors)
    // Page background: apply persisted custom value if any, else clear the
    // inline override so the body.theme-* class default takes over.
    const customBg = persisted.themeBg[theme]
    if (customBg) {
      document.body.style.setProperty('--page-bg', customBg)
    } else {
      document.body.style.removeProperty('--page-bg')
    }
  }

  // Apply persisted overrides on top of fire's current params.  We
  // restore two slices of state here:
  //   - non-numeric props (fontFamily, swirlType, sphereEnabled) —
  //     these have always been global.
  //   - global NUMERIC props (*_speed family + post-FX) — these are now
  //     global too, so they persist alongside fonts/colours rather
  //     than in the scroll-arc.
  // Per-keyframe numeric props are owned by scroll-arc; we skip them
  // here to avoid double-writing.  Colour stops are applied by
  // applyTheme() further below.
  if (Object.keys(persisted.params).length > 0) {
    const toApply: Partial<FireParams> = {}
    for (const key of Object.keys(persisted.params) as Array<keyof FireParams>) {
      const v = persisted.params[key]
      if (v === undefined) continue
      if (key === 'colorBase' || key === 'colorLow' || key === 'colorHot' || key === 'colorTip' || key === 'wordColorMain' || key === 'wordColorLeft' || key === 'wordColorRight') {
        continue // applyTheme handles colours
      }
      if (typeof v === 'number') {
        if (!isGlobalNumericKey(key)) continue // per-keyframe, owned by scroll-arc
      }
      ;(toApply as Record<string, unknown>)[key] = v
    }
    if (Object.keys(toApply).length > 0) fire.setParams(toApply)
  }
  applyTheme(persisted.theme)

  const panel = document.createElement('div')
  panel.id = 'fire-controls'
  if (persisted.collapsed) panel.classList.add('collapsed')

  // ── Header ───────────────────────────────────────────────────────────────
  const header = document.createElement('header')
  const chev = document.createElement('span')
  chev.className = 'chev'
  chev.textContent = '▼'
  const title = document.createElement('span')
  title.className = 'title'
  title.textContent = 'fire — tune'

  const themeBtn = document.createElement('button')
  themeBtn.className = 'theme-btn'
  themeBtn.title = 'Toggle dark / light theme'
  const renderThemeIcon = (): void => {
    themeBtn.textContent = persisted.theme === 'dark' ? '☾' : '☀'
  }
  renderThemeIcon()

  header.appendChild(chev)
  header.appendChild(title)
  header.appendChild(themeBtn)

  header.addEventListener('click', () => {
    panel.classList.toggle('collapsed')
    persisted.collapsed = panel.classList.contains('collapsed')
    savePersisted(persisted)
  })

  themeBtn.addEventListener('click', e => {
    // Don't let the theme button also toggle the collapse state.
    e.stopPropagation()
    persisted.theme = persisted.theme === 'dark' ? 'light' : 'dark'
    applyTheme(persisted.theme)
    renderThemeIcon()
    // Sync the color pickers' visible values to whatever this theme uses now.
    syncColorInputsFromFire()
    savePersisted(persisted)
  })

  panel.appendChild(header)

  // ── Body ─────────────────────────────────────────────────────────────────
  const body = document.createElement('div')
  body.className = 'body'

  // ── Font family dropdown (above the sliders) ─────────────────────────────
  const fontRow = document.createElement('div')
  fontRow.className = 'font-row'

  const fontSelect = document.createElement('select')
  fontSelect.title = 'Font family'

  // Insert a "custom" option for any persisted family that isn't in our list,
  // so we don't silently overwrite the user's choice on first mount.
  const currentFamily = String(fire.getParams().fontFamily)
  const knownStacks = new Set(FONT_FAMILIES.map(f => f.stack))
  if (!knownStacks.has(currentFamily)) {
    const opt = document.createElement('option')
    opt.value = currentFamily
    opt.textContent = '(custom)'
    fontSelect.appendChild(opt)
  }
  for (const f of FONT_FAMILIES) {
    const opt = document.createElement('option')
    opt.value = f.stack
    opt.textContent = f.label
    opt.style.fontFamily = f.stack // give the dropdown live previews
    fontSelect.appendChild(opt)
  }
  fontSelect.value = currentFamily

  fontSelect.addEventListener('change', () => {
    const v = fontSelect.value
    fire.setParams({ fontFamily: v })
    persisted.params.fontFamily = v
    savePersisted(persisted)
  })

  fontRow.appendChild(fontSelect)
  body.appendChild(fontRow)

  const rows: Array<{
    def: SliderDef
    input: HTMLInputElement
    val: HTMLInputElement
  }> = []

  for (const def of SLIDERS) {
    const row = document.createElement('div')
    row.className = 'row'

    const labelLine = document.createElement('div')
    labelLine.className = 'label-line'
    const label = document.createElement('label')
    label.textContent = def.label
    // The readout is an editable text input — type any number (including
    // values outside the slider's min/max) to dial in a precise value.
    // The slider thumb pins at its bounds when the typed value is out
    // of range, but the actual stored value is the one you typed.
    const val = document.createElement('input')
    val.type = 'text'
    val.inputMode = 'decimal'
    val.spellcheck = false
    val.className = 'val'
    val.title = 'Click and type a number — no min/max cap'
    labelLine.appendChild(label)
    labelLine.appendChild(val)

    const input = document.createElement('input')
    input.type = 'range'
    input.min = String(def.min)
    input.max = String(def.max)
    input.step = String(def.step)
    // Two routing rules:
    //   - GLOBAL params (speeds + post-FX) live on the fire instance
    //     directly and persist in this panel's localStorage.
    //   - Per-keyframe params live on the active scroll-arc checkpoint;
    //     fire.getParams() returns the INTERPOLATED render value, but
    //     we want the discrete checkpoint value for these.
    const isGlobal = isGlobalNumericKey(def.key)
    const activeParams = () =>
      scrollArc.getKeyframes()[scrollArc.getActiveIndex()]?.params
    const current = isGlobal
      ? fire.getParams()[def.key]
      : (activeParams() as CheckpointParams | undefined)?.[def.key as KeyframeNumericKey]
        ?? FIRE_DEFAULTS[def.key]
    input.value = String(current)

    const fmt = def.format ?? defaultFormat(def.step)
    val.value = fmt(current as number)

    // Single apply path used by both the slider drag and the text input.
    const applyValue = isGlobal
      ? (v: number) => {
          fire.setParams({ [def.key]: v } as Partial<FireParams>)
          ;(persisted.params as Record<string, unknown>)[def.key] = v
          savePersisted(persisted)
        }
      : (v: number) => {
          scrollArc.setActiveParam(def.key as KeyframeNumericKey, v)
        }

    input.addEventListener('input', () => {
      const v = Number(input.value)
      val.value = fmt(v)
      applyValue(v)
    })

    // Text input — commit on Enter or blur.  Out-of-range values are
    // accepted as-is (the slider thumb pins to its closer bound, but
    // the underlying param value is whatever the user typed).
    const commitTypedValue = (): void => {
      const v = Number(val.value)
      if (!Number.isFinite(v)) {
        // Bad input — revert the field to whatever the slider shows.
        val.value = fmt(Number(input.value))
        return
      }
      input.value = String(v) // browser will clamp into [min, max] visually
      val.value = fmt(v)
      applyValue(v)
    }
    val.addEventListener('change', commitTypedValue)
    val.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        val.blur() // triggers the change → commit
      } else if (e.key === 'Escape') {
        val.value = fmt(Number(input.value))
        val.blur()
      }
    })
    // Select-all on focus so a click instantly overwrites — friendlier
    // than placing a caret at one end of a small number field.
    val.addEventListener('focus', () => { val.select() })

    row.appendChild(labelLine)
    row.appendChild(input)
    body.appendChild(row)
    rows.push({ def, input, val })
  }

  // ── Flicker-mode dropdown ────────────────────────────────────────────────
  // Global toggle (not per-keyframe) for how the flicker noise is sampled
  // in sphere mode.  See the FlickerMode docs in fire.ts.
  const flickerModeRow = document.createElement('div')
  flickerModeRow.className = 'font-row'
  const flickerSelect = document.createElement('select')
  flickerSelect.title = 'Flicker noise sampling mode (sphere mode only)'
  for (const m of FLICKER_MODES) {
    const opt = document.createElement('option')
    opt.value = m
    opt.textContent = `flicker: ${m}`
    flickerSelect.appendChild(opt)
  }
  flickerSelect.value = fire.getParams().flickerMode
  flickerSelect.addEventListener('change', () => {
    const v = flickerSelect.value as FlickerMode
    fire.setParams({ flickerMode: v })
    persisted.params.flickerMode = v
    savePersisted(persisted)
  })
  flickerModeRow.appendChild(flickerSelect)
  body.appendChild(flickerModeRow)

  // ── Swirl-type dropdown ──────────────────────────────────────────────────
  // Re-uses the `font-row` styling so the look matches the family selector.
  const swirlRow = document.createElement('div')
  swirlRow.className = 'font-row'
  const swirlSelect = document.createElement('select')
  swirlSelect.title = 'Swirl noise field type'
  for (const tp of SWIRL_TYPES) {
    const opt = document.createElement('option')
    opt.value = tp
    opt.textContent = `swirl: ${tp}`
    swirlSelect.appendChild(opt)
  }
  swirlSelect.value = fire.getParams().swirlType
  swirlSelect.addEventListener('change', () => {
    const v = swirlSelect.value as SwirlType
    fire.setParams({ swirlType: v })
    persisted.params.swirlType = v
    savePersisted(persisted)
  })
  swirlRow.appendChild(swirlSelect)
  body.appendChild(swirlRow)

  // ── Color pickers (gradient stops) ───────────────────────────────────────
  const colorsRow = document.createElement('div')
  colorsRow.className = 'colors'

  const colorInputs: Record<ColorDef['key'], HTMLInputElement> = {} as Record<
    ColorDef['key'],
    HTMLInputElement
  >

  for (const def of COLOR_PICKERS) {
    const swatch = document.createElement('div')
    swatch.className = 'swatch'

    const input = document.createElement('input')
    input.type = 'color'
    input.value = String(fire.getParams()[def.key])

    const label = document.createElement('span')
    label.textContent = def.label

    input.addEventListener('input', () => {
      const v = input.value
      fire.setParams({ [def.key]: v } as Partial<FireParams>)
      // Save into the current theme's color slot.
      const themeColors = persisted.themeColors[persisted.theme] ?? {
        colorBase: fire.getParams().colorBase,
        colorLow: fire.getParams().colorLow,
        colorHot: fire.getParams().colorHot,
        colorTip: fire.getParams().colorTip,
        wordColorMain: fire.getParams().wordColorMain,
        wordColorLeft: fire.getParams().wordColorLeft,
        wordColorRight: fire.getParams().wordColorRight,
      }
      themeColors[def.key] = v
      persisted.themeColors[persisted.theme] = themeColors
      savePersisted(persisted)
    })

    swatch.appendChild(input)
    swatch.appendChild(label)
    colorsRow.appendChild(swatch)
    colorInputs[def.key] = input
  }

  // ── Page background — 5th swatch in the colours grid.  Not a FireParam;
  //    applies directly to the CSS variable that drives `body { background }`.
  const bgSwatch = document.createElement('div')
  bgSwatch.className = 'swatch'
  const bgInput = document.createElement('input')
  bgInput.type = 'color'
  const bgLabel = document.createElement('span')
  bgLabel.textContent = 'bg'
  /** Read whatever CSS-variable value is currently in effect for the body so
   *  the picker reflects the live state, including a theme-class default
   *  when no custom override is set. */
  function readEffectiveBg(): string {
    const v = getComputedStyle(document.body)
      .getPropertyValue('--page-bg')
      .trim()
    // Browser may return rgb(...) form; the colour input only accepts #rrggbb.
    if (v.startsWith('#')) return v
    const m = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(v)
    if (!m) return '#000000'
    const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10)
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
  }
  bgInput.value = persisted.themeBg[persisted.theme] ?? readEffectiveBg()
  bgInput.addEventListener('input', () => {
    const v = bgInput.value
    document.body.style.setProperty('--page-bg', v)
    persisted.themeBg[persisted.theme] = v
    savePersisted(persisted)
  })
  bgSwatch.append(bgInput, bgLabel)
  colorsRow.appendChild(bgSwatch)

  // The glow tint is no longer a separate swatch — it's derived live from
  // the (hue-rotated) `tip` palette stop inside the fire renderer, so the
  // glow always follows the same colour cycle as the corona's tips.

  function syncColorInputsFromFire(): void {
    const p = fire.getParams()
    colorInputs.colorBase.value = p.colorBase
    colorInputs.colorLow.value = p.colorLow
    colorInputs.colorHot.value = p.colorHot
    colorInputs.colorTip.value = p.colorTip
    // Re-read effective bg after theme swap (CSS class may have changed it).
    bgInput.value = persisted.themeBg[persisted.theme] ?? readEffectiveBg()
  }

  body.appendChild(colorsRow)

  // ── Actions ──────────────────────────────────────────────────────────────
  const actions = document.createElement('div')
  actions.className = 'actions'

  const resetBtn = document.createElement('button')
  resetBtn.textContent = 'reset'
  resetBtn.title = 'Restore default values'
  resetBtn.addEventListener('click', () => {
    // Reset non-numeric fire params (fonts, colours, swirl type, theme bg)
    // here.  Numeric params live in the scroll-arc and are reset from its
    // own panel ("reset" inside #scroll-arc), since wiping them here would
    // clobber every checkpoint at once without warning.
    fire.setParams({
      fontFamily: FIRE_DEFAULTS.fontFamily,
      swirlType: FIRE_DEFAULTS.swirlType,
      sphereEnabled: FIRE_DEFAULTS.sphereEnabled,
      colorBase: FIRE_DEFAULTS.colorBase,
      colorLow: FIRE_DEFAULTS.colorLow,
      colorHot: FIRE_DEFAULTS.colorHot,
      colorTip: FIRE_DEFAULTS.colorTip,
      wordColorMain: FIRE_DEFAULTS.wordColorMain,
      wordColorLeft: FIRE_DEFAULTS.wordColorLeft,
      wordColorRight: FIRE_DEFAULTS.wordColorRight,
      glowColor: FIRE_DEFAULTS.glowColor,
    })
    persisted.params = {}
    persisted.themeColors = {}
    persisted.themeBg = {}
    savePersisted(persisted)
    applyTheme(persisted.theme)

    fontSelect.value = String(FIRE_DEFAULTS.fontFamily)
    swirlSelect.value = FIRE_DEFAULTS.swirlType
    syncColorInputsFromFire()
    refreshSliders()
  })

  // ── Copy / paste of checkpoint params ────────────────────────────────
  // `copy` snapshots the ACTIVE checkpoint's per-keyframe params (no
  // globals — those live elsewhere) into an in-memory buffer.  `paste`
  // applies that buffer to whichever checkpoint is currently active.
  // Together they let you propagate one section's look to others
  // without manually re-dragging every slider.
  let copyBuffer: CheckpointParams | null = null

  const copyBtn = document.createElement('button')
  copyBtn.textContent = 'copy'
  copyBtn.title = 'Snapshot current section params (excluding globals) into a buffer'

  const pasteBtn = document.createElement('button')
  pasteBtn.textContent = 'paste'
  pasteBtn.title = 'Apply the buffered params to the current section'
  pasteBtn.disabled = true

  copyBtn.addEventListener('click', () => {
    const kf = scrollArc.getKeyframes()[scrollArc.getActiveIndex()]
    if (!kf) return
    // Clone and restrict to the canonical keyframe keys — defensive in
    // case stale fields are present.
    const buf = {} as CheckpointParams
    for (const k of NUMERIC_KEYS) buf[k] = kf.params[k]
    copyBuffer = buf
    pasteBtn.disabled = false
    const orig = copyBtn.textContent
    copyBtn.textContent = 'copied'
    setTimeout(() => { copyBtn.textContent = orig }, 900)
  })

  pasteBtn.addEventListener('click', () => {
    if (!copyBuffer) return
    scrollArc.setActiveParams(copyBuffer)
    refreshSliders()
    const orig = pasteBtn.textContent
    pasteBtn.textContent = 'pasted'
    setTimeout(() => { pasteBtn.textContent = orig }, 900)
  })

  actions.appendChild(resetBtn)
  actions.appendChild(copyBtn)
  actions.appendChild(pasteBtn)
  body.appendChild(actions)

  panel.appendChild(body)
  parent.appendChild(panel)

  // Keep slider DOM in sync with the currently-active checkpoint.  Triggers
  // on scroll (main.ts updates activeIndex as the user moves between
  // sections) and on arrow clicks (section-nav).  Guard with a flag so the
  // sync doesn't fire mid-drag and yank the thumb out from under the user.
  let suppressSync = false
  for (const { input } of rows) {
    input.addEventListener('pointerdown', () => { suppressSync = true })
    const release = () => { suppressSync = false; refreshSliders() }
    input.addEventListener('pointerup', release)
    input.addEventListener('pointercancel', release)
  }
  function refreshSliders(): void {
    if (suppressSync) return
    const kf = scrollArc.getKeyframes()[scrollArc.getActiveIndex()]
    if (!kf) return
    for (const { def, input, val } of rows) {
      // Globals don't change with the active checkpoint — they're owned
      // by the fire instance + this panel's localStorage, so leave
      // their slider DOM alone.
      if (isGlobalNumericKey(def.key)) continue
      // Don't yank the text input out from under the user mid-edit.
      if (document.activeElement === val) continue
      const v = kf.params[def.key as KeyframeNumericKey]
      if (typeof v !== 'number') continue
      if (Number(input.value) !== v) input.value = String(v)
      const fmt = def.format ?? defaultFormat(def.step)
      val.value = fmt(v)
    }
  }
  const unsubscribe = scrollArc.subscribe(refreshSliders)
  refreshSliders()

  return {
    destroy() {
      unsubscribe()
      panel.remove()
    },
  }
}
