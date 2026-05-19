/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Preset graph scenarios for topological sort education.
 * Each scenario demonstrates a different aspect of the algorithm.
 */

/**
 * Linear chain: A → B → C → D
 * Best for: Understanding basic DFS traversal
 */
export const SCENARIO_LINEAR_CHAIN = {
  id: 'linearChain',
  i18nKey: 'graphScenarios.linearChain',
  nodes: [
    { id: '0', label: 'A', x: 0.1, y: 0.5 },
    { id: '1', label: 'B', x: 0.35, y: 0.5 },
    { id: '2', label: 'C', x: 0.65, y: 0.5 },
    { id: '3', label: 'D', x: 0.9, y: 0.5 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1' },
    { id: '1->2', from: '1', to: '2' },
    { id: '2->3', from: '2', to: '3' },
  ],
  adjacency: {
    0: ['1'],
    1: ['2'],
    2: ['3'],
    3: [],
  },
};

/**
 * Diamond/merge pattern: Two paths converge
 * Best for: Understanding how multiple parents are handled
 */
export const SCENARIO_DIAMOND = {
  id: 'diamond',
  i18nKey: 'graphScenarios.diamond',
  nodes: [
    { id: '0', label: 'A', x: 0.5, y: 0.1 },
    { id: '1', label: 'B', x: 0.2, y: 0.5 },
    { id: '2', label: 'C', x: 0.8, y: 0.5 },
    { id: '3', label: 'D', x: 0.5, y: 0.9 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1' },
    { id: '0->2', from: '0', to: '2' },
    { id: '1->3', from: '1', to: '3' },
    { id: '2->3', from: '2', to: '3' },
  ],
  adjacency: {
    0: ['1', '2'],
    1: ['3'],
    2: ['3'],
    3: [],
  },
};

/**
 * Complex DAG with multiple levels
 * Best for: Understanding realistic dependency graphs
 */
export const SCENARIO_COMPLEX = {
  id: 'complex',
  i18nKey: 'graphScenarios.complex',
  nodes: [
    { id: '0', label: 'A', x: 0.5, y: 0.05 },
    { id: '1', label: 'B', x: 0.15, y: 0.35 },
    { id: '2', label: 'C', x: 0.5, y: 0.35 },
    { id: '3', label: 'D', x: 0.85, y: 0.35 },
    { id: '4', label: 'E', x: 0.25, y: 0.65 },
    { id: '5', label: 'F', x: 0.75, y: 0.65 },
    { id: '6', label: 'G', x: 0.5, y: 0.95 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1' },
    { id: '0->2', from: '0', to: '2' },
    { id: '0->3', from: '0', to: '3' },
    { id: '1->4', from: '1', to: '4' },
    { id: '2->4', from: '2', to: '4' },
    { id: '2->5', from: '2', to: '5' },
    { id: '3->5', from: '3', to: '5' },
    { id: '4->6', from: '4', to: '6' },
    { id: '5->6', from: '5', to: '6' },
  ],
  adjacency: {
    0: ['1', '2', '3'],
    1: ['4'],
    2: ['4', '5'],
    3: ['5'],
    4: ['6'],
    5: ['6'],
    6: [],
  },
};

/**
 * Disconnected components
 * Best for: Understanding handling of multiple independent subgraphs
 */
export const SCENARIO_DISCONNECTED = {
  id: 'disconnected',
  i18nKey: 'graphScenarios.disconnected',
  nodes: [
    // Component 1
    { id: '0', label: 'A', x: 0.2, y: 0.3 },
    { id: '1', label: 'B', x: 0.35, y: 0.7 },
    // Component 2
    { id: '2', label: 'C', x: 0.65, y: 0.3 },
    { id: '3', label: 'D', x: 0.8, y: 0.7 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1' },
    { id: '2->3', from: '2', to: '3' },
  ],
  adjacency: {
    0: ['1'],
    1: [],
    2: ['3'],
    3: [],
  },
};

/**
 * Single node (trivial case)
 * Best for: Verifying edge case handling
 */
export const SCENARIO_SINGLE_NODE = {
  id: 'singleNode',
  i18nKey: 'graphScenarios.singleNode',
  nodes: [{ id: '0', label: 'A', x: 0.5, y: 0.5 }],
  edges: [],
  adjacency: {
    0: [],
  },
};

/**
 * Wide graph (many independent nodes)
 * Best for: Seeing how node ordering is determined when there are no constraints
 */
export const SCENARIO_WIDE = {
  id: 'wide',
  i18nKey: 'graphScenarios.wide',
  nodes: [
    { id: '0', label: 'A', x: 0.1, y: 0.5 },
    { id: '1', label: 'B', x: 0.3, y: 0.5 },
    { id: '2', label: 'C', x: 0.5, y: 0.5 },
    { id: '3', label: 'D', x: 0.7, y: 0.5 },
    { id: '4', label: 'E', x: 0.9, y: 0.5 },
  ],
  edges: [],
  adjacency: {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  },
};

/**
 * Directed cycle
 * Best for: Showing why Kahn's queue can empty before every vertex is ordered
 */
export const SCENARIO_DIRECTED_CYCLE = {
  id: 'directedCycle',
  i18nKey: 'graphScenarios.directedCycle',
  directed: true,
  weighted: false,
  nodes: [
    { id: '0', label: 'A', x: 0.5, y: 0.08 },
    { id: '1', label: 'B', x: 0.16, y: 0.5 },
    { id: '2', label: 'C', x: 0.84, y: 0.5 },
    { id: '3', label: 'D', x: 0.5, y: 0.92 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1' },
    { id: '1->3', from: '1', to: '3' },
    { id: '3->2', from: '3', to: '2' },
    { id: '2->0', from: '2', to: '0' },
  ],
  adjacency: {
    0: ['1'],
    1: ['3'],
    2: ['0'],
    3: ['2'],
  },
};

/**
 * Weighted undirected triangle
 * Best for: Understanding the simplest cycle rejection in Kruskal's algorithm
 */
export const SCENARIO_WEIGHTED_TRIANGLE = {
  id: 'weightedTriangle',
  i18nKey: 'graphScenarios.weightedTriangle',
  directed: false,
  weighted: true,
  nodes: [
    { id: '0', label: 'A', x: 0.5, y: 0.1 },
    { id: '1', label: 'B', x: 0.18, y: 0.82 },
    { id: '2', label: 'C', x: 0.82, y: 0.82 },
  ],
  edges: [
    { id: '0<->1', from: '0', to: '1', weight: 1 },
    { id: '1<->2', from: '1', to: '2', weight: 2 },
    { id: '0<->2', from: '0', to: '2', weight: 4 },
  ],
  adjacency: {
    0: ['1', '2'],
    1: ['0', '2'],
    2: ['0', '1'],
  },
};

/**
 * Weighted connected graph with several candidate cycles
 * Best for: Comparing selected versus rejected edges in a richer MST example
 */
export const SCENARIO_WEIGHTED_BRIDGE = {
  id: 'weightedBridge',
  i18nKey: 'graphScenarios.weightedBridge',
  directed: false,
  weighted: true,
  nodes: [
    { id: '0', label: 'A', x: 0.14, y: 0.26 },
    { id: '1', label: 'B', x: 0.42, y: 0.12 },
    { id: '2', label: 'C', x: 0.42, y: 0.52 },
    { id: '3', label: 'D', x: 0.72, y: 0.3 },
    { id: '4', label: 'E', x: 0.88, y: 0.72 },
  ],
  edges: [
    { id: '0<->1', from: '0', to: '1', weight: 2 },
    { id: '0<->2', from: '0', to: '2', weight: 3 },
    { id: '1<->2', from: '1', to: '2', weight: 1 },
    { id: '1<->3', from: '1', to: '3', weight: 4 },
    { id: '2<->3', from: '2', to: '3', weight: 5 },
    { id: '2<->4', from: '2', to: '4', weight: 6 },
    { id: '3<->4', from: '3', to: '4', weight: 2 },
  ],
  adjacency: {
    0: ['1', '2'],
    1: ['0', '2', '3'],
    2: ['0', '1', '3', '4'],
    3: ['1', '2', '4'],
    4: ['2', '3'],
  },
};

/**
 * Weighted disconnected graph
 * Best for: Showing that Kruskal returns a minimum spanning forest
 */
export const SCENARIO_WEIGHTED_DISCONNECTED = {
  id: 'weightedDisconnected',
  i18nKey: 'graphScenarios.weightedDisconnected',
  directed: false,
  weighted: true,
  nodes: [
    { id: '0', label: 'A', x: 0.18, y: 0.32 },
    { id: '1', label: 'B', x: 0.34, y: 0.7 },
    { id: '2', label: 'C', x: 0.52, y: 0.3 },
    { id: '3', label: 'D', x: 0.72, y: 0.24 },
    { id: '4', label: 'E', x: 0.86, y: 0.72 },
  ],
  edges: [
    { id: '0<->1', from: '0', to: '1', weight: 1 },
    { id: '1<->2', from: '1', to: '2', weight: 3 },
    { id: '0<->2', from: '0', to: '2', weight: 4 },
    { id: '3<->4', from: '3', to: '4', weight: 2 },
  ],
  adjacency: {
    0: ['1', '2'],
    1: ['0', '2'],
    2: ['0', '1'],
    3: ['4'],
    4: ['3'],
  },
};

/**
 * Single strongly connected cycle
 * Best for: Understanding Tarjan/Kosaraju on one SCC
 */
export const SCENARIO_SCC_CYCLE = {
  id: 'sccCycle',
  i18nKey: 'graphScenarios.sccCycle',
  directed: true,
  weighted: false,
  nodes: [
    { id: '0', label: 'A', x: 0.5, y: 0.1 },
    { id: '1', label: 'B', x: 0.84, y: 0.5 },
    { id: '2', label: 'C', x: 0.5, y: 0.9 },
    { id: '3', label: 'D', x: 0.16, y: 0.5 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1' },
    { id: '1->2', from: '1', to: '2' },
    { id: '2->3', from: '2', to: '3' },
    { id: '3->0', from: '3', to: '0' },
  ],
  adjacency: {
    0: ['1'],
    1: ['2'],
    2: ['3'],
    3: ['0'],
  },
};

/**
 * Multiple SCCs connected in one direction
 * Best for: Showing SCC condensation structure
 */
export const SCENARIO_MULTI_SCC = {
  id: 'multiScc',
  i18nKey: 'graphScenarios.multiScc',
  directed: true,
  weighted: false,
  nodes: [
    { id: '0', label: 'A', x: 0.12, y: 0.25 },
    { id: '1', label: 'B', x: 0.28, y: 0.62 },
    { id: '2', label: 'C', x: 0.45, y: 0.25 },
    { id: '3', label: 'D', x: 0.68, y: 0.25 },
    { id: '4', label: 'E', x: 0.84, y: 0.62 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1' },
    { id: '1->2', from: '1', to: '2' },
    { id: '2->0', from: '2', to: '0' },
    { id: '1->3', from: '1', to: '3' },
    { id: '3->4', from: '3', to: '4' },
    { id: '4->3', from: '4', to: '3' },
  ],
  adjacency: {
    0: ['1'],
    1: ['2', '3'],
    2: ['0'],
    3: ['4'],
    4: ['3'],
  },
};

/**
 * Self-loop plus outbound edge
 * Best for: Verifying singleton SCCs with self loops
 */
export const SCENARIO_SELF_LOOP = {
  id: 'selfLoop',
  i18nKey: 'graphScenarios.selfLoop',
  directed: true,
  weighted: false,
  nodes: [
    { id: '0', label: 'A', x: 0.24, y: 0.5 },
    { id: '1', label: 'B', x: 0.58, y: 0.26 },
    { id: '2', label: 'C', x: 0.82, y: 0.74 },
  ],
  edges: [
    { id: '0->0', from: '0', to: '0' },
    { id: '0->1', from: '0', to: '1' },
    { id: '1->2', from: '1', to: '2' },
  ],
  adjacency: {
    0: ['0', '1'],
    1: ['2'],
    2: [],
  },
};

/**
 * Positive weighted directed graph
 * Best for: Basic Floyd-Warshall shortest-path updates
 */
export const SCENARIO_WEIGHTED_DIRECTED_POSITIVE = {
  id: 'weightedDirectedPositive',
  i18nKey: 'graphScenarios.weightedDirectedPositive',
  directed: true,
  weighted: true,
  nodes: [
    { id: '0', label: 'A', x: 0.14, y: 0.18 },
    { id: '1', label: 'B', x: 0.48, y: 0.14 },
    { id: '2', label: 'C', x: 0.82, y: 0.34 },
    { id: '3', label: 'D', x: 0.48, y: 0.82 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1', weight: 3 },
    { id: '0->3', from: '0', to: '3', weight: 10 },
    { id: '1->2', from: '1', to: '2', weight: 2 },
    { id: '2->3', from: '2', to: '3', weight: 1 },
    { id: '3->1', from: '3', to: '1', weight: 4 },
  ],
  adjacency: {
    0: ['1', '3'],
    1: ['2'],
    2: ['3'],
    3: ['1'],
  },
};

/**
 * Negative weighted directed graph without a negative cycle
 * Best for: Showing safe negative-edge relaxation
 */
export const SCENARIO_WEIGHTED_DIRECTED_NEGATIVE = {
  id: 'weightedDirectedNegative',
  i18nKey: 'graphScenarios.weightedDirectedNegative',
  directed: true,
  weighted: true,
  nodes: [
    { id: '0', label: 'A', x: 0.14, y: 0.18 },
    { id: '1', label: 'B', x: 0.48, y: 0.14 },
    { id: '2', label: 'C', x: 0.82, y: 0.34 },
    { id: '3', label: 'D', x: 0.48, y: 0.82 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1', weight: 4 },
    { id: '0->2', from: '0', to: '2', weight: 11 },
    { id: '1->2', from: '1', to: '2', weight: -2 },
    { id: '2->3', from: '2', to: '3', weight: 3 },
    { id: '3->1', from: '3', to: '1', weight: 6 },
  ],
  adjacency: {
    0: ['1', '2'],
    1: ['2'],
    2: ['3'],
    3: ['1'],
  },
};

/**
 * Negative cycle graph
 * Best for: Demonstrating diagonal-negative detection
 */
export const SCENARIO_WEIGHTED_DIRECTED_NEGATIVE_CYCLE = {
  id: 'weightedDirectedNegativeCycle',
  i18nKey: 'graphScenarios.weightedDirectedNegativeCycle',
  directed: true,
  weighted: true,
  nodes: [
    { id: '0', label: 'A', x: 0.2, y: 0.5 },
    { id: '1', label: 'B', x: 0.5, y: 0.18 },
    { id: '2', label: 'C', x: 0.8, y: 0.5 },
  ],
  edges: [
    { id: '0->1', from: '0', to: '1', weight: 1 },
    { id: '1->2', from: '1', to: '2', weight: -4 },
    { id: '2->0', from: '2', to: '0', weight: 1 },
  ],
  adjacency: {
    0: ['1'],
    1: ['2'],
    2: ['0'],
  },
};

/**
 * Single node matrix case
 * Best for: Verifying trivial Floyd-Warshall input
 */
export const SCENARIO_WEIGHTED_DIRECTED_SINGLE = {
  id: 'weightedDirectedSingle',
  i18nKey: 'graphScenarios.weightedDirectedSingle',
  directed: true,
  weighted: true,
  nodes: [{ id: '0', label: 'A', x: 0.5, y: 0.5 }],
  edges: [],
  adjacency: {
    0: [],
  },
};

/**
 * All scenarios mapped by id for easy lookup
 */
export const GRAPH_SCENARIOS = {
  [SCENARIO_LINEAR_CHAIN.id]: SCENARIO_LINEAR_CHAIN,
  [SCENARIO_DIAMOND.id]: SCENARIO_DIAMOND,
  [SCENARIO_COMPLEX.id]: SCENARIO_COMPLEX,
  [SCENARIO_DISCONNECTED.id]: SCENARIO_DISCONNECTED,
  [SCENARIO_SINGLE_NODE.id]: SCENARIO_SINGLE_NODE,
  [SCENARIO_WIDE.id]: SCENARIO_WIDE,
  [SCENARIO_DIRECTED_CYCLE.id]: SCENARIO_DIRECTED_CYCLE,
  [SCENARIO_WEIGHTED_TRIANGLE.id]: SCENARIO_WEIGHTED_TRIANGLE,
  [SCENARIO_WEIGHTED_BRIDGE.id]: SCENARIO_WEIGHTED_BRIDGE,
  [SCENARIO_WEIGHTED_DISCONNECTED.id]: SCENARIO_WEIGHTED_DISCONNECTED,
  [SCENARIO_SCC_CYCLE.id]: SCENARIO_SCC_CYCLE,
  [SCENARIO_MULTI_SCC.id]: SCENARIO_MULTI_SCC,
  [SCENARIO_SELF_LOOP.id]: SCENARIO_SELF_LOOP,
  [SCENARIO_WEIGHTED_DIRECTED_POSITIVE.id]: SCENARIO_WEIGHTED_DIRECTED_POSITIVE,
  [SCENARIO_WEIGHTED_DIRECTED_NEGATIVE.id]: SCENARIO_WEIGHTED_DIRECTED_NEGATIVE,
  [SCENARIO_WEIGHTED_DIRECTED_NEGATIVE_CYCLE.id]:
    SCENARIO_WEIGHTED_DIRECTED_NEGATIVE_CYCLE,
  [SCENARIO_WEIGHTED_DIRECTED_SINGLE.id]: SCENARIO_WEIGHTED_DIRECTED_SINGLE,
};

/**
 * Default scenario order for UI display
 */
export const SCENARIO_ORDER = [
  SCENARIO_LINEAR_CHAIN.id,
  SCENARIO_DIAMOND.id,
  SCENARIO_WIDE.id,
  SCENARIO_DISCONNECTED.id,
  SCENARIO_COMPLEX.id,
  SCENARIO_SINGLE_NODE.id,
];
