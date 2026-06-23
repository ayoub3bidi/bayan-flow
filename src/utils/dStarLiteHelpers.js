/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Calculate heuristic (Manhattan distance)
 * @param {Object} a - Position {row, col}
 * @param {Object} b - Position {row, col}
 * @returns {number}
 */
export function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Calculate D* Lite Key
 * @param {Object} node - Position {row, col}
 * @param {Object} start - Start position
 * @param {number[][]} g - G-values grid
 * @param {number[][]} rhs - RHS-values grid
 * @param {number} km - Key modifier
 * @returns {[number, number]} - Key pair [k1, k2]
 */
export function calculateKey(node, start, g, rhs, km) {
  const minVal = Math.min(g[node.row][node.col], rhs[node.row][node.col]);
  return [minVal + heuristic(start, node) + km, minVal];
}

/**
 * Compare two keys
 * @param {[number, number]} key1
 * @param {[number, number]} key2
 * @returns {boolean} - true if key1 < key2
 */
export function compareKeys(key1, key2) {
  if (key1[0] < key2[0]) return true;
  if (key1[0] > key2[0]) return false;
  return key1[1] < key2[1];
}
