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
 * Manhattan distance heuristic for JPS
 * @param {Object} a - Position {row, col}
 * @param {Object} b - Position {row, col}
 * @returns {number} - Manhattan distance
 */
function manhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Check if a position is within grid bounds
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} rows - Total rows
 * @param {number} cols - Total columns
 * @returns {boolean} - True if within bounds
 */
function isValid(row, col, rows, cols) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

/**
 * Check if a cell is walkable (no obstacles)
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number[][]} grid - Grid with cell weights (0 = walkable, 1 = wall)
 * @returns {boolean} - True if walkable
 */
function isWalkable(row, col, grid) {
  // Check bounds and if cell is not a wall (1 = wall, 0 = walkable)
  return grid[row] && grid[row][col] !== undefined && grid[row][col] !== 1;
}

/**
 * Identify forced neighbors for Jump Point Search
 * Forced neighbors are nodes that must be considered when moving in a direction
 * because obstacles block the natural path.
 * @param {number} row - Current row
 * @param {number} col - Current column
 * @param {number} dx - X direction (-1, 0, or 1)
 * @param {number} dy - Y direction (-1, 0, or 1)
 * @param {number} rows - Total rows
 * @param {number} cols - Total columns
 * @param {number[][]} grid - Grid with cell weights
 * @returns {Object[]} - Array of forced neighbor positions
 */
function identifyForcedNeighbors(row, col, dx, dy, rows, cols, grid) {
  const forcedNeighbors = [];

  // Cardinal directions (dx or dy is 0)
  if (dx === 0) {
    // Moving vertically (up or down)
    const leftBlocked =
      !isValid(row, col - 1, rows, cols) || !isWalkable(row, col - 1, grid);
    const rightBlocked =
      !isValid(row, col + 1, rows, cols) || !isWalkable(row, col + 1, grid);

    if (
      leftBlocked &&
      isValid(row + dy, col - 1, rows, cols) &&
      isWalkable(row + dy, col - 1, grid)
    ) {
      forcedNeighbors.push({ row: row + dy, col: col - 1 });
    }
    if (
      rightBlocked &&
      isValid(row + dy, col + 1, rows, cols) &&
      isWalkable(row + dy, col + 1, grid)
    ) {
      forcedNeighbors.push({ row: row + dy, col: col + 1 });
    }
  } else if (dy === 0) {
    // Moving horizontally (left or right)
    const upBlocked =
      !isValid(row - 1, col, rows, cols) || !isWalkable(row - 1, col, grid);
    const downBlocked =
      !isValid(row + 1, col, rows, cols) || !isWalkable(row + 1, col, grid);

    if (
      upBlocked &&
      isValid(row - 1, col + dx, rows, cols) &&
      isWalkable(row - 1, col + dx, grid)
    ) {
      forcedNeighbors.push({ row: row - 1, col: col + dx });
    }
    if (
      downBlocked &&
      isValid(row + 1, col + dx, rows, cols) &&
      isWalkable(row + 1, col + dx, grid)
    ) {
      forcedNeighbors.push({ row: row + 1, col: col + dx });
    }
  } else {
    // Diagonal movement
    // Check natural directions for this diagonal
    const naturalRow = row + dy;
    const naturalCol = col;
    const naturalRow2 = row;
    const naturalCol2 = col + dx;

    const natural1Blocked =
      !isValid(naturalRow, naturalCol, rows, cols) ||
      !isWalkable(naturalRow, naturalCol, grid);
    const natural2Blocked =
      !isValid(naturalRow2, naturalCol2, rows, cols) ||
      !isWalkable(naturalRow2, naturalCol2, grid);

    // Forced neighbors for diagonal
    if (
      natural1Blocked &&
      isValid(naturalRow, col + dx, rows, cols) &&
      isWalkable(naturalRow, col + dx, grid)
    ) {
      forcedNeighbors.push({ row: naturalRow, col: col + dx });
    }
    if (
      natural2Blocked &&
      isValid(row + dy, naturalCol2, rows, cols) &&
      isWalkable(row + dy, naturalCol2, grid)
    ) {
      forcedNeighbors.push({ row: row + dy, col: naturalCol2 });
    }
  }

  return forcedNeighbors;
}

/**
 * Jump in a direction until finding a jump point or hitting an obstacle
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {number} dx - X direction (-1, 0, or 1)
 * @param {number} dy - Y direction (-1, 0, or 1)
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Total rows
 * @param {number} cols - Total columns
 * @param {number[][]} grid - Grid with cell weights
 * @param {boolean[][]} closed - Closed set (visited nodes)
 * @returns {Object|null} - Jump point position or null
 */
