// @vitest-environment node
/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { encodeWav, mixExportSoundCues } from './mixExportAudio.js';

// 10 samples per frame keeps offsets easy to read.
const FPS = 10;
const RATE = 100;
const ones = n => [new Float32Array(n).fill(1), new Float32Array(n).fill(1)];

function mix(
  cues,
  { framesPerStep = 45, mainDurationInFrames = 200, volume = 1 } = {}
) {
  return mixExportSoundCues({
    cues,
    clips: { compare: ones(10_000), complete: ones(10_000) },
    framesPerStep,
    mainDurationInFrames,
    fps: FPS,
    sampleRate: RATE,
    volume,
  });
}

/** [first, last] sample index that is non-zero in the left channel. */
function span(channel) {
  const first = channel.findIndex(v => v !== 0);
  const last = channel.findLastIndex(v => v !== 0);
  return [first, last];
}

describe('mixExportSoundCues', () => {
  it('covers the main segment with one buffer per stereo channel', () => {
    const out = mix([]);
    expect(out).toHaveLength(2);
    expect(out[0]).toHaveLength(200 * (RATE / FPS));
  });

  it('places a cue at its frame and plays its full clip at the normal pace', () => {
    const [left, right] = mix([{ fromFrame: 3, kind: 'compare' }]);
    // compare = 14 frames → samples 30..169
    expect(span(left)).toEqual([30, 169]);
    expect(span(right)).toEqual([30, 169]);
  });

  it('trims per-step cues to one step at fast paces', () => {
    const [left] = mix([{ fromFrame: 0, kind: 'compare' }], {
      framesPerStep: 6,
    });
    expect(span(left)).toEqual([0, 59]);
  });

  it('keeps milestone cues at full length at fast paces', () => {
    const [left] = mix([{ fromFrame: 0, kind: 'complete' }], {
      framesPerStep: 6,
    });
    // complete = 80 frames
    expect(span(left)).toEqual([0, 799]);
  });

  it('never writes past the main segment', () => {
    const [left] = mix(
      [
        { fromFrame: 190, kind: 'complete' },
        { fromFrame: 200, kind: 'compare' },
      ],
      { mainDurationInFrames: 200 }
    );
    expect(left).toHaveLength(2000);
    expect(span(left)).toEqual([1900, 1999]);
  });

  it('applies volume and sums overlapping cues', () => {
    const [left] = mix(
      [
        { fromFrame: 0, kind: 'compare' },
        { fromFrame: 0, kind: 'complete' },
      ],
      { volume: 0.5 }
    );
    expect(left[0]).toBeCloseTo(1);
    expect(left[500]).toBeCloseTo(0.5);
  });

  it('skips cues whose sound is missing', () => {
    const [left] = mix([{ fromFrame: 0, kind: 'swap' }]);
    expect(span(left)).toEqual([-1, -1]);
  });
});

describe('encodeWav', () => {
  it('writes a 16-bit PCM stereo header and clamps samples', async () => {
    const left = new Float32Array([0, 0.5, 2]);
    const right = new Float32Array([0, -0.5, -2]);
    const blob = encodeWav([left, right], 48000);
    const view = new DataView(await blob.arrayBuffer());
    const ascii = (o, n) =>
      String.fromCharCode(
        ...Array.from({ length: n }, (_, i) => view.getUint8(o + i))
      );

    expect(blob.type).toBe('audio/wav');
    expect(blob.size).toBe(44 + 3 * 2 * 2);
    expect(ascii(0, 4)).toBe('RIFF');
    expect(ascii(8, 4)).toBe('WAVE');
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(24, true)).toBe(48000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(ascii(36, 4)).toBe('data');
    expect(view.getUint32(40, true)).toBe(12);
    // Interleaved L/R: second frame, then the clamped third frame.
    expect(view.getInt16(48, true)).toBe(Math.trunc(0.5 * 0x7fff));
    expect(view.getInt16(50, true)).toBe(-0.5 * 0x8000);
    expect(view.getInt16(52, true)).toBe(0x7fff);
    expect(view.getInt16(54, true)).toBe(-0x8000);
  });
});
