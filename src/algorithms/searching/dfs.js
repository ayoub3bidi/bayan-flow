/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRAPH_NODE_STATES } from '../../constants';
import {
  getAlgorithmDescription,
  ALGORITHM_STEPS,
} from '../../utils/algorithmTranslations';

/**
 * @typedef {import('../../utils/graphSearchGenerators.js').GraphSearchNode} GraphSearchNode
 * @typedef {import('../../utils/graphSearchGenerators.js').GraphSearchEdge} GraphSearchEdge
 */

/**
 * One animation frame for node–link DFS: full snapshot for the visualizer and video export.
 *
 * @typedef {Object} GraphDfsStep
 * @property {GraphSearchNode[]} nodes
 * @property {GraphSearchEdge[]} edges
 * @property {Record<string, string>} nodeStates — values from `GRAPH_NODE_STATES`
 * @property {string[]} stackOrder — bottom → top; top = last element (next pop)
 * @property {string} description — i18n key
 * @property {string} [goalNodeId]
 * @property {{ from: string, to: string }} [activeEdge]
 */

function cloneNodes(nodes) {
  return nodes.map(n => ({ ...n }));
}

function cloneEdges(edges) {
  return edges.map(e => ({ ...e }));
}

/**
 * @param {GraphSearchNode[]} nodes
 * @param {GraphSearchEdge[]} edges
 * @param {Record<string, string>} nodeStates
 * @param {string[]} stackOrder
 * @param {string} description
 * @param {string} goalNodeId
 * @param {{ from: string, to: string } | undefined} activeEdge
 * @returns {GraphDfsStep}
 */
function pushStep(
  nodes,
  edges,
  nodeStates,
  stackOrder,
  description,
  goalNodeId,
  activeEdge
) {
  return {
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    nodeStates: { ...nodeStates },
    stackOrder: [...stackOrder],
    description,
    goalNodeId,
    ...(activeEdge ? { activeEdge } : {}),
  };
}

/**
 * @param {string[]} allIds
 * @param {string} rootId
 * @param {string} goalId
 */
function emptyPalette(allIds, rootId, goalId) {
  /** @type {Record<string, string>} */
  const st = {};
  for (const id of allIds) {
    st[id] = GRAPH_NODE_STATES.DEFAULT;
  }
  st[rootId] = GRAPH_NODE_STATES.ROOT;
  st[goalId] = GRAPH_NODE_STATES.GOAL;
  return st;
}

/**
 * Closed = popped; stack = explicit stack. Root stays ROOT; goal stays GOAL while searching.
 *
 * @param {Set<string>} closed
 * @param {string[]} stack
 * @param {string} rootId
 * @param {string} goalId
 * @param {string[]} allIds
 */
function paintSearchStates(closed, stack, rootId, goalId, allIds) {
  const st = emptyPalette(allIds, rootId, goalId);
  for (const id of closed) {
    if (id === rootId) {
      continue;
    }
    st[id] = GRAPH_NODE_STATES.VISITED;
  }
  for (const id of stack) {
    if (id === rootId || id === goalId) {
      continue;
    }
    st[id] = GRAPH_NODE_STATES.FRONTIER;
  }
  return st;
}

/**
 * Depth-first search on an explicit undirected graph (adjacency list).
 * Iterative stack traversal; neighbor order follows `adjacency[id]` (caller should sort for stability).
 *
 * @param {Object} input
 * @param {Record<string, string[]>} input.adjacency
 * @param {string} input.rootId
 * @param {string} input.goalId
 * @param {GraphSearchNode[]} input.nodes
 * @param {GraphSearchEdge[]} input.edges
 * @returns {GraphDfsStep[]}
 */
