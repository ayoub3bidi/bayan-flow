/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { binarySearch, binarySearchPure } from './binarySearch';
import { jumpSearch, jumpSearchPure } from './jumpSearch';

export const searchingAlgorithms = {
  binarySearch,
  jumpSearch,
};

export const pureSearchingAlgorithms = {
  binarySearch: binarySearchPure,
  jumpSearch: jumpSearchPure,
};

export { binarySearch, binarySearchPure, jumpSearch, jumpSearchPure };
