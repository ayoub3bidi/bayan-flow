/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SortingScene from './SortingScene.jsx';
import { withElementIds } from '../utils/elementIds.js';

vi.mock('../constants/index.js', async importOriginal => importOriginal());

let currentFrame = 0;

vi.mock('remotion', () => ({
  useCurrentFrame: () => currentFrame,
  useVideoConfig: () => ({ width: 1920, height: 1080 }),
  // Linear stand-in: the real easing only reshapes progress between 0 and 1.
  interpolate: (value, [from, to], [a, b]) =>
    a +
    ((b - a) * Math.min(Math.max(value - from, 0), to - from)) / (to - from),
  Easing: { inOut: fn => fn, ease: t => t },
}));

const FRAMES = 10;

function renderAt(frame, steps, props = {}) {
  currentFrame = frame;
  const utils = render(
    <SortingScene steps={steps} framesPerStep={FRAMES} {...props} />
  );
  const bars = [
    ...utils.container.querySelectorAll('[data-testid="video-bar"]'),
  ];
  const slotOf = value =>
    Number(
      bars.find(b => b.textContent === String(value))?.getAttribute('data-slot')
    );
  return { ...utils, bars, slotOf };
}

const swapSteps = withElementIds([
  { array: [30, 10, 20], states: ['default', 'default', 'default'] },
  { array: [10, 30, 20], states: ['swapping', 'swapping', 'default'] },
]);

describe('SortingScene (bars, default)', () => {
  it('renders one bar per element scaled to the run max', () => {
    const { bars } = renderAt(0, swapSteps);
    expect(bars).toHaveLength(3);
    expect(bars[0].style.height).toBe('100%');
    expect(bars[1].style.height).toBe(`${(10 / 30) * 100}%`);
  });

  it('slides swapped bars from their old slot to the new one', () => {
    // Step 1 starts at frame 10; bars move during the first 40% (4 frames).
    expect(renderAt(10, swapSteps).slotOf(30)).toBe(0);
    expect(renderAt(12, swapSteps).slotOf(30)).toBe(0.5);
    expect(renderAt(12, swapSteps).slotOf(10)).toBe(0.5);
    expect(renderAt(14, swapSteps).slotOf(30)).toBe(1);
    expect(renderAt(19, swapSteps).slotOf(10)).toBe(0);
    // The untouched element never moves.
    expect(renderAt(12, swapSteps).slotOf(20)).toBe(2);
  });

  it('resizes in place for overwrite steps', () => {
    const steps = withElementIds([
      { array: [10, 40], states: ['default', 'default'] },
      { array: [30, 40], states: ['comparing', 'default'] },
    ]);
    const { bars } = renderAt(12, steps);
    // 10 → 30 halfway = 20 of max 40.
    expect(bars[0].style.height).toBe('50%');
    expect(bars[0].getAttribute('data-slot')).toBe('0');
  });

  it('works without ids (array searching) and rings the target', () => {
    const steps = [
      { array: [5, 9], states: ['default', 'comparing'], targetValue: 9 },
      { array: [5, 9], states: ['default', 'sorted'], targetValue: 9 },
    ];
    const { bars } = renderAt(12, steps);
    expect(bars.map(b => b.getAttribute('data-slot'))).toEqual(['0', '1']);
    expect(bars[1].style.boxShadow).toContain('234, 88, 12');
  });

  it('hides labels above 25 bars', () => {
    const steps = [
      {
        array: Array.from({ length: 26 }, (_, i) => i + 1),
        states: [],
      },
    ];
    const { bars } = renderAt(0, steps);
    expect(bars[0].textContent).toBe('');
  });
});

describe('SortingScene (boxes)', () => {
  it('keeps the numbered box layout', () => {
    const { container, bars } = renderAt(0, swapSteps, { arrayView: 'boxes' });
    expect(bars).toHaveLength(0);
    expect(container.textContent).toContain('30');
    expect(container.textContent).toContain('10');
  });
});
