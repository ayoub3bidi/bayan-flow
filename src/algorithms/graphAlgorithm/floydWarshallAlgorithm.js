/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRAPH_REPRESENTATIONS } from '../../registry/graphAlgorithmRegistry.js';
import i18n from '../../i18n/index.js';
import {
  ALGORITHM_STEPS,
  getAlgorithmDescription,
} from '../../utils/algorithmTranslations.js';
import { labelById, sortNodeIds } from './shared.js';

const INF = Number.POSITIVE_INFINITY;

function orderedIds(nodes, edges) {
  const ids = new Set(nodes.map(node => node.id));
  edges.forEach(edge => {
    ids.add(edge.from);
    ids.add(edge.to);
  });
  return sortNodeIds([...ids]);
}

function buildLabels(nodes, ids) {
  const labels = labelById(nodes);
  ids.forEach(id => {
    if (!labels[id]) labels[id] = id;
  });
  return labels;
}

function createMatrix(size, fillValue) {
  return Array.from({ length: size }, () => Array(size).fill(fillValue));
}

function formatDistance(value) {
  return value === INF ? '∞' : String(value);
}

function cloneStateMatrix(cellStates) {
  return cellStates.map(row => [...row]);
}

function matrixFromDistances(ids, labels, distances, cellStates) {
  return {
    rowLabels: ids.map(id => labels[id] ?? id),
    columnLabels: ids.map(id => labels[id] ?? id),
    cells: distances.map(row => row.map(formatDistance)),
    cellStates: cloneStateMatrix(cellStates),
  };
}

function reconstructPath(ids, next, fromIndex, toIndex) {
  if (next[fromIndex][toIndex] == null) return null;
  const path = [ids[fromIndex]];
  let current = fromIndex;

  while (current !== toIndex) {
    current = next[current][toIndex];
    if (current == null) return null;
    path.push(ids[current]);
    if (path.length > ids.length + 1) return null;
  }

  return path;
}

function buildGraphArtifacts(
  labels,
  intermediateId,
  path = null,
  hasNegativeCycle = false
) {
  const badges = [];

  if (intermediateId) {
    badges.push({
      id: 'intermediate',
      text: i18n.t('visualization.matrixIntermediateBadge', {
        node: labels[intermediateId] ?? intermediateId,
        defaultValue: labels[intermediateId] ?? intermediateId,
      }),
    });
  }

  if (path?.length) {
    badges.push({
      id: 'path',
      text: i18n.t('visualization.pathUpdateBadge', {
        path: path.map(id => labels[id] ?? id).join(' → '),
        defaultValue: path.map(id => labels[id] ?? id).join(' → '),
      }),
    });
  }

  if (hasNegativeCycle) {
    badges.push({
      id: 'negative-cycle',
      text: i18n.t('visualization.negativeCycleBadge', {
        defaultValue: 'Negative cycle detected',
      }),
    });
  }

  return { badges };
}

function makeStep({
  ids,
  labels,
  distances,
  cellStates,
  description,
  intermediateId = null,
  path = null,
  hasNegativeCycle = false,
}) {
  return {
    matrix: matrixFromDistances(ids, labels, distances, cellStates),
    description,
    representation: GRAPH_REPRESENTATIONS.MATRIX,
    directed: true,
    weighted: true,
    graphArtifacts: buildGraphArtifacts(
      labels,
      intermediateId,
      path,
      hasNegativeCycle
    ),
    hasNegativeCycle,
  };
}

/**
 * @param {{ nodes?: Array<{ id: string }>, edges?: Array<{ from: string, to: string, weight?: number }> }} input
 * @returns {{ distances: number[][], next: Array<Array<number | null>>, hasNegativeCycle: boolean, ids: string[] }}
 */
export function floydWarshallAlgorithmPure({ nodes = [], edges = [] }) {
  const ids = orderedIds(nodes, edges);
  const size = ids.length;
  const indexById = new Map(ids.map((id, index) => [id, index]));
  const distances = createMatrix(size, INF);
  const next = createMatrix(size, null);

  for (let index = 0; index < size; index += 1) {
    distances[index][index] = 0;
    next[index][index] = index;
  }

  edges.forEach(edge => {
    const fromIndex = indexById.get(edge.from);
    const toIndex = indexById.get(edge.to);
    if (fromIndex == null || toIndex == null) return;
    const weight = edge.weight ?? 0;
    if (weight < distances[fromIndex][toIndex]) {
      distances[fromIndex][toIndex] = weight;
      next[fromIndex][toIndex] = toIndex;
    }
  });

  for (let via = 0; via < size; via += 1) {
    for (let from = 0; from < size; from += 1) {
      if (distances[from][via] === INF) continue;
      for (let to = 0; to < size; to += 1) {
        if (distances[via][to] === INF) continue;
        const candidate = distances[from][via] + distances[via][to];
        if (candidate < distances[from][to]) {
          distances[from][to] = candidate;
          next[from][to] = next[from][via];
        }
      }
    }
  }

  const hasNegativeCycle = distances.some((row, index) => row[index] < 0);

  return { distances, next, hasNegativeCycle, ids };
}

