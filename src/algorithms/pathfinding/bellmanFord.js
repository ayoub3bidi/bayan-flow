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
 * Helper function to check if a cell is valid
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} rows - Total rows
 * @param {number} cols - Total columns
 * @returns {boolean} - True if valid
 */
function isValid(row, col, rows, cols) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

/**
 * Helper function to check if a cell is walkable (not a wall)
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number[][]} grid - Grid with cell weights
 * @returns {boolean} - True if walkable
 */
function isWalkable(row, col, grid) {
  return isValid(row, col, grid.length, grid[0].length) && grid[row][col] !== 1;
}

/**
 * Bellman-Ford Pathfinding Algorithm
 * Time Complexity: O(VE) where V = vertices, E = edges
 * Space Complexity: O(V)
 *
 * Single-source shortest path algorithm using iterative relaxation.
 * Can handle negative edge weights and detect negative cycles.
 * Runs V-1 iterations, relaxing all edges in each iteration.
 *
 * @param {number[][]} grid - 2D grid with cell weights
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows in grid
 * @param {number} cols - Number of columns in grid
 * @returns {Object[]} - Array of animation steps
 */
export function bellmanFord(grid, start, end, rows, cols) {
  const steps = [];

  if (!start || !end || !rows || !cols) {
    console.error('Bellman-Ford: Invalid inputs', { start, end, rows, cols });
    return steps;
  }

  if (
    start.row < 0 ||
    start.row >= rows ||
    start.col < 0 ||
    start.col >= cols
  ) {
    console.error('Bellman-Ford: Start position out of bounds', {
      start,
      rows,
      cols,
    });
    return steps;
  }

  if (end.row < 0 || end.row >= rows || end.col < 0 || end.col >= cols) {
    console.error('Bellman-Ford: End position out of bounds', {
      end,
      rows,
      cols,
    });
    return steps;
  }

  // Check if start and end are the same
  if (start.row === end.row && start.col === end.col) {
    const states = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(GRID_ELEMENT_STATES.DEFAULT));
    states[start.row][start.col] = GRID_ELEMENT_STATES.START;
    states[end.row][end.col] = GRID_ELEMENT_STATES.END;

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: 'algorithms.descriptions.bellmanFord',
    });

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.PATH_FOUND, {
        length: 0,
      }),
    });

    return steps;
  }

  const distances = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const parent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  const states = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(GRID_ELEMENT_STATES.DEFAULT));
  states[start.row][start.col] = GRID_ELEMENT_STATES.START;
  states[end.row][end.col] = GRID_ELEMENT_STATES.END;

  distances[start.row][start.col] = 0;

  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }, // right
  ];

  const maxIterations = rows * cols - 1;

  // Initial step
  steps.push({
    grid: grid.map(row => [...row]),
    states: states.map(row => [...row]),
    description: 'algorithms.descriptions.bellmanFord',
  });

  // Bellman-Ford: V-1 iterations
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    let relaxations = 0;
    let updated = false;

    // Relax all edges in this iteration
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip if cell is not reachable yet or is a wall
        if (distances[row][col] === Infinity || !isWalkable(row, col, grid)) {
          continue;
        }

        // Check all neighbors (4-directional)
        for (const dir of directions) {
          const newRow = row + dir.row;
          const newCol = col + dir.col;

          if (!isValid(newRow, newCol, rows, cols)) {
            continue;
          }

          if (!isWalkable(newRow, newCol, grid)) {
            continue;
          }

          const edgeWeight = 1; // Uniform weight for grid
          const newDist = distances[row][col] + edgeWeight;

          // Relax edge if distance can be improved
          if (newDist < distances[newRow][newCol]) {
            distances[newRow][newCol] = newDist;
            parent[newRow][newCol] = { row, col };
            updated = true;
            relaxations++;

            // Mark as OPEN if not start/end
            if (
              !(newRow === start.row && newCol === start.col) &&
              !(newRow === end.row && newCol === end.col)
            ) {
              states[newRow][newCol] = GRID_ELEMENT_STATES.OPEN;
            }
          }
        }
      }
    }

    // Record step for this iteration
    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.BELLMAN_ITERATION, {
        iteration,
        maxIterations,
        relaxations,
        distance:
          distances[end.row][end.col] === Infinity
            ? '∞'
            : distances[end.row][end.col].toFixed(1),
      }),
    });

    // Early termination: if no updates, distances are finalized
    if (!updated) {
      steps.push({
        grid: grid.map(row => [...row]),
        states: states.map(row => [...row]),
        description: getAlgorithmDescription(
          ALGORITHM_STEPS.BELLMAN_NO_UPDATES
        ),
      });
      break;
    }
  }

  // Mark all explored cells as CLOSED (except start and end)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (
        distances[row][col] !== Infinity &&
        !(row === start.row && col === start.col) &&
        !(row === end.row && col === end.col) &&
        states[row][col] !== GRID_ELEMENT_STATES.PATH
      ) {
        states[row][col] = GRID_ELEMENT_STATES.CLOSED;
      }
    }
  }

  // Reconstruct path if reachable
  if (distances[end.row][end.col] !== Infinity) {
    const path = [];
    let current = end;

    while (
      current &&
      !(current.row === start.row && current.col === start.col)
    ) {
      path.unshift(current);
      current = parent[current.row][current.col];
    }

    // Mark path cells
    for (const cell of path) {
      if (!(cell.row === end.row && cell.col === end.col)) {
        states[cell.row][cell.col] = GRID_ELEMENT_STATES.PATH;
      }
    }

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.PATH_FOUND, {
        length: path.length,
      }),
    });
  } else {
    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.NO_PATH),
    });
  }

  return steps;
}

/**
 * Pure Bellman-Ford implementation for testing (returns path coordinates)
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object[]|null} - Array of path coordinates or null if no path
 */
export function bellmanFordPure(start, end, rows, cols) {
  // Check if start and end are the same
  if (start.row === end.row && start.col === end.col) {
    return [start];
  }

  // Create empty grid (all walkable)
  const grid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));

  const distances = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const parent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  distances[start.row][start.col] = 0;

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  const maxIterations = rows * cols - 1;

  // Bellman-Ford: V-1 iterations
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    let updated = false;

    // Relax all edges in this iteration
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (distances[row][col] === Infinity) {
          continue;
        }

        // Check all neighbors
        for (const dir of directions) {
          const newRow = row + dir.row;
          const newCol = col + dir.col;

          if (
            newRow < 0 ||
            newRow >= rows ||
            newCol < 0 ||
            newCol >= cols ||
            grid[newRow][newCol] === 1
          ) {
            continue;
          }

          const edgeWeight = 1;
          const newDist = distances[row][col] + edgeWeight;

          // Relax edge if distance can be improved
          if (newDist < distances[newRow][newCol]) {
            distances[newRow][newCol] = newDist;
            parent[newRow][newCol] = { row, col };
            updated = true;
          }
        }
      }
    }

    // Early termination: if no updates, distances are finalized
    if (!updated) {
      break;
    }
  }

  // Reconstruct path if reachable
  if (distances[end.row][end.col] !== Infinity) {
    const path = [];
    let current = end;

    while (
      current &&
      !(current.row === start.row && current.col === start.col)
    ) {
      path.unshift(current);
      current = parent[current.row][current.col];
    }

    // Add start node
    path.unshift(start);

    return path;
  }

  return null; // No path found
}
