/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PathfindingScene from './PathfindingScene.jsx';
import { GRID_STATE_COLORS } from '../constants/index.js';

vi.mock('../constants/index.js', async importOriginal => importOriginal());

let currentFrame = 0;

vi.mock('remotion', () => ({
  useCurrentFrame: () => currentFrame,
  useVideoConfig: () => ({ width: 1920, height: 1080 }),
  interpolate: (value, [from, to], [a, b]) =>
    a +
    ((b - a) * Math.min(Math.max(value - from, 0), to - from)) / (to - from),
  interpolateColors: (progress, _range, [from, to]) =>
    progress >= 1 ? to : `mix(${from},${to},${progress.toFixed(2)})`,
}));

const grid = state => [
  ['start', 'default', 'default'],
  ['default', state, 'default'],
  ['default', 'default', 'end'],
];
const steps = [{ states: grid('default') }, { states: grid('closed') }];

function cellFills(frame) {
  currentFrame = frame;
  const { container, unmount } = render(
    <PathfindingScene steps={steps} framesPerStep={10} gridSize={3} />
  );
  const svgs = container.querySelectorAll('svg');
  const fills = [...container.querySelectorAll('rect')].map(r =>
    r.getAttribute('fill')
  );
  unmount();
  return { svgCount: svgs.length, fills };
}

describe('PathfindingScene', () => {
  it('draws the whole grid as one svg with a rect per cell', () => {
    const { svgCount, fills } = cellFills(0);
    expect(svgCount).toBe(1);
    expect(fills).toHaveLength(9);
    expect(fills[0]).toBe(GRID_STATE_COLORS.start);
    expect(fills[8]).toBe(GRID_STATE_COLORS.end);
  });

  it('fades a cell that changes state, then settles on the new colour', () => {
    expect(cellFills(11).fills[4]).toMatch(/^mix\(/);
    expect(cellFills(19).fills[4]).toBe(GRID_STATE_COLORS.closed);
    // Unchanged cells never fade.
    expect(cellFills(11).fills[1]).toBe(GRID_STATE_COLORS.default);
  });
});
