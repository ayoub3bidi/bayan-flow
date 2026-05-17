/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import i18n from '../../i18n/index.js';
import { GRAPH_REPRESENTATIONS } from '../../registry/graphAlgorithmRegistry.js';

export function sortNodeIds(ids) {
  return [...ids].sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true })
  );
}

export function cloneNodes(nodes) {
  return nodes.map(node => ({ ...node }));
}

export function cloneEdges(edges) {
  return edges.map(edge => ({ ...edge }));
}

export function normalizeAdjacency(adjacency) {
  const out = {};
  for (const [id, neighbors] of Object.entries(adjacency ?? {})) {
    out[id] = sortNodeIds([...new Set(neighbors ?? [])]);
  }
  for (const neighbors of Object.values(out)) {
    for (const id of neighbors) {
      if (!out[id]) out[id] = [];
    }
  }
  return out;
}

export function makeEdgeId(from, to) {
  return `${from}->${to}`;
}

export function makeUndirectedEdgeId(a, b) {
  return sortNodeIds([a, b]).join('|');
}

export function buildEdgeIdByEndpoints(edges, directed = true) {
  const map = new Map();
  for (const edge of edges) {
    map.set(
      directed
        ? makeEdgeId(edge.from, edge.to)
        : makeUndirectedEdgeId(edge.from, edge.to),
      edge.id ??
        (directed
          ? makeEdgeId(edge.from, edge.to)
          : makeUndirectedEdgeId(edge.from, edge.to))
    );
  }
  return map;
}

export function labelById(nodes) {
  return Object.fromEntries(
    nodes.map(node => [node.id, node.label ?? node.id])
  );
}

export function buildFallbackNodes(adjacency) {
  const ids = sortNodeIds(Object.keys(adjacency ?? {}));
  return ids.map((id, index) => ({
    id,
    label: id,
    x: ids.length <= 1 ? 0.5 : index / (ids.length - 1),
    y: 0.5,
  }));
}

export function ensureVisibleNodes(nodes, adjacency) {
  return nodes.length > 0 ? nodes : buildFallbackNodes(adjacency);
}

export function formatBadgeText(labelKey, labels, paramName = 'order') {
  const joined = labels.length > 0 ? labels.join(' → ') : '∅';
  return i18n.t(labelKey, {
    [paramName]: joined,
    defaultValue: joined,
  });
}

export function makeNodeLinkStep({
  nodes,
  edges,
  nodeStates,
  edgeStates,
  stackOrder,
  outputOrder,
  description,
  graphArtifacts = {},
  directed = true,
  weighted = false,
  hasCycle = false,
}) {
  return {
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    stackOrder: [...stackOrder],
    outputOrder: [...outputOrder],
    description,
    representation: GRAPH_REPRESENTATIONS.NODE_LINK,
    graphArtifacts: { ...graphArtifacts },
    directed,
    weighted,
    hasCycle,
  };
}
