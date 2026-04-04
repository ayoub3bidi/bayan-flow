/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Pre-defined test cases for Python algorithm validation (LeetCode-style).
 * Input and expected are Python expression strings evaluated in the Pyodide harness.
 */

/** Shared test cases for sorting algorithms (arr -> sorted list) */
const SORTING_TEST_CASES = [
  {
    id: 'sort-basic',
    name: 'Basic sorting',
    input: '[64, 34, 25, 12, 22, 11, 90]',
    expected: '[11, 12, 22, 25, 34, 64, 90]',
  },
  {
    id: 'sort-empty',
    name: 'Empty array',
    input: '[]',
    expected: '[]',
  },
  {
    id: 'sort-single',
    name: 'Single element',
    input: '[42]',
    expected: '[42]',
  },
  {
    id: 'sort-already-sorted',
    name: 'Already sorted',
    input: '[1, 2, 3, 4, 5]',
    expected: '[1, 2, 3, 4, 5]',
  },
  {
    id: 'sort-reverse',
    name: 'Reverse sorted',
    input: '[5, 4, 3, 2, 1]',
    expected: '[1, 2, 3, 4, 5]',
  },
  {
    id: 'sort-duplicates',
    name: 'With duplicates',
    input: '[3, 1, 4, 1, 5, 9, 2, 6, 5]',
    expected: '[1, 1, 2, 3, 4, 5, 5, 6, 9]',
  },
];

/** Counting sort only works with non-negative integers */
const COUNTING_SORT_TEST_CASES = [
  {
    id: 'cs-basic',
    name: 'Basic (non-negative)',
    input: '[4, 2, 2, 8, 3, 3, 1]',
    expected: '[1, 2, 2, 3, 3, 4, 8]',
  },
  {
    id: 'cs-empty',
    name: 'Empty array',
    input: '[]',
    expected: '[]',
  },
  {
    id: 'cs-single',
    name: 'Single element',
    input: '[5]',
    expected: '[5]',
  },
];

/** Radix sort handles non-negative integers; use positive-only for simplicity */
const RADIX_SORT_TEST_CASES = [
  {
    id: 'radix-basic',
    name: 'Basic',
    input: '[170, 45, 75, 90, 802, 24, 2, 66]',
    expected: '[2, 24, 45, 66, 75, 90, 170, 802]',
  },
  {
    id: 'radix-empty',
    name: 'Empty array',
    input: '[]',
    expected: '[]',
  },
  {
    id: 'radix-single',
    name: 'Single element',
    input: '[42]',
    expected: '[42]',
  },
];

/** Bogo sort needs max_attempts; input is (arr, max_attempts) */
const BOGO_SORT_TEST_CASES = [
  {
    id: 'bogo-small',
    name: 'Small array (high success chance)',
    input: '([3, 1, 2], 5000)',
    expected: '[1, 2, 3]',
  },
  {
    id: 'bogo-empty',
    name: 'Empty array',
    input: '([], 1)',
    expected: '[]',
  },
  {
    id: 'bogo-single',
    name: 'Single element',
    input: '([42], 1)',
    expected: '[42]',
  },
];

/** binary_search(arr, target) -> index or -1; arr must be sorted ascending */
/** ternary_search(arr, target) -> index or -1; arr must be sorted ascending */
const TERNARY_SEARCH_TEST_CASES = [
  {
    id: 'ts-found-middle',
    name: 'Target in middle',
    input: '([1, 3, 5, 7, 9], 5)',
    expected: '2',
  },
  {
    id: 'ts-found-ends',
    name: 'Target at bounds',
    input: '([2, 4, 6, 8], 8)',
    expected: '3',
  },
  {
    id: 'ts-not-found',
    name: 'Target absent',
    input: '([1, 2, 4, 8], 5)',
    expected: '-1',
  },
  {
    id: 'ts-single',
    name: 'Single element',
    input: '([42], 42)',
    expected: '0',
  },
  {
    id: 'ts-empty',
    name: 'Empty array',
    input: '([], 1)',
    expected: '-1',
  },
];

