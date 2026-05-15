// Tunables. Pull everything magic-number into here.

export const NAME_TEXT = 'Your Name'
export const NAME_FONT = 'bold 64px Georgia'
export const NAME_FONT_MOBILE = 'bold 44px Georgia'
export const NAME_LINE_HEIGHT = 1.2 // multiplier of font size

export const FIRE_FONT = '14px "Courier New", monospace'
export const FIRE_LINE_HEIGHT = 16 // px
export const FIRE_TOP_FRACTION = 0.5 // bottom half is fire

// Column layout
export const FIRE_COLUMN_WIDTH = 110 // px target width per column at rest
export const FIRE_COLUMN_MIN_COUNT = 6
export const FIRE_COLUMN_MAX_COUNT = 22

// Scroll
export const FIRE_SCROLL_SPEED_MIN = 22 // px/sec
export const FIRE_SCROLL_SPEED_MAX = 60

// Envelopment
export const ENVELOP_SIGMA_Y = 90 // gaussian falloff vertically (px)
export const ENVELOP_REACH_MAX = 140 // max horizontal reach (px)
export const ENVELOP_NARROW_FRACTION = 0.35 // up to 35% column narrowing
export const ENVELOP_RAMP_MS = 200

// Submersion
export const SUBMERSION_THRESHOLD_PX = 12 // overlap to count as "in fire"
export const SUBMERSION_REQUIRED_S = 3
export const SUBMERSION_DECAY_RATIO = 0.5 // out-of-fire decays at half rate
export const SUBMERSION_REQUIRED_S_REDUCED = 1

// Drag spring
export const DRAG_STIFFNESS_TOUCH = 180
export const DRAG_STIFFNESS_MOUSE = 400

// Particles
export const PARTICLE_LIFE_MIN_S = 1.0
export const PARTICLE_LIFE_MAX_S = 1.8
export const PARTICLE_VY_MIN = -140
export const PARTICLE_VY_MAX = -60
export const PARTICLE_VX_RANGE = 20
export const PARTICLE_GRAVITY = -40 // negative = upward bias
export const PARTICLE_CHAR_SWAP_AT_LIFE_FRAC = 0.6

// Reduced motion
export const REDUCED_FIRE_SCROLL_FACTOR = 0
export const REDUCED_NOISE_AMP = 0.2
export const REDUCED_DISSOLVE_MS = 400
