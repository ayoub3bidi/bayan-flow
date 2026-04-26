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
 * @typedef {Object} LevelOrderTraversalStep
 * @property {TreeGenNode[]} nodes
 * @property {TreeGenEdge[]} edges
 * @property {Record<string, string>} nodeStates
 * @property {string[]} visitOrder
 * @property {string[]} [queueOrder]
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
 * @param {TreeGenNode[]} nodes
 * @param {TreeGenEdge[]} edges
 * @param {Record<string, string>} nodeStates
 * @param {string[]} visitOrder
 * @param {string[]} queueOrder
 * @param {string} description
 * @returns {LevelOrderTraversalStep}
 */
function pushStep(nodes, edges, nodeStates, visitOrder, queueOrder, description) {
  return {
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    nodeStates: { ...nodeStates },
    visitOrder: [...visitOrder],
    queueOrder: [...queueOrder],
    description,
  };
}

/**
 * Queue-based level-order traversal (breadth-first traversal on a tree).
 * One visiting + one visited frame per node.
 *
 * @param {Object} input
 * @param {TreeGenNode[]} input.nodes
 * @param {TreeGenEdge[]} input.edges
 * @param {Record<string, TreeChildLinks>} input.children
 * @param {string|null} input.rootId
 * @returns {LevelOrderTraversalStep[]}
 */
export function levelOrderTraversal({ nodes, edges, children, rootId }) {
  const steps = [];

  if (!nodes?.length || rootId == null || !children) {
    steps.push(
      pushStep(
        nodes ?? [],
        edges ?? [],
        {},
        [],
        [],
        getAlgorithmDescription(ALGORITHM_STEPS.LEVEL_ORDER_EMPTY)
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
      getAlgorithmDescription(ALGORITHM_STEPS.LEVEL_ORDER_START)
    )
  );

  /** @type {string[]} */
  const queue = [rootId];
  /** @type {string[]} */
  const completed = [];

  while (queue.length > 0) {
    const queueSnapshot = [...queue];
    const current = queue.shift();
    if (current == null) continue;

    const nodeLabel = labelById[current] ?? current;

    steps.push(
      pushStep(
        nodes,
        edges,
        paintStates(nodes, completed, current),
        completed,
        queueSnapshot,
        getAlgorithmDescription(ALGORITHM_STEPS.LEVEL_ORDER_VISITING, {
          node: nodeLabel,
        })
      )
    );

    completed.push(current);

    steps.push(
      pushStep(
        nodes,
        edges,
        paintStates(nodes, completed, null),
        completed,
        queue,
        getAlgorithmDescription(ALGORITHM_STEPS.LEVEL_ORDER_VISITED, {
          node: nodeLabel,
          order: completed.map(id => labelById[id] ?? id).join(', '),
        })
      )
    );

    const links = children[current];
    const left = links?.left ?? null;
    const right = links?.right ?? null;
    if (left != null) queue.push(left);
    if (right != null) queue.push(right);
  }

  steps.push(
    pushStep(
      nodes,
      edges,
      paintStates(nodes, completed, null),
      completed,
      [],
      getAlgorithmDescription(ALGORITHM_STEPS.LEVEL_ORDER_COMPLETE, {
        order: completed.map(id => labelById[id] ?? id).join(', '),
      })
    )
  );

  return steps;
}

/**
 * Pure level-order traversal: returns ordered node ids level by level.
 *
 * @param {Record<string, TreeChildLinks>} children
 * @param {string|null} rootId
 * @returns {string[]}
 */
export function levelOrderTraversalPure(children, rootId) {
  if (!children || rootId == null) {
    return [];
  }

  /** @type {string[]} */
  const result = [];
  /** @type {string[]} */
  const queue = [rootId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current == null) continue;

    result.push(current);

    const left = children[current]?.left ?? null;
    const right = children[current]?.right ?? null;
    if (left != null) queue.push(left);
    if (right != null) queue.push(right);
  }

  return result;
}
