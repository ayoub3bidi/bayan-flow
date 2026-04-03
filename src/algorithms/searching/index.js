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

export const searchingAlgorithms = {
  binarySearch,
  jumpSearch,
  interpolationSearch,
  exponentialSearch,
};

export const pureSearchingAlgorithms = {
  binarySearch: binarySearchPure,
  jumpSearch: jumpSearchPure,
  interpolationSearch: interpolationSearchPure,
  exponentialSearch: exponentialSearchPure,
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
};
