/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import i18n from '../i18n';

/**
 * Get translated algorithm description
 * @param {string} key - Translation key
 * @param {Object} options - Interpolation options
 * @returns {string} Translated description
 */
export function getAlgorithmDescription(key, options = {}) {
  return i18n.t(`algorithmSteps.${key}`, options);
}

/**
 * Common algorithm step descriptions with interpolation support
 */
export const ALGORITHM_STEPS = {
  // Common
  STARTING: 'starting',
  COMPLETED: 'completed',
  COMPARING: 'comparing',
  SWAPPING: 'swapping',

  // Bubble Sort
  BUBBLE_PASS_COMPLETE: 'bubblePassComplete',
  BUBBLE_EARLY_TERMINATION: 'bubbleEarlyTermination',

  // Quick Sort
  PIVOT_SELECTED: 'pivotSelected',
  PIVOT_PLACED: 'pivotPlaced',

  // Merge Sort
  DIVIDING: 'dividing',
  MERGING: 'merging',
  PLACED: 'placed',
  PLACED_REMAINING: 'placedRemaining',
  MERGED_SECTION: 'mergedSection',

  // Selection Sort
  SELECTION_FINDING_MIN: 'selectionFindingMin',
  SELECTION_NEW_MIN: 'selectionNewMin',
  SELECTION_PLACED: 'selectionPlaced',

  // Insertion Sort
  INSERTION_KEY: 'insertionKey',
  INSERTION_SHIFT: 'insertionShift',
  INSERTION_PLACED: 'insertionPlaced',
  INSERTION_PASS_COMPLETE: 'insertionPassComplete',

  // Heap Sort
  HEAP_HEAPIFY: 'heapHeapify',
  HEAP_EXTRACT_MAX: 'heapExtractMax',
  HEAP_PLACED: 'heapPlaced',

  // Shell Sort
  SHELL_GAP: 'shellGap',
  SHELL_SELECTING: 'shellSelecting',
  SHELL_COMPARING: 'shellComparing',
  SHELL_SHIFTING: 'shellShifting',
  SHELL_PLACED: 'shellPlaced',
  SHELL_GAP_COMPLETE: 'shellGapComplete',

  // Comb Sort
  COMB_GAP: 'combGap',
  COMB_GAP_COMPLETE: 'combGapComplete',

  // Tim Sort
  TIM_RUN_DETECTED: 'timRunDetected',
  TIM_RUN_SORTED: 'timRunSorted',
  TIM_MERGING_RUNS: 'timMergingRuns',

  // Searching
  SEARCH_LINEAR_START: 'searchLinearStart',
  SEARCH_LINEAR_CHECK: 'searchLinearCheck',
  SEARCH_LINEAR_FOUND: 'searchLinearFound',
  SEARCH_LINEAR_NOT_FOUND: 'searchLinearNotFound',

  SEARCH_BINARY_START: 'searchBinaryStart',
  SEARCH_BINARY_CHECK: 'searchBinaryCheck',
  SEARCH_BINARY_FOUND: 'searchBinaryFound',
  SEARCH_BINARY_NOT_FOUND: 'searchBinaryNotFound',

  SEARCH_TERNARY_START: 'searchTernaryStart',
  SEARCH_TERNARY_CHECK: 'searchTernaryCheck',
  SEARCH_TERNARY_FOUND: 'searchTernaryFound',
  SEARCH_TERNARY_NOT_FOUND: 'searchTernaryNotFound',

  SEARCH_JUMP_START: 'searchJumpStart',
  SEARCH_JUMP_BLOCK_CHECK: 'searchJumpBlockCheck',
  SEARCH_JUMP_LINEAR_CHECK: 'searchJumpLinearCheck',
  SEARCH_JUMP_FOUND: 'searchJumpFound',
  SEARCH_JUMP_NOT_FOUND: 'searchJumpNotFound',

  SEARCH_INTERPOLATION_START: 'searchInterpolationStart',
  SEARCH_INTERPOLATION_PROBE: 'searchInterpolationProbe',
  SEARCH_INTERPOLATION_FOUND: 'searchInterpolationFound',
  SEARCH_INTERPOLATION_NOT_FOUND: 'searchInterpolationNotFound',

  SEARCH_EXPONENTIAL_START: 'searchExponentialStart',
  SEARCH_EXPONENTIAL_CHECK_FIRST: 'searchExponentialCheckFirst',
  SEARCH_EXPONENTIAL_DOUBLED_PROBE: 'searchExponentialDoubledProbe',
  SEARCH_EXPONENTIAL_RANGE_LOCKED: 'searchExponentialRangeLocked',
  SEARCH_EXPONENTIAL_BINARY_CHECK: 'searchExponentialBinaryCheck',
  SEARCH_EXPONENTIAL_FOUND: 'searchExponentialFound',
  SEARCH_EXPONENTIAL_NOT_FOUND: 'searchExponentialNotFound',

  SEARCH_FIBONACCI_START: 'searchFibonacciStart',
  SEARCH_FIBONACCI_PROBE: 'searchFibonacciProbe',
  SEARCH_FIBONACCI_FOUND: 'searchFibonacciFound',
  SEARCH_FIBONACCI_NOT_FOUND: 'searchFibonacciNotFound',

  // Graph-based searching (DFS stack / BFS queue)
  DFS_STACK_PUSH: 'dfsStackPush',
  DFS_GRAPH_VISITING: 'dfsGraphVisiting',
  BFS_GRAPH_DEQUEUE: 'bfsGraphDequeue',
  BFS_GRAPH_ENQUEUE: 'bfsGraphEnqueue',

  // Pathfinding
  EXPLORING: 'exploring',
  EXPLORING_FORWARD: 'exploringForward',
  EXPLORING_BACKWARD: 'exploringBackward',
  ADDED_TO_QUEUE: 'addedToQueue',
  BIDIRECTIONAL_PROGRESS: 'bidirectionalProgress',
  BIDIRECTIONAL_MEETING: 'bidirectionalMeeting',
  PATH_FOUND: 'pathFound',
  PATH_FOUND_WITH_COST: 'pathFoundWithCost',
  PATH_FOUND_GRAPH: 'pathFoundGraph',
  NO_PATH: 'noPath',
  GREEDY_EXPLORING: 'greedyExploring',
  DIJKSTRA_EXPLORING: 'dijkstraExploring',
  A_STAR_EXPLORING: 'aStarExploring',
  JPS_JUMP_POINT_FOUND: 'jpsJumpPointFound',
  JPS_JUMP_POINT_AT: 'jpsJumpPointAt',
  JPS_JUMPING: 'jpsJumping',
  JPS_JUMP_POINTS_DISCOVERED: 'jpsJumpPointsDiscovered',

  // Radix Sort
  RADIX_BUCKET_PUSH: 'radixBucketPush',
  RADIX_COLLECT: 'radixCollect',
  RADIX_PASS_COMPLETE: 'radixPassComplete',

  // Counting Sort
  COUNTING_FIND_MAX: 'countingFindMax',
  COUNTING_COUNT: 'countingCount',
  COUNTING_COUNT_COMPLETE: 'countingCountComplete',
  COUNTING_CUMULATIVE_COMPLETE: 'countingCumulativeComplete',
  COUNTING_PLACE: 'countingPlace',

  // Bucket Sort
  BUCKET_DISTRIBUTING: 'bucketDistributing',
  BUCKET_PLACED: 'bucketPlaced',
  BUCKET_DISTRIBUTION_COMPLETE: 'bucketDistributionComplete',
  BUCKET_SORTED: 'bucketSorted',
  BUCKET_MERGING: 'bucketMerging',

  // Cycle Sort
  CYCLE_START: 'cycleStart',
  CYCLE_SKIP: 'cycleSkip',
  CYCLE_PLACE: 'cyclePlace',

  // Bellman-Ford
  BELLMAN_ITERATION: 'bellmanIteration',
  BELLMAN_RELAXATION: 'bellmanRelaxation',
  BELLMAN_NO_UPDATES: 'bellmanNoUpdates',

  // IDA*
  IDA_NEW_THRESHOLD: 'idaNewThreshold',
  IDA_VISITING: 'idaVisiting',
  IDA_BACKTRACKING: 'idaBacktracking',

  // D* Lite
  D_STAR_LITE_EXPANSION: 'dStarLiteExpansion',
  D_STAR_LITE_INCONSISTENT: 'dStarLiteInconsistent',

  // Bogo Sort
  BOGO_CHECKING: 'bogoChecking',
  BOGO_SHUFFLING: 'bogoShuffling',
  BOGO_SUCCESS: 'bogoSuccess',
  BOGO_FAILED: 'bogoFailed',
};
