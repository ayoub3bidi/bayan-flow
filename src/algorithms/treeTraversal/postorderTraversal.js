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
 * @typedef {Object} PostorderTraversalStep
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
 * @returns {PostorderTraversalStep}
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
 * Iterative postorder traversal using two-stack approach.
 * Stack 1 processes nodes; Stack 2 collects output in reverse.
 * One visiting + one visited frame per node.
 *
 * @param {Object} input
 * @param {TreeGenNode[]} input.nodes
 * @param {TreeGenEdge[]} input.edges
 * @param {Record<string, TreeChildLinks>} input.children
 * @param {string|null} input.rootId
 * @returns {PostorderTraversalStep[]}
 */
export function postorderTraversal({ nodes, edges, children, rootId }) {
  const steps = [];

  if (!nodes?.length || rootId == null || !children) {
    steps.push(
      pushStep(
        nodes ?? [],
        edges ?? [],
        {},
        [],
        getAlgorithmDescription(ALGORITHM_STEPS.POSTORDER_EMPTY)
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
      getAlgorithmDescription(ALGORITHM_STEPS.POSTORDER_START)
    )
  );

  // Two-stack iterative approach: stack1 for processing, stack2 for output
  /** @type {string[]} */
  const stack1 = [rootId];
  /** @type {string[]} */
  const stack2 = [];

  while (stack1.length > 0) {
    const current = stack1.pop();
    if (current == null) continue;

    stack2.push(current);

    const links = children[current];
    const left = links?.left ?? null;
    const right = links?.right ?? null;

    if (left != null) stack1.push(left);
    if (right != null) stack1.push(right);
  }

  const completed = [];

  while (stack2.length > 0) {
    const current = stack2.pop();
    if (current == null) continue;

    const nodeLabel = labelById[current] ?? current;

    steps.push(
      pushStep(
        nodes,
        edges,
        paintStates(nodes, completed, current),
        completed,
        getAlgorithmDescription(ALGORITHM_STEPS.POSTORDER_VISITING, {
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
        getAlgorithmDescription(ALGORITHM_STEPS.POSTORDER_VISITED, {
          node: nodeLabel,
          order: completed.map(id => labelById[id] ?? id).join(', '),
        })
      )
    );
  }

  steps.push(
    pushStep(
      nodes,
      edges,
      paintStates(nodes, completed, null),
      completed,
      getAlgorithmDescription(ALGORITHM_STEPS.POSTORDER_COMPLETE, {
        order: completed.map(id => labelById[id] ?? id).join(', '),
      })
    )
  );

  return steps;
}

/**
 * Pure postorder traversal: returns ordered node ids (left subtree, right subtree, node).
 * Uses two-stack iterative approach for O(n) time and O(h) space.
 *
 * @param {Record<string, TreeChildLinks>} children
 * @param {string|null} rootId
 * @returns {string[]}
 */
export function postorderTraversalPure(children, rootId) {
  if (!children || rootId == null) {
    return [];
  }

  /** @type {string[]} */
  const result = [];
  /** @type {string[]} */
  const stack1 = [rootId];
  /** @type {string[]} */
  const stack2 = [];

  while (stack1.length > 0) {
    const current = stack1.pop();
    if (current == null) continue;

    stack2.push(current);

    const left = children[current]?.left ?? null;
    const right = children[current]?.right ?? null;

    if (left != null) stack1.push(left);
    if (right != null) stack1.push(right);
  }

  while (stack2.length > 0) {
    const node = stack2.pop();
    if (node != null) {
      result.push(node);
    }
  }

  return result;
}
