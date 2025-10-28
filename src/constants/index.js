/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

export const ALGORITHM_TYPES = {
  SORTING: 'sorting',
  PATHFINDING: 'pathfinding',
};

export const SORTING_ALGORITHMS = {
  BUBBLE_SORT: 'bubbleSort',
  MERGE_SORT: 'mergeSort',
  QUICK_SORT: 'quickSort',
  INSERTION_SORT: 'insertionSort',
  SELECTION_SORT: 'selectionSort',
};

export const PATHFINDING_ALGORITHMS = {
  BFS: 'bfs',
  DIJKSTRA: 'dijkstra',
  A_STAR: 'aStar',
};

export const ANIMATION_SPEEDS = {
  SLOW: 8000,
  MEDIUM: 4800,
  FAST: 2400,
  VERY_FAST: 1200,
};

export const ELEMENT_STATES = {
  DEFAULT: 'default',
  COMPARING: 'comparing',
  SWAPPING: 'swapping',
  SORTED: 'sorted',
  PIVOT: 'pivot',
  AUXILIARY: 'auxiliary',
};

export const STATE_COLORS = {
  [ELEMENT_STATES.DEFAULT]: '#3b82f6', // blue-500
  [ELEMENT_STATES.COMPARING]: '#fbbf24', // amber-400
  [ELEMENT_STATES.SWAPPING]: '#ef4444', // red-500
  [ELEMENT_STATES.SORTED]: '#10b981', // green-500
  [ELEMENT_STATES.PIVOT]: '#8b5cf6', // purple-500
  [ELEMENT_STATES.AUXILIARY]: '#6b7280', // gray-500
};

export const GRID_ELEMENT_STATES = {
  DEFAULT: 'default',
  OPEN: 'open',
  CLOSED: 'closed',
  PATH: 'path',
  START: 'start',
  END: 'end',
  WALL: 'wall',
};

export const GRID_STATE_COLORS = {
  [GRID_ELEMENT_STATES.DEFAULT]: '#e5e7eb', // gray-200
  [GRID_ELEMENT_STATES.OPEN]: '#fbbf24', // amber-400
  [GRID_ELEMENT_STATES.CLOSED]: '#60a5fa', // blue-400
  [GRID_ELEMENT_STATES.PATH]: '#10b981', // green-500
  [GRID_ELEMENT_STATES.START]: '#8b5cf6', // purple-500
  [GRID_ELEMENT_STATES.END]: '#ef4444', // red-500
  [GRID_ELEMENT_STATES.WALL]: '#374151', // gray-700
};

export const VISUALIZATION_MODES = {
  AUTOPLAY: 'autoplay',
  MANUAL: 'manual',
};

export const ALGORITHM_COMPLEXITY = {
  bubbleSort: {
    name: 'Bubble Sort',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
  },
  quickSort: {
    name: 'Quick Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(log n)',
  },
  mergeSort: {
    name: 'Merge Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n)',
  },
};

export const COMPLEXITY_FUNCTIONS = {
  // eslint-disable-next-line no-unused-vars
  'O(1)': n => 1,
  'O(log n)': n => Math.log2(n),
  'O(n)': n => n,
  'O(n log n)': n => n * Math.log2(n),
  'O(n²)': n => n * n,
  'O(n³)': n => n * n * n,
  'O(2^n)': n => Math.pow(2, n),
  'O(V + E)': n => n + n * 4, // Approximation: V vertices + E edges (grid has ~4 edges per vertex)
  'O((V + E) log V)': n => (n + n * 4) * Math.log2(n),
  'O(E)': n => n * 4, // Approximation for grid edges
  'O(b^d)': n => Math.pow(4, Math.log2(n)), // Approximation: branching factor 4, depth log(n)
};

export const DEFAULT_ARRAY_SIZE = 20;

// Grid size presets for pathfinding
export const GRID_SIZES = {
  SMALL: 15,
  MEDIUM: 25,
  LARGE: 35,
};

export const DEFAULT_GRID_SIZE = GRID_SIZES.SMALL;

// Pathfinding algorithm complexity metadata
export const PATHFINDING_COMPLEXITY = {
  bfs: {
    name: 'Breadth-First Search',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    description:
      'BFS explores all neighbor nodes at the present depth before moving to nodes at the next depth level. Guarantees shortest path in unweighted graphs.',
    useCases: [
      'Finding shortest path in unweighted graphs',
      'Level-order traversal in trees',
      'Finding connected components',
      'Testing graph bipartiteness',
    ],
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    timeComplexity: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
    },
    spaceComplexity: 'O(V)',
    description:
      "Dijkstra's algorithm finds the shortest path between nodes in a weighted graph. It uses a priority queue to always explore the most promising node.",
    useCases: [
      'GPS navigation and route planning',
      'Network routing protocols',
      'Finding shortest paths in weighted graphs',
      'Resource allocation optimization',
    ],
  },
  aStar: {
    name: 'A* Search',
    timeComplexity: {
      best: 'O(E)',
      average: 'O(b^d)',
      worst: 'O(b^d)',
    },
    spaceComplexity: 'O(b^d)',
    description:
      "A* is an informed search algorithm that uses heuristics to guide its search. It combines the benefits of Dijkstra's algorithm and greedy best-first search.",
    useCases: [
      'Video game pathfinding',
      'Robot navigation',
      'Map-based applications',
      'Puzzle solving (e.g., 8-puzzle)',
    ],
  },
};
