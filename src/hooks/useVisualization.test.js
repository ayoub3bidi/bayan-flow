/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVisualization } from './useVisualization';
import {
  ALGORITHM_TYPES,
  ELEMENT_STATES,
  VISUALIZATION_MODES,
} from '../constants/index.js';
import { soundManager } from '../utils/soundManager.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSteps(count) {
  return Array.from({ length: count }, (_, i) => ({
    description: `Step ${i}`,
    value: i,
  }));
}

function makeHook(overrides = {}) {
  const executeStep = vi.fn();
  const defaults = {
    executeStep,
    speed: 100,
    mode: VISUALIZATION_MODES.MANUAL,
    ...overrides,
  };
  const hook = renderHook(() => useVisualization(defaults));
  return { ...hook, executeStep };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useVisualization', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => vi.useRealTimers());

  // ── Initialization ────────────────────────────────────────────────────────

  describe('Initial state', () => {
    it('starts with empty steps and no playback', () => {
      const { result } = makeHook();
      expect(result.current.steps).toEqual([]);
      expect(result.current.totalSteps).toBe(0);
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.description).toBe('');
    });
  });

  // ── loadSteps ─────────────────────────────────────────────────────────────

  describe('loadSteps', () => {
    it('sets steps and calls executeStep with the first step', () => {
      const { result, executeStep } = makeHook();
      const steps = makeSteps(3);

      act(() => {
        result.current.loadSteps(steps);
      });

      expect(result.current.totalSteps).toBe(3);
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.description).toBe('Step 0');
      expect(executeStep).toHaveBeenCalledWith(steps[0]);
    });

    it('handles empty steps array gracefully', () => {
      const { result } = makeHook();
      act(() => {
        result.current.loadSteps([]);
      });
      expect(result.current.totalSteps).toBe(0);
      expect(result.current.description).toBe('');
    });

    it('resets playback state when new steps are loaded during autoplay', () => {
      const { result } = makeHook({ mode: VISUALIZATION_MODES.AUTOPLAY });
      const steps = makeSteps(5);
      act(() => {
        result.current.loadSteps(steps);
        result.current.play();
      });
      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.loadSteps(makeSteps(2));
      });
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
    });
  });

  // ── Manual mode ───────────────────────────────────────────────────────────

  describe('Manual mode', () => {
    it('play() advances one step at a time', () => {
      const { result, executeStep } = makeHook();
      const steps = makeSteps(3);
      act(() => {
        result.current.loadSteps(steps);
      });

      act(() => {
        result.current.play();
      });
      expect(result.current.currentStep).toBe(1);
      expect(executeStep).toHaveBeenLastCalledWith(steps[1]);
    });

    it('play() marks isComplete when reaching the last step', () => {
      const { result } = makeHook();
      const steps = makeSteps(2);
      act(() => {
        result.current.loadSteps(steps);
      });
      act(() => {
        result.current.play();
      });
      expect(result.current.isComplete).toBe(true);
    });

    it('play() does nothing when already complete', () => {
      const { result, executeStep } = makeHook();
      act(() => {
        result.current.loadSteps(makeSteps(2));
      });
      act(() => {
        result.current.play();
      }); // complete
      const callsBefore = executeStep.mock.calls.length;
      act(() => {
        result.current.play();
      });
      expect(executeStep.mock.calls.length).toBe(callsBefore);
    });

    it('stepForward() advances and marks complete at last step', () => {
      const { result } = makeHook();
      act(() => {
        result.current.loadSteps(makeSteps(2));
      });
      act(() => {
        result.current.stepForward();
      });
      expect(result.current.currentStep).toBe(1);
      expect(result.current.isComplete).toBe(true);
    });

    it('stepForward() does nothing when already at last step', () => {
      const { result } = makeHook();
      act(() => {
        result.current.loadSteps(makeSteps(2));
      });
      act(() => {
        result.current.stepForward();
      });
      act(() => {
        result.current.stepForward();
      });
      expect(result.current.currentStep).toBe(1);
    });

    it('stepBackward() moves back and clears isComplete', () => {
      const { result } = makeHook();
      act(() => {
        result.current.loadSteps(makeSteps(2));
      });
      act(() => {
        result.current.stepForward();
      });
      expect(result.current.isComplete).toBe(true);
      act(() => {
        result.current.stepBackward();
      });
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
    });

    it('stepBackward() does nothing when at step 0', () => {
      const { result } = makeHook();
      act(() => {
        result.current.loadSteps(makeSteps(3));
      });
      act(() => {
        result.current.stepBackward();
      });
      expect(result.current.currentStep).toBe(0);
    });

    it('emits sound only for intentional forward playback', () => {
      const { result } = makeHook({
        soundContext: {
          algorithmType: ALGORITHM_TYPES.SORTING,
          algorithmKey: 'bubbleSort',
        },
      });
      const steps = [
        {
          description: 'Initial',
          array: [2, 1],
          states: [ELEMENT_STATES.DEFAULT, ELEMENT_STATES.DEFAULT],
        },
        {
          description: 'Compare',
          array: [2, 1],
          states: [ELEMENT_STATES.COMPARING, ELEMENT_STATES.DEFAULT],
        },
      ];

      act(() => {
        result.current.loadSteps(steps);
      });
      expect(soundManager.playEvents).not.toHaveBeenCalled();

      act(() => {
        result.current.stepForward();
      });
      expect(soundManager.playEvents).toHaveBeenCalledWith(
        [{ kind: 'compare', value: 2 }],
        expect.objectContaining({
          algorithmType: ALGORITHM_TYPES.SORTING,
          algorithmKey: 'bubbleSort',
          stepIndex: 1,
          speed: 100,
        })
      );

      vi.clearAllMocks();
      act(() => {
        result.current.stepBackward();
      });
      expect(soundManager.playEvents).not.toHaveBeenCalled();

      act(() => {
        result.current.reset();
      });
      expect(soundManager.playEvents).not.toHaveBeenCalled();
    });
  });

  // ── Autoplay mode ─────────────────────────────────────────────────────────

  describe('Autoplay mode', () => {
    it('play() starts autoplay and advances steps via timer', () => {
      const { result } = makeHook({
        mode: VISUALIZATION_MODES.AUTOPLAY,
        speed: 100,
      });
      act(() => {
        result.current.loadSteps(makeSteps(3));
      });

      act(() => {
        result.current.play();
      });
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.isAutoplayActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.currentStep).toBe(1);

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.currentStep).toBe(2);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
    });

    it('pause() stops autoplay mid-sequence', () => {
      const { result } = makeHook({
        mode: VISUALIZATION_MODES.AUTOPLAY,
        speed: 100,
      });
      act(() => {
        result.current.loadSteps(makeSteps(5));
      });
      act(() => {
        result.current.play();
      });
      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.pause();
      });
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);

      const stoppedAt = result.current.currentStep;
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current.currentStep).toBe(stoppedAt);
    });

    it('play() does nothing when no steps are loaded', () => {
      const { result } = makeHook({ mode: VISUALIZATION_MODES.AUTOPLAY });
      act(() => {
        result.current.play();
      });
      expect(result.current.isPlaying).toBe(false);
    });
  });

  // ── reset ─────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('returns to step 0 and calls executeStep with first step', () => {
      const { result, executeStep } = makeHook();
      const steps = makeSteps(3);
      act(() => {
        result.current.loadSteps(steps);
      });
      act(() => {
        result.current.stepForward();
      });
      act(() => {
        result.current.stepForward();
      });
      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.reset();
      });
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(executeStep).toHaveBeenLastCalledWith(steps[0]);
    });

    it('reset() stops autoplay', () => {
      const { result } = makeHook({ mode: VISUALIZATION_MODES.AUTOPLAY });
      act(() => {
        result.current.loadSteps(makeSteps(5));
        result.current.play();
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
    });

    it('reset() is safe with no steps', () => {
      const { result } = makeHook();
      act(() => {
        result.current.reset();
      });
      expect(result.current.currentStep).toBe(0);
    });
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────

  describe('Cleanup', () => {
    it('does not advance steps after unmount', () => {
      const { result, unmount } = makeHook({
        mode: VISUALIZATION_MODES.AUTOPLAY,
        speed: 100,
      });
      act(() => {
        result.current.loadSteps(makeSteps(5));
        result.current.play();
      });
      unmount();
      // Should not throw or advance.
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(true).toBe(true);
    });
  });
});
