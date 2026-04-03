/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import '../i18n';

// Mock constants globally to prevent import issues
// Mock both the directory path and explicit index.js path to handle ES module resolution
const constantsMockValue = {
  DEFAULT_GRID_SIZE: 15,
  DEFAULT_ARRAY_SIZE: 20,
  ANIMATION_SPEEDS: {
    SLOW: 2000,
    MEDIUM: 1000,
    FAST: 500,
    VERY_FAST: 250,
  },
  VISUALIZATION_MODES: {
    MANUAL: 'manual',
    AUTOPLAY: 'autoplay',
  },
  ALGORITHM_TYPES: {
    SORTING: 'sorting',
    PATHFINDING: 'pathfinding',
    SEARCHING: 'searching',
  },
  ALGORITHM_TYPE_LIST: ['sorting', 'pathfinding', 'searching'],
  SORTING_ALGORITHMS: {
    BUBBLE_SORT: 'bubbleSort',
    MERGE_SORT: 'mergeSort',
    QUICK_SORT: 'quickSort',
  },
  PATHFINDING_ALGORITHMS: {
    BFS: 'bfs',
    DIJKSTRA: 'dijkstra',
    A_STAR: 'aStar',
    BIDIRECTIONAL_SEARCH: 'bidirectionalSearch',
    GREEDY_BEST_FIRST_SEARCH: 'greedyBestFirstSearch',
    JUMP_POINT_SEARCH: 'jumpPointSearch',
  },
  SEARCHING_ALGORITHMS: {
    BINARY_SEARCH: 'binarySearch',
    JUMP_SEARCH: 'jumpSearch',
    INTERPOLATION_SEARCH: 'interpolationSearch',
    EXPONENTIAL_SEARCH: 'exponentialSearch',
  },
  ELEMENT_STATES: {
    DEFAULT: 'default',
    COMPARING: 'comparing',
    SWAPPING: 'swapping',
    SORTED: 'sorted',
    PIVOT: 'pivot',
  },
  GRID_ELEMENT_STATES: {
    DEFAULT: 'default',
    START: 'start',
    END: 'end',
    OPEN: 'open',
    CLOSED: 'closed',
    PATH: 'path',
    WALL: 'wall',
  },
  GRID_SIZES: {
    SMALL: 15,
    MEDIUM: 25,
    LARGE: 35,
  },
  // Used by complexityDatasetRegistry and Remotion complexity UI
  ALGORITHM_COMPLEXITY: {},
  PATHFINDING_COMPLEXITY: {},
  SEARCHING_COMPLEXITY: {},
  COMPLEXITY_FUNCTIONS: {},
};

vi.mock('../constants', () => constantsMockValue);
vi.mock('../constants/index.js', () => constantsMockValue);

// Mock Tone.js globally FIRST - soundManager depends on it
// Use exact pattern from soundManager.test.js which successfully tests soundManager
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

// Mock soundManager globally - prevents file execution
vi.mock('../utils/soundManager', () => ({
  soundManager: {
    playSound: vi.fn(),
    playArrayGenerate: vi.fn(),
    playCompare: vi.fn(),
    playSwap: vi.fn(),
    playPivot: vi.fn(),
    playSorted: vi.fn(),
    playNodeVisit: vi.fn(),
    playPathFound: vi.fn(),
    playUIClick: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
  },
}));
vi.mock('../utils/soundManager.js', () => ({
  soundManager: {
    playSound: vi.fn(),
    playArrayGenerate: vi.fn(),
    playCompare: vi.fn(),
    playSwap: vi.fn(),
    playPivot: vi.fn(),
    playSorted: vi.fn(),
    playNodeVisit: vi.fn(),
    playPathFound: vi.fn(),
    playUIClick: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
  },
}));

// Mock gridHelpers globally to prevent issues when hooks are evaluated
const gridHelpersMock = {
  createEmptyGrid: vi.fn((rows, cols) =>
    Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0))
  ),
  generateRandomStartEnd: vi.fn((rows, cols) => ({
    start: { row: 0, col: 0 },
    end: { row: rows - 1, col: cols - 1 },
  })),
  isValidGridSize: vi.fn(size => size >= 5 && size <= 50),
};
vi.mock('../utils/gridHelpers', () => gridHelpersMock);
vi.mock('../utils/gridHelpers.js', () => gridHelpersMock);

expect.extend(matchers);

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
});
