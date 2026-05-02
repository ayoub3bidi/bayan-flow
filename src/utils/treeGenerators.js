/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * @typedef {{ id: string, x: number, y: number, label: string, parentId?: string|null }} TreeGenNode
 * @typedef {{ from: string, to: string }} TreeGenEdge
 * @typedef {{ left: string|null, right: string|null }} TreeChildLinks
 */

/**
 * Random binary tree with subtree-width layout in normalized [0,1] coordinates.
 * Values 1..n are assigned in inorder order so the tree is a valid BST by construction
 * (inorder yields sorted order).
 *
 * @param {Object} opts
 * @param {number} opts.nodeCount
 * @param {() => number} [opts.rng] — returns [0,1)
 * @returns {{
 *   nodes: TreeGenNode[],
 *   edges: TreeGenEdge[],
 *   children: Record<string, TreeChildLinks>,
 *   rootId: string|null,
 *   nodeValues: Record<string, number>,
 * }}
 */
export function generateTreeForTraversal({ nodeCount, rng = Math.random }) {
  const n = Math.floor(nodeCount);
  if (n <= 0) {
    return {
      nodes: [],
      edges: [],
      children: {},
      rootId: null,
      nodeValues: {},
    };
  }

  const ids = Array.from({ length: n }, (_, i) => String(i));

  /** @type {Record<string, TreeChildLinks>} */
  const links = Object.fromEntries(
    ids.map(id => [id, { left: null, right: null }])
  );

  const rootId = ids[0];

  for (let i = 1; i < n; i++) {
    const newId = ids[i];
    const candidates = ids
      .slice(0, i)
      .filter(p => links[p].left === null || links[p].right === null);
    const parent = candidates[Math.floor(rng() * candidates.length)];
    const canLeft = links[parent].left === null;
    const canRight = links[parent].right === null;
    let side = 'left';
    if (canLeft && canRight) {
      side = rng() < 0.5 ? 'left' : 'right';
    } else if (canLeft) {
      side = 'left';
    } else {
      side = 'right';
    }
    links[parent][side] = newId;
  }

  /** @type {Record<string, string[]>} — children lists for layout (left then right) */
  const treeChildren = Object.fromEntries(ids.map(id => [id, []]));
  for (const id of ids) {
    const L = links[id].left;
    const R = links[id].right;
    if (L != null) treeChildren[id].push(L);
    if (R != null) treeChildren[id].push(R);
  }

  /** Inorder ids once structure is fixed */
  function inorderIds(startId) {
    const out = [];
    function walk(nodeId) {
      if (nodeId == null) return;
      walk(links[nodeId].left);
      out.push(nodeId);
      walk(links[nodeId].right);
    }
    walk(startId);
    return out;
  }

  const order = inorderIds(rootId);
  /** @type {Record<string, number>} */
  const nodeValues = {};
  order.forEach((id, idx) => {
    nodeValues[id] = idx + 1;
  });

  /** Depth for y layout */
  /** @type {Record<string, number>} */
  const depth = {};
  const queue = [rootId];
  depth[rootId] = 0;
  let qi = 0;
  while (qi < queue.length) {
    const u = queue[qi++];
    const ch = treeChildren[u];
    for (const v of ch) {
      depth[v] = depth[u] + 1;
      queue.push(v);
    }
  }

  const maxDepth = n === 1 ? 0 : Math.max(...Object.values(depth));

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

  const allX = Object.values(xPos);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const xRange = maxX - minX || 1;

  const nodes = ids.map(id => {
    const parentEntry = Object.entries(links).find(([, v]) => {
      return v.left === id || v.right === id;
    });
    const parentId = parentEntry ? parentEntry[0] : null;
    const val = nodeValues[id];
    return {
      id,
      x: (xPos[id] - minX) / xRange,
      y: maxDepth === 0 ? 0.5 : (depth[id] + 1) / (maxDepth + 2),
      label: String(val),
      parentId,
    };
  });

  const edges = [];
  for (const id of ids) {
    const L = links[id].left;
    const R = links[id].right;
    if (L != null) edges.push({ from: id, to: L });
    if (R != null) edges.push({ from: id, to: R });
  }

  return {
    nodes,
    edges,
    children: links,
    rootId,
    nodeValues,
  };
}
