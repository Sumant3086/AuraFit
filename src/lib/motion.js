/**
 * AuraFit Motion System
 * Single source of truth for all animation values.
 * Philosophy: Apple/Linear quality — invisible, natural, fast.
 *
 * Rules:
 *  - Only animate transform and opacity (GPU composited)
 *  - Keep durations short — users don't want to wait
 *  - Ease out on enters, ease in on exits
 *  - Stagger reveals to create narrative flow
 */

// ── Easing curves ──────────────────────────────────────────────
export const ease = {
  out:      [0.16, 1, 0.3, 1],      // Fast start, smooth settle — Apple default
  inOut:    [0.45, 0, 0.55, 1],     // Symmetric — for toggles
  spring:   [0.34, 1.4, 0.64, 1],  // Slight overshoot — tactile feel
  sharp:    [0.16, 0.9, 0.3, 1],   // Very fast settle — micro-interactions
};

// ── Duration scale (seconds) ───────────────────────────────────
export const dur = {
  micro:     0.10,   // Button press, icon swap
  fast:      0.18,   // Hover states, small transitions
  base:      0.28,   // Card reveals, small sections
  medium:    0.42,   // Page sections, modals
  slow:      0.55,   // Hero reveals, large sections
  cinematic: 0.70,   // Opening sequences
};

// ── Shared Framer Motion variants ──────────────────────────────

/** Standard fade-up — use for most content reveals */
export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: dur.slow, ease: ease.out },
  },
};

/** Subtle fade-up — for dense content, secondary elements */
export const fadeUpSm = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: dur.base, ease: ease.out },
  },
};

/** Pure fade — for overlays, backgrounds */
export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: dur.medium, ease: ease.inOut },
  },
};

/** Scale in — for cards, modals */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1, scale: 1,
    transition: { duration: dur.medium, ease: ease.out },
  },
};

/** Slide from left */
export const slideLeft = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1, x: 0,
    transition: { duration: dur.medium, ease: ease.out },
  },
};

/** Slide from right */
export const slideRight = {
  hidden: { opacity: 0, x: 16 },
  show: {
    opacity: 1, x: 0,
    transition: { duration: dur.medium, ease: ease.out },
  },
};

/** Stagger container — wraps staggered children */
export const staggerContainer = (staggerChildren = 0.07, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

/** Page transition — very subtle, just opacity + tiny y */
export const pageTransition = {
  initial: { opacity: 0, y: 5 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.22, ease: ease.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.14, ease: [0.4, 0, 1, 1] },
  },
};

// ── Hover/tap presets for motion.* elements ────────────────────

/** Standard interactive element */
export const hoverTap = {
  whileHover: { scale: 1.02 },
  whileTap:   { scale: 0.97 },
  transition: { duration: dur.micro, ease: ease.sharp },
};

/** Subtle list item hover */
export const hoverLift = {
  whileHover: { y: -2 },
  transition: { duration: dur.fast, ease: ease.out },
};

/** Card hover */
export const hoverCard = {
  whileHover: { y: -3, transition: { duration: dur.fast, ease: ease.out } },
  whileTap:   { scale: 0.99 },
};
