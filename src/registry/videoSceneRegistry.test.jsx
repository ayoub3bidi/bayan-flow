/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { ALGORITHM_TYPES } from '../constants';
import {
  VIDEO_SCENE_RENDERERS,
  VIDEO_TITLE_FALLBACK,
} from './videoSceneRegistry.jsx';

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
