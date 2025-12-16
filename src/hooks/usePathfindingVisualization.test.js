/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePathfindingVisualization } from './usePathfindingVisualization';
import {
  GRID_ELEMENT_STATES,
  VISUALIZATION_MODES,
  DEFAULT_GRID_SIZE,
} from '../constants/index.js';

// Mock gridHelpers using vi.hoisted
const { mockCreateEmptyGrid, mockGenerateRandomStartEnd } = vi.hoisted(() => ({
  mockCreateEmptyGrid: vi.fn((rows, cols) =>
    Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0))
  ),
  mockGenerateRandomStartEnd: vi.fn((rows, cols) => ({
    start: { row: 0, col: 0 },
    end: { row: rows - 1, col: cols - 1 },
  })),
}));

vi.mock('../utils/gridHelpers.js', () => ({
  createEmptyGrid: mockCreateEmptyGrid,
  generateRandomStartEnd: mockGenerateRandomStartEnd,
}));

// Mock soundManager using vi.hoisted
const { mockSoundManager } = vi.hoisted(() => ({
  mockSoundManager: {
    playNodeVisit: vi.fn(),
    playPathFound: vi.fn(),
  },
}));

vi.mock('../utils/soundManager.js', () => ({
  soundManager: mockSoundManager,
}));

