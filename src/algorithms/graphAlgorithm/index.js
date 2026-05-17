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

export const graphAlgorithms = {
  topologicalSort,
  kahnAlgorithm,
};

export const pureGraphAlgorithms = {
  topologicalSort: topologicalSortPure,
  kahnAlgorithm: kahnAlgorithmPure,
};

export {
  kahnAlgorithm,
  kahnAlgorithmPure,
  topologicalSort,
  topologicalSortPure,
  isValidTopologicalOrder,
};
