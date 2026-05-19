/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  generateRandomDag,
  generateRandomDirectedGraph,
  generateRandomWeightedUndirectedGraph,
} from '../utils/graphAlgorithmGenerators.js';
import {
  GRAPH_SCENARIOS,
  SCENARIO_DISCONNECTED,
  SCENARIO_MULTI_SCC,
  SCENARIO_DIRECTED_CYCLE,
  SCENARIO_SCC_CYCLE,
  SCENARIO_SINGLE_NODE,
  SCENARIO_SELF_LOOP,
  SCENARIO_WEIGHTED_BRIDGE,
  SCENARIO_WEIGHTED_DISCONNECTED,
  SCENARIO_WEIGHTED_TRIANGLE,
  SCENARIO_ORDER,
} from '../utils/graphTestScenarios.js';

export const GRAPH_REPRESENTATIONS = {
  NODE_LINK: 'nodeLink',
  MATRIX: 'matrix',
};

function cloneScenarioGraph(scenario) {
  return {
    nodes: scenario.nodes.map(node => ({ ...node })),
    edges: scenario.edges.map(edge => ({ ...edge })),
    adjacency: Object.fromEntries(
      Object.entries(scenario.adjacency).map(([id, neighbors]) => [
        id,
        [...neighbors],
      ])
    ),
    directed: scenario.directed ?? true,
    weighted: scenario.weighted ?? false,
  };
}

export const GRAPH_ALGORITHM_PROFILES = {
  topologicalSort: {
    key: 'topologicalSort',
    groupLabelKey: 'algorithmGroups.topologicalOrdering',
    representation: GRAPH_REPRESENTATIONS.NODE_LINK,
    directed: true,
    weighted: false,
    supportsRandomGeneration: true,
    scenarioIds: SCENARIO_ORDER,
    createInput({ nodeCount, scenarioId, rng = Math.random }) {
      const scenario =
        scenarioId && GRAPH_SCENARIOS[scenarioId]
          ? GRAPH_SCENARIOS[scenarioId]
          : null;
      if (scenario) {
        return cloneScenarioGraph(scenario);
      }
      return generateRandomDag({ nodeCount, rng });
    },
  },
  kahnAlgorithm: {
    key: 'kahnAlgorithm',
    groupLabelKey: 'algorithmGroups.topologicalOrdering',
    representation: GRAPH_REPRESENTATIONS.NODE_LINK,
    directed: true,
    weighted: false,
    supportsRandomGeneration: true,
    scenarioIds: [...SCENARIO_ORDER, SCENARIO_DIRECTED_CYCLE.id],
    createInput({ nodeCount, scenarioId, rng = Math.random }) {
      const scenario =
        scenarioId && GRAPH_SCENARIOS[scenarioId]
          ? GRAPH_SCENARIOS[scenarioId]
          : null;
      if (scenario) {
        return cloneScenarioGraph(scenario);
      }
      return generateRandomDag({ nodeCount, rng });
    },
  },
  kruskalAlgorithm: {
    key: 'kruskalAlgorithm',
    groupLabelKey: 'algorithmGroups.minimumSpanningTree',
    representation: GRAPH_REPRESENTATIONS.NODE_LINK,
    directed: false,
    weighted: true,
    supportsRandomGeneration: true,
    scenarioIds: [
      SCENARIO_WEIGHTED_TRIANGLE.id,
      SCENARIO_WEIGHTED_BRIDGE.id,
      SCENARIO_WEIGHTED_DISCONNECTED.id,
    ],
    createInput({ nodeCount, scenarioId, rng = Math.random }) {
      const scenario =
        scenarioId && GRAPH_SCENARIOS[scenarioId]
          ? GRAPH_SCENARIOS[scenarioId]
          : null;
      if (scenario) {
        return cloneScenarioGraph(scenario);
      }
      return generateRandomWeightedUndirectedGraph({ nodeCount, rng });
    },
  },
  primAlgorithm: {
    key: 'primAlgorithm',
    groupLabelKey: 'algorithmGroups.minimumSpanningTree',
    representation: GRAPH_REPRESENTATIONS.NODE_LINK,
    directed: false,
    weighted: true,
    supportsRandomGeneration: true,
    scenarioIds: [SCENARIO_WEIGHTED_TRIANGLE.id, SCENARIO_WEIGHTED_BRIDGE.id],
    createInput({ nodeCount, scenarioId, rng = Math.random }) {
      const scenario =
        scenarioId && GRAPH_SCENARIOS[scenarioId]
          ? GRAPH_SCENARIOS[scenarioId]
          : null;
      if (scenario) {
        return cloneScenarioGraph(scenario);
      }
      return generateRandomWeightedUndirectedGraph({ nodeCount, rng });
    },
  },
  tarjanAlgorithm: {
    key: 'tarjanAlgorithm',
    groupLabelKey: 'algorithmGroups.stronglyConnectedComponents',
    representation: GRAPH_REPRESENTATIONS.NODE_LINK,
    directed: true,
    weighted: false,
    supportsRandomGeneration: true,
    scenarioIds: [
      SCENARIO_SCC_CYCLE.id,
      SCENARIO_MULTI_SCC.id,
      SCENARIO_SELF_LOOP.id,
      SCENARIO_DISCONNECTED.id,
      SCENARIO_SINGLE_NODE.id,
    ],
    createInput({ nodeCount, scenarioId, rng = Math.random }) {
      const scenario =
        scenarioId && GRAPH_SCENARIOS[scenarioId]
          ? GRAPH_SCENARIOS[scenarioId]
          : null;
      if (scenario) {
        return cloneScenarioGraph(scenario);
      }
      return generateRandomDirectedGraph({ nodeCount, rng });
    },
  },
  kosarajuAlgorithm: {
    key: 'kosarajuAlgorithm',
    groupLabelKey: 'algorithmGroups.stronglyConnectedComponents',
    representation: GRAPH_REPRESENTATIONS.NODE_LINK,
    directed: true,
    weighted: false,
    supportsRandomGeneration: true,
    scenarioIds: [
      SCENARIO_SCC_CYCLE.id,
      SCENARIO_MULTI_SCC.id,
      SCENARIO_SELF_LOOP.id,
      SCENARIO_DISCONNECTED.id,
      SCENARIO_SINGLE_NODE.id,
    ],
    createInput({ nodeCount, scenarioId, rng = Math.random }) {
      const scenario =
        scenarioId && GRAPH_SCENARIOS[scenarioId]
          ? GRAPH_SCENARIOS[scenarioId]
          : null;
      if (scenario) {
        return cloneScenarioGraph(scenario);
      }
      return generateRandomDirectedGraph({ nodeCount, rng });
    },
  },
};

