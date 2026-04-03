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

export const searchingAlgorithms = {
  binarySearch,
  jumpSearch,
  interpolationSearch,
};

export const pureSearchingAlgorithms = {
  binarySearch: binarySearchPure,
  jumpSearch: jumpSearchPure,
  interpolationSearch: interpolationSearchPure,
};

export {
  binarySearch,
  binarySearchPure,
  jumpSearch,
  jumpSearchPure,
  interpolationSearch,
  interpolationSearchPure,
};
