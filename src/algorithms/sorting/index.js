/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { bubbleSort, bubbleSortPure } from './bubbleSort';
import { quickSort, quickSortPure } from './quickSort';
import { mergeSort, mergeSortPure } from './mergeSort';

export const sortingAlgorithms = {
  bubbleSort,
  quickSort,
  mergeSort,
};

export const pureSortingAlgorithms = {
  bubbleSort: bubbleSortPure,
  quickSort: quickSortPure,
  mergeSort: mergeSortPure,
};

export { bubbleSort, quickSort, mergeSort };
export { bubbleSortPure, quickSortPure, mergeSortPure };
