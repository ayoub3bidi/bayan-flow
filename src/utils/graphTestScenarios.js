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
