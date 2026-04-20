/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  ALGORITHM_TYPES,
  ELEMENT_STATES,
  GRID_ELEMENT_STATES,
} from '../constants';
import {
  VIDEO_SCENE_RENDERERS,
  VIDEO_TITLE_FALLBACK,
} from './videoSceneRegistry.jsx';

const minimalArrayStep = {
  array: [1],
  states: [ELEMENT_STATES.DEFAULT],
  description: '',
};

const minimalGridStep = {
  grid: [[0]],
  states: [[GRID_ELEMENT_STATES.DEFAULT]],
  description: '',
};

const minimalTreeStep = {
  nodes: [{ id: '0', x: 0.5, y: 0.5, label: '1' }],
  edges: [],
  nodeStates: {},
  description: '',
};

describe('VIDEO_SCENE_RENDERERS', () => {
  it('has a renderer for every ALGORITHM_TYPE', () => {
    Object.values(ALGORITHM_TYPES).forEach(type => {
      expect(
        VIDEO_SCENE_RENDERERS[type],
        `Missing video scene for type "${type}"`
      ).toBeDefined();
      expect(typeof VIDEO_SCENE_RENDERERS[type]).toBe('function');
    });
  });

  it('invokes each renderer with minimal props and returns a React element', () => {
    Object.values(ALGORITHM_TYPES).forEach(type => {
      const renderer = VIDEO_SCENE_RENDERERS[type];
      const props =
        type === ALGORITHM_TYPES.PATHFINDING
          ? {
              steps: [minimalGridStep],
              framesPerStep: 1,
              gridSize: 1,
            }
          : type === ALGORITHM_TYPES.TREE_TRAVERSAL
            ? {
                steps: [minimalTreeStep],
                framesPerStep: 1,
                exportTheme: 'dark',
              }
            : {
                steps: [minimalArrayStep],
                framesPerStep: 1,
              };
      const node = renderer(props);
      expect(node).toBeDefined();
      expect(node.type).toBeDefined();
    });
  });
});

describe('VIDEO_TITLE_FALLBACK', () => {
  it('has a title for every ALGORITHM_TYPE', () => {
    Object.values(ALGORITHM_TYPES).forEach(type => {
      expect(
        VIDEO_TITLE_FALLBACK[type],
        `Missing video title fallback for type "${type}"`
      ).toBeTruthy();
    });
  });
});
