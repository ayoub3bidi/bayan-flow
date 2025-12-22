import { bubbleSort, bubbleSortPure } from './bubbleSort';
import { quickSort, quickSortPure } from './quickSort';
import { mergeSort, mergeSortPure } from './mergeSort';
import { selectionSort, selectionSortPure } from './selectionSort';

export const sortingAlgorithms = {
  bubbleSort,
  quickSort,
  mergeSort,
  selectionSort,
};

export const pureSortingAlgorithms = {
  bubbleSort: bubbleSortPure,
  quickSort: quickSortPure,
  mergeSort: mergeSortPure,
  selectionSort: selectionSortPure,
};

export { bubbleSort, quickSort, mergeSort, selectionSort };
export { bubbleSortPure, quickSortPure, mergeSortPure, selectionSortPure };
