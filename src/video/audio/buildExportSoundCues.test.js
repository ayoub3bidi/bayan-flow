/**
 * Copyright (c) 2025 Ayoub Abidi
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
} from '../../constants/index.js';

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

  it('pathfinding: path found when PATH and description', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.PATHFINDING,
      algorithmKey: 'bfs',
      steps: [
        {
          grid: [],
          states: [[GRID_ELEMENT_STATES.PATH]],
          description: 'Path found!',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([{ fromFrame: 0, kind: 'pathFound' }]);
  });

  it('pathfinding: open without path phrase is node visit', () => {
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
    expect(cues).toEqual([{ fromFrame: 0, kind: 'nodeVisit' }]);
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

  it('searching graph: frontier yields nodeVisit', () => {
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
    expect(cues).toEqual([{ fromFrame: 0, kind: 'nodeVisit' }]);
  });

  it('searching graph: path with description path', () => {
    const cues = buildExportSoundCues({
      algorithmType: ALGORITHM_TYPES.SEARCHING,
      algorithmKey: 'depthFirstSearch',
      steps: [
        {
          nodes: [{ id: 'a' }],
          edges: [],
          nodeStates: { a: GRAPH_NODE_STATES.PATH },
          description: 'Found path to goal',
        },
      ],
      framesPerStep: FPS_STEP,
    });
    expect(cues).toEqual([{ fromFrame: 0, kind: 'pathFound' }]);
  });
});
