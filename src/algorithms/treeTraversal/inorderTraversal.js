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
 * @typedef {Object} InorderTraversalStep
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
 * @returns {InorderTraversalStep}
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
 * Iterative inorder traversal with explicit stack; one visiting + one visited frame per node.
 *
 * @param {Object} input
 * @param {TreeGenNode[]} input.nodes
 * @param {TreeGenEdge[]} input.edges
 * @param {Record<string, TreeChildLinks>} input.children
 * @param {string|null} input.rootId
 * @returns {InorderTraversalStep[]}
 */
export function inorderTraversal({ nodes, edges, children, rootId }) {
  const steps = [];

  if (!nodes?.length || rootId == null || !children) {
    steps.push(
      pushStep(
        nodes ?? [],
        edges ?? [],
        {},
        [],
        getAlgorithmDescription(ALGORITHM_STEPS.INORDER_EMPTY)
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
      getAlgorithmDescription(ALGORITHM_STEPS.INORDER_START)
    )
  );

  /** @type {string[]} */
  const stack = [];
  /** @type {string[]} */
  const completed = [];
  let current = rootId;

  while (stack.length > 0 || current != null) {
    while (current != null) {
      stack.push(current);
      const links = children[current];
      current = links?.left ?? null;
    }

    current = stack.pop();
    const nodeLabel = labelById[current] ?? current;

    steps.push(
      pushStep(
        nodes,
        edges,
        paintStates(nodes, completed, current),
        completed,
        getAlgorithmDescription(ALGORITHM_STEPS.INORDER_VISITING, {
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
        getAlgorithmDescription(ALGORITHM_STEPS.INORDER_VISITED, {
          node: nodeLabel,
          order: completed.map(id => labelById[id] ?? id).join(', '),
        })
      )
    );

    const linksAfter = children[current];
    current = linksAfter?.right ?? null;
  }

  steps.push(
    pushStep(
      nodes,
      edges,
      paintStates(nodes, completed, null),
      completed,
      getAlgorithmDescription(ALGORITHM_STEPS.INORDER_COMPLETE, {
        order: completed.map(id => labelById[id] ?? id).join(', '),
      })
    )
  );

  return steps;
}

/**
 * Pure inorder traversal: returns ordered node ids.
 *
 * @param {Record<string, TreeChildLinks>} children
 * @param {string|null} rootId
 * @returns {string[]}
 */
export function inorderTraversalPure(children, rootId) {
  if (!children || rootId == null) {
    return [];
  }

  /** @type {string[]} */
  const result = [];
  /** @type {string[]} */
  const stack = [];
  let current = rootId;

  while (stack.length > 0 || current != null) {
    while (current != null) {
      stack.push(current);
      current = children[current]?.left ?? null;
    }
    current = stack.pop();
    result.push(current);
    current = children[current]?.right ?? null;
  }

  return result;
}
