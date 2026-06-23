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
 * @typedef {Object} PreorderTraversalStep
 * @property {TreeGenNode[]} nodes
 * @property {TreeGenEdge[]} edges
 * @property {Record<string, string>} nodeStates — values from `TREE_NODE_STATES`
 * @property {string[]} visitOrder — visited node ids in order (completed visits)
 * @property {string} description — i18n key passed to `t()`
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
 * @param {string[]} visitOrderIds
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
 * @param {string} description
 * @returns {PreorderTraversalStep}
 */
function pushStep(nodes, edges, nodeStates, visitOrder, description) {
  return {
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    nodeStates: { ...nodeStates },
    visitOrder: [...visitOrder],
    description,
  };
}

/**
 * Iterative preorder traversal with explicit stack (push right then left so left is popped first).
 * One visiting + one visited frame per node.
 *
 * @param {Object} input
 * @param {TreeGenNode[]} input.nodes
 * @param {TreeGenEdge[]} input.edges
 * @param {Record<string, TreeChildLinks>} input.children
 * @param {string|null} input.rootId
 * @returns {PreorderTraversalStep[]}
 */
export function preorderTraversal({ nodes, edges, children, rootId }) {
  const steps = [];

  if (!nodes?.length || rootId == null || !children) {
    steps.push(
      pushStep(
        nodes ?? [],
        edges ?? [],
        {},
        [],
        getAlgorithmDescription(ALGORITHM_STEPS.PREORDER_EMPTY)
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
      getAlgorithmDescription(ALGORITHM_STEPS.PREORDER_START)
    )
  );

  /** @type {string[]} */
  const stack = [rootId];
  /** @type {string[]} */
  const completed = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (current == null) continue;

    const nodeLabel = labelById[current] ?? current;

    steps.push(
      pushStep(
        nodes,
        edges,
        paintStates(nodes, completed, current),
        completed,
        getAlgorithmDescription(ALGORITHM_STEPS.PREORDER_VISITING, {
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
        getAlgorithmDescription(ALGORITHM_STEPS.PREORDER_VISITED, {
          node: nodeLabel,
          order: completed.map(id => labelById[id] ?? id).join(', '),
        })
      )
    );

    const links = children[current];
    const right = links?.right ?? null;
    const left = links?.left ?? null;
    if (right != null) stack.push(right);
    if (left != null) stack.push(left);
  }

  steps.push(
    pushStep(
      nodes,
      edges,
      paintStates(nodes, completed, null),
      completed,
      getAlgorithmDescription(ALGORITHM_STEPS.PREORDER_COMPLETE, {
        order: completed.map(id => labelById[id] ?? id).join(', '),
      })
    )
  );

  return steps;
}

/**
 * Pure preorder traversal: returns ordered node ids (node, left subtree, right subtree).
 *
 * @param {Record<string, TreeChildLinks>} children
 * @param {string|null} rootId
 * @returns {string[]}
 */
export function preorderTraversalPure(children, rootId) {
  if (!children || rootId == null) {
    return [];
  }

  /** @type {string[]} */
  const result = [];
  /** @type {string[]} */
  const stack = [rootId];

  while (stack.length > 0) {
    const current = stack.pop();
    if (current == null) continue;
    result.push(current);
    const right = children[current]?.right ?? null;
    const left = children[current]?.left ?? null;
    if (right != null) stack.push(right);
    if (left != null) stack.push(left);
  }

  return result;
}
