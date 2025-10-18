import { bfs, bfsPure } from './bfs';
import { dijkstra, dijkstraPure } from './dijkstra';
import { aStar, aStarPure } from './aStar';

export const pathfindingAlgorithms = {
  bfs,
  dijkstra,
  aStar,
};

export const purePathfindingAlgorithms = {
  bfs: bfsPure,
  dijkstra: dijkstraPure,
  aStar: aStarPure,
};

export { bfs, dijkstra, aStar };
export { bfsPure, dijkstraPure, aStarPure };