export const GRAPH_ALGORITHM_KEYS = Object.freeze(
  Object.keys(GRAPH_ALGORITHM_PROFILES)
);

function buildGroupDefs() {
  /** @type {Map<string, { labelKey: string, algorithms: string[] }>} */
  const groups = new Map();
  for (const profile of Object.values(GRAPH_ALGORITHM_PROFILES)) {
    const existing = groups.get(profile.groupLabelKey);
    if (existing) {
      existing.algorithms.push(profile.key);
      continue;
    }
    groups.set(profile.groupLabelKey, {
      labelKey: profile.groupLabelKey,
      algorithms: [profile.key],
    });
  }
  return Object.freeze(Array.from(groups.values()));
}

export function getGraphAlgorithmProfile(algorithmKey) {
  return GRAPH_ALGORITHM_PROFILES[algorithmKey] ?? null;
}

export function getGraphAlgorithmRepresentation(algorithmKey) {
  return (
    getGraphAlgorithmProfile(algorithmKey)?.representation ??
    GRAPH_REPRESENTATIONS.NODE_LINK
  );
}

export function getGraphAlgorithmScenarioOptions(algorithmKey) {
  const profile = getGraphAlgorithmProfile(algorithmKey);
  if (!profile?.scenarioIds?.length) return [];

  return profile.scenarioIds
    .map(id => {
      const scenario = GRAPH_SCENARIOS[id];
      if (!scenario) return null;
      return {
        id,
        i18nKey: scenario.i18nKey,
      };
    })
    .filter(Boolean);
}

export function isGraphScenarioSupported(algorithmKey, scenarioId) {
  if (!scenarioId) return true;
  return getGraphAlgorithmScenarioOptions(algorithmKey).some(
    option => option.id === scenarioId
  );
}

export function createGraphInputForAlgorithm(
  algorithmKey,
  { nodeCount, scenarioId = null, rng = Math.random } = {}
) {
  const profile = getGraphAlgorithmProfile(algorithmKey);
  if (!profile?.createInput) {
    return generateRandomDag({ nodeCount, rng });
  }

  return profile.createInput({
    nodeCount,
    scenarioId: isGraphScenarioSupported(algorithmKey, scenarioId)
      ? scenarioId
      : null,
    rng,
  });
}

export const GRAPH_ALGORITHM_GROUPS = buildGroupDefs();