/**
 * @param {Object} input
 * @param {Array<{ id: string, label?: string }>} input.nodes
 * @param {Array<{ id?: string, from: string, to: string, weight?: number }>} input.edges
 * @returns {Array}
 */
export function floydWarshallAlgorithm({ nodes = [], edges = [] }) {
  const ids = orderedIds(nodes, edges);
  const labels = buildLabels(nodes, ids);
  const size = ids.length;
  const indexById = new Map(ids.map((id, index) => [id, index]));
  const distances = createMatrix(size, INF);
  const next = createMatrix(size, null);
  const steps = [];

  for (let index = 0; index < size; index += 1) {
    distances[index][index] = 0;
    next[index][index] = index;
  }

  edges.forEach(edge => {
    const fromIndex = indexById.get(edge.from);
    const toIndex = indexById.get(edge.to);
    if (fromIndex == null || toIndex == null) return;
    const weight = edge.weight ?? 0;
    if (weight < distances[fromIndex][toIndex]) {
      distances[fromIndex][toIndex] = weight;
      next[fromIndex][toIndex] = toIndex;
    }
  });

  let cellStates = createMatrix(size, 'default');

  steps.push(
    makeStep({
      ids,
      labels,
      distances,
      cellStates,
      description: getAlgorithmDescription(
        ALGORITHM_STEPS.FLOYD_WARSHALL_START
      ),
    })
  );

  for (let via = 0; via < size; via += 1) {
    cellStates = createMatrix(size, 'default');
    cellStates[via][via] = 'current';

    steps.push(
      makeStep({
        ids,
        labels,
        distances,
        cellStates,
        description: getAlgorithmDescription(
          ALGORITHM_STEPS.FLOYD_WARSHALL_INTERMEDIATE,
          {
            node: labels[ids[via]] ?? ids[via],
          }
        ),
        intermediateId: ids[via],
      })
    );

    for (let from = 0; from < size; from += 1) {
      if (distances[from][via] === INF) continue;
      for (let to = 0; to < size; to += 1) {
        if (distances[via][to] === INF) continue;
        const candidate = distances[from][via] + distances[via][to];
        if (candidate < distances[from][to]) {
          distances[from][to] = candidate;
          next[from][to] = next[from][via];

          cellStates = createMatrix(size, 'default');
          cellStates[via][via] = 'current';
          cellStates[from][via] = 'considering';
          cellStates[via][to] = 'considering';
          cellStates[from][to] = 'updated';

          const path = reconstructPath(ids, next, from, to);
          steps.push(
            makeStep({
              ids,
              labels,
              distances,
              cellStates,
              description: getAlgorithmDescription(
                ALGORITHM_STEPS.FLOYD_WARSHALL_UPDATE,
                {
                  from: labels[ids[from]] ?? ids[from],
                  to: labels[ids[to]] ?? ids[to],
                  via: labels[ids[via]] ?? ids[via],
                  distance: candidate,
                }
              ),
              intermediateId: ids[via],
              path,
            })
          );
        }
      }
    }
  }

  const negativeCycleNodes = ids.filter(
    (_, index) => distances[index][index] < 0
  );
  if (negativeCycleNodes.length > 0) {
    cellStates = createMatrix(size, 'default');
    negativeCycleNodes.forEach(nodeId => {
      const index = indexById.get(nodeId);
      cellStates[index][index] = 'updated';
    });

    steps.push(
      makeStep({
        ids,
        labels,
        distances,
        cellStates,
        description: getAlgorithmDescription(
          ALGORITHM_STEPS.FLOYD_WARSHALL_NEGATIVE_CYCLE,
          {
            nodes: negativeCycleNodes.map(id => labels[id] ?? id).join(', '),
          }
        ),
        hasNegativeCycle: true,
      })
    );
    return steps;
  }

  steps.push(
    makeStep({
      ids,
      labels,
      distances,
      cellStates: createMatrix(size, 'default'),
      description: getAlgorithmDescription(
        ALGORITHM_STEPS.FLOYD_WARSHALL_FINISH
      ),
    })
  );

  return steps;
}
