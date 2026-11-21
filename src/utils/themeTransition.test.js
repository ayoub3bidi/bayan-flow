/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWaveRings, runThemeTransition } from './themeTransition';

describe('getWaveRings', () => {
  it('assigns BFS depth from the origin tile', () => {
    const { rings, maxRing } = getWaveRings(4, 3, 1, 1);
    expect(rings[1 * 4 + 1]).toBe(0);
    expect(rings[0]).toBe(2);
    expect(rings[2 * 4 + 3]).toBe(3);
    expect(maxRing).toBe(3);
  });

  it('changes by exactly one between horizontal and vertical neighbours', () => {
    const cols = 6;
    const rows = 5;
    const { rings } = getWaveRings(cols, rows, 4, 0);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const here = rings[row * cols + col];
        expect(Math.abs(here - rings[row * cols + col + 1])).toBe(1);
        if (row < rows - 1) {
          expect(Math.abs(here - rings[(row + 1) * cols + col])).toBe(1);
        }
      }
    }
  });
});

describe('runThemeTransition', () => {
  let originalMatchMedia;
  const setReducedMotion = matches => {
    window.matchMedia = vi.fn(media => ({ matches, media }));
  };

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    setReducedMotion(false);
    delete document.startViewTransition;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    delete document.startViewTransition;
    document.documentElement.classList.remove('theme-transitioning');
  });

  it('applies the change immediately when View Transitions are unsupported', () => {
    const applyChange = vi.fn();
    runThemeTransition({ x: 10, y: 10 }, applyChange);
    expect(applyChange).toHaveBeenCalledTimes(1);
  });

  it('applies the change immediately when reduced motion is preferred', () => {
    const startViewTransition = vi.fn();
    document.startViewTransition = startViewTransition;
    setReducedMotion(true);
    const applyChange = vi.fn();

    runThemeTransition({ x: 10, y: 10 }, applyChange);

    expect(applyChange).toHaveBeenCalledTimes(1);
    expect(startViewTransition).not.toHaveBeenCalled();
  });

  it('runs the change inside a view transition and cleans up afterwards', async () => {
    let finish;
    const finished = new Promise(resolve => {
      finish = resolve;
    });
    document.startViewTransition = vi.fn(callback => {
      callback();
      return {
        ready: new Promise(() => {}),
        finished,
        skipTransition: vi.fn(),
      };
    });
    const applyChange = vi.fn();
    const maskStyle = () =>
      [...document.head.querySelectorAll('style')].find(style =>
        style.textContent.includes('::view-transition-new(root){mask-image')
      );

    runThemeTransition({ x: 10, y: 10 }, applyChange);

    expect(applyChange).toHaveBeenCalledTimes(1);
    expect(
      document.documentElement.classList.contains('theme-transitioning')
    ).toBe(true);
    expect(maskStyle()).toBeTruthy();

    finish();

    await vi.waitFor(() => {
      expect(
        document.documentElement.classList.contains('theme-transitioning')
      ).toBe(false);
      expect(maskStyle()).toBeUndefined();
    });
  });
});
