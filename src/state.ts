import type { LayoutCursor, PreparedTextWithSegments } from '@chenglou/pretext'

export type Phase = 'idle' | 'dragging' | 'dissolving' | 'final'

export type GlyphPos = { char: string; x: number; y: number }

export type FlameColumn = {
  passageIndex: number
  prepared: PreparedTextWithSegments
  cursor: LayoutCursor
  scrollOffset: number
  baseX: number
  baseWidth: number
  scrollSpeed: number
  hueShift: number
}

export type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  char: string
  alpha: number
  life: number
  maxLife: number
  swapped: boolean
}

export type AppState = {
  phase: Phase

  viewport: {
    w: number
    h: number
    dpr: number
    fireTopY: number
  }

  name: {
    text: string
    font: string
    fontSizePx: number
    lineHeightPx: number
    prepared: PreparedTextWithSegments | null
    glyphPositions: GlyphPos[]
    width: number
    height: number
    homePos: { x: number; y: number }
    inputPos: { x: number; y: number }
    pos: { x: number; y: number }
    velocity: { x: number; y: number }
    dragging: boolean
    pointerType: 'touch' | 'mouse' | 'pen'
    submergedTime: number
    charringLevel: number
  }

  fire: {
    columns: FlameColumn[]
    cellWidth: number // monospace cell width in px (for FIRE_FONT)
    envelopStrength: number // 0..1, ramps when name enters fire
  }

  particles: Particle[]
  dissolveStartedAt: number | null
  reducedMotion: boolean
}

export const state: AppState = {
  phase: 'idle',
  viewport: { w: 0, h: 0, dpr: 1, fireTopY: 0 },
  name: {
    text: '',
    font: '',
    fontSizePx: 0,
    lineHeightPx: 0,
    prepared: null,
    glyphPositions: [],
    width: 0,
    height: 0,
    homePos: { x: 0, y: 0 },
    inputPos: { x: 0, y: 0 },
    pos: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    dragging: false,
    pointerType: 'mouse',
    submergedTime: 0,
    charringLevel: 0,
  },
  fire: {
    columns: [],
    cellWidth: 0,
    envelopStrength: 0,
  },
  particles: [],
  dissolveStartedAt: null,
  reducedMotion: false,
}
