/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { buildExportSoundCues } from './buildExportSoundCues.js';
import {
  ALGORITHM_TYPES,
  ELEMENT_STATES,
  GRID_ELEMENT_STATES,
  GRAPH_NODE_STATES,
  GRAPH_EDGE_STATES,
  TREE_NODE_STATES,
} from '../../constants/index.js';
import { GRAPH_REPRESENTATIONS } from '../../registry/graphAlgorithmRegistry.js';
import { SOUND_EVENT_KINDS } from '../../utils/soundEvents.js';

const FPS_STEP = 45;

describe('buildExportSoundCues', () => {
  it('returns empty for empty steps', () => {
    expect(
      buildExportSoundCues({
        algorithmType: ALGORITHM_TYPES.SORTING,
        algorithmKey: 'bubbleSort',
        steps: [],
        framesPerStep: FPS_STEP,
      })
    ).toEqual([]);
  });

  it('sorting: swap takes precedence over compare in same step shape', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.SORTING,
      algorithmKey: 'bubbleSort',
      steps: [
        {
          array: [2, 1],
          states: [ELEMENT_STATES.SWAPPING, ELEMENT_STATES.SWAPPING],
          description: '',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues.some(c => c.kind === 'swap')).toBe(true);
    expect(cues.some(c => c.kind === 'compare')).toBe(false);
  });

  it('sorting: compare uses frame offset', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.SORTING,
      algorithmKey: 'bubbleSort',
      steps: [
        {
          array: [1, 2],
          states: [ELEMENT_STATES.COMPARING, ELEMENT_STATES.DEFAULT],
          description: '',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([
      { fromFrame: Math.floor(FPS_STEP * 0.15), kind: 'compare' },
    ]);
  });

  it('pathfinding: path found when PATH state is present regardless of language', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.PATHFINDING,
      algorithmKey: 'bfs',
      steps: [
        {
          grid: [],
          states: [[GRID_ELEMENT_STATES.PATH]],
          description: 'Chemin trouvé !',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([
      { fromFrame: 0, kind: SOUND_EVENT_KINDS.PATH_FOUND },
    ]);
  });

  it('pathfinding: open without path phrase is frontier', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.PATHFINDING,
      algorithmKey: 'bfs',
      steps: [
        {
          grid: [],
          states: [[GRID_ELEMENT_STATES.OPEN]],
          description: 'Exploring',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([{ fromFrame: 0, kind: SOUND_EVENT_KINDS.FRONTIER }]);
  });

  it('searching array: only compare', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.SEARCHING,
      algorithmKey: 'binarySearch',
      steps: [
        {
          array: [1, 2, 3],
          states: [ELEMENT_STATES.COMPARING, ELEMENT_STATES.DEFAULT],
          description: '',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues.length).toBe(1);
    expect(cues[0].kind).toBe('compare');
  });

  it('searching graph: frontier yields frontier', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.SEARCHING,
      algorithmKey: 'depthFirstSearch',
      steps: [
        {
          nodes: [{ id: 'a' }],
          edges: [],
          nodeStates: { a: GRAPH_NODE_STATES.FRONTIER },
          description: 'Visit',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([{ fromFrame: 0, kind: SOUND_EVENT_KINDS.FRONTIER }]);
  });

  it('searching graph: path state yields pathFound without English copy', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.SEARCHING,
      algorithmKey: 'depthFirstSearch',
      steps: [
        {
          nodes: [{ id: 'a' }],
          edges: [],
          nodeStates: { a: GRAPH_NODE_STATES.PATH },
          description: 'وُجد مسار!',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([
      { fromFrame: 0, kind: SOUND_EVENT_KINDS.PATH_FOUND },
    ]);
  });

  it('tree traversal: VISITING yields visit', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.TREE_TRAVERSAL,
      algorithmKey: 'inorderTraversal',
      steps: [
        {
          nodes: [{ id: '0' }],
          edges: [],
          nodeStates: { 0: TREE_NODE_STATES.VISITING },
          description: '',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([{ fromFrame: 0, kind: SOUND_EVENT_KINDS.VISIT }]);
  });

  it('graph algorithms: selected edge yields edgeSelect export cue', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
      algorithmKey: 'kruskalAlgorithm',
      steps: [
        {
          nodes: [{ id: 'a' }, { id: 'b' }],
          edges: [{ id: 'e1', from: 'a', to: 'b' }],
          nodeStates: {},
          edgeStates: { e1: GRAPH_EDGE_STATES.SELECTED },
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([
      { fromFrame: 0, kind: SOUND_EVENT_KINDS.EDGE_SELECT },
    ]);
  });

  it('matrix graph algorithms: updated matrix cell yields matrixUpdate export cue', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
      algorithmKey: 'floydWarshallAlgorithm',
      steps: [
        {
          representation: GRAPH_REPRESENTATIONS.MATRIX,
          matrix: {
            cellStates: [['default', 'updated']],
          },
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([
      { fromFrame: 0, kind: SOUND_EVENT_KINDS.MATRIX_UPDATE },
    ]);
  });

  it('exports noResult and cycle milestones with semantic cue kinds', () => {
    expect(
      buildExportSoundCues({
        algorithmType: ALGORITHM_TYPES.SEARCHING,
        algorithmKey: 'binarySearch',
        steps: [
          {
            array: [1, 2, 3],
            states: Array(3).fill(ELEMENT_STATES.DEFAULT),
          },
        ],
        framesPerStep: FPS_STEP,
      })
    ).toEqual([{ fromFrame: 0, kind: SOUND_EVENT_KINDS.NO_RESULT }]);

    expect(
      buildExportSoundCues({
        algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
        algorithmKey: 'kahnAlgorithm',
        steps: [
          {
            nodeStates: { a: GRAPH_NODE_STATES.CYCLE },
            edgeStates: {},
          },
        ],
        framesPerStep: FPS_STEP,
      })
    ).toEqual([{ fromFrame: 0, kind: SOUND_EVENT_KINDS.CYCLE }]);
  });
});
