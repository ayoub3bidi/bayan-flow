/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import {
  generateRandomDag,
  generateRandomDirectedGraph,
  generateRandomWeightedUndirectedGraph,
  isAcyclic,
  isConnectedUndirectedGraph,
} from './graphAlgorithmGenerators.js';

describe('generateRandomDag', () => {
  it('generates the requested number of nodes', () => {
    const graph = generateRandomDag({ nodeCount: 6, rng: () => 1 });

    expect(graph.nodes).toHaveLength(6);
    expect(Object.keys(graph.adjacency)).toHaveLength(6);
    expect(graph.directed).toBe(true);
    expect(graph.weighted).toBe(false);
  });

  it('only creates forward edges by numeric rank', () => {
    const graph = generateRandomDag({ nodeCount: 8, rng: () => 0 });

    graph.edges.forEach(edge => {
      expect(Number(edge.from)).toBeLessThan(Number(edge.to));
    });
  });

  it('generates acyclic adjacency', () => {
    const graph = generateRandomDag({ nodeCount: 12, rng: () => 0.2 });

    expect(isAcyclic(graph.adjacency)).toBe(true);
  });
});

describe('generateRandomWeightedUndirectedGraph', () => {
  it('generates the requested number of nodes', () => {
    const graph = generateRandomWeightedUndirectedGraph({
      nodeCount: 6,
      rng: () => 1,
    });

    expect(graph.nodes).toHaveLength(6);
    expect(Object.keys(graph.adjacency)).toHaveLength(6);
    expect(graph.directed).toBe(false);
    expect(graph.weighted).toBe(true);
  });

  it('generates connected graphs for MST algorithms', () => {
    const graph = generateRandomWeightedUndirectedGraph({
      nodeCount: 8,
      rng: () => 0.2,
    });

    expect(isConnectedUndirectedGraph(graph.adjacency)).toBe(true);
  });

  it('assigns weights to every edge', () => {
    const graph = generateRandomWeightedUndirectedGraph({
      nodeCount: 5,
      rng: () => 0.2,
    });

    graph.edges.forEach(edge => {
      expect(typeof edge.weight).toBe('number');
      expect(edge.weight).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('generateRandomDirectedGraph', () => {
  it('generates the requested number of directed nodes', () => {
    const graph = generateRandomDirectedGraph({
      nodeCount: 6,
      rng: () => 1,
    });

    expect(graph.nodes).toHaveLength(6);
    expect(Object.keys(graph.adjacency)).toHaveLength(6);
    expect(graph.directed).toBe(true);
    expect(graph.weighted).toBe(false);
  });

  it('seeds a visible SCC cycle when at least three nodes exist', () => {
    const graph = generateRandomDirectedGraph({
      nodeCount: 5,
      rng: () => 1,
    });

    expect(graph.adjacency['0']).toContain('1');
    expect(graph.adjacency['1']).toContain('2');
    expect(graph.adjacency['2']).toContain('0');
  });
});
