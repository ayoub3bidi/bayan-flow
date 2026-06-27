/**
 * Copyright (c) 2025 Bayan Flow
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
  DEFAULT_SEARCH_GRAPH_NODE_COUNT: 12,
  DEFAULT_TREE_NODE_COUNT: 15,
  DEFAULT_GRAPH_NODE_COUNT: 10,
  TREE_NODE_COUNT: { min: 3, max: 31, step: 1 },
  SEARCH_GRAPH_NODE_COUNT: { min: 5, max: 24, step: 1 },
  GRAPH_NODE_COUNT: { min: 3, max: 18, step: 1 },
  GRAPH_NODE_STATES: {
    DEFAULT: 'default',
    ROOT: 'root',
    GOAL: 'goal',
    FRONTIER: 'frontier',
    CURRENT: 'current',
    VISITED: 'visited',
    PATH: 'path',
    CYCLE: 'cycle',
  },
  GRAPH_EDGE_STATES: {
    DEFAULT: 'default',
    ACTIVE: 'active',
    VISITED: 'visited',
    SELECTED: 'selected',
    CYCLE: 'cycle',
  },
  TREE_NODE_STATES: {
    DEFAULT: 'default',
    VISITING: 'visiting',
    VISITED: 'visited',
  },
  TREE_NODE_STATE_COLORS: {
    default: '#e5e7eb',
    visiting: '#f97316',
    visited: '#10b981',
  },
  GRAPH_NODE_STATE_COLORS: {
    default: '#e5e7eb',
    root: '#8b5cf6',
    goal: '#ef4444',
    frontier: '#fbbf24',
    current: '#f97316',
    visited: '#60a5fa',
    path: '#10b981',
    cycle: '#ef4444',
  },
  GRAPH_EDGE_STATE_COLORS: {
    default: '#9ca3af',
    active: '#f97316',
    visited: '#60a5fa',
    selected: '#10b981',
    cycle: '#ef4444',
  },
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
    TREE_TRAVERSAL: 'treeTraversal',
    GRAPH_ALGORITHM: 'graphAlgorithm',
  },
  ALGORITHM_TYPE_LIST: [
    'sorting',
    'pathfinding',
    'searching',
    'treeTraversal',
    'graphAlgorithm',
  ],
  SORT_ORDERS: {
    ASCENDING: 'ascending',
    DESCENDING: 'descending',
  },
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
  GRAPH_ALGORITHMS: {
    TOPOLOGICAL_SORT: 'topologicalSort',
    KAHN_ALGORITHM: 'kahnAlgorithm',
    KRUSKAL_ALGORITHM: 'kruskalAlgorithm',
    PRIM_ALGORITHM: 'primAlgorithm',
    TARJAN_ALGORITHM: 'tarjanAlgorithm',
    KOSARAJU_ALGORITHM: 'kosarajuAlgorithm',
    FLOYD_WARSHALL_ALGORITHM: 'floydWarshallAlgorithm',
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
  TREE_TRAVERSAL_COMPLEXITY: {
    inorderTraversal: {
      name: 'Inorder Traversal',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(h)',
    },
  },
  GRAPH_ALGORITHM_COMPLEXITY: {
    topologicalSort: {
      name: 'Topological Sort (DFS)',
      timeComplexity: {
        best: 'O(V + E)',
        average: 'O(V + E)',
        worst: 'O(V + E)',
      },
      spaceComplexity: 'O(V)',
    },
    tarjanAlgorithm: {
      name: "Tarjan's Algorithm",
      timeComplexity: {
        best: 'O(V + E)',
        average: 'O(V + E)',
        worst: 'O(V + E)',
      },
      spaceComplexity: 'O(V)',
    },
    kosarajuAlgorithm: {
      name: "Kosaraju's Algorithm",
      timeComplexity: {
        best: 'O(V + E)',
        average: 'O(V + E)',
        worst: 'O(V + E)',
      },
      spaceComplexity: 'O(V)',
    },
    floydWarshallAlgorithm: {
      name: 'Floyd-Warshall Algorithm',
      timeComplexity: {
        best: 'O(V³)',
        average: 'O(V³)',
        worst: 'O(V³)',
      },
      spaceComplexity: 'O(V²)',
    },
  },
  COMPLEXITY_FUNCTIONS: {},
};

vi.mock('../constants', () => constantsMockValue);
vi.mock('../constants/index.js', () => constantsMockValue);

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await import('./framerMotionMock.jsx');
  return createFramerMotionMock();
});

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  });
}

// Mock Tone.js globally FIRST - soundManager depends on it
const toneNodeMock = () => ({
  connect: vi.fn().mockReturnThis(),
  chain: vi.fn().mockReturnThis(),
  toDestination: vi.fn().mockReturnThis(),
  triggerAttackRelease: vi.fn(),
  volume: { value: 0 },
});

vi.mock('tone', () => ({
  Synth: vi.fn(() => toneNodeMock()),
  PluckSynth: vi.fn(() => toneNodeMock()),
  FMSynth: vi.fn(() => toneNodeMock()),
  AMSynth: vi.fn(() => toneNodeMock()),
  PolySynth: vi.fn(() => toneNodeMock()),
  Gain: vi.fn(() => toneNodeMock()),
  Filter: vi.fn(() => toneNodeMock()),
  Compressor: vi.fn(() => toneNodeMock()),
  Reverb: vi.fn(() => ({
    ...toneNodeMock(),
    ready: Promise.resolve(),
  })),
  context: {
    state: 'suspended',
  },
  start: vi.fn().mockResolvedValue(undefined),
  now: vi.fn(() => 0),
  Destination: toneNodeMock(),
}));

// Mock soundManager globally - prevents file execution
const soundManagerState = {
  isEnabled: false,
};
const soundManagerMock = {
  playEvents: vi.fn(),
  enable: vi.fn(async () => {
    soundManagerState.isEnabled = true;
  }),
  disable: vi.fn(() => {
    soundManagerState.isEnabled = false;
  }),
  getIsEnabled: vi.fn(() => soundManagerState.isEnabled),
};
vi.mock('../utils/soundManager', () => ({
  soundManager: soundManagerMock,
}));
vi.mock('../utils/soundManager.js', () => ({
  soundManager: soundManagerMock,
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
  soundManagerState.isEnabled = false;
  if (typeof document !== 'undefined') {
    document.body.style.cssText = '';
  }
});
