/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { TREE_NODE_STATES } from '../../constants';
import {
  getAlgorithmDescription,
  ALGORITHM_STEPS,
} from '../../utils/algorithmTranslations';

/**
 * @typedef {import('../../utils/treeGenerators.js').TreeGenNode} TreeGenNode
 * @typedef {import('../../utils/treeGenerators.js').TreeGenEdge} TreeGenEdge
 * @typedef {import('../../utils/treeGenerators.js').TreeChildLinks} TreeChildLinks
 */

/**
 * @typedef {'ltr' | 'rtl'} LevelScanDirection
 */

/**
 * @typedef {Object} ZigzagLevelOrderTraversalStep
 * @property {TreeGenNode[]} nodes
 * @property {TreeGenEdge[]} edges
 * @property {Record<string, string>} nodeStates
 * @property {string[]} visitOrder
 * @property {string[]} [queueOrder]
 * @property {LevelScanDirection} [levelScanDirection]
 * @property {string} description
 */

function cloneNodes(nodes) {
  return nodes.map(n => ({ ...n }));
}

function cloneEdges(edges) {
  return edges.map(e => ({ ...e }));
}

/**
 * @param {TreeGenNode[]} nodes
 */
function allDefaultStates(nodes) {
  /** @type {Record<string, string>} */
  const st = {};
  for (const n of nodes) {
    st[n.id] = TREE_NODE_STATES.DEFAULT;
  }
  return st;
}

/**
 * @param {TreeGenNode[]} nodes
 * @param {string[]} visitOrderIds
 * @param {string | null} visitingId
 */
function paintStates(nodes, visitOrderIds, visitingId) {
  /** @type {Record<string, string>} */
  const st = {};
  for (const n of nodes) {
    st[n.id] = TREE_NODE_STATES.DEFAULT;
  }
  for (const id of visitOrderIds) {
    st[id] = TREE_NODE_STATES.VISITED;
  }
  if (visitingId != null && st[visitingId] !== undefined) {
    st[visitingId] = TREE_NODE_STATES.VISITING;
  }
  return st;
}

/**
 * @param {string[]} levelNodes Spatial left-to-right order for this depth
 * @param {Record<string, TreeChildLinks>} children
 */
function spatialNextLevelIds(levelNodes, children) {
  /** @type {string[]} */
  const next = [];
  for (const id of levelNodes) {
    const left = children[id]?.left ?? null;
    const right = children[id]?.right ?? null;
    if (left != null) next.push(left);
    if (right != null) next.push(right);
  }
  return next;
}

/**
 * @param {TreeGenNode[]} nodes
 * @param {TreeGenEdge[]} edges
 * @param {Record<string, string>} nodeStates
 * @param {string[]} visitOrder
 * @param {string[]} queueOrder
 * @param {string} description
 * @param {LevelScanDirection | undefined} levelScanDirection
 * @returns {ZigzagLevelOrderTraversalStep}
 */
function pushStep(
  nodes,
  edges,
  nodeStates,
  visitOrder,
  queueOrder,
  description,
  levelScanDirection
) {
  /** @type {ZigzagLevelOrderTraversalStep} */
  const step = {
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    nodeStates: { ...nodeStates },
    visitOrder: [...visitOrder],
    queueOrder: [...queueOrder],
    description,
  };
  if (levelScanDirection !== undefined) {
    step.levelScanDirection = levelScanDirection;
  }
  return step;
}

/**
 * Zigzag level-order: breadth-first by level, alternating scan direction per depth.
 *
 * @param {Object} input
 * @param {TreeGenNode[]} input.nodes
 * @param {TreeGenEdge[]} input.edges
 * @param {Record<string, TreeChildLinks>} input.children
 * @param {string|null} input.rootId
 * @returns {ZigzagLevelOrderTraversalStep[]}
 */
