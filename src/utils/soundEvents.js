/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  ALGORITHM_TYPES,
  ELEMENT_STATES,
  GRID_ELEMENT_STATES,
  GRAPH_EDGE_STATES,
  GRAPH_NODE_STATES,
  TREE_NODE_STATES,
} from '../constants/index.js';
import { isNodeLinkSearchingAlgorithm } from '../registry/searchingSubstrate.js';
import { GRAPH_REPRESENTATIONS } from '../registry/graphAlgorithmRegistry.js';

export const SOUND_EVENT_KINDS = {
  COMPARE: 'compare',
  SWAP: 'swap',
  PIVOT: 'pivot',
  COMPLETE: 'complete',
  VISIT: 'visit',
  FRONTIER: 'frontier',
  TARGET_FOUND: 'targetFound',
  PATH_FOUND: 'pathFound',
  NO_RESULT: 'noResult',
  EDGE_CONSIDER: 'edgeConsider',
  EDGE_SELECT: 'edgeSelect',
  CYCLE: 'cycle',
  MATRIX_CONSIDER: 'matrixConsider',
  MATRIX_UPDATE: 'matrixUpdate',
  COMPONENT_COMPLETE: 'componentComplete',
  PASS_COMPLETE: 'passComplete',
};

const SCC_ALGORITHMS = new Set(['tarjanAlgorithm', 'kosarajuAlgorithm']);
const ORDERING_ALGORITHMS = new Set(['topologicalSort', 'kahnAlgorithm']);

function normalizeExplicitEvent(event) {
  if (typeof event === 'string') return { kind: event };
  if (!event?.kind) return null;
  return event;
}

function explicitSoundEvents(step) {
  if (Array.isArray(step.soundEvents)) {
    return step.soundEvents.map(normalizeExplicitEvent).filter(Boolean);
  }
  const single = normalizeExplicitEvent(step.soundEvent ?? step.sound);
  return single ? [single] : null;
}

function firstValueForState(step, state) {
  const index = step.states?.indexOf(state) ?? -1;
  if (index < 0) return undefined;
  return step.array?.[index];
}

function isFinalStep(stepIndex, totalSteps) {
  return totalSteps > 0 && stepIndex === totalSteps - 1;
}

function isFullySorted(states) {
  return (
    Array.isArray(states) &&
    states.length > 0 &&
    states.every(state => state === ELEMENT_STATES.SORTED)
  );
}

function isPassProgressStep(states) {
  if (!Array.isArray(states) || states.length === 0) return false;

  const sortedCount = states.filter(
    state => state === ELEMENT_STATES.SORTED
  ).length;
  if (sortedCount === 0 || sortedCount >= states.length) return false;

  return states.every(
    state => state === ELEMENT_STATES.SORTED || state === ELEMENT_STATES.DEFAULT
  );
}

function hasGridState(step, state) {
  return (step.states ?? []).some(
    row => Array.isArray(row) && row.includes(state)
  );
}

function countGridState(step, state) {
  let count = 0;
  for (const row of step.states ?? []) {
    if (!Array.isArray(row)) continue;
    for (const cell of row) {
      if (cell === state) count += 1;
    }
  }
  return count;
}

function gridStateIncreased(step, previousStep, state) {
  if (!previousStep?.states) {
    return hasGridState(step, state);
  }
  return countGridState(step, state) > countGridState(previousStep, state);
}

function objectValues(obj) {
  return obj && typeof obj === 'object' ? Object.values(obj) : [];
}

function hasMatrixCellState(step, state) {
  return (step.matrix?.cellStates ?? []).some(
    row => Array.isArray(row) && row.includes(state)
  );
}

