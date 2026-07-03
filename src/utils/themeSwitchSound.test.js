/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  playThemeSwitchSound,
  resetThemeSwitchSoundForTests,
} from './themeSwitchSound';

describe('themeSwitchSound', () => {
  let startMock;
  let sourceInstances;
  let decodeAudioDataMock;

  beforeEach(() => {
    sourceInstances = [];
    startMock = vi.fn();
    decodeAudioDataMock = vi.fn(async () => ({
      numberOfChannels: 1,
      length: 4,
      sampleRate: 48000,
      getChannelData: () => Float32Array.from([0.1, 0.2, 0.3, 0.4]),
    }));

    class MockAudioContext {
      state = 'running';

      createBufferSource() {
        const source = {
          buffer: null,
          playbackRate: { value: 1 },
          connect: vi.fn(),
          start: startMock,
        };
        sourceInstances.push(source);
        return source;
      }

      createGain() {
        return {
          gain: { value: 1 },
          connect: vi.fn(),
        };
      }

      createBuffer(channels, length, sampleRate) {
        return {
          numberOfChannels: channels,
          length,
          sampleRate,
          getChannelData: () => new Float32Array(length),
        };
      }

      decodeAudioData = decodeAudioDataMock;

      resume = vi.fn(async () => {
        this.state = 'running';
      });

      get destination() {
        return {};
      }
    }

    window.AudioContext = MockAudioContext;
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    global.fetch = vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    }));
  });

  afterEach(() => {
    resetThemeSwitchSoundForTests();
    vi.restoreAllMocks();
  });

  it('plays the forward clip when switching to light mode', async () => {
    await playThemeSwitchSound('light');

    expect(fetch).toHaveBeenCalledWith('/ui/sfx/switch-on.mp3');
    expect(decodeAudioDataMock).toHaveBeenCalledTimes(1);
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(sourceInstances[0].playbackRate.value).toBe(1);
  });

  it('plays the reversed clip at a lower rate when switching to dark mode', async () => {
    await playThemeSwitchSound('dark');

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(sourceInstances[0].playbackRate.value).toBe(0.82);
  });

  it('skips playback when reduced motion is preferred', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    await playThemeSwitchSound('light');

    expect(fetch).not.toHaveBeenCalled();
    expect(startMock).not.toHaveBeenCalled();
  });
});
