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

function buildNodeLabels(ids) {
  return Object.fromEntries(
    ids.map((id, index) => [id, String.fromCharCode(65 + index)])
  );
}

function buildCircularNodes(ids) {
  const labels = buildNodeLabels(ids);
  const radius = ids.length <= 1 ? 0 : 0.38;
  return ids.map((id, index) => {
    const angle = (2 * Math.PI * index) / Math.max(1, ids.length) - Math.PI / 2;
    return {
      id,
      label: labels[id],
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius,
    };
  });
}

function randomWeight(rng, minWeight, maxWeight) {
  return minWeight + Math.floor(rng() * (maxWeight - minWeight + 1));
}

/**
 * Compute the longest path from each node to any sink node in a DAG.
 * This is used to assign topological levels for hierarchical layout.
 */
function computeTopologicalLevels(adjacency) {
  const ids = Object.keys(adjacency ?? {});
  const memo = {};

  function longestPath(id) {
    if (memo[id] !== undefined) return memo[id];
    const neighbors = adjacency[id] ?? [];
    if (neighbors.length === 0) {
      return (memo[id] = 0);
    }
    memo[id] = 1 + Math.max(...neighbors.map(longestPath));
    return memo[id];
  }

  const levels = {};
  const maxLevel = Math.max(...ids.map(longestPath), 0);
  for (const id of ids) {
    levels[id] = maxLevel - longestPath(id);
  }
  return { levels, maxLevel };
}

/**
 * Layered directed acyclic graph generator using hierarchical layout.
 * Nodes are assigned to levels based on their topological depth, minimizing
 * edge crossings and creating a clean, understandable visualization.
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

  /** @type {Record<string, string[]>} */
  const adjacency = Object.fromEntries(ids.map(id => [id, []]));
  /** @type {GraphAlgorithmEdge[]} */
  const edges = [];

  // Generate edges: only from lower ids to higher ids (ensures acyclicity)
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

  // Compute hierarchical levels for clean layout
  const { levels, maxLevel } = computeTopologicalLevels(adjacency);

  // Group nodes by level
  const nodesPerLevel = Array.from({ length: maxLevel + 1 }, () => []);
  for (const id of ids) {
    nodesPerLevel[levels[id]].push(id);
  }

  // Sort nodes within each level by their original id for consistency
  for (const level of nodesPerLevel) {
    level.sort((a, b) => Number(a) - Number(b));
  }

  // Position nodes: x based on position within level, y based on level
  const nodes = [];
  for (let levelIndex = 0; levelIndex < nodesPerLevel.length; levelIndex++) {
    const levelNodes = nodesPerLevel[levelIndex];
    const levelY = maxLevel === 0 ? 0.5 : levelIndex / maxLevel;

    for (let i = 0; i < levelNodes.length; i++) {
      const id = levelNodes[i];
      const originalIndex = ids.indexOf(id);
      const levelX =
        levelNodes.length === 1 ? 0.5 : i / (levelNodes.length - 1);

      nodes.push({
        id,
        label: String.fromCharCode(65 + originalIndex),
        x: levelX,
        y: levelY,
      });
    }
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
 * Random connected undirected weighted graph for MST algorithms.
 *
 * @param {Object} opts
 * @param {number} opts.nodeCount
 * @param {() => number} [opts.rng]
 * @param {number} [opts.edgeProbability]
 * @param {number} [opts.minWeight]
 * @param {number} [opts.maxWeight]
 * @returns {{
 *   nodes: GraphAlgorithmNode[],
 *   edges: GraphAlgorithmEdge[],
 *   adjacency: Record<string, string[]>,
 *   directed: false,
 *   weighted: true,
 * }}
 */
export function generateRandomWeightedUndirectedGraph({
  nodeCount,
  rng = Math.random,
  edgeProbability = 0.35,
  minWeight = 1,
  maxWeight = 9,
}) {
  const n = clampNodeCount(nodeCount);
  const ids = Array.from({ length: n }, (_, i) => String(i));
  const adjacency = Object.fromEntries(ids.map(id => [id, []]));
  const edges = [];
  const edgeIds = new Set();

  const addEdge = (from, to, weight) => {
    const key = [from, to].sort((a, b) => Number(a) - Number(b)).join('|');
    if (edgeIds.has(key)) return;
    edgeIds.add(key);
    adjacency[from].push(to);
    adjacency[to].push(from);
    edges.push({
      id: `${from}<->${to}`,
      from,
      to,
      weight,
    });
  };

  for (let index = 0; index < n - 1; index++) {
    addEdge(
      ids[index],
      ids[index + 1],
      randomWeight(rng, minWeight, maxWeight)
    );
  }

  for (let fromIndex = 0; fromIndex < n; fromIndex++) {
    for (let toIndex = fromIndex + 2; toIndex < n; toIndex++) {
      if (rng() < edgeProbability) {
        addEdge(
          ids[fromIndex],
          ids[toIndex],
          randomWeight(rng, minWeight, maxWeight)
        );
      }
    }
  }

  for (const id of ids) {
    adjacency[id].sort((a, b) => Number(a) - Number(b));
  }

  return {
    nodes: buildCircularNodes(ids),
    edges,
    adjacency,
    directed: false,
    weighted: true,
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

/**
 * @param {Record<string, string[]>} adjacency
 * @returns {boolean}
 */
export function isConnectedUndirectedGraph(adjacency) {
  const ids = Object.keys(adjacency ?? {});
  if (ids.length <= 1) return true;

  const visited = new Set();
  const stack = [ids[0]];

  while (stack.length > 0) {
    const current = stack.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    for (const next of adjacency[current] ?? []) {
      if (!visited.has(next)) stack.push(next);
    }
  }

  return visited.size === ids.length;
}
