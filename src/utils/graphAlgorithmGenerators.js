/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * @typedef {{ id: string, x: number, y: number, label?: string }} GraphAlgorithmNode
 * @typedef {{ id: string, from: string, to: string, weight?: number }} GraphAlgorithmEdge
 */

function clampNodeCount(nodeCount) {
  return Math.max(1, Math.floor(Number(nodeCount) || 1));
}

/**
 * Layered directed acyclic graph generator. Edges are only created from lower
 * numeric ids to higher numeric ids, so cycles are impossible by construction.
 *
 * @param {Object} opts
 * @param {number} opts.nodeCount
 * @param {() => number} [opts.rng]
 * @param {number} [opts.edgeProbability]
 * @returns {{
 *   nodes: GraphAlgorithmNode[],
 *   edges: GraphAlgorithmEdge[],
 *   adjacency: Record<string, string[]>,
 *   directed: true,
 *   weighted: false,
 * }}
 */
export function generateRandomDag({
  nodeCount,
  rng = Math.random,
  edgeProbability = 0.28,
}) {
  const n = clampNodeCount(nodeCount);
  const ids = Array.from({ length: n }, (_, i) => String(i));
  const columns = Math.min(5, Math.max(1, Math.ceil(Math.sqrt(n))));
  const rows = Math.ceil(n / columns);

  const nodes = ids.map((id, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
      id,
      label: String.fromCharCode(65 + index),
      x: columns === 1 ? 0.5 : col / (columns - 1),
      y: rows === 1 ? 0.5 : row / (rows - 1),
    };
  });

  /** @type {Record<string, string[]>} */
  const adjacency = Object.fromEntries(ids.map(id => [id, []]));
  /** @type {GraphAlgorithmEdge[]} */
  const edges = [];

  for (let fromIndex = 0; fromIndex < n; fromIndex++) {
    for (let toIndex = fromIndex + 1; toIndex < n; toIndex++) {
      const isBackboneEdge = toIndex === fromIndex + 1 && fromIndex % 2 === 0;
      if (isBackboneEdge || rng() < edgeProbability) {
        const from = ids[fromIndex];
        const to = ids[toIndex];
        adjacency[from].push(to);
        edges.push({ id: `${from}->${to}`, from, to });
      }
    }
  }

  for (const id of ids) {
    adjacency[id].sort((a, b) => Number(a) - Number(b));
  }

  return {
    nodes,
    edges,
    adjacency,
    directed: true,
    weighted: false,
  };
}

/**
 * @param {Record<string, string[]>} adjacency
 * @returns {boolean}
 */
export function isAcyclic(adjacency) {
  const visiting = new Set();
  const visited = new Set();
  const ids = Object.keys(adjacency ?? {});

  function dfs(id) {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    for (const next of adjacency[id] ?? []) {
      if (!dfs(next)) return false;
    }
    visiting.delete(id);
    visited.add(id);
    return true;
  }

  return ids.every(dfs);
}
