import { bubbleSort, bubbleSortPure } from './bubbleSort';
import { quickSort, quickSortPure } from './quickSort';
import { mergeSort, mergeSortPure } from './mergeSort';
import { selectionSort, selectionSortPure } from './selectionSort';
import { insertionSort, insertionSortPure } from './insertionSort';
import { heapSort, heapSortPure } from './heapSort';

export const sortingAlgorithms = {
  bubbleSort,
  quickSort,
  mergeSort,
  selectionSort,
  insertionSort,
  heapSort,
};

export const pureSortingAlgorithms = {
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
