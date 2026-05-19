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

function buildTranspose(graph) {
  const transpose = Object.fromEntries(
    sortNodeIds(Object.keys(graph)).map(id => [id, []])
  );

  for (const [from, neighbors] of Object.entries(graph)) {
    for (const to of neighbors) {
      if (!transpose[to]) transpose[to] = [];
      transpose[to].push(from);
    }
  }

  for (const id of Object.keys(transpose)) {
    transpose[id] = sortNodeIds(transpose[id]);
  }

  return transpose;
}

function makeTransposeEdges(edges) {
  return edges.map(edge => ({
    ...edge,
    id: edge.id ? `${edge.id}:T` : `${edge.to}->${edge.from}:T`,
    from: edge.to,
    to: edge.from,
  }));
}

function formatComponents(components, labels) {
  return (
    components
      .map(component => `{${component.map(id => labels[id] ?? id).join(', ')}}`)
      .join(' | ') || '∅'
  );
}

function buildGraphArtifacts({ passLabel, activeStack, finishOrder, sccs, labels }) {
  return {
    badges: [
      {
        id: 'pass',
        text: passLabel,
      },
      {
        id: 'finish',
        text: i18n.t('visualization.finishStackBadge', {
          order: finishOrder.map(id => labels[id] ?? id).join(' → ') || '∅',
          defaultValue: finishOrder.map(id => labels[id] ?? id).join(' → ') || '∅',
        }),
      },
      {
        id: 'components',
        text: i18n.t('visualization.sccListBadge', {
          components: formatComponents(sccs, labels),
          defaultValue: formatComponents(sccs, labels),
        }),
      },
      {
        id: 'stack',
        text: i18n.t('visualization.sccStackBadge', {
          order: activeStack.map(id => labels[id] ?? id).join(' → ') || '∅',
          defaultValue: activeStack.map(id => labels[id] ?? id).join(' → ') || '∅',
        }),
      },
    ],
  };
}

function paintNodeStates(nodes, activeSet, currentId, finishSet, completedSet) {
  /** @type {Record<string, string>} */
  const states = {};
  for (const node of nodes) {
    if (node.id === currentId) {
      states[node.id] = GRAPH_NODE_STATES.CURRENT;
    } else if (completedSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.PATH;
    } else if (activeSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.FRONTIER;
    } else if (finishSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.VISITED;
    } else {
      states[node.id] = GRAPH_NODE_STATES.DEFAULT;
    }
  }
  return states;
}

/**
 * @param {Record<string, string[]>} adjacency
 * @returns {{
 *   sccs: string[][],
 *   finishOrder: string[],
 *   transpose: Record<string, string[]>,
 * }}
 */
export function kosarajuAlgorithmPure(adjacency) {
  const graph = normalizeAdjacency(adjacency);
  const ids = sortNodeIds(Object.keys(graph));
  const transpose = buildTranspose(graph);
  const visited = new Set();
  const finishOrder = [];
  const sccs = [];

  function dfsOriginal(id) {
    visited.add(id);
    for (const next of graph[id] ?? []) {
      if (!visited.has(next)) dfsOriginal(next);
    }
    finishOrder.push(id);
  }

  for (const id of ids) {
    if (!visited.has(id)) dfsOriginal(id);
  }

  const assigned = new Set();
  function dfsTranspose(id, component) {
    assigned.add(id);
    component.push(id);
    for (const next of transpose[id] ?? []) {
      if (!assigned.has(next)) dfsTranspose(next, component);
    }
  }

  for (const id of [...finishOrder].reverse()) {
    if (assigned.has(id)) continue;
    const component = [];
    dfsTranspose(id, component);
    sccs.push(sortNodeIds(component));
  }

  return { sccs, finishOrder, transpose };
}

/**
 * @param {Object} input
 * @param {Array<{ id: string, x: number, y: number, label?: string }>} input.nodes
 * @param {Array<{ id?: string, from: string, to: string, weight?: number }>} input.edges
 * @param {Record<string, string[]>} input.adjacency
 * @returns {Array}
 */