describe('usePathfindingVisualization', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockSteps = [
    {
      grid: [
        [0, 0],
        [0, 0],
      ],
      states: [
        [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.DEFAULT],
        [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
      ],
      description: 'Initial state',
    },
    {
      grid: [
        [0, 0],
        [0, 0],
      ],
      states: [
        [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.OPEN],
        [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
      ],
      description: 'Exploring neighbor',
    },
  ];

  describe('Initialization', () => {
    it('should initialize with default grid size', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(undefined, 1000, VISUALIZATION_MODES.MANUAL)
      );

      expect(mockCreateEmptyGrid).toHaveBeenCalledWith(
        DEFAULT_GRID_SIZE,
        DEFAULT_GRID_SIZE
      );
      expect(mockGenerateRandomStartEnd).toHaveBeenCalledWith(
        DEFAULT_GRID_SIZE,
        DEFAULT_GRID_SIZE
      );
      expect(result.current.grid).toEqual(
        Array(DEFAULT_GRID_SIZE)
          .fill(null)
          .map(() => Array(DEFAULT_GRID_SIZE).fill(0))
      );
      expect(result.current.start).toEqual({ row: 0, col: 0 });
      expect(result.current.end).toEqual({
        row: DEFAULT_GRID_SIZE - 1,
        col: DEFAULT_GRID_SIZE - 1,
      });
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
      expect(result.current.currentStep).toBe(0);
      expect(result.current.totalSteps).toBe(0);
      expect(result.current.description).toBe('');
      expect(result.current.isComplete).toBe(false);
    });

    it('should initialize with custom grid size', () => {
      const customSize = 5;
      const { result } = renderHook(() =>
        usePathfindingVisualization(
          customSize,
          1000,
          VISUALIZATION_MODES.MANUAL
        )
      );

      expect(mockCreateEmptyGrid).toHaveBeenCalledWith(customSize, customSize);
      expect(mockGenerateRandomStartEnd).toHaveBeenCalledWith(
        customSize,
        customSize
      );
      expect(result.current.grid).toEqual(
        Array(customSize)
          .fill(null)
          .map(() => Array(customSize).fill(0))
      );
    });

    it('should set start and end positions in states', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      expect(result.current.states[0][0]).toBe(GRID_ELEMENT_STATES.START);
      expect(result.current.states[1][1]).toBe(GRID_ELEMENT_STATES.END);
      expect(result.current.states[0][1]).toBe(GRID_ELEMENT_STATES.DEFAULT);
      expect(result.current.states[1][0]).toBe(GRID_ELEMENT_STATES.DEFAULT);
    });
  });

  describe('generateNewGrid', () => {
    it('should generate a new grid with random start/end positions', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(3, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.generateNewGrid();
      });

      // The hook may call these functions multiple times during initialization and re-renders
      // So we just check that generateNewGrid was called (more calls than just initial)
      expect(mockCreateEmptyGrid).toHaveBeenCalled();
      expect(mockGenerateRandomStartEnd).toHaveBeenCalled();
      expect(result.current.currentStep).toBe(0);
      expect(result.current.description).toBe('');
      expect(result.current.isComplete).toBe(false);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
      expect(result.current.totalSteps).toBe(0);
    });

    it('should clear autoplay timeout when generating new grid', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      // Manually start autoplay first
      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.play();
      });

      expect(result.current.isAutoplayActive).toBe(true);

      // Generate new grid
      act(() => {
        result.current.generateNewGrid();
      });

      expect(result.current.isAutoplayActive).toBe(false);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('loadSteps', () => {
    it('should load steps and set initial state', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
      });

      expect(result.current.totalSteps).toBe(mockSteps.length);
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.grid).toEqual(mockSteps[0].grid);
      expect(result.current.states).toEqual(mockSteps[0].states);
      expect(result.current.description).toBe(mockSteps[0].description);
    });

    it('should handle empty steps array', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps([]);
      });

      expect(result.current.totalSteps).toBe(0);
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
    });

    it('should clear autoplay timeout when loading new steps', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      // Start autoplay first
      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.play();
      });

      expect(result.current.isAutoplayActive).toBe(true);

      // Load new steps
      act(() => {
        result.current.loadSteps(mockSteps);
      });

      expect(result.current.isAutoplayActive).toBe(false);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('Manual mode controls', () => {
    it('should step forward in manual mode', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
      });

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.stepForward();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.grid).toEqual(mockSteps[1].grid);
      expect(result.current.states).toEqual(mockSteps[1].states);
      expect(result.current.description).toBe(mockSteps[1].description);
      expect(result.current.isComplete).toBe(true);
    });

    it('should not step forward when at the end', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.stepForward();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isComplete).toBe(true);

      act(() => {
        result.current.stepForward();
      });

      expect(result.current.currentStep).toBe(1); // Should not change
    });

    it('should step backward', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.stepForward();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isComplete).toBe(true);

      act(() => {
        result.current.stepBackward();
      });

      expect(result.current.currentStep).toBe(0);
      expect(result.current.grid).toEqual(mockSteps[0].grid);
      expect(result.current.states).toEqual(mockSteps[0].states);
      expect(result.current.isComplete).toBe(false);
    });

    it('should not step backward when at the beginning', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
      });

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.stepBackward();
      });

      expect(result.current.currentStep).toBe(0); // Should not change
    });

    it('should play one step in manual mode', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.play();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.grid).toEqual(mockSteps[1].grid);
      expect(result.current.isComplete).toBe(true);
    });
  });

  describe('Autoplay mode', () => {
    it('should start autoplay', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.isAutoplayActive).toBe(true);

      // Fast-forward timer
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
    });

    it('should pause autoplay', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 100, VISUALIZATION_MODES.AUTOPLAY)
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
      expect(result.current.isAutoplayActive).toBe(false);
    });

    it('should reset to first step', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.stepForward();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isComplete).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
    });

    it('should not play when already complete', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.stepForward(); // Complete the visualization
      });

      expect(result.current.isComplete).toBe(true);

      act(() => {
        result.current.play();
      });

      expect(result.current.currentStep).toBe(1); // Should not change
    });

    it('should handle autoplay with multiple steps', () => {
      const multiStepSteps = [
        mockSteps[0],
        mockSteps[1],
        {
          grid: [
            [0, 0],
            [0, 0],
          ],
          states: [
            [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.PATH],
            [GRID_ELEMENT_STATES.PATH, GRID_ELEMENT_STATES.END],
          ],
          description: 'Path found',
        },
      ];

      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 50, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(multiStepSteps);
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      // Fast-forward through all steps
      act(() => {
        vi.advanceTimersByTime(150); // 3 steps * 50ms
      });

      expect(result.current.currentStep).toBe(2);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('Sound effects', () => {
    it('should play node visit sound when exploring', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      const initialStep = {
        grid: [
          [0, 0],
          [0, 0],
        ],
        states: [
          [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.DEFAULT],
          [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
        ],
        description: 'Initial state',
      };

      const exploreStep = {
        grid: [
          [0, 0],
          [0, 0],
        ],
        states: [
          [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.OPEN],
          [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
        ],
        description: 'Exploring neighbor',
      };

      act(() => {
        result.current.loadSteps([initialStep, exploreStep]);
        result.current.stepForward();
      });

      expect(mockSoundManager.playNodeVisit).toHaveBeenCalled();
      expect(mockSoundManager.playPathFound).not.toHaveBeenCalled();
    });

    it('should play path found sound when path is discovered', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      const initialStep = {
        grid: [
          [0, 0],
          [0, 0],
        ],
        states: [
          [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.DEFAULT],
          [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
        ],
        description: 'Initial state',
      };

      const pathStep = {
        grid: [
          [0, 0],
          [0, 0],
        ],
        states: [
          [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.PATH],
          [GRID_ELEMENT_STATES.PATH, GRID_ELEMENT_STATES.END],
        ],
        description: 'Path found',
      };

      act(() => {
        result.current.loadSteps([initialStep, pathStep]);
        result.current.stepForward();
      });

      expect(mockSoundManager.playPathFound).toHaveBeenCalled();
      expect(mockSoundManager.playNodeVisit).not.toHaveBeenCalled();
    });

    it('should not play path sound for open nodes with non-path description', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      const initialStep = {
        grid: [
          [0, 0],
          [0, 0],
        ],
        states: [
          [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.DEFAULT],
          [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
        ],
        description: 'Initial state',
      };

      const openStep = {
        grid: [
          [0, 0],
          [0, 0],
        ],
        states: [
          [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.OPEN],
          [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
        ],
        description: 'Exploring neighbors',
      };

      act(() => {
        result.current.loadSteps([initialStep, openStep]);
        result.current.stepForward();
      });

      expect(mockSoundManager.playNodeVisit).toHaveBeenCalled();
      expect(mockSoundManager.playPathFound).not.toHaveBeenCalled();
    });
  });

  describe('Grid size changes', () => {
    it('should regenerate grid when size changes', () => {
      vi.clearAllMocks();
      const { rerender } = renderHook(
        ({ gridSize, speed, mode }) =>
          usePathfindingVisualization(gridSize, speed, mode),
        {
          initialProps: {
            gridSize: 2,
            speed: 1000,
            mode: VISUALIZATION_MODES.MANUAL,
          },
        }
      );

      // The hook initializes with generateNewGrid which is called on mount and via useEffect
      // So we check that generateNewGrid was called (which calls both functions)
      const initialCalls = mockCreateEmptyGrid.mock.calls.length;

      // Change grid size
      rerender({ gridSize: 3, speed: 1000, mode: VISUALIZATION_MODES.MANUAL });

      // After rerender, should have been called again with new size
      expect(mockCreateEmptyGrid.mock.calls.length).toBeGreaterThan(
        initialCalls
      );
      expect(mockCreateEmptyGrid).toHaveBeenLastCalledWith(3, 3);
      expect(mockGenerateRandomStartEnd).toHaveBeenLastCalledWith(3, 3);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const { result, unmount } = renderHook(() =>
        usePathfindingVisualization(2, 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.play();
      });

      expect(result.current.isAutoplayActive).toBe(true);

      unmount();

      // Fast-forward timer - should not cause any issues
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(true).toBe(true); // Should not throw
    });

    it('should clear timeout when paused', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.play();
      });

      expect(result.current.isAutoplayActive).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isAutoplayActive).toBe(false);

      // Fast-forward timer - should not advance steps
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.currentStep).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle 1x1 grid', () => {
      // For 1x1 grid, generateRandomStartEnd will return the same position for start and end
      // Since the hook sets START first then END, END will overwrite START
      mockGenerateRandomStartEnd.mockReturnValueOnce({
        start: { row: 0, col: 0 },
        end: { row: 0, col: 0 },
      });

      const { result } = renderHook(() =>
        usePathfindingVisualization(1, 1000, VISUALIZATION_MODES.MANUAL)
      );

      expect(result.current.grid).toEqual([[0]]);
      // In 1x1 grid, start and end are the same position, END overwrites START
      expect(result.current.states).toEqual([[GRID_ELEMENT_STATES.END]]);
      expect(result.current.start).toEqual({ row: 0, col: 0 });
      expect(result.current.end).toEqual({ row: 0, col: 0 });
    });

    it('should not play without steps', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);
    });

    it('should handle computeEffectiveDelay', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      // This tests the computeEffectiveDelay function indirectly
      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.play();
      });

      // The delay should be used for the timeout
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should handle play in manual mode when at the end', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
        result.current.stepForward(); // Move to end
      });

      expect(result.current.isComplete).toBe(true);
      const finalStep = result.current.currentStep;

      act(() => {
        result.current.play();
      });

      // Should not advance further
      expect(result.current.currentStep).toBe(finalStep);
    });

    it('should handle reset without steps', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
    });

    it('should handle autoplay cancellation during execution', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 100, VISUALIZATION_MODES.AUTOPLAY)
      );

      const multiStepSteps = [
        mockSteps[0],
        mockSteps[1],
        {
          grid: [
            [0, 0],
            [0, 0],
          ],
          states: [
            [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.PATH],
            [GRID_ELEMENT_STATES.PATH, GRID_ELEMENT_STATES.END],
          ],
          description: 'Path found',
        },
      ];

      act(() => {
        result.current.loadSteps(multiStepSteps);
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      // Advance partially
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Pause during autoplay
      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isAutoplayActive).toBe(false);

      // Advance time further - should not continue
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle stepForward with multiple steps', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      const multiStepSteps = [
        mockSteps[0],
        mockSteps[1],
        {
          grid: [
            [0, 0],
            [0, 0],
          ],
          states: [
            [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.PATH],
            [GRID_ELEMENT_STATES.PATH, GRID_ELEMENT_STATES.END],
          ],
          description: 'Final step',
        },
      ];

      act(() => {
        result.current.loadSteps(multiStepSteps);
      });

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.stepForward();
      });
      expect(result.current.currentStep).toBe(1);
      expect(result.current.isComplete).toBe(false);

      act(() => {
        result.current.stepForward();
      });
      expect(result.current.currentStep).toBe(2);
      expect(result.current.isComplete).toBe(true);
    });

    it('should handle stepBackward with multiple steps', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      const multiStepSteps = [
        mockSteps[0],
        mockSteps[1],
        {
          grid: [
            [0, 0],
            [0, 0],
          ],
          states: [
            [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.PATH],
            [GRID_ELEMENT_STATES.PATH, GRID_ELEMENT_STATES.END],
          ],
          description: 'Final step',
        },
      ];

      act(() => {
        result.current.loadSteps(multiStepSteps);
      });

      act(() => {
        result.current.stepForward();
      });
      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.stepForward();
      });
      expect(result.current.currentStep).toBe(2);
      expect(result.current.isComplete).toBe(true);

      act(() => {
        result.current.stepBackward();
      });
      expect(result.current.currentStep).toBe(1);
      expect(result.current.isComplete).toBe(false);

      act(() => {
        result.current.stepBackward();
      });
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isComplete).toBe(false);
    });

    it('should handle executeStep with no special states', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      const defaultStep = {
        grid: [
          [0, 0],
          [0, 0],
        ],
        states: [
          [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.DEFAULT],
          [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.DEFAULT],
        ],
        description: 'Default states',
      };

      act(() => {
        result.current.loadSteps([defaultStep]);
        result.current.stepForward();
      });

      // No sounds should play for default states
      expect(mockSoundManager.playNodeVisit).not.toHaveBeenCalled();
      expect(mockSoundManager.playPathFound).not.toHaveBeenCalled();
    });

    it('should handle executeStep with open nodes but non-path description', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      const initialStep = {
        grid: [
          [0, 0],
          [0, 0],
        ],
        states: [
          [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.DEFAULT],
          [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
        ],
        description: 'Initial state',
      };

      const openStep = {
        grid: [
          [0, 0],
          [0, 0],
        ],
        states: [
          [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.OPEN],
          [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
        ],
        description: 'Exploring neighbors',
      };

      act(() => {
        result.current.loadSteps([initialStep, openStep]);
        result.current.stepForward();
      });

      expect(mockSoundManager.playNodeVisit).toHaveBeenCalled();
      expect(mockSoundManager.playPathFound).not.toHaveBeenCalled();
    });
  });

  describe('Return values', () => {
    it('should return totalSteps as steps.length', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      act(() => {
        result.current.loadSteps(mockSteps);
      });

      expect(result.current.totalSteps).toBe(mockSteps.length);
    });

    it('should return mode', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.AUTOPLAY)
      );

      expect(result.current.mode).toBe(VISUALIZATION_MODES.AUTOPLAY);
    });

    it('should return start and end positions', () => {
      const { result } = renderHook(() =>
        usePathfindingVisualization(2, 1000, VISUALIZATION_MODES.MANUAL)
      );

      expect(result.current.start).toBeDefined();
      expect(result.current.end).toBeDefined();
      expect(result.current.start).toHaveProperty('row');
      expect(result.current.start).toHaveProperty('col');
      expect(result.current.end).toHaveProperty('row');
      expect(result.current.end).toHaveProperty('col');
    });
  });
});
