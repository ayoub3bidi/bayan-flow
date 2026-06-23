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
 * Manhattan distance heuristic for Greedy Best-First Search
 * @param {Object} a - Position {row, col}
 * @param {Object} b - Position {row, col}
 * @returns {number} - Manhattan distance
 */
function manhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Greedy Best-First Search Pathfinding Algorithm
 * Time Complexity: O(b^d) where b is branching factor and d is depth
 * Space Complexity: O(b^d)
 *
 * Greedy Best-First Search uses heuristics to guide its search towards the goal.
 * Unlike A*, it only considers the heuristic distance h(n) and ignores the path cost g(n).
 * This makes it faster but doesn't guarantee the shortest path.
 *
 * @param {number[][]} grid - 2D grid with cell weights
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows in grid
 * @param {number} cols - Number of columns in grid
 * @returns {Object[]} - Array of animation steps
 */
export function greedyBestFirstSearch(grid, start, end, rows, cols) {
  const steps = [];

  if (!start || !end || !rows || !cols) {
    console.error('Greedy Best-First Search: Invalid inputs', {
      start,
      end,
      rows,
      cols,
    });
    return steps;
  }

  if (
    start.row < 0 ||
    start.row >= rows ||
    start.col < 0 ||
    start.col >= cols
  ) {
    console.error('Greedy Best-First Search: Start position out of bounds', {
      start,
      rows,
      cols,
    });
    return steps;
  }

  if (end.row < 0 || end.row >= rows || end.col < 0 || end.col >= cols) {
    console.error('Greedy Best-First Search: End position out of bounds', {
      end,
      rows,
      cols,
    });
    return steps;
  }

  const visited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const parent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  const states = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(GRID_ELEMENT_STATES.DEFAULT));
  states[start.row][start.col] = GRID_ELEMENT_STATES.START;
  states[end.row][end.col] = GRID_ELEMENT_STATES.END;

  steps.push({
    grid: grid.map(row => [...row]),
    states: states.map(row => [...row]),
    description: 'algorithms.descriptions.greedyBestFirstSearch',
  });

  const openSet = [
    {
      row: start.row,
      col: start.col,
      h: manhattanDistance(start, end),
    },
  ];

  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }, // right
  ];

  let found = false;

  while (openSet.length > 0 && !found) {
    openSet.sort((a, b) => a.h - b.h);
    const current = openSet.shift();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;

    if (
      !(current.row === start.row && current.col === start.col) &&
      !(current.row === end.row && current.col === end.col)
    ) {
      states[current.row][current.col] = GRID_ELEMENT_STATES.CLOSED;
    }

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.GREEDY_EXPLORING, {
        row: current.row,
        col: current.col,
        heuristic: current.h.toFixed(1),
      }),
    });

    if (current.row === end.row && current.col === end.col) {
      found = true;
      break;
    }

    for (const dir of directions) {
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col;

      if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
        continue;
      }

      if (grid[newRow][newCol] === 1) {
        continue; // Skip walls
      }

      if (visited[newRow][newCol]) {
        continue;
      }

      parent[newRow][newCol] = current;

      openSet.push({
        row: newRow,
        col: newCol,
        h: manhattanDistance({ row: newRow, col: newCol }, end),
      });

      if (!(newRow === end.row && newCol === end.col)) {
        states[newRow][newCol] = GRID_ELEMENT_STATES.OPEN;
      }
    }
  }

  if (found) {
    const path = [];
    let current = end;

    while (
      current &&
      !(current.row === start.row && current.col === start.col)
    ) {
      path.unshift(current);
      current = parent[current.row][current.col];
    }

    for (const cell of path) {
      if (!(cell.row === end.row && cell.col === end.col)) {
        states[cell.row][cell.col] = GRID_ELEMENT_STATES.PATH;
      }
    }

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.PATH_FOUND, {
        length: path.length + 1, // +1 for start node
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
 * Pure Greedy Best-First Search implementation for testing (returns path coordinates)
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object[]|null} - Array of path coordinates or null if no path
 */
export function greedyBestFirstSearchPure(start, end, rows, cols) {
  const visited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const parent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  const openSet = [
    {
      row: start.row,
      col: start.col,
      h: manhattanDistance(start, end),
    },
  ];

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.h - b.h);
    const current = openSet.shift();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;

    if (current.row === end.row && current.col === end.col) {
      const path = [];
      let curr = end;
      while (curr) {
        path.unshift(curr);
        curr = parent[curr.row][curr.col];
      }
      return path;
    }

    for (const dir of directions) {
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        !visited[newRow][newCol]
      ) {
        parent[newRow][newCol] = { row: current.row, col: current.col };

        openSet.push({
          row: newRow,
          col: newCol,
          h: manhattanDistance({ row: newRow, col: newCol }, end),
        });
      }
    }
  }

  return null;
}
