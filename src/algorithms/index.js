import { bubbleSort, bubbleSortPure } from './bubbleSort';
import { quickSort, quickSortPure } from './quickSort';
import { mergeSort, mergeSortPure } from './mergeSort';

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
