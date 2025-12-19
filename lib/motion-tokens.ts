/**
 * FORMATDISC Motion Tokens
 * Standardized animation system for consistent UX
 * All animations respect prefers-reduced-motion
 */

export const motionTokens = {
  // Entry animations
  enter: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },

  // Stagger container
  stagger: {
    animate: {
      transition: { staggerChildren: 0.08 },
    },
  },

  // Badge scale animation
  badge: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" },
  },

  // Card reveal
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  },

  // Fade only (no movement)
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },

  // Stats counter
  stat: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "backOut" },
  },
} as const

// Semantic motion intents
export const motionIntents = {
  arrival: motionTokens.enter, // Hero entrance
  reveal: motionTokens.card, // Content reveal
  credential: motionTokens.badge, // Badge/credential display
  surface: motionTokens.fade, // Capability surfacing
} as const

// Duration tokens (ms)
export const durations = {
  fast: 200,
  normal: 400,
  slow: 600,
  emphasis: 800,
} as const

// Easing tokens
export const easings = {
  default: "easeOut",
  bounce: "backOut",
  smooth: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
} as const
