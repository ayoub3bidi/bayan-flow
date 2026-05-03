/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  isValidTopologicalOrder,
  topologicalSort,
  topologicalSortPure,
} from './topologicalSort.js';

export const graphAlgorithms = {
  topologicalSort,
};

export const pureGraphAlgorithms = {
  topologicalSort: topologicalSortPure,
};

export { topologicalSort, topologicalSortPure, isValidTopologicalOrder };
