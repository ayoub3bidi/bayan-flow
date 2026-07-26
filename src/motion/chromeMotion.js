/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Shared chrome (non-visualization) motion presets.
 * Drawers, modals, menus, and marketing entrances must import from here —
 * do not invent local spring params for chrome UI.
 */

export const CHROME_EASE = [0.32, 0.72, 0, 1];
export const CHROME_DURATION = 0.28;
export const CHROME_DURATION_FAST = 0.2;
export const CHROME_DURATION_MARKETING = 0.4;
export const ENTER_Y = 12;

/** Solid dim overlay — never pair with backdrop-blur while opacity animates. */
export const OVERLAY_CLASS = 'bg-black/40';
export const OVERLAY_CLASS_LIGHT = 'bg-black/20';
export const COMPLETION_OVERLAY_CLASS = 'bg-black/30';

/**
 * @param {boolean | null | undefined} reduceMotion
 * @param {number} [duration]
 */
export function getChromeTransition(reduceMotion, duration = CHROME_DURATION) {
  if (reduceMotion) {
    return { duration: 0 };
  }
  return { duration, ease: CHROME_EASE };
}

/**
 * Side drawer variants — transform only (no opacity).
 * @param {boolean} isRTL
 */
export function drawerPanelVariants(isRTL) {
  const off = isRTL ? '-100%' : '100%';
  return {
    hidden: { x: off },
    visible: { x: 0 },
    exit: { x: off },
  };
}

/** Bottom sheet variants — transform only (no opacity). */
export function sheetPanelVariants() {
  return {
    hidden: { y: '100%' },
    visible: { y: 0 },
    exit: { y: '100%' },
  };
}

/**
 * @param {boolean | null | undefined} reduceMotion
 */
export function fadeOverlayTransition(reduceMotion) {
  return getChromeTransition(reduceMotion, CHROME_DURATION_FAST);
}

/**
 * Modal panel: slight scale + opacity, no spring.
 * @param {boolean | null | undefined} reduceMotion
 */
export function modalPanelTransition(reduceMotion) {
  return getChromeTransition(reduceMotion, CHROME_DURATION);
}

export function modalPanelInitial(reduceMotion) {
  if (reduceMotion) {
    return { opacity: 1, scale: 1, y: 0 };
  }
  return { opacity: 0, scale: 0.98, y: 12 };
}

export function modalPanelAnimate() {
  return { opacity: 1, scale: 1, y: 0 };
}

export function modalPanelExit(reduceMotion) {
  if (reduceMotion) {
    return { opacity: 0 };
  }
  return { opacity: 0, scale: 0.98, y: 12 };
}

/**
 * Dropdown / menu shell.
 * @param {boolean | null | undefined} reduceMotion
 */
export function menuTransition(reduceMotion) {
  return getChromeTransition(reduceMotion, CHROME_DURATION_FAST);
}

export function menuInitial(reduceMotion) {
  if (reduceMotion) {
    return { opacity: 1, y: 0 };
  }
  return { opacity: 0, y: -8 };
}

export function menuAnimate() {
  return { opacity: 1, y: 0 };
}

export function menuExit(reduceMotion) {
  if (reduceMotion) {
    return { opacity: 0 };
  }
  return { opacity: 0, y: -8 };
}

/**
 * Marketing / secondary chrome entrance props for motion components.
 * @param {boolean | null | undefined} reduceMotion
 * @param {number} [delay]
 */
export function marketingEnter(reduceMotion, delay = 0) {
  if (reduceMotion) {
    return {
      initial: { opacity: 1, y: 0 },
      whileInView: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: ENTER_Y },
    whileInView: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: CHROME_DURATION_MARKETING,
      ease: CHROME_EASE,
      delay,
    },
  };
}

/**
 * Banner slide-up (cookie consent).
 * @param {boolean | null | undefined} reduceMotion
 */
export function bannerTransition(reduceMotion) {
  return getChromeTransition(reduceMotion, CHROME_DURATION);
}

export function bannerInitial(reduceMotion) {
  if (reduceMotion) {
    return { y: 0, opacity: 1 };
  }
  return { y: 100, opacity: 0 };
}

export function bannerAnimate() {
  return { y: 0, opacity: 1 };
}

export function bannerExit(reduceMotion) {
  if (reduceMotion) {
    return { opacity: 0 };
  }
  return { y: 100, opacity: 0 };
}

/** Hover spring for FABs / CTAs only — not for enter/exit. */
export const HOVER_SPRING = { type: 'spring', stiffness: 400, damping: 17 };
