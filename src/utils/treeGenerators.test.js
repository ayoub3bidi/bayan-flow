/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { generateTreeForTraversal } from './treeGenerators.js';

describe('generateTreeForTraversal', () => {
  it('returns empty structures for nodeCount <= 0', () => {
    const t = generateTreeForTraversal({ nodeCount: 0 });
    expect(t.nodes).toEqual([]);
    expect(t.rootId).toBe(null);
    expect(t.edges).toEqual([]);
  });

  it('builds a single-node tree', () => {
    const t = generateTreeForTraversal({ nodeCount: 1 });
    expect(t.nodes).toHaveLength(1);
    expect(t.rootId).toBe('0');
    expect(t.edges).toHaveLength(0);
    expect(t.children['0']).toEqual({ left: null, right: null });
    expect(t.nodeValues['0']).toBe(1);
  });

  it('assigns BST inorder values 1..n', () => {
    const t = generateTreeForTraversal({
      nodeCount: 15,
      rng: () => 0.42,
    });
    const vals = Object.values(t.nodeValues).sort((a, b) => a - b);
    expect(vals).toEqual(Array.from({ length: t.nodes.length }, (_, i) => i + 1));
  });

  it('respects binary child links only', () => {
    const t = generateTreeForTraversal({ nodeCount: 10, rng: () => 0.5 });
    for (const id of t.nodes.map(n => n.id)) {
      const ch = t.children[id];
      expect(ch.left === null || typeof ch.left === 'string').toBe(true);
      expect(ch.right === null || typeof ch.right === 'string').toBe(true);
    }
  });
});
