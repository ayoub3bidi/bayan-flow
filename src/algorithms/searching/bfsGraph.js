/**
 * Copyright (c) 2025 Bayan Flow
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
 * One animation frame for node–link BFS: identical shape to GraphDfsStep so the
 * same GraphVisualizer renders both. `stackOrder` here holds the queue (front→back).
 *
 * @typedef {Object} GraphBfsStep
 * @property {GraphSearchNode[]} nodes
 * @property {GraphSearchEdge[]} edges
 * @property {Record<string, string>} nodeStates — values from `GRAPH_NODE_STATES`
 * @property {string[]} stackOrder — front → back; front = first element (next dequeue)
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
 * @param {string[]} queueOrder
 * @param {string} description
 * @param {string} goalNodeId
 * @param {{ from: string, to: string } | undefined} activeEdge
 * @returns {GraphBfsStep}
 */
function pushStep(
  nodes,
  edges,
  nodeStates,
  queueOrder,
  description,
  goalNodeId,
  activeEdge
) {
  return {
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    nodeStates: { ...nodeStates },
    stackOrder: [...queueOrder], // reuse stackOrder field name for GraphVisualizer compatibility
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
 * Visited = dequeued; queue = explicit FIFO. Root stays ROOT; goal stays GOAL while searching.
 *
 * @param {Set<string>} visited
 * @param {string[]} queue
 * @param {string} rootId
 * @param {string} goalId
 * @param {string[]} allIds
 */
function paintSearchStates(visited, queue, rootId, goalId, allIds) {
  const st = emptyPalette(allIds, rootId, goalId);
  for (const id of visited) {
    if (id === rootId) continue;
    st[id] = GRAPH_NODE_STATES.VISITED;
  }
  for (const id of queue) {
    if (id === rootId || id === goalId) continue;
    st[id] = GRAPH_NODE_STATES.FRONTIER;
  }
  return st;
}

/**
 * Breadth-first search on an explicit undirected graph (adjacency list).
 * Iterative queue traversal; neighbor order follows `adjacency[id]` (caller sorts for stability).
 * Guarantees a shortest-path to the goal (fewest hops).
 *
 * @param {Object} input
 * @param {Record<string, string[]>} input.adjacency
 * @param {string} input.rootId
 * @param {string} input.goalId
 * @param {GraphSearchNode[]} input.nodes
 * @param {GraphSearchEdge[]} input.edges
 * @returns {GraphBfsStep[]}
 */
export function breadthFirstSearchGraph({
  adjacency,
  rootId,
  goalId,
  nodes,
  edges,
}) {
  const steps = [];

  if (!adjacency || !rootId || !goalId || !nodes?.length) {
    console.error('BFS (graph): invalid graph input', {
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
    console.error('BFS (graph): root or goal not in nodes', {
      rootId,
      goalId,
      allIds,
    });
    return steps;
  }

  const neighborList = id => (adjacency[id] ?? []).filter(n => idSet.has(n));

  /** @type {Record<string, string|null>} */
  const parent = {};
  const queue = [rootId];
  const discovered = new Set([rootId]);
  const visited = new Set();

  // Initial frame — queue contains just the root
  steps.push(
    pushStep(
      nodes,
      edges,
      paintSearchStates(visited, queue, rootId, goalId, allIds),
      [...queue],
      'algorithms.descriptions.breadthFirstSearchGraph',
      goalId,
      undefined
    )
  );

  let found = false;

  while (queue.length > 0 && !found) {
    const current = queue.shift(); // FIFO dequeue

    const parentOfCurrent = parent[current] ?? null;
    const traversalEdge =
      parentOfCurrent != null
        ? { from: parentOfCurrent, to: current }
        : undefined;

    // ── CURRENT-state frame: show node being examined before marking visited ──
    {
      const currentStates = paintSearchStates(
        visited,
        queue,
        rootId,
        goalId,
        allIds
      );
      if (current !== rootId && current !== goalId) {
        currentStates[current] = GRAPH_NODE_STATES.CURRENT;
      }
      steps.push(
        pushStep(
          nodes,
          edges,
          currentStates,
          [...queue],
          getAlgorithmDescription(ALGORITHM_STEPS.BFS_GRAPH_DEQUEUE, {
            node: current,
          }),
          goalId,
          traversalEdge
        )
      );
    }

    // Mark as visited (dequeued)
    if (current !== rootId && current !== goalId) {
      visited.add(current);
    }

    if (current === goalId) {
      found = true;
      break;
    }

    const nbrs = neighborList(current).filter(n => !discovered.has(n));
    for (const n of nbrs) {
      discovered.add(n);
      parent[n] = current;
      queue.push(n);
    }

    if (nbrs.length > 0) {
      steps.push(
        pushStep(
          nodes,
          edges,
          paintSearchStates(visited, queue, rootId, goalId, allIds),
          [...queue],
          getAlgorithmDescription(ALGORITHM_STEPS.BFS_GRAPH_ENQUEUE, {
            count: queue.length,
          }),
          goalId,
          undefined
        )
      );
    }
  }

  // Final frame — path reconstruction or no-path
  if (found) {
    const pathIds = [];
    let cur = goalId;
    while (cur != null) {
      pathIds.unshift(cur);
      cur = parent[cur] ?? null;
    }

    const finalStates = emptyPalette(allIds, rootId, goalId);
    for (const id of allIds) {
      if (id === rootId || id === goalId) continue;
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
        paintSearchStates(visited, queue, rootId, goalId, allIds),
        [...queue],
        getAlgorithmDescription(ALGORITHM_STEPS.NO_PATH),
        goalId,
        undefined
      )
    );
  }

  return steps;
}

/**
 * Pure BFS: returns node ids from root to goal (shortest path), or null.
 *
 * @param {Record<string, string[]>} adjacency
 * @param {string} rootId
 * @param {string} goalId
 * @returns {string[]|null}
 */
export function breadthFirstSearchGraphPure(adjacency, rootId, goalId) {
  if (!adjacency || rootId == null || goalId == null) return null;

  const queue = [rootId];
  const discovered = new Set([rootId]);
  /** @type {Record<string, string|null>} */
  const parent = { [rootId]: null };

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === goalId) {
      const path = [];
      let c = goalId;
      while (c != null) {
        path.unshift(c);
        c = parent[c];
      }
      return path;
    }

    for (const nbr of adjacency[current] ?? []) {
      if (!discovered.has(nbr)) {
        discovered.add(nbr);
        parent[nbr] = current;
        queue.push(nbr);
      }
    }
  }

  return null;
}
