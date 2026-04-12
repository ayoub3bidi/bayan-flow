/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { VISUALIZER_REGISTRY } from './visualizerRegistry';
import { ALGORITHM_TYPES } from '../constants';

describe('VISUALIZER_REGISTRY', () => {
  it('contains an entry for every ALGORITHM_TYPE', () => {
    Object.values(ALGORITHM_TYPES).forEach(type => {
      expect(
        VISUALIZER_REGISTRY[type],
        `Missing VISUALIZER_REGISTRY entry for type "${type}"`
      ).toBeDefined();
    });
  });

  it('maps each entry to a function (React component)', () => {
    Object.entries(VISUALIZER_REGISTRY).forEach(([type, Component]) => {
      expect(
        typeof Component,
        `VISUALIZER_REGISTRY["${type}"] should be a function`
      ).toBe('function');
    });
  });

  it('has no extra keys beyond ALGORITHM_TYPES', () => {
    const registeredTypes = Object.keys(VISUALIZER_REGISTRY);
    const knownTypes = Object.values(ALGORITHM_TYPES);
    registeredTypes.forEach(type => {
      expect(
        knownTypes,
        `VISUALIZER_REGISTRY has an unknown type "${type}"`
      ).toContain(type);
    });
  });
});