function jump(row, col, dx, dy, end, rows, cols, grid) {
  let currentRow = row;
  let currentCol = col;

  while (true) {
    currentRow += dy;
    currentCol += dx;

    // Check bounds
    if (!isValid(currentRow, currentCol, rows, cols)) {
      return null;
    }

    // Check if walkable
    if (!isWalkable(currentRow, currentCol, grid)) {
      return null;
    }

    // Check if goal
    if (currentRow === end.row && currentCol === end.col) {
      return { row: currentRow, col: currentCol };
    }

    // Check for forced neighbors
    const forcedNeighbors = identifyForcedNeighbors(
      currentRow,
      currentCol,
      dx,
      dy,
      rows,
      cols,
      grid
    );

    if (forcedNeighbors.length > 0) {
      return { row: currentRow, col: currentCol };
    }

    // With 4-directional movement on empty grid, create jump point when:
    // We reach goal's coordinate in the perpendicular direction (allows direction change)
    if (dx === 0) {
      // Moving vertically (up/down), check if we've reached goal's row
      if (currentRow === end.row) {
        return { row: currentRow, col: currentCol };
      }
    } else if (dy === 0) {
      // Moving horizontally (left/right), check if we've reached goal's column
      if (currentCol === end.col) {
        return { row: currentRow, col: currentCol };
      }
    }
  }
}

/**
 * Jump Point Search (JPS) Pathfinding Algorithm
 * Time Complexity: O(E) where E is number of edges
 * Space Complexity: O(V) where V is number of vertices
 *
 * JPS optimizes A* by eliminating symmetric paths on uniform-cost grids.
 * It only explores "jump points" - nodes that could improve the path.
 *
 * @param {number[][]} grid - 2D grid with cell weights
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows in grid
 * @param {number} cols - Number of columns in grid
 * @returns {Object[]} - Array of animation steps
 */
