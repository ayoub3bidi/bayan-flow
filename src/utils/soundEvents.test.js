/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import {
  ALGORITHM_TYPES,
  ELEMENT_STATES,
  GRID_ELEMENT_STATES,
  GRAPH_EDGE_STATES,
  GRAPH_NODE_STATES,
} from '../constants/index.js';
import { GRAPH_REPRESENTATIONS } from '../registry/graphAlgorithmRegistry.js';
import { SOUND_EVENT_KINDS, getSoundEventsForStep } from './soundEvents.js';

describe('getSoundEventsForStep', () => {
  it('detects pathfinding path-found from state instead of description text', () => {
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.PATHFINDING,
        algorithmKey: 'bfs',
        step: {
          states: [[GRID_ELEMENT_STATES.PATH]],
          description: 'Chemin trouvé !',
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.PATH_FOUND }]);
  });

  it('detects graph-search path-found without English copy', () => {
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SEARCHING,
        algorithmKey: 'depthFirstSearch',
        step: {
          nodes: [{ id: 'a' }],
          edges: [],
          nodeStates: { a: GRAPH_NODE_STATES.PATH },
          description: 'وُجد مسار!',
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.PATH_FOUND }]);
  });

  it('emits sorting complete only for the final fully sorted step', () => {
    const partial = {
      array: [1, 2, 3],
      states: [
        ELEMENT_STATES.SORTED,
        ELEMENT_STATES.DEFAULT,
        ELEMENT_STATES.DEFAULT,
      ],
    };
    const complete = {
      array: [1, 2, 3],
      states: Array(3).fill(ELEMENT_STATES.SORTED),
    };

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SORTING,
        algorithmKey: 'bubbleSort',
        step: partial,
        stepIndex: 1,
        totalSteps: 3,
      })
    ).toEqual([]);
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SORTING,
        algorithmKey: 'bubbleSort',
        step: complete,
        stepIndex: 2,
        totalSteps: 3,
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.COMPLETE }]);
  });

  it('emits semantic graph algorithm and matrix events', () => {
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
        algorithmKey: 'kruskalAlgorithm',
        step: {
          nodeStates: {},
          edgeStates: { e1: GRAPH_EDGE_STATES.SELECTED },
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.EDGE_SELECT }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
        algorithmKey: 'floydWarshallAlgorithm',
        step: {
          representation: GRAPH_REPRESENTATIONS.MATRIX,
          matrix: { cellStates: [['default', 'updated']] },
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.MATRIX_UPDATE }]);
  });

  it('distinguishes frequent visits from frontier expansion and no-result milestones', () => {
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SEARCHING,
        algorithmKey: 'depthFirstSearch',
        step: {
          nodeStates: { a: GRAPH_NODE_STATES.CURRENT },
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.VISIT }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.PATHFINDING,
        algorithmKey: 'bfs',
        step: {
          states: [[GRID_ELEMENT_STATES.OPEN]],
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.FRONTIER }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SEARCHING,
        algorithmKey: 'binarySearch',
        step: {
          array: [1, 2, 3],
          states: Array(3).fill(ELEMENT_STATES.DEFAULT),
        },
        stepIndex: 2,
        totalSteps: 3,
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.NO_RESULT }]);
  });

  it('maps cycles and SCC completion to dedicated graph events', () => {
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
        algorithmKey: 'kahnAlgorithm',
        step: {
          nodeStates: { a: GRAPH_NODE_STATES.CYCLE },
          edgeStates: {},
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.CYCLE }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
        algorithmKey: 'tarjanAlgorithm',
        step: {
          nodeStates: { a: GRAPH_NODE_STATES.PATH },
          edgeStates: {},
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.COMPONENT_COMPLETE }]);
  });
});