function buildSortingEvents(step, stepIndex, totalSteps) {
  const explicitEvents = explicitSoundEvents(step);
  if (explicitEvents) return explicitEvents;

  const states = step.states ?? [];
  const events = [];

  if (states.includes(ELEMENT_STATES.SWAPPING)) {
    events.push({ kind: SOUND_EVENT_KINDS.SWAP });
  } else if (states.includes(ELEMENT_STATES.PIVOT)) {
    events.push({
      kind: SOUND_EVENT_KINDS.PIVOT,
      value: firstValueForState(step, ELEMENT_STATES.PIVOT),
    });
  } else if (states.includes(ELEMENT_STATES.COMPARING)) {
    events.push({
      kind: SOUND_EVENT_KINDS.COMPARE,
      value: firstValueForState(step, ELEMENT_STATES.COMPARING),
    });
  }

  if (isFinalStep(stepIndex, totalSteps) && isFullySorted(states)) {
    events.push({ kind: SOUND_EVENT_KINDS.COMPLETE });
  } else if (isPassProgressStep(states)) {
    events.push({ kind: SOUND_EVENT_KINDS.PASS_COMPLETE });
  }

  return events;
}

function buildPathfindingEvents(step, stepIndex, totalSteps, previousStep) {
  const explicitEvents = explicitSoundEvents(step);
  if (explicitEvents) return explicitEvents;

  const events = [];

  if (hasGridState(step, GRID_ELEMENT_STATES.PATH)) {
    events.push({ kind: SOUND_EVENT_KINDS.PATH_FOUND });
  } else if (
    gridStateIncreased(step, previousStep, GRID_ELEMENT_STATES.CLOSED)
  ) {
    events.push({ kind: SOUND_EVENT_KINDS.VISIT });
  } else if (gridStateIncreased(step, previousStep, GRID_ELEMENT_STATES.OPEN)) {
    events.push({ kind: SOUND_EVENT_KINDS.FRONTIER });
  }

  if (
    events.length === 0 &&
    isFinalStep(stepIndex, totalSteps) &&
    !hasGridState(step, GRID_ELEMENT_STATES.PATH)
  ) {
    events.push({ kind: SOUND_EVENT_KINDS.NO_RESULT });
  }

  return events;
}

function buildSearchingEvents(step, algorithmKey, stepIndex, totalSteps) {
  const explicitEvents = explicitSoundEvents(step);
  if (explicitEvents) return explicitEvents;

  if (isNodeLinkSearchingAlgorithm(algorithmKey)) {
    const values = objectValues(step.nodeStates);
    if (values.includes(GRAPH_NODE_STATES.PATH)) {
      return [{ kind: SOUND_EVENT_KINDS.PATH_FOUND }];
    }
    if (values.includes(GRAPH_NODE_STATES.CURRENT)) {
      return [{ kind: SOUND_EVENT_KINDS.VISIT }];
    }
    if (values.includes(GRAPH_NODE_STATES.FRONTIER)) {
      return [{ kind: SOUND_EVENT_KINDS.FRONTIER }];
    }
    if (isFinalStep(stepIndex, totalSteps)) {
      return [{ kind: SOUND_EVENT_KINDS.NO_RESULT }];
    }
    return [];
  }

  const states = step.states ?? [];
  if (states.includes(ELEMENT_STATES.SORTED)) {
    return [{ kind: SOUND_EVENT_KINDS.TARGET_FOUND }];
  }
  if (states.includes(ELEMENT_STATES.COMPARING)) {
    return [
      {
        kind: SOUND_EVENT_KINDS.COMPARE,
        value: firstValueForState(step, ELEMENT_STATES.COMPARING),
      },
    ];
  }
  if (isFinalStep(stepIndex, totalSteps)) {
    return [{ kind: SOUND_EVENT_KINDS.NO_RESULT }];
  }
  return [];
}

function isTreeTraversalComplete(step) {
  const values = objectValues(step.nodeStates);
  if (!values.length) return false;

  return (
    !values.includes(TREE_NODE_STATES.VISITING) &&
    values.every(state => state === TREE_NODE_STATES.VISITED)
  );
}

