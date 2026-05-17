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
import { kahnAlgorithm, kahnAlgorithmPure } from './kahnAlgorithm.js';
import { kruskalAlgorithm, kruskalAlgorithmPure } from './kruskalAlgorithm.js';

export const graphAlgorithms = {
  topologicalSort,
  kahnAlgorithm,
  kruskalAlgorithm,
};

export const pureGraphAlgorithms = {
  topologicalSort: topologicalSortPure,
  kahnAlgorithm: kahnAlgorithmPure,
  kruskalAlgorithm: kruskalAlgorithmPure,
};

export {
  kahnAlgorithm,
  kahnAlgorithmPure,
  kruskalAlgorithm,
  kruskalAlgorithmPure,
  topologicalSort,
  topologicalSortPure,
  isValidTopologicalOrder,
};
