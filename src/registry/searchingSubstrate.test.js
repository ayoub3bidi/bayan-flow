/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  getSearchingSubstrate,
  SEARCHING_SUBSTRATES,
  isNodeLinkSearchingAlgorithm,
} from './searchingSubstrate';

describe('searchingSubstrate', () => {
  it('classifies depthFirstSearch as node–link graph', () => {
    expect(getSearchingSubstrate('depthFirstSearch')).toBe(
      SEARCHING_SUBSTRATES.NODE_LINK
    );
    expect(isNodeLinkSearchingAlgorithm('depthFirstSearch')).toBe(true);
  });

  it('defaults unknown keys to array substrate', () => {
    expect(getSearchingSubstrate('binarySearch')).toBe(
      SEARCHING_SUBSTRATES.ARRAY
    );
    expect(isNodeLinkSearchingAlgorithm('binarySearch')).toBe(false);
  });
});
