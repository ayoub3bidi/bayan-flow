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

  // ── Subtree-width tree layout (two-pass, zero edge crossings) ──────────
  // Pass 1 — bottom-up: compute subtree width for every node.
  // A leaf occupies 1 unit; a parent occupies the sum of its children's
  // widths plus inter-child spacing.
  const SIBLING_GAP = 0.4;
  /** @type {Record<string, number>} */
  const subtreeWidth = {};

  function computeWidth(nodeId) {
    const ch = treeChildren[nodeId];
    if (ch.length === 0) {
      subtreeWidth[nodeId] = 1;
      return 1;
    }
    let total = 0;
    for (const child of ch) {
      total += computeWidth(child);
    }
    total += (ch.length - 1) * SIBLING_GAP;
    subtreeWidth[nodeId] = total;
    return total;
  }
  computeWidth(rootId);

  // Pass 2 — top-down: assign x-coordinate so every parent is centered
  // above its children, and siblings never overlap.
  /** @type {Record<string, number>} */
  const xPos = {};

  function assignX(nodeId, leftBound, rightBound) {
    xPos[nodeId] = (leftBound + rightBound) / 2;
    const ch = treeChildren[nodeId];
    if (ch.length === 0) return;

    const totalChildWidth =
      ch.reduce((sum, c) => sum + subtreeWidth[c], 0) +
      (ch.length - 1) * SIBLING_GAP;

    let cursor = (leftBound + rightBound) / 2 - totalChildWidth / 2;
    for (const child of ch) {
      const w = subtreeWidth[child];
      assignX(child, cursor, cursor + w);
      cursor += w + SIBLING_GAP;
    }
  }
  assignX(rootId, 0, subtreeWidth[rootId]);

  // Normalize x-coordinates to [0, 1].
  const allX = Object.values(xPos);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const xRange = maxX - minX || 1;

  const nodes = ids.map(id => ({
    id,
    x: (xPos[id] - minX) / xRange,
    y: maxDepth === 0 ? 0.5 : (depth[id] + 1) / (maxDepth + 2),
    label: id,
  }));

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