export function jumpPointSearch(grid, start, end, rows, cols) {
  const steps = [];

  if (!start || !end || !rows || !cols) {
    console.error('JPS: Invalid inputs', { start, end, rows, cols });
    return steps;
  }

  if (
    start.row < 0 ||
    start.row >= rows ||
    start.col < 0 ||
    start.col >= cols
  ) {
    console.error('JPS: Start position out of bounds', { start, rows, cols });
    return steps;
  }

  if (end.row < 0 || end.row >= rows || end.col < 0 || end.col >= cols) {
    console.error('JPS: End position out of bounds', { end, rows, cols });
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
      description: 'algorithms.descriptions.jumpPointSearch',
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

  const gScore = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const fScore = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const closed = Array(rows)
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
    description: 'algorithms.descriptions.jumpPointSearch',
  });

  gScore[start.row][start.col] = 0;
  fScore[start.row][start.col] = manhattanDistance(start, end);

  const openSet = [
    {
      row: start.row,
      col: start.col,
      f: fScore[start.row][start.col],
      g: 0,
    },
  ];

  // 4-directional movement (cardinal only) to match other algorithms in this codebase
  // Note: Standard JPS uses 8-directional movement, but for consistency with A*/Dijkstra/BFS
  // we use 4-directional movement here
  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }, // right
  ];

  let found = false;

  while (openSet.length > 0 && !found) {
    // Sort by f-score (A* priority)
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (closed[current.row][current.col]) {
      continue;
    }

    closed[current.row][current.col] = true;

    if (
      !(current.row === start.row && current.col === start.col) &&
      !(current.row === end.row && current.col === end.col)
    ) {
      states[current.row][current.col] = GRID_ELEMENT_STATES.CLOSED;
    }

    const g = gScore[current.row][current.col];
    const h = manhattanDistance({ row: current.row, col: current.col }, end);

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.JPS_JUMP_POINT_AT, {
        row: current.row,
        col: current.col,
        g: g.toFixed(1),
        h: h.toFixed(1),
        f: current.f.toFixed(1),
      }),
    });

    if (current.row === end.row && current.col === end.col) {
      found = true;
      break;
    }

    // Get parent direction (if exists)
    let parentDir = null;
    if (parent[current.row][current.col]) {
      const p = parent[current.row][current.col];
      const rowDiff = current.row - p.row;
      const colDiff = current.col - p.col;
      // Normalize to one of the 4 cardinal directions
      if (rowDiff !== 0 || colDiff !== 0) {
        parentDir = {
          row: rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1,
          col: colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1,
        };
        // Ensure it's a valid cardinal direction (not diagonal)
        if (parentDir.row !== 0 && parentDir.col !== 0) {
          // Shouldn't happen with 4-directional movement, but handle gracefully
          parentDir = null;
        }
      }
    }

    // Explore neighbors
    // With 4-directional movement on empty grid, when we reach goal's coordinate
    // in perpendicular direction, we need to allow direction change
    // So if current is a jump point (aligned with goal in one coordinate), check all directions
    const isJumpPoint = current.row === end.row || current.col === end.col;
    const neighborsToCheck =
      parentDir && !isJumpPoint
        ? [parentDir] // Pruning: only check parent direction
        : directions; // Start node or jump point: check all directions

    for (const dir of neighborsToCheck) {
      const jumpPoint = jump(
        current.row,
        current.col,
        dir.col,
        dir.row,
        end,
        rows,
        cols,
        grid,
        closed
      );

      if (!jumpPoint) {
        continue;
      }

      const newRow = jumpPoint.row;
      const newCol = jumpPoint.col;

      if (closed[newRow][newCol]) {
        continue;
      }

      // With 4-directional movement, all moves have cost 1
      const tentativeG = gScore[current.row][current.col] + 1;

      if (tentativeG < gScore[newRow][newCol]) {
        parent[newRow][newCol] = {
          row: current.row,
          col: current.col,
        };
        gScore[newRow][newCol] = tentativeG;
        const hScore = manhattanDistance({ row: newRow, col: newCol }, end);
        fScore[newRow][newCol] = tentativeG + hScore;

        // Check if already in open set
        const existingIndex = openSet.findIndex(
          n => n.row === newRow && n.col === newCol
        );

        if (existingIndex >= 0) {
          openSet[existingIndex].f = fScore[newRow][newCol];
          openSet[existingIndex].g = tentativeG;
        } else {
          openSet.push({
            row: newRow,
            col: newCol,
            f: fScore[newRow][newCol],
            g: tentativeG,
          });
        }

        if (!(newRow === end.row && newCol === end.col)) {
          states[newRow][newCol] = GRID_ELEMENT_STATES.OPEN;
        }
      }
    }
  }

  if (found) {
    // Reconstruct path from jump points
    // Follow parent pointers from end to start (same pattern as A* and BFS)
    const jumpPoints = [];
    let current = end;

    while (
      current &&
      !(current.row === start.row && current.col === start.col)
    ) {
      jumpPoints.unshift(current);
      current = parent[current.row][current.col];
    }

    // Add start node to jump points (parent chain should include it, but ensure it's there)
    jumpPoints.unshift(start);

    // Expand path to include all intermediate cells between jump points
    // This is critical for visualization - users need to see the full path
    let fullPath = [];
    if (jumpPoints.length === 1) {
      fullPath = jumpPoints;
    } else {
      for (let i = 0; i < jumpPoints.length - 1; i++) {
        const segment = expandPath(jumpPoints[i], jumpPoints[i + 1]);
        // Add all cells from segment except the last one (to avoid duplicates)
        // Last segment includes the end point
        const shouldIncludeLast = i === jumpPoints.length - 2;
        for (let j = 0; j < segment.length - (shouldIncludeLast ? 0 : 1); j++) {
          fullPath.push(segment[j]);
        }
      }
      // Ensure end point is included
      const lastPoint = jumpPoints[jumpPoints.length - 1];
      if (
        !fullPath.length ||
        fullPath[fullPath.length - 1].row !== lastPoint.row ||
        fullPath[fullPath.length - 1].col !== lastPoint.col
      ) {
        fullPath.push(lastPoint);
      }
    }

    // Mark path cells in states
    for (const cell of fullPath) {
      if (
        !(cell.row === start.row && cell.col === start.col) &&
        !(cell.row === end.row && cell.col === end.col)
      ) {
        states[cell.row][cell.col] = GRID_ELEMENT_STATES.PATH;
      }
    }

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: getAlgorithmDescription(
        ALGORITHM_STEPS.PATH_FOUND_WITH_COST,
        {
          length: fullPath.length,
          cost: gScore[end.row][end.col].toFixed(1),
        }
      ),
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
 * Expand path between two points, filling in intermediate cells
 * @param {Object} from - Start point {row, col}
 * @param {Object} to - End point {row, col}
 * @returns {Object[]} - Array of all cells from 'from' to 'to' (inclusive)
 */
function expandPath(from, to) {
  const path = [];
  let row = from.row;
  let col = from.col;

  const dx = to.col === from.col ? 0 : to.col > from.col ? 1 : -1;
  const dy = to.row === from.row ? 0 : to.row > from.row ? 1 : -1;

  // Always include the starting point
  path.push({ row, col });

  // Move step by step until we reach the destination
  while (row !== to.row || col !== to.col) {
    // Move step by step in the direction towards the goal
    if (row !== to.row) row += dy;
    if (col !== to.col) col += dx;
    path.push({ row, col });
  }

  return path;
}

/**
 * Pure Jump Point Search implementation for testing (returns path coordinates)
 * JPS returns jump points only, so we expand the path to include all intermediate cells
 * to match the format expected by other algorithms (which include all cells)
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object[]|null} - Array of path coordinates or null if no path
 */
export function jumpPointSearchPure(start, end, rows, cols) {
  // Check if start and end are the same
  if (start.row === end.row && start.col === end.col) {
    return [start];
  }

  // Create empty grid (all walkable)
  const grid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));

  const gScore = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const closed = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const parent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  gScore[start.row][start.col] = 0;

  const openSet = [
    {
      row: start.row,
      col: start.col,
      f: manhattanDistance(start, end),
      g: 0,
    },
  ];

  // 4-directional movement (cardinal only) to match other algorithms
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (closed[current.row][current.col]) {
      continue;
    }

    closed[current.row][current.col] = true;

    if (current.row === end.row && current.col === end.col) {
      // Reconstruct path from jump points
      const jumpPoints = [];
      let curr = end;
      while (curr) {
        jumpPoints.unshift(curr);
        curr = parent[curr.row][curr.col];
      }

      // If only one jump point (start), return it
      if (jumpPoints.length === 1) {
        return jumpPoints;
      }

      // Expand path to include all intermediate cells between jump points
      const fullPath = [];
      for (let i = 0; i < jumpPoints.length - 1; i++) {
        const segment = expandPath(jumpPoints[i], jumpPoints[i + 1]);
        // Add all cells from segment except the last one (to avoid duplicates)
        // Last segment includes the end point
        const shouldIncludeLast = i === jumpPoints.length - 2;
        for (let j = 0; j < segment.length - (shouldIncludeLast ? 0 : 1); j++) {
          fullPath.push(segment[j]);
        }
      }
      // Ensure end point is included
      const lastPoint = jumpPoints[jumpPoints.length - 1];
      if (
        !fullPath.length ||
        fullPath[fullPath.length - 1].row !== lastPoint.row ||
        fullPath[fullPath.length - 1].col !== lastPoint.col
      ) {
        fullPath.push(lastPoint);
      }

      return fullPath;
    }

    let parentDir = null;
    if (parent[current.row][current.col]) {
      const p = parent[current.row][current.col];
      const rowDiff = current.row - p.row;
      const colDiff = current.col - p.col;
      // Normalize to one of the 4 cardinal directions
      if (Math.abs(rowDiff) > 0) {
        parentDir = { row: rowDiff > 0 ? 1 : -1, col: 0 };
      } else if (Math.abs(colDiff) > 0) {
        parentDir = { row: 0, col: colDiff > 0 ? 1 : -1 };
      }
    }

    // With 4-directional movement on empty grid, when we reach goal's coordinate
    // in perpendicular direction, we need to allow direction change
    // So if current is a jump point (aligned with goal in one coordinate), check all directions
    const isJumpPoint = current.row === end.row || current.col === end.col;
    const neighborsToCheck =
      parentDir && !isJumpPoint ? [parentDir] : directions;

    for (const dir of neighborsToCheck) {
      const jumpPoint = jump(
        current.row,
        current.col,
        dir.col,
        dir.row,
        end,
        rows,
        cols,
        grid,
        closed
      );

      if (!jumpPoint) {
        continue;
      }

      const newRow = jumpPoint.row;
      const newCol = jumpPoint.col;

      if (closed[newRow][newCol]) {
        continue;
      }

      // With 4-directional movement, all moves have cost 1
      const tentativeG = gScore[current.row][current.col] + 1;

      if (tentativeG < gScore[newRow][newCol]) {
        parent[newRow][newCol] = { row: current.row, col: current.col };
        gScore[newRow][newCol] = tentativeG;
        const hScore = manhattanDistance({ row: newRow, col: newCol }, end);
        const fScore = tentativeG + hScore;

        const existingIndex = openSet.findIndex(
          n => n.row === newRow && n.col === newCol
        );

        if (existingIndex >= 0) {
          openSet[existingIndex].f = fScore;
          openSet[existingIndex].g = tentativeG;
        } else {
          openSet.push({
            row: newRow,
            col: newCol,
            f: fScore,
            g: tentativeG,
          });
        }
      }
    }
  }

  return null;
}
