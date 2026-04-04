/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * @typedef {{ id: string, x: number, y: number, label?: string }} GraphSearchNode
 * @typedef {{ from: string, to: string }} GraphSearchEdge
 */

/**
 * Random rooted tree with layered layout in normalized [0,1] coordinates.
 *
 * @param {Object} opts
 * @param {number} opts.nodeCount
 * @param {number} [opts.maxChildren]
 * @param {() => number} [opts.rng] — returns [0,1)
 * @returns {{
 *   nodes: GraphSearchNode[],
 *   edges: GraphSearchEdge[],
 *   adjacency: Record<string, string[]>,
 *   rootId: string,
 *   goalId: string,
 *   children: Record<string, string[]>,
 * }}
 */
export function generateRandomSearchTree({
  nodeCount,
  maxChildren = 3,
  rng = Math.random,
}) {
  const n = Math.max(2, Math.floor(nodeCount));
  const ids = Array.from({ length: n }, (_, i) => String(i));
  /** @type {Record<string, string[]>} */
  const treeChildren = Object.fromEntries(ids.map(id => [id, []]));

  for (let i = 1; i < n; i++) {
    const candidates = ids
      .slice(0, i)
      .filter(p => treeChildren[p].length < maxChildren);
    const parent = candidates[Math.floor(rng() * candidates.length)];
    treeChildren[parent].push(ids[i]);
  }

  const rootId = '0';

  /** @type {Record<string, string[]>} */
  const adjacency = Object.fromEntries(ids.map(id => [id, []]));
  for (const p of ids) {
    for (const c of treeChildren[p]) {
      adjacency[p].push(c);
      adjacency[c].push(p);
    }
  }
  for (const id of ids) {
    adjacency[id].sort((a, b) => Number(a) - Number(b));
  }

  const edges = [];
  for (const p of ids) {
    for (const c of treeChildren[p]) {
      edges.push({ from: p, to: c });
    }
  }

  /** @type {Record<string, number>} */
  const depth = {};
  const queue = [rootId];
  depth[rootId] = 0;
  let qi = 0;
  while (qi < queue.length) {
    const u = queue[qi++];
    for (const v of treeChildren[u]) {
      depth[v] = depth[u] + 1;
      queue.push(v);
    }
  }

  const maxDepth = Math.max(...Object.values(depth));
  /** @type {Record<number, string[]>} */
  const byLevel = {};
  for (const id of ids) {
    const d = depth[id];
    if (!byLevel[d]) {
      byLevel[d] = [];
    }
    byLevel[d].push(id);
  }

  const nodes = [];
  for (let d = 0; d <= maxDepth; d++) {
    const row = byLevel[d] ?? [];
    const w = row.length;
    row.forEach((id, j) => {
      const x = w === 1 ? 0.5 : (j + 1) / (w + 1);
      const y = maxDepth === 0 ? 0.5 : (d + 1) / (maxDepth + 2);
      nodes.push({ id, x, y, label: id });
    });
  }

  const leaves = ids.filter(id => treeChildren[id].length === 0);
  const goalCandidates = leaves.filter(id => id !== rootId);
  const goalId =
    goalCandidates.length > 0
      ? goalCandidates[Math.floor(rng() * goalCandidates.length)]
      : ids[ids.length - 1];

  return {
    nodes,
    edges,
    adjacency,
    rootId,
    goalId,
    children: treeChildren,
  };
}
