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
 * Deep-clone binary child links so Morris threading does not mutate caller data.
 *
 * @param {Record<string, TreeChildLinks>} children
 * @returns {Record<string, TreeChildLinks>}
 */
function deepCloneChildren(children) {
  /** @type {Record<string, TreeChildLinks>} */
  const out = {};
  for (const id of Object.keys(children)) {
    const L = children[id];
    out[id] = {
      left: L?.left ?? null,
      right: L?.right ?? null,
    };
  }
  return out;
}

/**
 * @typedef {Object} MorrisTraversalStep
 * @property {TreeGenNode[]} nodes
 * @property {TreeGenEdge[]} edges
 * @property {Record<string, string>} nodeStates — values from `TREE_NODE_STATES`
 * @property {string[]} visitOrder — visited node ids in order (completed visits)
 * @property {string} description — localized narration (via `getAlgorithmDescription`)
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
 * @param {TreeGenEdge[]} baseEdges
 * @param {string} from
 * @param {string} to
 */
function edgesWithThread(baseEdges, from, to) {
  return [...cloneEdges(baseEdges), { from, to }];
}

/**
 * @param {TreeGenNode[]} nodes
 * @param {TreeGenEdge[]} edges
 * @param {Record<string, string>} nodeStates
 * @param {string[]} visitOrder
 * @param {string} description
 * @returns {MorrisTraversalStep}
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
 * Morris (threaded) inorder traversal: O(n) time, O(1) extra space.
 * Visualization uses a deep-cloned mutable `children`; original tree + layout edges unchanged.
 *
 * Thread edges are appended to each step's `edges` array so temporary links render on the SVG.
 *
 * @param {Object} input
 * @param {TreeGenNode[]} input.nodes
 * @param {TreeGenEdge[]} input.edges — original tree edges (constant layout)
 * @param {Record<string, TreeChildLinks>} input.children
 * @param {string|null} input.rootId
 * @returns {MorrisTraversalStep[]}
 */
export function morrisTraversal({ nodes, edges, children, rootId }) {
  const steps = [];

  if (!nodes?.length || rootId == null || !children) {
    steps.push(
      pushStep(
        nodes ?? [],
        edges ?? [],
        {},
        [],
        getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_EMPTY)
      )
    );
    return steps;
  }

  /** @type {Record<string, TreeChildLinks>} */
  const mutable = deepCloneChildren(children);
  const labelById = Object.fromEntries(nodes.map(n => [n.id, n.label ?? n.id]));
  const baseEdges = edges;

  steps.push(
    pushStep(
      nodes,
      baseEdges,
      allDefaultStates(nodes),
      [],
      getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_START)
    )
  );

  /** @type {string[]} */
  const completed = [];
  let current = rootId;

  while (current != null) {
    const left = mutable[current].left;
    if (left == null) {
      const nodeLabel = labelById[current] ?? current;

      steps.push(
        pushStep(
          nodes,
          baseEdges,
          paintStates(nodes, completed, current),
          completed,
          getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_VISITING, {
            node: nodeLabel,
          })
        )
      );

      completed.push(current);

      steps.push(
        pushStep(
          nodes,
          baseEdges,
          paintStates(nodes, completed, null),
          completed,
          getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_VISITED, {
            node: nodeLabel,
            order: completed.map(id => labelById[id] ?? id).join(', '),
          })
        )
      );

      current = mutable[current].right;
    } else {
      let pred = left;
      while (mutable[pred].right != null && mutable[pred].right !== current) {
        pred = mutable[pred].right;
      }

      if (mutable[pred].right == null) {
        const threaded = edgesWithThread(baseEdges, pred, current);

        steps.push(
          pushStep(
            nodes,
            threaded,
            paintStates(nodes, completed, null),
            completed,
            getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_THREADING, {
              from: labelById[pred] ?? pred,
              to: labelById[current] ?? current,
            })
          )
        );

        mutable[pred].right = current;
        current = left;
      } else {
        const threaded = edgesWithThread(baseEdges, pred, current);

        steps.push(
          pushStep(
            nodes,
            threaded,
            paintStates(nodes, completed, null),
            completed,
            getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_UNTHREADING, {
              from: labelById[pred] ?? pred,
              to: labelById[current] ?? current,
            })
          )
        );

        mutable[pred].right = null;

        const nodeLabel = labelById[current] ?? current;

        steps.push(
          pushStep(
            nodes,
            baseEdges,
            paintStates(nodes, completed, current),
            completed,
            getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_VISITING, {
              node: nodeLabel,
            })
          )
        );

        completed.push(current);

        steps.push(
          pushStep(
            nodes,
            baseEdges,
            paintStates(nodes, completed, null),
            completed,
            getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_VISITED, {
              node: nodeLabel,
              order: completed.map(id => labelById[id] ?? id).join(', '),
            })
          )
        );

        current = mutable[current].right;
      }
    }
  }

  steps.push(
    pushStep(
      nodes,
      baseEdges,
      paintStates(nodes, completed, null),
      completed,
      getAlgorithmDescription(ALGORITHM_STEPS.MORRIS_COMPLETE, {
        order: completed.map(id => labelById[id] ?? id).join(', '),
      })
    )
  );

  return steps;
}

/**
 * Pure Morris inorder traversal: returns ordered node ids (same order as stack inorder).
 * Does not mutate `children`.
 *
 * @param {Record<string, TreeChildLinks>} children
 * @param {string|null} rootId
 * @returns {string[]}
 */
export function morrisTraversalPure(children, rootId) {
  if (!children || rootId == null) {
    return [];
  }

  const mutable = deepCloneChildren(children);
  /** @type {string[]} */
  const result = [];
  let current = rootId;

  while (current != null) {
    const left = mutable[current].left;
    if (left == null) {
      result.push(current);
      current = mutable[current].right;
    } else {
      let pred = left;
      while (mutable[pred].right != null && mutable[pred].right !== current) {
        pred = mutable[pred].right;
      }

      if (mutable[pred].right == null) {
        mutable[pred].right = current;
        current = left;
      } else {
        mutable[pred].right = null;
        result.push(current);
        current = mutable[current].right;
      }
    }
  }

  return result;
}
