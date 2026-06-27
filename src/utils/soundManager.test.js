/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SOUND_EVENT_KINDS } from './soundEvents.js';

vi.unmock('./soundManager.js');

const createChainableMock = () => ({
  connect: vi.fn().mockReturnThis(),
  chain: vi.fn().mockReturnThis(),
  toDestination: vi.fn().mockReturnThis(),
  triggerAttackRelease: vi.fn(),
  volume: { value: 0 },
});

const sharedTone = { now: () => 0 };

vi.mock('./masterChain.js', () => ({
  createMasterChain: vi.fn(async () => ({
    input: createChainableMock(),
  })),
  _Tone: sharedTone,
  getTone: vi.fn(async () => {
    if (!sharedTone.Synth) {
      const Tone = await import('tone');
      Object.assign(sharedTone, Tone);
    }
    return sharedTone;
  }),
}));

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
    expect(Tone.FMSynth).toHaveBeenCalled();
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
    await Promise.resolve();
    await Promise.resolve();

    expect(instruments.pluckSynth.triggerAttackRelease).toHaveBeenCalledTimes(
      1
    );
    expect(instruments.kalimbaSynth.triggerAttackRelease).toHaveBeenCalledTimes(
      1
    );
    expect(instruments.softSynth.triggerAttackRelease).toHaveBeenCalledTimes(1);
    expect(instruments.polySynth.triggerAttackRelease).not.toHaveBeenCalled();
  });

  it('throttles compare events at very fast playback speed', async () => {
    const { soundManager } = await import('./soundManager.js');
    const { ANIMATION_SPEEDS } = await import('../constants/index.js');
    await soundManager.enable();

    const instruments = soundManager.ensureInstruments();
    vi.clearAllMocks();

    soundManager.playEvents([{ kind: SOUND_EVENT_KINDS.COMPARE, value: 42 }], {
      speed: ANIMATION_SPEEDS.VERY_FAST,
      algorithmType: 'sorting',
    });
    soundManager.playEvents([{ kind: SOUND_EVENT_KINDS.COMPARE, value: 42 }], {
      speed: ANIMATION_SPEEDS.VERY_FAST,
      algorithmType: 'sorting',
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(instruments.kalimbaSynth.triggerAttackRelease).toHaveBeenCalledTimes(
      1
    );
  });

  it('uses category instruments and melodic notes for tree visits', async () => {
    const { soundManager } = await import('./soundManager.js');
    const { ALGORITHM_TYPES } = await import('../constants/index.js');
    await soundManager.enable();

    const instruments = soundManager.ensureInstruments();
    vi.clearAllMocks();

    soundManager.playEvents([{ kind: SOUND_EVENT_KINDS.VISIT }], {
      algorithmType: ALGORITHM_TYPES.TREE_TRAVERSAL,
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(instruments.bellSynth.triggerAttackRelease).toHaveBeenCalledWith(
      'D4',
      '8n'
    );
  });

  it('uses kalimba compare for searching array steps', async () => {
    const { soundManager } = await import('./soundManager.js');
    const { ALGORITHM_TYPES } = await import('../constants/index.js');
    await soundManager.enable();

    const instruments = soundManager.ensureInstruments();
    vi.clearAllMocks();

    soundManager.playEvents([{ kind: SOUND_EVENT_KINDS.COMPARE, value: 25 }], {
      algorithmType: ALGORITHM_TYPES.SEARCHING,
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(instruments.kalimbaSynth.triggerAttackRelease).toHaveBeenCalledTimes(
      1
    );
    expect(instruments.pluckSynth.triggerAttackRelease).not.toHaveBeenCalled();
  });

  it('throws when ensureInstruments is called before enable()', async () => {
    const { soundManager } = await import('./soundManager.js');
    expect(() => soundManager.ensureInstruments()).toThrow(
      /Call enable\(\) first/
    );
  });

  it('plays each semantic event kind through the category palette', async () => {
    const { soundManager } = await import('./soundManager.js');
    const { ALGORITHM_TYPES } = await import('../constants/index.js');
    await soundManager.enable();

    const instruments = soundManager.ensureInstruments();
    const cases = [
      { kind: SOUND_EVENT_KINDS.SWAP, synth: 'kalimbaSynth' },
      { kind: SOUND_EVENT_KINDS.PIVOT, synth: 'softSynth', value: 40 },
      { kind: SOUND_EVENT_KINDS.PASS_COMPLETE, synth: 'kalimbaSynth' },
      { kind: SOUND_EVENT_KINDS.COMPLETE, synth: 'polySynth' },
      { kind: SOUND_EVENT_KINDS.PATH_FOUND, synth: 'polySynth' },
      { kind: SOUND_EVENT_KINDS.TARGET_FOUND, synth: 'polySynth' },
      { kind: SOUND_EVENT_KINDS.NO_RESULT, synth: 'polySynth' },
      { kind: SOUND_EVENT_KINDS.EDGE_CONSIDER, synth: 'kalimbaSynth' },
      { kind: SOUND_EVENT_KINDS.EDGE_SELECT, synth: 'kalimbaSynth' },
      { kind: SOUND_EVENT_KINDS.CYCLE, synth: 'polySynth' },
      { kind: SOUND_EVENT_KINDS.MATRIX_CONSIDER, synth: 'softSynth' },
      { kind: SOUND_EVENT_KINDS.MATRIX_UPDATE, synth: 'kalimbaSynth' },
      { kind: SOUND_EVENT_KINDS.COMPONENT_COMPLETE, synth: 'polySynth' },
      { kind: SOUND_EVENT_KINDS.FRONTIER, synth: 'kalimbaSynth' },
    ];

    for (const { kind, synth, value } of cases) {
      vi.clearAllMocks();
      soundManager.playEvents([{ kind, value }], {
        algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
        algorithmKey: 'kruskalAlgorithm',
        speed: 1000,
      });
      await Promise.resolve();
      await Promise.resolve();
      expect(instruments[synth].triggerAttackRelease).toHaveBeenCalled();
    }
  });

  it('maps legacy sorted alias to complete playback', async () => {
    const { soundManager } = await import('./soundManager.js');
    await soundManager.enable();

    const instruments = soundManager.ensureInstruments();
    vi.clearAllMocks();

    soundManager.playEvents([{ kind: 'sorted' }], {
      algorithmType: 'sorting',
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(instruments.polySynth.triggerAttackRelease).toHaveBeenCalled();
  });

  it('does not play when sound is disabled', async () => {
    const { soundManager } = await import('./soundManager.js');
    const Tone = await import('tone');
    vi.clearAllMocks();

    soundManager.playEvents([{ kind: SOUND_EVENT_KINDS.SWAP }]);
    await Promise.resolve();

    expect(Tone.Synth).not.toHaveBeenCalled();
  });
});