const BINARY_SEARCH_TEST_CASES = [
  {
    id: 'bs-found-middle',
    name: 'Target in middle',
    input: '([1, 3, 5, 7, 9], 5)',
    expected: '2',
  },
  {
    id: 'bs-found-ends',
    name: 'Target at bounds',
    input: '([2, 4, 6, 8], 8)',
    expected: '3',
  },
  {
    id: 'bs-not-found',
    name: 'Target absent',
    input: '([1, 2, 4, 8], 5)',
    expected: '-1',
  },
  {
    id: 'bs-single',
    name: 'Single element',
    input: '([42], 42)',
    expected: '0',
  },
  {
    id: 'bs-empty',
    name: 'Empty array',
    input: '([], 1)',
    expected: '-1',
  },
];

/** linear_search(arr, target) -> index or -1; works on any order */
const LINEAR_SEARCH_TEST_CASES = [
  {
    id: 'ls-found-middle',
    name: 'Target in middle',
    input: '([1, 3, 5, 7, 9], 5)',
    expected: '2',
  },
  {
    id: 'ls-found-first',
    name: 'Target at start',
    input: '([2, 4, 6, 8], 2)',
    expected: '0',
  },
  {
    id: 'ls-not-found',
    name: 'Target absent',
    input: '([1, 2, 4, 8], 5)',
    expected: '-1',
  },
  {
    id: 'ls-single',
    name: 'Single element',
    input: '([42], 42)',
    expected: '0',
  },
  {
    id: 'ls-empty',
    name: 'Empty array',
    input: '([], 1)',
    expected: '-1',
  },
];

/** exponential_search(arr, target) -> index or -1; arr must be sorted ascending */
const EXPONENTIAL_SEARCH_TEST_CASES = [
  {
    id: 'es-found-middle',
    name: 'Target in middle',
    input: '([1, 3, 5, 7, 9], 5)',
    expected: '2',
  },
  {
    id: 'es-found-ends',
    name: 'Target at bounds',
    input: '([2, 4, 6, 8], 8)',
    expected: '3',
  },
  {
    id: 'es-not-found',
    name: 'Target absent',
    input: '([1, 2, 4, 8], 5)',
    expected: '-1',
  },
  {
    id: 'es-single',
    name: 'Single element',
    input: '([42], 42)',
    expected: '0',
  },
  {
    id: 'es-empty',
    name: 'Empty array',
    input: '([], 1)',
    expected: '-1',
  },
  {
    id: 'es-target-first',
    name: 'Target at index zero',
    input: '([1, 3, 5, 7, 9], 1)',
    expected: '0',
  },
];

/** fibonacci_search(arr, target) -> index or -1; arr must be sorted ascending */
const FIBONACCI_SEARCH_TEST_CASES = [
  {
    id: 'fs-found-middle',
    name: 'Target in middle',
    input: '([1, 3, 5, 7, 9], 5)',
    expected: '2',
  },
  {
    id: 'fs-found-ends',
    name: 'Target at bounds',
    input: '([2, 4, 6, 8], 8)',
    expected: '3',
  },
  {
    id: 'fs-not-found',
    name: 'Target absent',
    input: '([1, 2, 4, 8], 5)',
    expected: '-1',
  },
  {
    id: 'fs-single',
    name: 'Single element',
    input: '([42], 42)',
    expected: '0',
  },
  {
    id: 'fs-empty',
    name: 'Empty array',
    input: '([], 1)',
    expected: '-1',
  },
  {
    id: 'fs-target-first',
    name: 'Target at index zero',
    input: '([1, 3, 5, 7, 9], 1)',
    expected: '0',
  },
];

/** interpolation_search(arr, target) -> index or -1; arr must be sorted ascending */
const INTERPOLATION_SEARCH_TEST_CASES = [
  {
    id: 'is-found-middle',
    name: 'Target in middle',
    input: '([1, 3, 5, 7, 9], 5)',
    expected: '2',
  },
  {
    id: 'is-found-ends',
    name: 'Target at bounds',
    input: '([2, 4, 6, 8], 8)',
    expected: '3',
  },
  {
    id: 'is-not-found',
    name: 'Target absent',
    input: '([1, 2, 4, 8], 5)',
    expected: '-1',
  },
  {
    id: 'is-single',
    name: 'Single element',
    input: '([42], 42)',
    expected: '0',
  },
  {
    id: 'is-empty',
    name: 'Empty array',
    input: '([], 1)',
    expected: '-1',
  },
];

