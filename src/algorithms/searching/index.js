/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { linearSearch, linearSearchPure } from './linearSearch';
import { binarySearch, binarySearchPure } from './binarySearch';
import { ternarySearch, ternarySearchPure } from './ternarySearch';
import { jumpSearch, jumpSearchPure } from './jumpSearch';
import {
  interpolationSearch,
  interpolationSearchPure,
} from './interpolationSearch';
import { exponentialSearch, exponentialSearchPure } from './exponentialSearch';
import { fibonacciSearch, fibonacciSearchPure } from './fibonacciSearch';
import { depthFirstSearch, depthFirstSearchPure } from './dfs';
import {
  breadthFirstSearchGraph,
  breadthFirstSearchGraphPure,
} from './bfsGraph';

export const searchingAlgorithms = {
  linearSearch,
  binarySearch,
  ternarySearch,
  jumpSearch,
  interpolationSearch,
  exponentialSearch,
  fibonacciSearch,
  depthFirstSearch,
  breadthFirstSearchGraph,
};

export const pureSearchingAlgorithms = {
  linearSearch: linearSearchPure,
  binarySearch: binarySearchPure,
  ternarySearch: ternarySearchPure,
  jumpSearch: jumpSearchPure,
  interpolationSearch: interpolationSearchPure,
  exponentialSearch: exponentialSearchPure,
  fibonacciSearch: fibonacciSearchPure,
  depthFirstSearch: depthFirstSearchPure,
  breadthFirstSearchGraph: breadthFirstSearchGraphPure,
};

export {
  linearSearch,
  linearSearchPure,
  binarySearch,
  binarySearchPure,
  ternarySearch,
  ternarySearchPure,
  jumpSearch,
  jumpSearchPure,
  interpolationSearch,
  interpolationSearchPure,
  exponentialSearch,
  exponentialSearchPure,
  fibonacciSearch,
  fibonacciSearchPure,
  depthFirstSearch,
  depthFirstSearchPure,
  breadthFirstSearchGraph,
  breadthFirstSearchGraphPure,
};
