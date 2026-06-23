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
 * Bidirectional Search Pathfinding Algorithm
 * Time Complexity: O(b^(d/2)) where b is branching factor and d is depth
 * Space Complexity: O(b^(d/2))
 *
 * Bidirectional search runs two simultaneous BFS searches - one from start and one from end.
 * When the searches meet, we've found the shortest path. Significantly reduces search space.
 * Works best for unweighted graphs where shortest path is guaranteed.
 *
 * @param {number[][]} grid - 2D grid (not used for pathfinding, but kept for consistency)
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows in grid
 * @param {number} cols - Number of columns in grid
 * @returns {Object[]} - Array of animation steps
 */
export function bidirectionalSearch(grid, start, end, rows, cols) {
  const steps = [];

  if (!start || !end || !rows || !cols) {
    console.error('Bidirectional Search: Invalid inputs', {
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
    console.error('Bidirectional Search: Start position out of bounds', {
      start,
      rows,
      cols,
    });
    return steps;
  }

  if (end.row < 0 || end.row >= rows || end.col < 0 || end.col >= cols) {
    console.error('Bidirectional Search: End position out of bounds', {
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
      description: 'algorithms.descriptions.bidirectionalSearch',
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

  // Forward search (from start)
  const forwardVisited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const forwardParent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  // Backward search (from end)
  const backwardVisited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const backwardParent = Array(rows)
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
    description: 'algorithms.descriptions.bidirectionalSearch',
  });

  const forwardQueue = [start];
  const backwardQueue = [end];
  forwardVisited[start.row][start.col] = true;
  backwardVisited[end.row][end.col] = true;

  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }, // right
  ];

  let meetingPoint = null;
  let iteration = 0;

  while (forwardQueue.length > 0 && backwardQueue.length > 0 && !meetingPoint) {
    iteration++;

    // Alternate between forward and backward search
    const isForwardTurn = iteration % 2 === 1;
    const currentQueue = isForwardTurn ? forwardQueue : backwardQueue;
    const currentVisited = isForwardTurn ? forwardVisited : backwardVisited;
    const currentParent = isForwardTurn ? forwardParent : backwardParent;
    const oppositeVisited = isForwardTurn ? backwardVisited : forwardVisited;
    const searchDirection = isForwardTurn ? 'forward' : 'backward';

    if (currentQueue.length === 0) continue;

    const current = currentQueue.shift();

    // Mark as closed (except for start/end)
    if (
      !(
        (current.row === start.row && current.col === start.col) ||
        (current.row === end.row && current.col === end.col)
      )
    ) {
      states[current.row][current.col] = GRID_ELEMENT_STATES.CLOSED;
    }

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(
        searchDirection === 'forward'
          ? 'exploringForward'
          : 'exploringBackward',
        {
          row: current.row,
          col: current.col,
        }
      ),
    });

    // Check neighbors
    for (const dir of directions) {
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col;

      if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
        continue;
      }

      // Check if cell is a wall (1 = wall, 0 = walkable)
      if (grid[newRow][newCol] === 1) {
        continue;
      }

      if (currentVisited[newRow][newCol]) {
        continue;
      }

      // Check if this node is visited by the opposite search
      if (oppositeVisited[newRow][newCol]) {
        meetingPoint = { row: newRow, col: newCol };
        currentParent[newRow][newCol] = current;
        break;
      }

      currentVisited[newRow][newCol] = true;
      currentParent[newRow][newCol] = current;
      currentQueue.push({ row: newRow, col: newCol });

      // Mark as open (except for end node in forward search or start node in backward search)
      if (
        !(
          (isForwardTurn && newRow === end.row && newCol === end.col) ||
          (!isForwardTurn && newRow === start.row && newCol === start.col)
        )
      ) {
        states[newRow][newCol] = GRID_ELEMENT_STATES.OPEN;
      }
    }

    if (forwardQueue.length > 0 || backwardQueue.length > 0) {
      steps.push({
        grid: grid.map(row => [...row]),
        states: states.map(row => [...row]),
        description: getAlgorithmDescription('bidirectionalProgress', {
          forwardQueue: forwardQueue.length,
          backwardQueue: backwardQueue.length,
          direction: searchDirection,
        }),
      });
    }
  }

  if (meetingPoint) {
    // Reconstruct path from start to meeting point
    const forwardPath = [];
    let current = meetingPoint;
    while (
      current &&
      !(current.row === start.row && current.col === start.col)
    ) {
      forwardPath.unshift(current);
      current = forwardParent[current.row][current.col];
    }
    if (current) forwardPath.unshift(current); // Add start

    // Reconstruct path from end to meeting point
    const backwardPath = [];
    current = meetingPoint;
    while (current && !(current.row === end.row && current.col === end.col)) {
      backwardPath.push(current);
      current = backwardParent[current.row][current.col];
    }
    if (current) backwardPath.push(current); // Add end

    // Combine paths (remove duplicate meeting point)
    const fullPath = [...forwardPath, ...backwardPath.slice(1)];

    // Mark path in states
    for (const cell of fullPath) {
      if (
        !(cell.row === start.row && cell.col === start.col) &&
        !(cell.row === end.row && cell.col === end.col)
      ) {
        states[cell.row][cell.col] = GRID_ELEMENT_STATES.PATH;
      }
    }

    // Highlight meeting point
    states[meetingPoint.row][meetingPoint.col] = GRID_ELEMENT_STATES.PATH;

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription('bidirectionalMeeting', {
        row: meetingPoint.row,
        col: meetingPoint.col,
        pathLength: fullPath.length - 1, // Exclude start from length
      }),
    });

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.PATH_FOUND, {
        length: fullPath.length - 1,
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
 * Pure Bidirectional Search implementation for testing (returns path coordinates)
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {number[][]} [grid] - Optional 2D grid (0 = walkable, 1 = wall). If not provided, assumes empty grid.
 * @returns {Object[]|null} - Array of path coordinates or null if no path
 */
export function bidirectionalSearchPure(start, end, rows, cols, grid = null) {
  // Check if start and end are the same
  if (start.row === end.row && start.col === end.col) {
    return [start];
  }

  // Forward search (from start)
  const forwardVisited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const forwardParent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  // Backward search (from end)
  const backwardVisited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const backwardParent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  const forwardQueue = [start];
  const backwardQueue = [end];
  forwardVisited[start.row][start.col] = true;
  backwardVisited[end.row][end.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  let meetingPoint = null;
  let iteration = 0;

  while (forwardQueue.length > 0 && backwardQueue.length > 0 && !meetingPoint) {
    iteration++;

    // Alternate between forward and backward search
    const isForwardTurn = iteration % 2 === 1;
    const currentQueue = isForwardTurn ? forwardQueue : backwardQueue;
    const currentVisited = isForwardTurn ? forwardVisited : backwardVisited;
    const currentParent = isForwardTurn ? forwardParent : backwardParent;
    const oppositeVisited = isForwardTurn ? backwardVisited : forwardVisited;

    if (currentQueue.length === 0) continue;

    const current = currentQueue.shift();

    // Check neighbors
    for (const dir of directions) {
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        !currentVisited[newRow][newCol]
      ) {
        // Check if cell is a wall (1 = wall, 0 = walkable)
        if (grid && grid[newRow][newCol] === 1) {
          continue;
        }

        // Check if this node is visited by the opposite search
        if (oppositeVisited[newRow][newCol]) {
          meetingPoint = { row: newRow, col: newCol };
          currentParent[newRow][newCol] = current;
          break;
        }

        currentVisited[newRow][newCol] = true;
        currentParent[newRow][newCol] = current;
        currentQueue.push({ row: newRow, col: newCol });
      }
    }
  }

  if (meetingPoint) {
    // Reconstruct path from start to meeting point
    const forwardPath = [];
    let current = meetingPoint;
    while (
      current &&
      !(current.row === start.row && current.col === start.col)
    ) {
      forwardPath.unshift(current);
      current = forwardParent[current.row][current.col];
    }
    if (current) forwardPath.unshift(current); // Add start

    // Reconstruct path from end to meeting point
    const backwardPath = [];
    current = meetingPoint;
    while (current && !(current.row === end.row && current.col === end.col)) {
      backwardPath.push(current);
      current = backwardParent[current.row][current.col];
    }
    if (current) backwardPath.push(current); // Add end

    // Combine paths (remove duplicate meeting point)
    return [...forwardPath, ...backwardPath.slice(1)];
  }

  return null; // No path found
}
