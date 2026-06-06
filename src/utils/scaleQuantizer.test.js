/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import {
  C_MAJOR_PENTATONIC,
  midiToFrequency,
  quantizeToScale,
} from './scaleQuantizer.js';
import { getCompareFrequency, getPivotFrequency } from './soundFrequencies.js';

describe('scaleQuantizer', () => {
  it('maps min and max values to the expected pentatonic range', () => {
    expect(quantizeToScale(5)).toBeCloseTo(midiToFrequency(60), 1);
    expect(quantizeToScale(100)).toBeCloseTo(midiToFrequency(81), 1);
  });

  it('always returns frequencies on the C major pentatonic scale', () => {
    const allowedMidis = [];
    for (let octave = 0; octave < 2; octave += 1) {
      for (const degree of C_MAJOR_PENTATONIC) {
        allowedMidis.push(60 + octave * 12 + degree);
      }
    }

    for (let value = 5; value <= 100; value += 7) {
      const freq = quantizeToScale(value);
      const matchesScale = allowedMidis.some(
        midi => Math.abs(freq - midiToFrequency(midi)) < 0.5
      );
      expect(matchesScale).toBe(true);
    }
  });
});

describe('soundFrequencies', () => {
  it('returns pentatonic compare frequencies in the mid register', () => {
    expect(getCompareFrequency(5)).toBeCloseTo(261.63, 1);
    expect(getCompareFrequency(52)).toBeGreaterThan(300);
    expect(getCompareFrequency(100)).toBeCloseTo(880, 0);
  });

  it('returns lower-register pentatonic pivot frequencies', () => {
    expect(getPivotFrequency(5)).toBeCloseTo(130.81, 1);
    expect(getPivotFrequency(100)).toBeLessThan(getCompareFrequency(100));
  });
});