export function zigzagLevelOrderTraversal({ nodes, edges, children, rootId }) {
  /** @type {ZigzagLevelOrderTraversalStep[]} */
  const steps = [];

  if (!nodes?.length || rootId == null || !children) {
    steps.push(
      pushStep(
        nodes ?? [],
        edges ?? [],
        {},
        [],
        [],
        getAlgorithmDescription(ALGORITHM_STEPS.ZIGZAG_LEVEL_EMPTY),
        undefined
      )
    );
    return steps;
  }

  const labelById = Object.fromEntries(nodes.map(n => [n.id, n.label ?? n.id]));

  steps.push(
    pushStep(
      nodes,
      edges,
      allDefaultStates(nodes),
      [],
      [rootId],
      getAlgorithmDescription(ALGORITHM_STEPS.ZIGZAG_LEVEL_START),
      'ltr'
    )
  );

  /** @type {string[]} */
  let queue = [rootId];
  let leftToRight = true;

  /** @type {string[]} */
  const completed = [];

  while (queue.length > 0) {
    const size = queue.length;
    /** @type {string[]} */
    const levelNodes = [];
    for (let i = 0; i < size; i++) {
      const id = queue.shift();
      if (id != null) levelNodes.push(id);
    }

    /** @type {LevelScanDirection} */
    const dir = leftToRight ? 'ltr' : 'rtl';
    const visitSeq = leftToRight ? [...levelNodes] : [...levelNodes].reverse();

    /** @type {string[]} */
    let workingTail = [];

    for (let vi = 0; vi < visitSeq.length; vi++) {
      const id = visitSeq[vi];
      if (id == null) continue;

      const nodeLabel = labelById[id] ?? id;

      const qVisiting = [...visitSeq.slice(vi), ...workingTail];

      steps.push(
        pushStep(
          nodes,
          edges,
          paintStates(nodes, completed, id),
          completed,
          qVisiting,
          getAlgorithmDescription(ALGORITHM_STEPS.ZIGZAG_LEVEL_VISITING, {
            node: nodeLabel,
          }),
          dir
        )
      );

      completed.push(id);

      const left = children[id]?.left ?? null;
      const right = children[id]?.right ?? null;
      if (left != null) workingTail.push(left);
      if (right != null) workingTail.push(right);

      const qVisited = [...visitSeq.slice(vi + 1), ...workingTail];

      steps.push(
        pushStep(
          nodes,
          edges,
          paintStates(nodes, completed, null),
          completed,
          qVisited,
          getAlgorithmDescription(ALGORITHM_STEPS.ZIGZAG_LEVEL_VISITED, {
            node: nodeLabel,
            order: completed.map(x => labelById[x] ?? x).join(', '),
          }),
          dir
        )
      );
    }

    queue = spatialNextLevelIds(levelNodes, children);
    leftToRight = !leftToRight;
  }

  steps.push(
    pushStep(
      nodes,
      edges,
      paintStates(nodes, completed, null),
      completed,
      [],
      getAlgorithmDescription(ALGORITHM_STEPS.ZIGZAG_LEVEL_COMPLETE, {
        order: completed.map(id => labelById[id] ?? id).join(', '),
      }),
      undefined
    )
  );

  return steps;
}

/**
 * Zigzag level-order visit order as node ids (O(n) time, O(w) queue width).
 *
 * @param {Record<string, TreeChildLinks>} children
 * @param {string|null} rootId
 * @returns {string[]}
 */
export function zigzagLevelOrderTraversalPure(children, rootId) {
  if (!children || rootId == null) {
    return [];
  }

  /** @type {string[]} */
  const result = [];
  /** @type {string[]} */
  let queue = [rootId];
  let leftToRight = true;

  while (queue.length > 0) {
    const size = queue.length;
    /** @type {string[]} */
    const levelNodes = [];
    for (let i = 0; i < size; i++) {
      const id = queue.shift();
      if (id != null) levelNodes.push(id);
    }

    const visitSeq = leftToRight ? [...levelNodes] : [...levelNodes].reverse();

    for (const id of visitSeq) {
      if (id != null) result.push(id);
    }

    queue = spatialNextLevelIds(levelNodes, children);
    leftToRight = !leftToRight;
  }

  return result;
}
