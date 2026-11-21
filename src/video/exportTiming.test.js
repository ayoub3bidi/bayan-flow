/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  getExportTiming,
  MAX_EXPORT_SECONDS,
  MIN_EXPORT_FRAMES_PER_STEP,
  VIDEO_EXPORT_FRAMES_PER_STEP,
} from './constants';

describe('getExportTiming', () => {
  it('keeps the comfortable pace for short runs', () => {
    expect(getExportTiming(20)).toEqual({
      framesPerStep: VIDEO_EXPORT_FRAMES_PER_STEP,
      durationSec: 35,
      exceedsLimit: false,
    });
  });

  it('speeds up long runs to fit the limit', () => {
    const timing = getExportTiming(1000);
    expect(timing.framesPerStep).toBeLessThan(VIDEO_EXPORT_FRAMES_PER_STEP);
    expect(timing.framesPerStep).toBeGreaterThanOrEqual(
      MIN_EXPORT_FRAMES_PER_STEP
    );
    expect(timing.durationSec).toBeLessThanOrEqual(MAX_EXPORT_SECONDS);
    expect(timing.exceedsLimit).toBe(false);
  });

  it('allows the longest run that fits at the fastest pace', () => {
    expect(getExportTiming(2975)).toMatchObject({
      framesPerStep: MIN_EXPORT_FRAMES_PER_STEP,
      durationSec: MAX_EXPORT_SECONDS,
      exceedsLimit: false,
    });
  });

  it('flags runs too long even at the fastest pace', () => {
    expect(getExportTiming(2976).exceedsLimit).toBe(true);
    expect(getExportTiming(10001).exceedsLimit).toBe(true);
  });

  it('handles empty input', () => {
    expect(getExportTiming(0)).toMatchObject({
      framesPerStep: VIDEO_EXPORT_FRAMES_PER_STEP,
      exceedsLimit: false,
    });
  });
});
