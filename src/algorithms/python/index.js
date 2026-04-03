/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import bubbleSortPython from './bubble_sort.py?raw';
import quickSortPython from './quick_sort.py?raw';
import mergeSortPython from './merge_sort.py?raw';
import selectionSortPython from './selection_sort.py?raw';
import insertionSortPython from './insertion_sort.py?raw';
import heapSortPython from './heap_sort.py?raw';
import shellSortPython from './shell_sort.py?raw';
import bfsPython from './bfs.py?raw';
import dijkstraPython from './dijkstra.py?raw';
import astarPython from './astar.py?raw';
import bidirectionalSearchPython from './bidirectional_search.py?raw';
import greedyBestFirstSearchPython from './greedy_best_first_search.py?raw';
import radixSortPython from './radix_sort.py?raw';
import jumpPointSearchPython from './jump_point_search.py?raw';
import bellmanFordPython from './bellman_ford.py?raw';
import idaStarPython from './ida_star.py?raw';
import dStarLitePython from './d_star_lite.py?raw';
import countingSortPython from './counting_sort.py?raw';
import bucketSortPython from './bucket_sort.py?raw';
import cycleSortPython from './cycle_sort.py?raw';
import combSortPython from './comb_sort.py?raw';
import timSortPython from './timSort.py?raw';
import bogoSortPython from './bogo_sort.py?raw';
import binarySearchPython from './binary_search.py?raw';
import jumpSearchPython from './jump_search.py?raw';

export const pythonAlgorithms = {
  bubbleSort: bubbleSortPython,
  quickSort: quickSortPython,
  mergeSort: mergeSortPython,
  selectionSort: selectionSortPython,
  insertionSort: insertionSortPython,
  heapSort: heapSortPython,
  shellSort: shellSortPython,
  radixSort: radixSortPython,
  countingSort: countingSortPython,
  bucketSort: bucketSortPython,
  cycleSort: cycleSortPython,
  combSort: combSortPython,
  timSort: timSortPython,
  bogoSort: bogoSortPython,
  bfs: bfsPython,
  dijkstra: dijkstraPython,
  aStar: astarPython,
  bidirectionalSearch: bidirectionalSearchPython,
  greedyBestFirstSearch: greedyBestFirstSearchPython,
  jumpPointSearch: jumpPointSearchPython,
  bellmanFord: bellmanFordPython,
  idaStar: idaStarPython,
  dStarLite: dStarLitePython,
  binarySearch: binarySearchPython,
  jumpSearch: jumpSearchPython,
};

export const algorithmDisplayNames = {
  bubbleSort: 'Bubble Sort',
  quickSort: 'Quick Sort',
  mergeSort: 'Merge Sort',
  selectionSort: 'Selection Sort',
  insertionSort: 'Insertion Sort',
  heapSort: 'Heap Sort',
  shellSort: 'Shell Sort',
  radixSort: 'Radix Sort',
  countingSort: 'Counting Sort',
  bucketSort: 'Bucket Sort',
  cycleSort: 'Cycle Sort',
  combSort: 'Comb Sort',
  timSort: 'Tim Sort',
  bogoSort: 'Bogo Sort',
  bfs: 'Breadth-First Search (BFS)',
  dijkstra: "Dijkstra's Algorithm",
  aStar: 'A* Search',
  bidirectionalSearch: 'Bidirectional Search',
  greedyBestFirstSearch: 'Greedy Best-First Search',
  jumpPointSearch: 'Jump Point Search',
  bellmanFord: 'Bellman-Ford Algorithm',
  idaStar: 'Iterative Deepening A* (IDA*)',
  dStarLite: 'D* Lite',
  binarySearch: 'Binary Search',
  jumpSearch: 'Jump Search',
};

export function getPythonCode(algorithmName) {
  return pythonAlgorithms[algorithmName] || null;
}

export function getAlgorithmDisplayName(algorithmName) {
  return algorithmDisplayNames[algorithmName] || algorithmName;
}

export { getTestCases } from './testCases';
