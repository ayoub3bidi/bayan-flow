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
import {
  kosarajuAlgorithm,
  kosarajuAlgorithmPure,
} from './kosarajuAlgorithm.js';
import {
  floydWarshallAlgorithm,
  floydWarshallAlgorithmPure,
} from './floydWarshallAlgorithm.js';
import { tarjanAlgorithm, tarjanAlgorithmPure } from './tarjanAlgorithm.js';

export const graphAlgorithms = {
  topologicalSort,
  kahnAlgorithm,
  kruskalAlgorithm,
  primAlgorithm,
  kosarajuAlgorithm,
  tarjanAlgorithm,
  floydWarshallAlgorithm,
};

export const pureGraphAlgorithms = {
  topologicalSort: topologicalSortPure,
  kahnAlgorithm: kahnAlgorithmPure,
  kruskalAlgorithm: kruskalAlgorithmPure,
  primAlgorithm: primAlgorithmPure,
  kosarajuAlgorithm: kosarajuAlgorithmPure,
  tarjanAlgorithm: tarjanAlgorithmPure,
  floydWarshallAlgorithm: floydWarshallAlgorithmPure,
};

export {
  floydWarshallAlgorithm,
  floydWarshallAlgorithmPure,
  kahnAlgorithm,
  kahnAlgorithmPure,
  kosarajuAlgorithm,
  kosarajuAlgorithmPure,
  kruskalAlgorithm,
  kruskalAlgorithmPure,
  primAlgorithm,
  primAlgorithmPure,
  tarjanAlgorithm,
  tarjanAlgorithmPure,
  topologicalSort,
  topologicalSortPure,
  isValidTopologicalOrder,
};
