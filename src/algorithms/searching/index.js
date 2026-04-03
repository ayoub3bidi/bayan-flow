/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { linearSearch, linearSearchPure } from './linearSearch';
import { binarySearch, binarySearchPure } from './binarySearch';
import { jumpSearch, jumpSearchPure } from './jumpSearch';
import {
  interpolationSearch,
  interpolationSearchPure,
} from './interpolationSearch';
import { exponentialSearch, exponentialSearchPure } from './exponentialSearch';
import { fibonacciSearch, fibonacciSearchPure } from './fibonacciSearch';

export const searchingAlgorithms = {
  linearSearch,
  binarySearch,
  jumpSearch,
  interpolationSearch,
  exponentialSearch,
  fibonacciSearch,
};

export const pureSearchingAlgorithms = {
  linearSearch: linearSearchPure,
  binarySearch: binarySearchPure,
  jumpSearch: jumpSearchPure,
  interpolationSearch: interpolationSearchPure,
  exponentialSearch: exponentialSearchPure,
  fibonacciSearch: fibonacciSearchPure,
};

export {
  linearSearch,
  linearSearchPure,
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
