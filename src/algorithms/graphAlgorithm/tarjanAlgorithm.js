/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRAPH_EDGE_STATES, GRAPH_NODE_STATES } from '../../constants/index.js';
import i18n from '../../i18n/index.js';
import {
  ALGORITHM_STEPS,
  getAlgorithmDescription,
} from '../../utils/algorithmTranslations.js';
import {
  buildEdgeIdByEndpoints,
  ensureVisibleNodes,
  labelById,
  makeEdgeId,
  makeNodeLinkStep,
  normalizeAdjacency,
  sortNodeIds,
} from './shared.js';

function formatLowLinkBadge(ids, labels, indexById, lowLinkById) {
  const pairs = ids
    .filter(id => indexById[id] !== undefined)
    .map(
      id =>
        `${labels[id] ?? id}:${indexById[id]}/${lowLinkById[id] ?? indexById[id]}`
    )
    .join(', ');

  return i18n.t('visualization.lowLinkBadge', {
    pairs: pairs || '∅',
    defaultValue: pairs || '∅',
  });
}

function formatSccListBadge(components, labels) {
  const summary =
    components
      .map(component => `{${component.map(id => labels[id] ?? id).join(', ')}}`)
      .join(' | ') || '∅';

  return i18n.t('visualization.sccListBadge', {
    components: summary,
    defaultValue: summary,
  });
}

function buildGraphArtifacts(stack, labels, ids, indexById, lowLinkById, sccs) {
  return {
    badges: [
      {
        id: 'stack',
        text: i18n.t('visualization.sccStackBadge', {
          order: stack.map(id => labels[id] ?? id).join(' → ') || '∅',
          defaultValue: stack.map(id => labels[id] ?? id).join(' → ') || '∅',
        }),
      },
      {
        id: 'lowlink',
        text: formatLowLinkBadge(ids, labels, indexById, lowLinkById),
      },
      {
        id: 'components',
        text: formatSccListBadge(sccs, labels),
      },
    ],
  };
}

function paintNodeStates(nodes, stackSet, currentId, completedSet) {
  /** @type {Record<string, string>} */
  const states = {};

  for (const node of nodes) {
    if (node.id === currentId) {
      states[node.id] = GRAPH_NODE_STATES.CURRENT;
    } else if (completedSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.PATH;
    } else if (stackSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.FRONTIER;
    } else {
      states[node.id] = GRAPH_NODE_STATES.DEFAULT;
    }
  }

  return states;
}

function markComponentEdges(component, edges, edgeStates) {
  const componentSet = new Set(component);
  for (const edge of edges) {
    if (componentSet.has(edge.from) && componentSet.has(edge.to)) {
      edgeStates[edge.id ?? makeEdgeId(edge.from, edge.to)] =
        GRAPH_EDGE_STATES.SELECTED;
    }
  }
}

/**
 * @param {Record<string, string[]>} adjacency
 * @returns {{
 *   sccs: string[][],
 *   indexById: Record<string, number>,
 *   lowLinkById: Record<string, number>,
 * }}
 */
export function tarjanAlgorithmPure(adjacency) {
  const graph = normalizeAdjacency(adjacency);
  const ids = sortNodeIds(Object.keys(graph));
  /** @type {Record<string, number>} */
  const indexById = {};
  /** @type {Record<string, number>} */
  const lowLinkById = {};
  const stack = [];
  const stackSet = new Set();
  const sccs = [];
  let nextIndex = 0;

  function strongConnect(id) {
    indexById[id] = nextIndex;
    lowLinkById[id] = nextIndex;
    nextIndex += 1;
    stack.push(id);
    stackSet.add(id);

    for (const next of graph[id] ?? []) {
      if (indexById[next] === undefined) {
        strongConnect(next);
        lowLinkById[id] = Math.min(lowLinkById[id], lowLinkById[next]);
      } else if (stackSet.has(next)) {
        lowLinkById[id] = Math.min(lowLinkById[id], indexById[next]);
      }
    }

    if (lowLinkById[id] === indexById[id]) {
      const component = [];
      while (stack.length > 0) {
        const popped = stack.pop();
        stackSet.delete(popped);
        component.push(popped);
        if (popped === id) break;
      }
      sccs.push(sortNodeIds(component));
    }
  }

  for (const id of ids) {
    if (indexById[id] === undefined) {
      strongConnect(id);
    }
  }

  return { sccs, indexById, lowLinkById };
}