/** jump_search(arr, target) -> index or -1; arr must be sorted ascending */
const JUMP_SEARCH_TEST_CASES = [
  {
    id: 'js-found-middle',
    name: 'Target in middle',
    input: '([1, 3, 5, 7, 9], 5)',
    expected: '2',
  },
  {
    id: 'js-found-ends',
    name: 'Target at bounds',
    input: '([2, 4, 6, 8], 8)',
    expected: '3',
  },
  {
    id: 'js-not-found',
    name: 'Target absent',
    input: '([1, 2, 4, 8], 5)',
    expected: '-1',
  },
  {
    id: 'js-single',
    name: 'Single element',
    input: '([42], 42)',
    expected: '0',
  },
  {
    id: 'js-empty',
    name: 'Empty array',
    input: '([], 1)',
    expected: '-1',
  },
];

/** Pathfinding: grid (0=walkable, 1=wall), start, end -> path or None */
const PATH_3X3 = '([[0,0,0],[0,0,0],[0,0,0]], (0,0), (2,2))';
const PATH_3X3_EXPECTED = '[(0, 0), (1, 0), (2, 0), (2, 1), (2, 2)]';
const PATH_5X5 =
  '([[0,0,0,0,0],[0,1,1,0,0],[0,0,0,0,0],[0,0,1,1,0],[0,0,0,0,0]], (0,0), (4,4))';
const PATH_5X5_EXPECTED =
  '[(0, 0), (1, 0), (2, 0), (2, 1), (2, 2), (2, 3), (2, 4), (3, 4), (4, 4)]';
const PATH_BLOCKED = '([[0,0,0],[1,1,1],[0,0,0]], (0,0), (2,2))';
const PATH_BLOCKED_EXPECTED = 'None';

/** depth_first_search(adjacency, start, goal) — string node ids */
const DFS_GRAPH_LINE = "({'0': ['1'], '1': ['0', '2'], '2': ['1']}, '0', '2')";
const DFS_GRAPH_LINE_EXPECTED = "['0', '1', '2']";
const DFS_GRAPH_DISCONNECTED = "({'0': ['1'], '1': ['0'], '2': []}, '0', '2')";

const DEPTH_FIRST_SEARCH_TEST_CASES = [
  {
    id: 'dfs-graph-line',
    name: 'Path on a 3-node line graph',
    input: DFS_GRAPH_LINE,
    expected: DFS_GRAPH_LINE_EXPECTED,
  },
  {
    id: 'dfs-graph-disconnected',
    name: 'No path (disconnected goal)',
    input: DFS_GRAPH_DISCONNECTED,
    expected: PATH_BLOCKED_EXPECTED,
  },
];

/** Pathfinding test cases for grid, start, end */
const PATHFINDING_TEST_CASES = [
  {
    id: 'path-3x3',
    name: 'Simple 3x3 grid',
    input: PATH_3X3,
    expected: PATH_3X3_EXPECTED,
  },
  {
    id: 'path-5x5',
    name: '5x5 with obstacles',
    input: PATH_5X5,
    expected: PATH_5X5_EXPECTED,
  },
  {
    id: 'path-blocked',
    name: 'No path (blocked)',
    input: PATH_BLOCKED,
    expected: PATH_BLOCKED_EXPECTED,
  },
];

/** ida_star(grid, start, end, rows, cols) */
const IDA_STAR_TEST_CASES = [
  {
    id: 'ida-3x3',
    name: 'Simple 3x3 grid',
    input: '([[0,0,0],[0,0,0],[0,0,0]], (0,0), (2,2), 3, 3)',
    expected: '[(0, 0), (1, 0), (2, 0), (2, 1), (2, 2)]',
  },
  {
    id: 'ida-blocked',
    name: 'No path',
    input: '([[0,0,0],[1,1,1],[0,0,0]], (0,0), (2,2), 3, 3)',
    expected: 'None',
  },
];

