import { bubbleSort, bubbleSortPure } from './bubbleSort';
import { quickSort, quickSortPure } from './quickSort';
import { mergeSort, mergeSortPure } from './mergeSort';
import { selectionSort, selectionSortPure } from './selectionSort';
import { insertionSort, insertionSortPure } from './insertionSort';

export const sortingAlgorithms = {
  bubbleSort,
  quickSort,
  mergeSort,
  selectionSort,
  insertionSort,
};

export const pureSortingAlgorithms = {
  bubbleSort: bubbleSortPure,
  quickSort: quickSortPure,
  mergeSort: mergeSortPure,
  selectionSort: selectionSortPure,
  insertionSort: insertionSortPure,
};

export { bubbleSort, quickSort, mergeSort, selectionSort, insertionSort };
export {
  bubbleSortPure,
  quickSortPure,
  mergeSortPure,
  selectionSortPure,
  insertionSortPure,
};
