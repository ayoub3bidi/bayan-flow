/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import bubbleSortPython from './bubble_sort.py?raw';
import quickSortPython from './quick_sort.py?raw';
import mergeSortPython from './merge_sort.py?raw';
import bfsPython from './bfs.py?raw';
import dijkstraPython from './dijkstra.py?raw';
import astarPython from './astar.py?raw';

export const pythonAlgorithms = {
  bubbleSort: bubbleSortPython,
  quickSort: quickSortPython,
  mergeSort: mergeSortPython,
  bfs: bfsPython,
  dijkstra: dijkstraPython,
  aStar: astarPython,
};

export const algorithmDisplayNames = {
  bubbleSort: 'Bubble Sort',
  quickSort: 'Quick Sort',
  mergeSort: 'Merge Sort',
  bfs: 'Breadth-First Search (BFS)',
  dijkstra: "Dijkstra's Algorithm",
  aStar: 'A* Search',
};

export function getPythonCode(algorithmName) {
  return pythonAlgorithms[algorithmName] || null;
}

export function getAlgorithmDisplayName(algorithmName) {
  return algorithmDisplayNames[algorithmName] || algorithmName;
}