function buildTreeTraversalEvents(step, stepIndex, totalSteps) {
  const explicitEvents = explicitSoundEvents(step);
  if (explicitEvents) return explicitEvents;

  const values = objectValues(step.nodeStates);
  if (values.includes(TREE_NODE_STATES.VISITING)) {
    return [{ kind: SOUND_EVENT_KINDS.VISIT }];
  }

  if (isFinalStep(stepIndex, totalSteps) && isTreeTraversalComplete(step)) {
    return [{ kind: SOUND_EVENT_KINDS.COMPLETE }];
  }

  return [];
}

function buildGraphAlgorithmEvents(step, algorithmKey) {
  const explicitEvents = explicitSoundEvents(step);
  if (explicitEvents) return explicitEvents;

  if (step.representation === GRAPH_REPRESENTATIONS.MATRIX || step.matrix) {
    if (step.hasNegativeCycle || hasMatrixCellState(step, 'updated')) {
      return [
        {
          kind: step.hasNegativeCycle
            ? SOUND_EVENT_KINDS.CYCLE
            : SOUND_EVENT_KINDS.MATRIX_UPDATE,
        },
      ];
    }
    if (
      hasMatrixCellState(step, 'considering') ||
      hasMatrixCellState(step, 'current')
    ) {
      return [{ kind: SOUND_EVENT_KINDS.MATRIX_CONSIDER }];
    }
    return [];
  }

  const nodeValues = objectValues(step.nodeStates);
  const edgeValues = objectValues(step.edgeStates);

  if (
    nodeValues.includes(GRAPH_NODE_STATES.CYCLE) ||
    edgeValues.includes(GRAPH_EDGE_STATES.CYCLE)
  ) {
    return [{ kind: SOUND_EVENT_KINDS.CYCLE }];
  }
  if (edgeValues.includes(GRAPH_EDGE_STATES.SELECTED)) {
    return [{ kind: SOUND_EVENT_KINDS.EDGE_SELECT }];
  }
  if (nodeValues.includes(GRAPH_NODE_STATES.PATH)) {
    if (SCC_ALGORITHMS.has(algorithmKey)) {
      return [{ kind: SOUND_EVENT_KINDS.COMPONENT_COMPLETE }];
    }
    if (ORDERING_ALGORITHMS.has(algorithmKey)) {
      return [{ kind: SOUND_EVENT_KINDS.COMPLETE }];
    }
    return [{ kind: SOUND_EVENT_KINDS.PATH_FOUND }];
  }
  if (edgeValues.includes(GRAPH_EDGE_STATES.ACTIVE)) {
    return [{ kind: SOUND_EVENT_KINDS.EDGE_CONSIDER }];
  }
  if (nodeValues.includes(GRAPH_NODE_STATES.CURRENT)) {
    return [{ kind: SOUND_EVENT_KINDS.VISIT }];
  }
  if (nodeValues.includes(GRAPH_NODE_STATES.FRONTIER)) {
    return [{ kind: SOUND_EVENT_KINDS.FRONTIER }];
  }
  return [];
}

export function getSoundEventsForStep({
  algorithmType,
  algorithmKey = '',
  step,
  previousStep = null,
  stepIndex = 0,
  totalSteps = 0,
}) {
  if (!step) return [];

  if (algorithmType === ALGORITHM_TYPES.SORTING) {
    return buildSortingEvents(step, stepIndex, totalSteps);
  }
  if (algorithmType === ALGORITHM_TYPES.PATHFINDING) {
    return buildPathfindingEvents(step, stepIndex, totalSteps, previousStep);
  }
  if (algorithmType === ALGORITHM_TYPES.SEARCHING) {
    return buildSearchingEvents(step, algorithmKey, stepIndex, totalSteps);
  }
  if (algorithmType === ALGORITHM_TYPES.TREE_TRAVERSAL) {
    return buildTreeTraversalEvents(step, stepIndex, totalSteps);
  }
  if (algorithmType === ALGORITHM_TYPES.GRAPH_ALGORITHM) {
    return buildGraphAlgorithmEvents(step, algorithmKey);
  }

  return [];
}
