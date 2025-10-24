/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

/**
 * @param {number} rows - Number of rows in grid
 * @param {number} cols - Number of columns in grid
 * @returns {Object} - Object with start and end positions
 */
export function generateRandomStartEnd(rows, cols) {
  const start = {
    row: Math.floor(Math.random() * rows),
    col: Math.floor(Math.random() * cols),
  };

  let end;
  do {
    end = {
      row: Math.floor(Math.random() * rows),
      col: Math.floor(Math.random() * cols),
    };
  } while (start.row === end.row && start.col === end.col);

  return { start, end };
}

/**
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {number[][]} - 2D grid array
 */
export function createEmptyGrid(rows, cols) {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));
}

export function isValidGridSize(size) {
  return size >= 5 && size <= 50;
}
