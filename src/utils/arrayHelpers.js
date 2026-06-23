/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { SORT_ORDERS } from '../constants';

/**
 * Generates a random array of specified size with values between min and max
 * @param {number} size - The size of the array to generate
 * @param {number} min - Minimum value (default: 5)
 * @param {number} max - Maximum value (default: 500)
 * @returns {number[]} - Random array
 */
export const generateRandomArray = (size, min = 5, max = 500) => {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (max - min + 1) + min)
  );
};

/**
 * Random array sorted in ascending order (for searching / binary search demos).
 * @param {number} size
 * @param {number} min
 * @param {number} max
 * @returns {number[]}
 */
export const generateSortedRandomArray = (size, min = 5, max = 500) => {
  return [...generateRandomArray(size, min, max)].sort((a, b) => a - b);
};

/**
 * Prepare sorting visualization input after random generation.
 * Descending mode sorts values high-to-low (reverse-sorted input).
 *
 * @param {number[]} arr
 * @param {string} sortOrder - SORT_ORDERS.ASCENDING | SORT_ORDERS.DESCENDING
 * @returns {number[]}
 */
export function finalizeSortingInputArray(arr, sortOrder) {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  if (sortOrder === SORT_ORDERS.DESCENDING) {
    return [...arr].sort((a, b) => b - a);
  }
  return [...arr];
}

/**
 * Reorder the current multiset when the user toggles sort order (no new random draw).
 *
 * @param {number[]} arr
 * @param {string} sortOrder
 * @returns {number[]}
 */
export function reorderArrayForSortOrder(arr, sortOrder) {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  if (sortOrder === SORT_ORDERS.DESCENDING) {
    return [...arr].sort((a, b) => b - a);
  }
  return [...arr].sort((a, b) => a - b);
}

/**
 * Generates a nearly sorted array (useful for testing)
 * @param {number} size - The size of the array
 * @param {number} swaps - Number of random swaps to perform
 * @returns {number[]} - Nearly sorted array
 */
export const generateNearlySortedArray = (size, swaps = 5) => {
  const arr = Array.from({ length: size }, (_, i) => (i + 1) * 10);
  for (let i = 0; i < swaps; i++) {
    const idx1 = Math.floor(Math.random() * size);
    const idx2 = Math.floor(Math.random() * size);
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
  }
  return arr;
};

/**
 * Generates a reversed array
 * @param {number} size - The size of the array
 * @returns {number[]} - Reversed array
 */
export const generateReversedArray = size => {
  return Array.from({ length: size }, (_, i) => (size - i) * 10);
};

/**
 * Checks if an array is sorted
 * @param {number[]} arr - Array to check
 * @returns {boolean} - True if sorted, false otherwise
 */
export const isSorted = arr => {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) {
      return false;
    }
  }
  return true;
};

/**
 * Deep clones an array
 * @param {Array} arr - Array to clone
 * @returns {Array} - Cloned array
 */
export const cloneArray = arr => {
  return JSON.parse(JSON.stringify(arr));
};

/**
 * Delays execution for animation purposes
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
export const delay = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