export function depthFirstSearch({ adjacency, rootId, goalId, nodes, edges }) {
  const steps = [];

  if (!adjacency || !rootId || !goalId || !nodes?.length) {
    console.error('DFS: invalid graph input', {
      adjacency,
      rootId,
      goalId,
      nodes,
    });
    return steps;
  }

  const allIds = nodes.map(n => n.id);
  const idSet = new Set(allIds);
  if (!idSet.has(rootId) || !idSet.has(goalId)) {
    console.error('DFS: root or goal not in nodes', { rootId, goalId, allIds });
    return steps;
  }

  const neighborList = id => (adjacency[id] ?? []).filter(n => idSet.has(n));

  /** @type {Record<string, string|null>} */
  const parent = {};
  const stack = [rootId];
  const discovered = { [rootId]: true };
  const closed = new Set();

  steps.push(
    pushStep(
      nodes,
      edges,
      paintSearchStates(closed, stack, rootId, goalId, allIds),
      stack,
      'algorithms.descriptions.depthFirstSearch',
      goalId,
      undefined
    )
  );

  let found = false;

  while (stack.length > 0 && !found) {
    const current = stack.pop();

    if (current !== rootId && current !== goalId) {
      closed.add(current);
    }

    steps.push(
      pushStep(
        nodes,
        edges,
        paintSearchStates(closed, stack, rootId, goalId, allIds),
        [...stack],
        getAlgorithmDescription(ALGORITHM_STEPS.DFS_GRAPH_VISITING, {
          node: current,
        }),
        goalId,
        undefined
      )
    );

    if (current === goalId) {
      found = true;
      break;
    }

    const nbrs = neighborList(current).filter(n => !discovered[n]);

    for (let i = nbrs.length - 1; i >= 0; i--) {
      const n = nbrs[i];
      discovered[n] = true;
      parent[n] = current;
      stack.push(n);
    }

    if (stack.length > 0 && nbrs.length > 0) {
      steps.push(
        pushStep(
          nodes,
          edges,
          paintSearchStates(closed, stack, rootId, goalId, allIds),
          stack,
          getAlgorithmDescription(ALGORITHM_STEPS.DFS_STACK_PUSH, {
            count: stack.length,
          }),
          goalId,
          undefined
        )
      );
    }
  }

  if (found) {
    const pathIds = [];
    let cur = goalId;
    while (cur != null) {
      pathIds.unshift(cur);
      cur = parent[cur] ?? null;
    }

    const finalStates = emptyPalette(allIds, rootId, goalId);
    for (const id of allIds) {
      if (id === rootId || id === goalId) {
        continue;
      }
      finalStates[id] = GRAPH_NODE_STATES.VISITED;
    }
    for (const id of pathIds) {
      if (id !== goalId && id !== rootId) {
        finalStates[id] = GRAPH_NODE_STATES.PATH;
      }
    }
    finalStates[rootId] = GRAPH_NODE_STATES.ROOT;
    finalStates[goalId] = GRAPH_NODE_STATES.GOAL;

    steps.push(
      pushStep(
        nodes,
        edges,
        finalStates,
        [],
        getAlgorithmDescription(ALGORITHM_STEPS.PATH_FOUND_GRAPH, {
          length: pathIds.length,
        }),
        goalId,
        undefined
      )
    );
  } else {
    steps.push(
      pushStep(
        nodes,
        edges,
        paintSearchStates(closed, stack, rootId, goalId, allIds),
        stack,
        getAlgorithmDescription(ALGORITHM_STEPS.NO_PATH),
        goalId,
        undefined
      )
    );
  }

  return steps;
}

/**
 * Pure DFS: returns node ids from root to goal, or null.
 *
 * @param {Record<string, string[]>} adjacency
 * @param {string} rootId
 * @param {string} goalId
 * @returns {string[]|null}
 */
export function depthFirstSearchPure(adjacency, rootId, goalId) {
  if (!adjacency || rootId == null || goalId == null) {
    return null;
  }

  const stack = [rootId];
  const discovered = { [rootId]: true };
  /** @type {Record<string, string|null>} */
  const parent = { [rootId]: null };

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === goalId) {
      const path = [];
      let c = goalId;
      while (c != null) {
        path.unshift(c);
        c = parent[c];
      }
      return path;
    }

    const nbrs = (adjacency[current] ?? []).filter(n => !discovered[n]);
    for (let i = nbrs.length - 1; i >= 0; i--) {
      const n = nbrs[i];
      discovered[n] = true;
      parent[n] = current;
      stack.push(n);
    }
  }

  return null;
}
