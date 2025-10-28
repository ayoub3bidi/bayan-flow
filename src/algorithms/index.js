/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { bubbleSort, bubbleSortPure } from './sorting/bubbleSort';
import { quickSort, quickSortPure } from './sorting/quickSort';
import { mergeSort, mergeSortPure } from './sorting/mergeSort';

export const algorithms = {
  bubbleSort,
  quickSort,
  mergeSort,
};

export const pureAlgorithms = {
  bubbleSort: bubbleSortPure,
  quickSort: quickSortPure,
  mergeSort: mergeSortPure,
};

export { bubbleSort, quickSort, mergeSort };
export { bubbleSortPure, quickSortPure, mergeSortPure };
