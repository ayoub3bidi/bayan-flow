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
  TREE_NODE_STATES,
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

  it('emits pass-complete when a sorting pass finishes with partial sorted bars', () => {
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SORTING,
        algorithmKey: 'bubbleSort',
        step: {
          array: [2, 4, 5, 3, 1],
          states: [
            ELEMENT_STATES.DEFAULT,
            ELEMENT_STATES.DEFAULT,
            ELEMENT_STATES.DEFAULT,
            ELEMENT_STATES.SORTED,
            ELEMENT_STATES.SORTED,
          ],
        },
        stepIndex: 4,
        totalSteps: 10,
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.PASS_COMPLETE }]);
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
    ).toEqual([{ kind: SOUND_EVENT_KINDS.PASS_COMPLETE }]);
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
        algorithmType: ALGORITHM_TYPES.PATHFINDING,
        algorithmKey: 'bfs',
        previousStep: {
          states: [
            [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.DEFAULT],
            [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.DEFAULT],
          ],
        },
        step: {
          states: [
            [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.CLOSED],
            [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.DEFAULT],
          ],
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.VISIT }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.PATHFINDING,
        algorithmKey: 'bfs',
        previousStep: {
          states: [
            [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.CLOSED],
            [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.DEFAULT],
          ],
        },
        step: {
          states: [
            [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.CLOSED],
            [GRID_ELEMENT_STATES.OPEN, GRID_ELEMENT_STATES.DEFAULT],
          ],
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

  it('emits tree traversal complete on the final fully visited step', () => {
    const visiting = {
      nodeStates: {
        a: TREE_NODE_STATES.VISITED,
        b: TREE_NODE_STATES.VISITING,
      },
    };
    const completed = {
      nodeStates: {
        a: TREE_NODE_STATES.VISITED,
        b: TREE_NODE_STATES.VISITED,
      },
    };

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.TREE_TRAVERSAL,
        algorithmKey: 'inorderTraversal',
        step: visiting,
        stepIndex: 3,
        totalSteps: 5,
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.VISIT }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.TREE_TRAVERSAL,
        algorithmKey: 'inorderTraversal',
        step: completed,
        stepIndex: 4,
        totalSteps: 5,
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.COMPLETE }]);
  });

  it('honors explicit soundEvents arrays and single sound aliases', () => {
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SORTING,
        algorithmKey: 'bubbleSort',
        step: {
          soundEvents: ['swap', { kind: SOUND_EVENT_KINDS.PIVOT, value: 7 }],
        },
      })
    ).toEqual([
      { kind: SOUND_EVENT_KINDS.SWAP },
      { kind: SOUND_EVENT_KINDS.PIVOT, value: 7 },
    ]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SORTING,
        algorithmKey: 'quickSort',
        step: { sound: SOUND_EVENT_KINDS.COMPLETE },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.COMPLETE }]);
  });

  it('emits swap, pivot, and compare events from sorting visual states', () => {
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SORTING,
        algorithmKey: 'bubbleSort',
        step: {
          array: [3, 1, 2],
          states: [
            ELEMENT_STATES.SWAPPING,
            ELEMENT_STATES.DEFAULT,
            ELEMENT_STATES.DEFAULT,
          ],
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.SWAP }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SORTING,
        algorithmKey: 'quickSort',
        step: {
          array: [3, 1, 2],
          states: [
            ELEMENT_STATES.PIVOT,
            ELEMENT_STATES.DEFAULT,
            ELEMENT_STATES.DEFAULT,
          ],
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.PIVOT, value: 3 }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.SEARCHING,
        algorithmKey: 'binarySearch',
        step: {
          array: [1, 2, 3],
          states: [
            ELEMENT_STATES.COMPARING,
            ELEMENT_STATES.DEFAULT,
            ELEMENT_STATES.DEFAULT,
          ],
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.COMPARE, value: 1 }]);
  });

  it('covers graph ordering completion, matrix consider, and negative cycles', () => {
    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
        algorithmKey: 'topologicalSort',
        step: {
          nodeStates: { a: GRAPH_NODE_STATES.PATH },
          edgeStates: {},
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.COMPLETE }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
        algorithmKey: 'floydWarshallAlgorithm',
        step: {
          representation: GRAPH_REPRESENTATIONS.MATRIX,
          matrix: { cellStates: [['considering', 'default']] },
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.MATRIX_CONSIDER }]);

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
        algorithmKey: 'floydWarshallAlgorithm',
        step: {
          representation: GRAPH_REPRESENTATIONS.MATRIX,
          hasNegativeCycle: true,
          matrix: { cellStates: [['default', 'default']] },
        },
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.CYCLE }]);
  });

  it('emits pathfinding no-result on the final step without a path', () => {
    const stagnantGrid = {
      states: [
        [GRID_ELEMENT_STATES.START, GRID_ELEMENT_STATES.DEFAULT],
        [GRID_ELEMENT_STATES.DEFAULT, GRID_ELEMENT_STATES.END],
      ],
    };

    expect(
      getSoundEventsForStep({
        algorithmType: ALGORITHM_TYPES.PATHFINDING,
        algorithmKey: 'bfs',
        previousStep: stagnantGrid,
        step: stagnantGrid,
        stepIndex: 2,
        totalSteps: 3,
      })
    ).toEqual([{ kind: SOUND_EVENT_KINDS.NO_RESULT }]);
  });
});
