/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { binarySearch, binarySearchPure } from './binarySearch';
import { jumpSearch, jumpSearchPure } from './jumpSearch';
import {
  interpolationSearch,
  interpolationSearchPure,
} from './interpolationSearch';
import { exponentialSearch, exponentialSearchPure } from './exponentialSearch';
import { fibonacciSearch, fibonacciSearchPure } from './fibonacciSearch';

export const searchingAlgorithms = {
  binarySearch,
  jumpSearch,
  interpolationSearch,
  exponentialSearch,
  fibonacciSearch,
};

export const pureSearchingAlgorithms = {
  binarySearch: binarySearchPure,
  jumpSearch: jumpSearchPure,
  interpolationSearch: interpolationSearchPure,
  exponentialSearch: exponentialSearchPure,
  fibonacciSearch: fibonacciSearchPure,
};

export {
  binarySearch,
  binarySearchPure,
  jumpSearch,
  jumpSearchPure,
  interpolationSearch,
  interpolationSearchPure,
  exponentialSearch,
  exponentialSearchPure,
  fibonacciSearch,
  fibonacciSearchPure,
};
