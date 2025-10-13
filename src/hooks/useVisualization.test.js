import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVisualization } from './useVisualization';
import { ELEMENT_STATES, VISUALIZATION_MODES } from '../constants';

describe('useVisualization Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    //! Critical: run all pending timers before cleanup
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const mockSteps = [
    {
      array: [3, 1, 2],
      states: [
        ELEMENT_STATES.DEFAULT,
        ELEMENT_STATES.COMPARING,
        ELEMENT_STATES.DEFAULT,
      ],
      description: 'Initial state',
    },
    {
      array: [1, 3, 2],
      states: [
        ELEMENT_STATES.SORTED,
        ELEMENT_STATES.DEFAULT,
        ELEMENT_STATES.COMPARING,
      ],
      description: 'Step 1',
    },
    {
      array: [1, 2, 3],
      states: [
        ELEMENT_STATES.SORTED,
        ELEMENT_STATES.SORTED,
        ELEMENT_STATES.SORTED,
      ],
      description: 'Final state',
    },
  ];

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.AUTOPLAY)
      );

      expect(result.current.array).toEqual([3, 1, 2]);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
      expect(result.current.currentStep).toBe(0);
      expect(result.current.totalSteps).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.mode).toBe(VISUALIZATION_MODES.AUTOPLAY);
    });

    it('should initialize with manual mode', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.MANUAL)
      );

      expect(result.current.mode).toBe(VISUALIZATION_MODES.MANUAL);
    });
  });

  describe('loadSteps', () => {
    it('should load steps correctly', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
      });

      expect(result.current.totalSteps).toBe(3);
      expect(result.current.array).toEqual([3, 1, 2]);
      expect(result.current.description).toBe('Initial state');
      expect(result.current.currentStep).toBe(0);
    });

    it('should handle empty steps array', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps([]);
      });

      expect(result.current.totalSteps).toBe(0);
    });
  });

  describe('Manual Mode', () => {
    it('should step forward in manual mode', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
      });

      act(() => {
        result.current.play();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.array).toEqual([1, 3, 2]);
      expect(result.current.description).toBe('Step 1');
      expect(result.current.isPlaying).toBe(false);
    });

    it('should not advance beyond last step in manual mode', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
      });

      act(() => {
        result.current.play();
        result.current.play();
      });

      expect(result.current.currentStep).toBe(2);
      expect(result.current.isComplete).toBe(true);

      act(() => {
        result.current.play();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should use stepForward correctly in manual mode', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
      });

      act(() => {
        result.current.stepForward();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.array).toEqual([1, 3, 2]);
    });

    it('should use stepBackward correctly', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.stepForward();
        result.current.stepForward();
      });

      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.stepBackward();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('Autoplay Mode', () => {
    it('should start autoplay correctly', () => {
      const { result, unmount } = renderHook(() =>
        useVisualization([3, 1, 2], 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
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

      // Cleanup
      act(() => {
        result.current.pause();
      });
      unmount();
    });

    it('should pause autoplay correctly', () => {
      const { result, unmount } = renderHook(() =>
        useVisualization([3, 1, 2], 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.play();
      });

      expect(result.current.isAutoplayActive).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);

      unmount();
    });

    it('should pause and resume autoplay', () => {
      const { result, unmount } = renderHook(() =>
        useVisualization([3, 1, 2], 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      // Cleanup
      act(() => {
        result.current.pause();
      });
      unmount();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.stepForward();
        result.current.stepForward();
      });

      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
      expect(result.current.array).toEqual([3, 1, 2]);
      expect(result.current.description).toBe('Initial state');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty array', () => {
      const { result } = renderHook(() =>
        useVisualization([], 500, VISUALIZATION_MODES.AUTOPLAY)
      );

      expect(result.current.array).toEqual([]);
      expect(result.current.totalSteps).toBe(0);
    });

    it('should handle single element array', () => {
      const singleElementSteps = [
        {
          array: [42],
          states: [ELEMENT_STATES.SORTED],
          description: 'Single element',
        },
      ];

      const { result, unmount } = renderHook(() =>
        useVisualization([42], 500, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(singleElementSteps);
      });

      expect(result.current.array).toEqual([42]);
      expect(result.current.totalSteps).toBe(1);

      act(() => {
        result.current.play();
      });

      expect(result.current.isComplete).toBe(true);

      unmount();
    });

    it('should handle play when already complete', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.stepForward();
        result.current.stepForward();
      });

      expect(result.current.isComplete).toBe(true);

      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle stepBackward at beginning', () => {
      const { result } = renderHook(() =>
        useVisualization([3, 1, 2], 500, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
      });

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.stepBackward();
      });

      expect(result.current.currentStep).toBe(0);
    });
  });
});