/**
 * @param {Object} input
 * @param {Array<{ id: string, x: number, y: number, label?: string }>} input.nodes
 * @param {Array<{ id?: string, from: string, to: string, weight?: number }>} input.edges
 * @param {Record<string, string[]>} input.adjacency
 * @returns {Array}
 */
export function tarjanAlgorithm({ nodes = [], edges = [], adjacency = {} }) {
  const graph = normalizeAdjacency(adjacency);
  const ids = sortNodeIds(Object.keys(graph));
  const visibleNodes = ensureVisibleNodes(nodes, graph);
  const labels = labelById(visibleNodes);
  const edgeIdByEndpoints = buildEdgeIdByEndpoints(edges);
  /** @type {Record<string, number>} */
  const indexById = {};
  /** @type {Record<string, number>} */
  const lowLinkById = {};
  /** @type {Record<string, string>} */
  const edgeStates = {};
  const stack = [];
  const stackSet = new Set();
  const completedSet = new Set();
  const sccs = [];
  const steps = [];
  let nextIndex = 0;

  const push = (description, currentId = null) => {
    steps.push(
      makeNodeLinkStep({
        nodes: visibleNodes,
        edges,
        nodeStates: paintNodeStates(
          visibleNodes,
          stackSet,
          currentId,
          completedSet
        ),
        edgeStates,
        stackOrder: stack,
        outputOrder: [...completedSet],
        description,
        graphArtifacts: buildGraphArtifacts(
          stack,
          labels,
          ids,
          indexById,
          lowLinkById,
          sccs
        ),
        directed: true,
        weighted: false,
      })
    );
  };

  push(getAlgorithmDescription(ALGORITHM_STEPS.TARJAN_START));

  function strongConnect(id) {
    indexById[id] = nextIndex;
    lowLinkById[id] = nextIndex;
    nextIndex += 1;
    stack.push(id);
    stackSet.add(id);

    push(
      getAlgorithmDescription(ALGORITHM_STEPS.TARJAN_VISIT, {
        node: labels[id] ?? id,
        index: indexById[id],
      }),
      id
    );

    for (const next of graph[id] ?? []) {
      const edgeId =
        edgeIdByEndpoints.get(makeEdgeId(id, next)) ?? makeEdgeId(id, next);
      edgeStates[edgeId] = GRAPH_EDGE_STATES.ACTIVE;

      push(
        getAlgorithmDescription(ALGORITHM_STEPS.TARJAN_EXPLORE_EDGE, {
          from: labels[id] ?? id,
          to: labels[next] ?? next,
        }),
        id
      );

      if (indexById[next] === undefined) {
        strongConnect(next);
        const previousLowLink = lowLinkById[id];
        lowLinkById[id] = Math.min(lowLinkById[id], lowLinkById[next]);
        edgeStates[edgeId] = GRAPH_EDGE_STATES.VISITED;

        if (lowLinkById[id] !== previousLowLink) {
          push(
            getAlgorithmDescription(ALGORITHM_STEPS.TARJAN_LOW_LINK_UPDATE, {
              node: labels[id] ?? id,
              lowLink: lowLinkById[id],
              via: labels[next] ?? next,
            }),
            id
          );
        }
      } else if (stackSet.has(next)) {
        lowLinkById[id] = Math.min(lowLinkById[id], indexById[next]);
        edgeStates[edgeId] = GRAPH_EDGE_STATES.VISITED;

        push(
          getAlgorithmDescription(ALGORITHM_STEPS.TARJAN_BACK_EDGE, {
            from: labels[id] ?? id,
            to: labels[next] ?? next,
            lowLink: lowLinkById[id],
          }),
          id
        );
      } else {
        edgeStates[edgeId] = GRAPH_EDGE_STATES.VISITED;
      }
    }

    if (lowLinkById[id] === indexById[id]) {
      const component = [];
      while (stack.length > 0) {
        const popped = stack.pop();
        stackSet.delete(popped);
        completedSet.add(popped);
        component.push(popped);
        if (popped === id) break;
      }

      const sortedComponent = sortNodeIds(component);
      sccs.push(sortedComponent);
      markComponentEdges(sortedComponent, edges, edgeStates);

      push(
        getAlgorithmDescription(ALGORITHM_STEPS.TARJAN_SCC_FOUND, {
          component: sortedComponent.map(nodeId => labels[nodeId] ?? nodeId).join(', '),
        }),
        id
      );
    }
  }

  for (const id of ids) {
    if (indexById[id] === undefined) {
      strongConnect(id);
    }
  }

  push(
    getAlgorithmDescription(ALGORITHM_STEPS.TARJAN_FINISH, {
      count: sccs.length,
    })
  );

  return steps;
}
