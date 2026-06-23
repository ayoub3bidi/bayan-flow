/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRID_ELEMENT_STATES } from '../../constants';
import {
  getAlgorithmDescription,
  ALGORITHM_STEPS,
} from '../../utils/algorithmTranslations';

/**
 * Manhattan distance heuristic for A*
 * @param {Object} a - Position {row, col}
 * @param {Object} b - Position {row, col}
 * @returns {number} - Manhattan distance
 */
function manhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Iterative Deepening A* (IDA*) Pathfinding Algorithm
 *
 * IDA* is a depth-first search that uses the same heuristic function as A*.
 * It performs a series of depth-first searches, effectively increasing the search depth
 * (specifically, the f-cost limit) in each iteration.
 *
 * @param {number[][]} grid - 2D grid with cell weights
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows in grid
 * @param {number} cols - Number of columns in grid
 * @returns {Object[]} - Array of animation steps
 */
export function idaStar(grid, start, end, rows, cols) {
  const steps = [];

  if (!start || !end || !rows || !cols) {
    console.error('IDA*: Invalid inputs', { start, end, rows, cols });
    return steps;
  }

  // Initialize grid states
  const states = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(GRID_ELEMENT_STATES.DEFAULT));

  states[start.row][start.col] = GRID_ELEMENT_STATES.START;
  states[end.row][end.col] = GRID_ELEMENT_STATES.END;

  steps.push({
    grid: grid.map(row => [...row]),
    states: states.map(row => [...row]),
    description: 'algorithms.descriptions.idaStar',
  });

  const path = [start];

  // Directions: Up, Down, Left, Right
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  // Helper function to check validity of a position
  const isValid = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;

  /**
   * Recursive search function
   * @param {Object[]} path - Current path stack
   * @param {number} g - Cost to reach current node
   * @param {number} threshold - Current f-cost limit
   * @returns {Object} - { found: boolean, nextThreshold: number }
   */
  const search = (path, g, threshold) => {
    const current = path[path.length - 1];
    const h = manhattanDistance(current, end);
    const f = g + h;

    // If f-cost exceeds threshold, return the f-cost as the next potential threshold
    if (f > threshold) {
      return { found: false, nextThreshold: f };
    }

    // Goal found
    if (current.row === end.row && current.col === end.col) {
      return { found: true, nextThreshold: f };
    }

    // Visualize visiting current node (unless it's start or end)
    if (
      !(current.row === start.row && current.col === start.col) &&
      !(current.row === end.row && current.col === end.col)
    ) {
      states[current.row][current.col] = GRID_ELEMENT_STATES.OPEN;
      steps.push({
        grid: grid.map(row => [...row]),
        states: states.map(row => [...row]),
        description: getAlgorithmDescription(ALGORITHM_STEPS.IDA_VISITING, {
          x: current.col,
          y: current.row,
          threshold: threshold.toFixed(1),
        }),
      });
    }

    let minThreshold = Infinity;

    // Sort neighbors to mimic A* preference (optional but helps visualization)
    const neighbors = directions
      .map(dir => ({ row: current.row + dir.row, col: current.col + dir.col }))
      .filter(pos => isValid(pos.row, pos.col))
      .filter(pos => !path.some(p => p.row === pos.row && p.col === pos.col)); // Avoid cycles in current path

    // Sort by f-score (g+1 + h) for better traversal order
    neighbors.sort((a, b) => {
      const fA = g + 1 + manhattanDistance(a, end);
      const fB = g + 1 + manhattanDistance(b, end);
      return fA - fB;
    });

    for (const next of neighbors) {
      path.push(next);

      const result = search(path, g + 1, threshold);

      if (result.found) {
        return { found: true, nextThreshold: result.nextThreshold };
      }

      if (result.nextThreshold < minThreshold) {
        minThreshold = result.nextThreshold;
      }

      path.pop(); // Backtrack

      // Visualize backtracking
      if (
        !(next.row === start.row && next.col === start.col) &&
        !(next.row === end.row && next.col === end.col)
      ) {
        // Mark as closed or just default to show backtracking?
        // In IDA*, we revisit nodes, so maybe keep them OPEN or switch to CLOSED to show we left it in this recursion stack.
        // Let's mark as CLOSED to show it's "done for this recursion branch"
        states[next.row][next.col] = GRID_ELEMENT_STATES.CLOSED;
        steps.push({
          grid: grid.map(row => [...row]),
          states: states.map(row => [...row]),
          description: getAlgorithmDescription(
            ALGORITHM_STEPS.IDA_BACKTRACKING,
            {
              x: next.col,
              y: next.row,
            }
          ),
        });
      }
    }

    return { found: false, nextThreshold: minThreshold };
  };

  // Initial threshold is heuristic from start to end
  let threshold = manhattanDistance(start, end);

  while (true) {
    // Reset states slightly for visual clarity between thresholds?
    // Maybe too much flickering. We will just proceed.
    // If we want to show a "New Threshold" event:
    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.IDA_NEW_THRESHOLD, {
        threshold: threshold.toFixed(1),
      }),
    });

    const result = search(path, 0, threshold);

    if (result.found) {
      // Mark path
      for (const cell of path) {
        if (!(cell.row === end.row && cell.col === end.col)) {
          states[cell.row][cell.col] = GRID_ELEMENT_STATES.PATH;
        }
      }
      steps.push({
        grid: grid.map(row => [...row]),
        states: states.map(row => [...row]),
        description: getAlgorithmDescription(ALGORITHM_STEPS.PATH_FOUND),
      });
      return steps;
    }

    if (result.nextThreshold === Infinity) {
      // No path found
      steps.push({
        grid: grid.map(row => [...row]),
        states: states.map(row => [...row]),
        description: getAlgorithmDescription(ALGORITHM_STEPS.NO_PATH),
      });
      return steps;
    }

    threshold = result.nextThreshold;

    // Safety break for very large searches / preventing infinite loops in visualization
    if (threshold > rows * cols * 2) {
      // Arbitrary limit
      return steps;
    }
  }
}

/**
 * Pure IDA* implementation for testing
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object[]|null} - Array of path coordinates or null if no path
 */
export function idaStarPure(start, end, rows, cols) {
  const manhattan = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

  const isValid = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  const search = (path, g, threshold) => {
    const current = path[path.length - 1];
    const f = g + manhattan(current, end);

    if (f > threshold) return { found: false, nextThreshold: f };
    if (current.row === end.row && current.col === end.col)
      return { found: true, nextThreshold: f };

    let minThreshold = Infinity;

    // Optimization: Sort neighbors
    const neighbors = directions
      .map(dir => ({ row: current.row + dir.row, col: current.col + dir.col }))
      .filter(pos => isValid(pos.row, pos.col))
      .filter(pos => !path.some(p => p.row === pos.row && p.col === pos.col));

    neighbors.sort((a, b) => {
      const fA = g + 1 + manhattan(a, end);
      const fB = g + 1 + manhattan(b, end);
      return fA - fB;
    });

    for (const next of neighbors) {
      path.push(next);
      const result = search(path, g + 1, threshold);
      if (result.found) return result;
      if (result.nextThreshold < minThreshold)
        minThreshold = result.nextThreshold;
      path.pop();
    }

    return { found: false, nextThreshold: minThreshold };
  };

  let threshold = manhattan(start, end);
  const path = [start];

  while (true) {
    const result = search(path, 0, threshold);
    if (result.found) return path;
    if (result.nextThreshold === Infinity) return null;
    threshold = result.nextThreshold;
    if (threshold > rows * cols * 2) return null;
  }
}