/** Map algorithm key -> { functionName, testCases } */
export const algorithmTestCases = {
  bubbleSort: {
    functionName: 'bubble_sort',
    testCases: SORTING_TEST_CASES,
  },
  quickSort: {
    functionName: 'quick_sort',
    testCases: SORTING_TEST_CASES,
  },
  mergeSort: {
    functionName: 'merge_sort',
    testCases: SORTING_TEST_CASES,
  },
  selectionSort: {
    functionName: 'selection_sort',
    testCases: SORTING_TEST_CASES,
  },
  insertionSort: {
    functionName: 'insertion_sort',
    testCases: SORTING_TEST_CASES,
  },
  heapSort: {
    functionName: 'heap_sort',
    testCases: SORTING_TEST_CASES,
  },
  shellSort: {
    functionName: 'shell_sort',
    testCases: SORTING_TEST_CASES,
  },
  combSort: {
    functionName: 'comb_sort',
    testCases: SORTING_TEST_CASES,
  },
  cycleSort: {
    functionName: 'cycle_sort',
    testCases: SORTING_TEST_CASES,
  },
  timSort: {
    functionName: 'tim_sort',
    testCases: SORTING_TEST_CASES,
  },
  radixSort: {
    functionName: 'radix_sort',
    testCases: RADIX_SORT_TEST_CASES,
  },
  countingSort: {
    functionName: 'counting_sort',
    testCases: COUNTING_SORT_TEST_CASES,
  },
  bucketSort: {
    functionName: 'bucket_sort',
    testCases: SORTING_TEST_CASES,
  },
  bogoSort: {
    functionName: 'bogo_sort',
    testCases: BOGO_SORT_TEST_CASES,
  },
  bfs: {
    functionName: 'bfs',
    testCases: PATHFINDING_TEST_CASES,
  },
  dijkstra: {
    functionName: 'dijkstra',
    testCases: PATHFINDING_TEST_CASES,
  },
  aStar: {
    functionName: 'astar',
    testCases: PATHFINDING_TEST_CASES,
  },
  bidirectionalSearch: {
    functionName: 'bidirectional_search',
    testCases: PATHFINDING_TEST_CASES,
  },
  greedyBestFirstSearch: {
    functionName: 'greedy_best_first_search',
    testCases: PATHFINDING_TEST_CASES,
  },
  jumpPointSearch: {
    functionName: 'jump_point_search',
    testCases: PATHFINDING_TEST_CASES,
  },
  bellmanFord: {
    functionName: 'bellman_ford',
    testCases: PATHFINDING_TEST_CASES,
  },
  idaStar: {
    functionName: 'ida_star',
    testCases: IDA_STAR_TEST_CASES,
  },
  dStarLite: {
    functionName: 'd_star_lite',
    testCases: PATHFINDING_TEST_CASES,
  },
  linearSearch: {
    functionName: 'linear_search',
    testCases: LINEAR_SEARCH_TEST_CASES,
  },
  binarySearch: {
    functionName: 'binary_search',
    testCases: BINARY_SEARCH_TEST_CASES,
  },
  ternarySearch: {
    functionName: 'ternary_search',
    testCases: TERNARY_SEARCH_TEST_CASES,
  },
  jumpSearch: {
    functionName: 'jump_search',
    testCases: JUMP_SEARCH_TEST_CASES,
  },
  interpolationSearch: {
    functionName: 'interpolation_search',
    testCases: INTERPOLATION_SEARCH_TEST_CASES,
  },
  exponentialSearch: {
    functionName: 'exponential_search',
    testCases: EXPONENTIAL_SEARCH_TEST_CASES,
  },
  fibonacciSearch: {
    functionName: 'fibonacci_search',
    testCases: FIBONACCI_SEARCH_TEST_CASES,
  },
  depthFirstSearch: {
    functionName: 'depth_first_search',
    testCases: DEPTH_FIRST_SEARCH_TEST_CASES,
  },
};

export function getTestCases(algorithmKey) {
  return algorithmTestCases[algorithmKey] || null;
}