export function kosarajuAlgorithm({ nodes = [], edges = [], adjacency = {} }) {
  const graph = normalizeAdjacency(adjacency);
  const ids = sortNodeIds(Object.keys(graph));
  const transpose = buildTranspose(graph);
  const transposeEdges = makeTransposeEdges(edges);
  const visibleNodes = ensureVisibleNodes(nodes, graph);
  const labels = labelById(visibleNodes);
  const edgeIdByEndpoints = buildEdgeIdByEndpoints(edges);
  const transposeEdgeIdByEndpoints = buildEdgeIdByEndpoints(transposeEdges);
  const visited = new Set();
  const finishSet = new Set();
  const finishOrder = [];
  const assigned = new Set();
  const activeStack = [];
  const activeSet = new Set();
  const completedSet = new Set();
  const sccs = [];
  /** @type {Record<string, string>} */
  const edgeStates = {};
  const steps = [];

  const push = (
    description,
    currentId = null,
    phase = 'pass1',
    stepEdges = edges
  ) => {
    const passLabel =
      phase === 'pass1'
        ? i18n.t('visualization.passBadge', {
            pass: '1',
            defaultValue: 'Pass 1',
          })
        : i18n.t('visualization.passBadge', {
            pass: '2',
            defaultValue: 'Pass 2',
          });

    steps.push(
      makeNodeLinkStep({
        nodes: visibleNodes,
        edges: stepEdges,
        nodeStates: paintNodeStates(
          visibleNodes,
          activeSet,
          currentId,
          finishSet,
          completedSet
        ),
        edgeStates,
        stackOrder: activeStack,
        outputOrder: phase === 'pass1' ? finishOrder : [...completedSet],
        description,
        graphArtifacts: buildGraphArtifacts({
          passLabel,
          activeStack,
          finishOrder,
          sccs,
          labels,
        }),
        directed: true,
        weighted: false,
      })
    );
  };

  push(getAlgorithmDescription(ALGORITHM_STEPS.KOSARAJU_START));

  function dfsOriginal(id) {
    visited.add(id);
    activeStack.push(id);
    activeSet.add(id);

    push(
      getAlgorithmDescription(ALGORITHM_STEPS.KOSARAJU_VISIT, {
        pass: 1,
        node: labels[id] ?? id,
      }),
      id
    );

    for (const next of graph[id] ?? []) {
      const edgeId =
        edgeIdByEndpoints.get(makeEdgeId(id, next)) ?? makeEdgeId(id, next);
      edgeStates[edgeId] = GRAPH_EDGE_STATES.ACTIVE;
      if (!visited.has(next)) {
        dfsOriginal(next);
      }
      edgeStates[edgeId] = GRAPH_EDGE_STATES.VISITED;
    }

    activeStack.pop();
    activeSet.delete(id);
    finishSet.add(id);
    finishOrder.push(id);

    push(
      getAlgorithmDescription(ALGORITHM_STEPS.KOSARAJU_FINISH_ORDER, {
        node: labels[id] ?? id,
        stack: finishOrder.map(nodeId => labels[nodeId] ?? nodeId).join(', '),
      }),
      id
    );
  }

  for (const id of ids) {
    if (!visited.has(id)) dfsOriginal(id);
  }

  push(
    getAlgorithmDescription(ALGORITHM_STEPS.KOSARAJU_TRANSPOSE, {
      order: [...finishOrder]
        .reverse()
        .map(id => labels[id] ?? id)
        .join(', '),
    }),
    null,
    'pass2',
    transposeEdges
  );

  function dfsTranspose(id, component) {
    assigned.add(id);
    activeStack.push(id);
    activeSet.add(id);
    component.push(id);

    push(
      getAlgorithmDescription(ALGORITHM_STEPS.KOSARAJU_VISIT, {
        pass: 2,
        node: labels[id] ?? id,
      }),
      id,
      'pass2',
      transposeEdges
    );

    for (const next of transpose[id] ?? []) {
      const edgeId =
        transposeEdgeIdByEndpoints.get(makeEdgeId(id, next)) ??
        makeEdgeId(id, next);
      edgeStates[edgeId] = GRAPH_EDGE_STATES.ACTIVE;
      if (!assigned.has(next)) {
        dfsTranspose(next, component);
      }
      edgeStates[edgeId] = GRAPH_EDGE_STATES.VISITED;
    }

    activeStack.pop();
    activeSet.delete(id);
  }

  for (const id of [...finishOrder].reverse()) {
    if (assigned.has(id)) continue;
    const component = [];
    dfsTranspose(id, component);
    const sortedComponent = sortNodeIds(component);
    sortedComponent.forEach(nodeId => completedSet.add(nodeId));
    sccs.push(sortedComponent);

    push(
      getAlgorithmDescription(ALGORITHM_STEPS.KOSARAJU_COLLECT_SCC, {
        node: labels[id] ?? id,
        component: sortedComponent
          .map(nodeId => labels[nodeId] ?? nodeId)
          .join(', '),
      }),
      id,
      'pass2',
      transposeEdges
    );
  }

  push(
    getAlgorithmDescription(ALGORITHM_STEPS.KOSARAJU_FINISH, {
      count: sccs.length,
    }),
    null,
    'pass2',
    transposeEdges
  );

  return steps;
}
