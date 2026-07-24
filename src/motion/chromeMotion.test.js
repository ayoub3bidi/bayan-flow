/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  CHROME_DURATION,
  CHROME_DURATION_FAST,
  CHROME_EASE,
  drawerPanelVariants,
  sheetPanelVariants,
  getChromeTransition,
  fadeOverlayTransition,
  modalPanelInitial,
  menuInitial,
  marketingEnter,
  OVERLAY_CLASS,
  COMPLETION_OVERLAY_CLASS,
} from './chromeMotion';

describe('chromeMotion', () => {
  it('returns zero-duration transition when reduceMotion is true', () => {
    expect(getChromeTransition(true)).toEqual({ duration: 0 });
    expect(getChromeTransition(true, 0.5)).toEqual({ duration: 0 });
    expect(fadeOverlayTransition(true)).toEqual({ duration: 0 });
  });

  it('returns tween transition when reduceMotion is false', () => {
    expect(getChromeTransition(false)).toEqual({
      duration: CHROME_DURATION,
      ease: CHROME_EASE,
    });
    expect(getChromeTransition(false, CHROME_DURATION_FAST)).toEqual({
      duration: CHROME_DURATION_FAST,
      ease: CHROME_EASE,
    });
  });

  it('drawer and sheet variants use transform only (no opacity)', () => {
    const drawer = drawerPanelVariants(false);
    const sheet = sheetPanelVariants();
    for (const state of ['hidden', 'visible', 'exit']) {
      expect(drawer[state]).not.toHaveProperty('opacity');
      expect(sheet[state]).not.toHaveProperty('opacity');
    }
    expect(drawer.hidden.x).toBe('100%');
    expect(drawerPanelVariants(true).hidden.x).toBe('-100%');
    expect(sheet.hidden.y).toBe('100%');
  });

  it('modal and menu reduced-motion initials skip offset', () => {
    expect(modalPanelInitial(true)).toEqual({
      opacity: 1,
      scale: 1,
      y: 0,
    });
    expect(menuInitial(true)).toEqual({ opacity: 1, y: 0 });
  });

  it('marketingEnter respects reduced motion', () => {
    const reduced = marketingEnter(true, 0.2);
    expect(reduced.transition).toEqual({ duration: 0 });
    expect(reduced.initial).toEqual({ opacity: 1, y: 0 });

    const full = marketingEnter(false, 0.1);
    expect(full.transition.delay).toBe(0.1);
    expect(full.transition.duration).toBeGreaterThan(0);
    expect(full.initial.y).toBeGreaterThan(0);
  });

  it('exports solid overlay classnames without blur', () => {
    expect(OVERLAY_CLASS).not.toMatch(/blur/);
    expect(COMPLETION_OVERLAY_CLASS).not.toMatch(/blur/);
  });
});
