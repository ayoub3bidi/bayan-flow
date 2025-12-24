/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { bubbleSort, bubbleSortPure } from './sorting/bubbleSort';
import { quickSort, quickSortPure } from './sorting/quickSort';
import { mergeSort, mergeSortPure } from './sorting/mergeSort';
import { selectionSort, selectionSortPure } from './sorting/selectionSort';
import { insertionSort, insertionSortPure } from './sorting/insertionSort';
import { heapSort, heapSortPure } from './sorting/heapSort';

export const algorithms = {
  bubbleSort,
  quickSort,
  mergeSort,
  selectionSort,
  insertionSort,
  heapSort,
};

export const pureAlgorithms = {
  bubbleSort: bubbleSortPure,
  quickSort: quickSortPure,
  mergeSort: mergeSortPure,
  selectionSort: selectionSortPure,
  insertionSort: insertionSortPure,
  heapSort: heapSortPure,
};

export {
  bubbleSort,
  quickSort,
  mergeSort,
  selectionSort,
  insertionSort,
  heapSort,
};
export {
  bubbleSortPure,
  quickSortPure,
  mergeSortPure,
  selectionSortPure,
  insertionSortPure,
  heapSortPure,
};
