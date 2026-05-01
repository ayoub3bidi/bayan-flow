/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { BarChart3, Grid3x3, GitBranch, Search } from 'lucide-react';
import { algorithms } from '../algorithms';
import { pathfindingAlgorithms } from '../algorithms/pathfinding';
import { searchingAlgorithms } from '../algorithms/searching';
import {
  generateRandomArray,
  generateSortedRandomArray,
} from '../utils/arrayHelpers';
import { createEmptyGrid } from '../utils/gridHelpers';
import {
  ALGORITHM_TYPES,
  DEFAULT_ARRAY_SIZE,
  DEFAULT_GRID_SIZE,
  DEFAULT_TREE_NODE_COUNT,
  GRID_SIZES,
} from '../constants';
import { treeTraversalAlgorithms } from '../algorithms/treeTraversal';
import { generateTreeForTraversal } from '../utils/treeGenerators';

/**
 * Per-category configuration registry.
 *
 * Each entry defines:
 *   defaultAlgorithm  — key of the algorithm selected on first load.
 *   i18nPrefix        — prefix for algorithm name translations (`t(\`${i18nPrefix}.${key}\`)`).
 *   i18nTabKey        — translation key for the category tab label in SettingsPanel.
 *   icon              — Lucide React component for the category tab button.
 *   getAlgorithmFn    — (key: string) => function that returns steps[].
 *   generateData      — (size?: number) => the input data structure (array, grid, …).
 *                       Sorting: random array (VisualizerApp uses this for initial data, resize, shuffle).
 *                       Pathfinding: empty grid template only; random start/end live in
 *                       usePathfindingVisualization.generateNewGrid / regenerateGrid.
 *   features          — per-category UI feature flags.
 *     hasDataRefresh  — whether the "shuffle / new data" button is shown in ControlPanel.
 *   complexityDataset — 'sorting' | 'pathfinding': which static complexity map Remotion uses
 *                       (see complexityDatasetRegistry.js).
 *   sizeBinding       — 'array' | 'grid': which parent state SettingsPanel reads/writes
 *                       (arraySize vs gridSize in VisualizerApp).
 *   sizeControl       — descriptor consumed by SettingsPanel's SizeControl component.
 *     type            — 'slider' | 'buttons'
 *     i18nKey         — translation key for the label.
 *     (slider) min, max, step
 *     (buttons) options — array of preset size values
 *   algorithmKeys     — ordered list of algorithm keys for the dropdown.
 *   groupDefs         — dropdown group definitions: { labelKey, algorithms[] }.
 *
 * Adding a new category (checklist):
 *   1. Add the type to ALGORITHM_TYPES and ALGORITHM_TYPE_LIST (constants/index.js).
 *   2. Add a full entry below (including features, complexityDataset, algorithmKeys, …).
 *   3. Register VISUALIZER_REGISTRY, VIDEO_SCENE_RENDERERS / VIDEO_TITLE_FALLBACK (if video export),
 *      getExtraVisualizerProps, and complexityDatasetRegistry if you add a new dataset key.
 *   4. In VisualizerApp.jsx: call the category hook unconditionally (Rules of Hooks), merge its
 *      result into useCategoryVisualizations (add one property to the object returned there), and
 *      wire any new top-level state.
 */
