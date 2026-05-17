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
import { primAlgorithm, primAlgorithmPure } from './primAlgorithm.js';

export const graphAlgorithms = {
  topologicalSort,
  kahnAlgorithm,
  kruskalAlgorithm,
  primAlgorithm,
};

export const pureGraphAlgorithms = {
  topologicalSort: topologicalSortPure,
  kahnAlgorithm: kahnAlgorithmPure,
  kruskalAlgorithm: kruskalAlgorithmPure,
  primAlgorithm: primAlgorithmPure,
};

export {
  kahnAlgorithm,
  kahnAlgorithmPure,
  kruskalAlgorithm,
  kruskalAlgorithmPure,
  primAlgorithm,
  primAlgorithmPure,
  topologicalSort,
  topologicalSortPure,
  isValidTopologicalOrder,
};
