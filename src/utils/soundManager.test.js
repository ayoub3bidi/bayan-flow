/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SOUND_EVENT_KINDS } from './soundEvents.js';

vi.unmock('./soundManager.js');

describe('soundManager', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('exposes the current enabled state through getIsEnabled()', async () => {
    const { soundManager } = await import('./soundManager.js');

    expect(soundManager.getIsEnabled()).toBe(false);

    await soundManager.enable();
    expect(soundManager.getIsEnabled()).toBe(true);

    soundManager.disable();
    expect(soundManager.getIsEnabled()).toBe(false);
  });

  it('creates Tone instruments lazily only when sound is enabled', async () => {
    const { soundManager } = await import('./soundManager.js');
    const Tone = await import('tone');

    expect(Tone.Synth).not.toHaveBeenCalled();

    soundManager.playEvents([{ kind: SOUND_EVENT_KINDS.VISIT }]);
    expect(Tone.Synth).not.toHaveBeenCalled();

    await soundManager.enable();
    expect(Tone.Synth).toHaveBeenCalled();
  });

  it('deduplicates noisy event batches and ignores unknown events', async () => {
    const { soundManager } = await import('./soundManager.js');
    await soundManager.enable();

    const instruments = soundManager.ensureInstruments();
    vi.clearAllMocks();

    soundManager.playEvents([
      { kind: SOUND_EVENT_KINDS.COMPARE, value: 10 },
      { kind: SOUND_EVENT_KINDS.COMPARE, value: 90 },
      { kind: SOUND_EVENT_KINDS.SWAP },
      { kind: SOUND_EVENT_KINDS.PIVOT, value: 30 },
      { kind: SOUND_EVENT_KINDS.PATH_FOUND },
      { kind: 'unknown' },
    ]);

    expect(instruments.pluckSynth.triggerAttackRelease).toHaveBeenCalledTimes(
      1
    );
    expect(
      instruments.metallicSynth.triggerAttackRelease
    ).toHaveBeenCalledTimes(1);
    expect(instruments.softSynth.triggerAttackRelease).toHaveBeenCalledTimes(1);
    expect(instruments.polySynth.triggerAttackRelease).not.toHaveBeenCalled();
  });
});
