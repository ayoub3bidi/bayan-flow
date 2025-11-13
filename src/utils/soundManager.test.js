/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundManager } from './soundManager';

// Mock Tone.js
vi.mock('tone', () => ({
  Synth: vi.fn(() => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
  })),
  PluckSynth: vi.fn(() => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
  })),
  MetalSynth: vi.fn(() => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
  })),
  PolySynth: vi.fn(() => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
  })),
  MembraneSynth: vi.fn(() => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
  })),
  context: {
    state: 'suspended',
  },
  start: vi.fn().mockResolvedValue(undefined),
  now: vi.fn(() => 0),
}));

describe('SoundManager', () => {
  beforeEach(() => {
    soundManager.disable();
    vi.clearAllMocks();
  });

  describe('enable/disable functionality', () => {
    it('should start disabled by default', () => {
      expect(soundManager.isEnabled).toBe(false);
    });

    it('should enable sound when enable() is called', async () => {
      await soundManager.enable();
      expect(soundManager.isEnabled).toBe(true);
    });

    it('should disable sound when disable() is called', () => {
      soundManager.disable();
      expect(soundManager.isEnabled).toBe(false);
    });
  });

  describe('sound methods when disabled', () => {
    it('should not trigger sounds when disabled', () => {
      soundManager.disable();

      soundManager.playCompare(50);
      soundManager.playSwap(25);
      soundManager.playPivot(75);
      soundManager.playSorted();
      soundManager.playNodeVisit();
      soundManager.playPathFound();
      soundManager.playUIClick();
      soundManager.playArrayGenerate();

      // Verify no synth methods were called
      expect(
        soundManager.pluckSynth.triggerAttackRelease
      ).not.toHaveBeenCalled();
      expect(
        soundManager.metallicSynth.triggerAttackRelease
      ).not.toHaveBeenCalled();
      expect(
        soundManager.softSynth.triggerAttackRelease
      ).not.toHaveBeenCalled();
      expect(
        soundManager.polySynth.triggerAttackRelease
      ).not.toHaveBeenCalled();
    });
  });

  describe('sound methods when enabled', () => {
    beforeEach(async () => {
      await soundManager.enable();
    });

    it('should play compare sound with correct frequency mapping', () => {
      soundManager.playCompare(50);

      // Frequency should be mapped: 150 + ((50 - 5) / 95) * 200 ≈ 244.7Hz
      const expectedFreq = 150 + ((50 - 5) / 95) * 200;
      expect(soundManager.pluckSynth.triggerAttackRelease).toHaveBeenCalledWith(
        expectedFreq,
        '16n'
      );
    });

    it('should play swap sound', () => {
      soundManager.playSwap(25);

      expect(
        soundManager.metallicSynth.triggerAttackRelease
      ).toHaveBeenCalledWith('32n');
    });

    it('should play pivot sound with correct frequency mapping', () => {
      soundManager.playPivot(75);

      // Frequency should be mapped: 100 + ((75 - 5) / 95) * 100 ≈ 173.7Hz
      const expectedFreq = 100 + ((75 - 5) / 95) * 100;
      expect(soundManager.softSynth.triggerAttackRelease).toHaveBeenCalledWith(
        expectedFreq,
        '8n'
      );
    });

    it('should play sorted chord', () => {
      soundManager.playSorted();

      expect(soundManager.polySynth.triggerAttackRelease).toHaveBeenCalledWith(
        ['C4', 'E4', 'G4'],
        '2n',
        0
      );
    });

    it('should play node visit sound', () => {
      soundManager.playNodeVisit();

      expect(soundManager.softSynth.triggerAttackRelease).toHaveBeenCalledWith(
        220,
        '64n'
      );
    });

    it('should play path found chord', () => {
      soundManager.playPathFound();

      expect(soundManager.polySynth.triggerAttackRelease).toHaveBeenCalledWith(
        ['C3', 'E3', 'G3', 'C4'],
        '1n',
        0
      );
    });

    it('should play UI click sound', () => {
      soundManager.playUIClick();

      expect(soundManager.softSynth.triggerAttackRelease).toHaveBeenCalledWith(
        'G4',
        '64n'
      );
    });

    it('should play array generate sound', () => {
      soundManager.playArrayGenerate();

      expect(soundManager.softSynth.triggerAttackRelease).toHaveBeenCalledWith(
        'C4',
        '8n'
      );
    });
  });
});
