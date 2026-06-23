/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { bfs, bfsPure } from './bfs';
import { dijkstra, dijkstraPure } from './dijkstra';
import { aStar, aStarPure } from './aStar';
import {
  bidirectionalSearch,
  bidirectionalSearchPure,
} from './bidirectionalSearch';
import {
  greedyBestFirstSearch,
  greedyBestFirstSearchPure,
} from './greedyBestFirstSearch';
import { jumpPointSearch, jumpPointSearchPure } from './jumpPointSearch';
import { bellmanFord, bellmanFordPure } from './bellmanFord';
import { idaStar, idaStarPure } from './idaStar';
import { dStarLite, dStarLitePure } from './dStarLite';

export const pathfindingAlgorithms = {
  bfs,
  dijkstra,
  aStar,
  bidirectionalSearch,
  greedyBestFirstSearch,
  jumpPointSearch,
  bellmanFord,
  idaStar,
  dStarLite,
};

export const purePathfindingAlgorithms = {
  bfs: bfsPure,
  dijkstra: dijkstraPure,
  aStar: aStarPure,
  bidirectionalSearch: bidirectionalSearchPure,
  greedyBestFirstSearch: greedyBestFirstSearchPure,
  jumpPointSearch: jumpPointSearchPure,
  bellmanFord: bellmanFordPure,
  idaStar: idaStarPure,
  dStarLite: dStarLitePure,
};

export {
  bfs,
  dijkstra,
  aStar,
  bidirectionalSearch,
  greedyBestFirstSearch,
  jumpPointSearch,
  bellmanFord,
  idaStar,
  dStarLite,
};
export {
  bfsPure,
  dijkstraPure,
  aStarPure,
  bidirectionalSearchPure,
  greedyBestFirstSearchPure,
  jumpPointSearchPure,
  bellmanFordPure,
  idaStarPure,
  dStarLitePure,
};
