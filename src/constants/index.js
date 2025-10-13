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
  DIJKSTRA: 'dijkstra',
  A_STAR: 'aStar',
  BFS: 'bfs',
  DFS: 'dfs',
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

export const NODE_STATES = {
  EMPTY: 'empty',
  WALL: 'wall',
  START: 'start',
  END: 'end',
  VISITED: 'visited',
  PATH: 'path',
  CURRENT: 'current',
};

export const VISUALIZATION_MODES = {
  AUTOPLAY: 'autoplay',
  MANUAL: 'manual',
};

export const DEFAULT_ARRAY_SIZE = 20;
export const GRID_ROWS = 20;
export const GRID_COLS = 40;