export const CATEGORY_CONFIG = {
  [ALGORITHM_TYPES.SORTING]: {
    defaultAlgorithm: 'bubbleSort',
    i18nPrefix: 'algorithms.sorting',
    i18nTabKey: 'modes.sorting',
    icon: BarChart3,
    sizeBinding: 'array',
    getAlgorithmFn: key => algorithms[key],
    generateData: (size = DEFAULT_ARRAY_SIZE) => generateRandomArray(size),
    features: {
      hasDataRefresh: true,
    },
    complexityDataset: 'sorting',
    sizeControl: {
      type: 'slider',
      i18nKey: 'settings.arraySize',
      min: 5,
      max: 100,
      step: 5,
    },
    algorithmKeys: [
      'bubbleSort',
      'quickSort',
      'mergeSort',
      'selectionSort',
      'insertionSort',
      'heapSort',
      'shellSort',
      'radixSort',
      'countingSort',
      'bucketSort',
      'cycleSort',
      'combSort',
      'timSort',
      'bogoSort',
    ],
    groupDefs: [
      {
        labelKey: 'algorithmGroups.comparisonBased',
        algorithms: [
          'bubbleSort',
          'quickSort',
          'mergeSort',
          'selectionSort',
          'insertionSort',
          'heapSort',
          'shellSort',
          'combSort',
          'timSort',
        ],
      },
      {
        labelKey: 'algorithmGroups.nonComparison',
        algorithms: ['radixSort', 'countingSort', 'bucketSort'],
      },
      {
        labelKey: 'algorithmGroups.writeOptimal',
        algorithms: ['cycleSort'],
      },
      {
        labelKey: 'algorithmGroups.educational',
        algorithms: ['bogoSort'],
      },
    ],
  },

  [ALGORITHM_TYPES.PATHFINDING]: {
    defaultAlgorithm: 'bfs',
    i18nPrefix: 'algorithms.pathfinding',
    i18nTabKey: 'modes.pathfinding',
    icon: Grid3x3,
    sizeBinding: 'grid',
    getAlgorithmFn: key => pathfindingAlgorithms[key],
    generateData: (size = DEFAULT_GRID_SIZE) => createEmptyGrid(size, size),
    features: {
      hasDataRefresh: true,
    },
    complexityDataset: 'pathfinding',
    sizeControl: {
      type: 'buttons',
      i18nKey: 'settings.gridSize',
      options: [GRID_SIZES.SMALL, GRID_SIZES.MEDIUM, GRID_SIZES.LARGE],
    },
    algorithmKeys: [
      'bfs',
      'dijkstra',
      'aStar',
      'bidirectionalSearch',
      'greedyBestFirstSearch',
      'jumpPointSearch',
      'bellmanFord',
      'idaStar',
      'dStarLite',
    ],
    groupDefs: [
      {
        labelKey: 'algorithmGroups.unweighted',
        algorithms: ['bfs', 'bidirectionalSearch'],
      },
      {
        labelKey: 'algorithmGroups.weightedOptimal',
        algorithms: ['dijkstra', 'aStar', 'idaStar', 'dStarLite'],
      },
      {
        labelKey: 'algorithmGroups.heuristicBased',
        algorithms: ['greedyBestFirstSearch', 'jumpPointSearch'],
      },
      {
        labelKey: 'algorithmGroups.specialCases',
        algorithms: ['bellmanFord'],
      },
    ],
  },

  [ALGORITHM_TYPES.SEARCHING]: {
    defaultAlgorithm: 'binarySearch',
    i18nPrefix: 'algorithms.searching',
    i18nTabKey: 'modes.searching',
    icon: Search,
    sizeBinding: 'array',
    getAlgorithmFn: key => searchingAlgorithms[key],
    generateData: (size = DEFAULT_ARRAY_SIZE) =>
      generateSortedRandomArray(size),
    features: {
      hasDataRefresh: true,
    },
    complexityDataset: 'searching',
    sizeControl: {
      type: 'slider',
      i18nKey: 'settings.arraySize',
      min: 5,
      max: 100,
      step: 5,
    },
    algorithmKeys: [
      'linearSearch',
      'binarySearch',
      'ternarySearch',
      'jumpSearch',
      'interpolationSearch',
      'exponentialSearch',
      'fibonacciSearch',
      'depthFirstSearch',
      'breadthFirstSearchGraph',
    ],
    groupDefs: [
      {
        labelKey: 'algorithmGroups.sequentialSearch',
        algorithms: ['linearSearch'],
      },
      {
        labelKey: 'algorithmGroups.logarithmicSearch',
        algorithms: [
          'binarySearch',
          'ternarySearch',
          'exponentialSearch',
          'fibonacciSearch',
        ],
      },
      {
        labelKey: 'algorithmGroups.blockJumpSearch',
        algorithms: ['jumpSearch'],
      },
      {
        labelKey: 'algorithmGroups.distributionAwareSearch',
        algorithms: ['interpolationSearch'],
      },
      {
        labelKey: 'algorithmGroups.graphTraversalSearch',
        algorithms: ['depthFirstSearch', 'breadthFirstSearchGraph'],
      },
    ],
  },

  [ALGORITHM_TYPES.TREE_TRAVERSAL]: {
    defaultAlgorithm: 'inorderTraversal',
    i18nPrefix: 'algorithms.treeTraversal',
    i18nTabKey: 'modes.treeTraversal',
    icon: GitBranch,
    sizeBinding: 'tree',
    getAlgorithmFn: key => treeTraversalAlgorithms[key],
    generateData: (size = DEFAULT_TREE_NODE_COUNT) =>
      generateTreeForTraversal({ nodeCount: size }),
    features: {
      hasDataRefresh: true,
    },
    complexityDataset: 'treeTraversal',
    sizeControl: {
      type: 'slider',
      i18nKey: 'settings.treeNodeCount',
      min: 3,
      max: 31,
      step: 1,
    },
    algorithmKeys: [
      'inorderTraversal',
      'levelOrderTraversal',
      'preorderTraversal',
      'postorderTraversal',
      'morrisTraversal',
    ],
    groupDefs: [
      {
        labelKey: 'algorithmGroups.depthFirstTraversal',
        algorithms: [
          'inorderTraversal',
          'preorderTraversal',
          'postorderTraversal',
        ],
      },
      {
        labelKey: 'algorithmGroups.breadthFirstTraversal',
        algorithms: ['levelOrderTraversal'],
      },
      {
        labelKey: 'algorithmGroups.spaceOptimizedTraversal',
        algorithms: ['morrisTraversal'],
      },
    ],
  },
};
