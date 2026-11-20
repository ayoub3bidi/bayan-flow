/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ExportAudioTracks from './ExportAudioTracks';
import { ALGORITHM_TYPES, ELEMENT_STATES } from '../constants';

vi.mock('@remotion/media', () => ({
  Audio: ({ src }) => <span data-src={src} />,
}));

vi.mock('remotion', () => ({
  staticFile: p => p,
  Sequence: ({ children, from, durationInFrames }) => (
    <div data-testid="cue" data-from={from} data-duration={durationInFrames}>
      {children}
    </div>
  ),
}));

const compare = [ELEMENT_STATES.COMPARING, ELEMENT_STATES.DEFAULT];
const sorted = [ELEMENT_STATES.SORTED, ELEMENT_STATES.SORTED];
const steps = [
  { array: [2, 1], states: compare },
  { array: [1, 2], states: sorted },
];

function cueDurations(framesPerStep) {
  const { getAllByTestId } = render(
    <ExportAudioTracks
      enabled
      algorithmType={ALGORITHM_TYPES.SORTING}
      algorithmKey="bubbleSort"
      steps={steps}
      framesPerStep={framesPerStep}
      mainDurationInFrames={1000}
    />
  );
  return getAllByTestId('cue').map(el => Number(el.dataset.duration));
}

describe('ExportAudioTracks', () => {
  it('plays full clips at the normal pace', () => {
    expect(cueDurations(45)).toEqual([14, 80]);
  });

  it('trims per-step cues to one step at fast paces but keeps milestones', () => {
    expect(cueDurations(6)).toEqual([6, 80]);
  });
});
