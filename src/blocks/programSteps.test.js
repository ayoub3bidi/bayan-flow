/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  buildProgramSteps,
  buildSearchProgramSteps,
  buildPathProgramSteps,
  buildTreeProgramSteps,
  treeToDict,
  buildGraphProgramSteps,
  buildMatrixProgramSteps,
  graphNodeNames,
  graphToArgs,
  isValidGridPath,
  shortestPathLength,
  isSortedAscending,
} from './programSteps.js';

// Events a correct bubble sort records for [3, 1, 2].
const EVENTS = [
  { kind: 'compare', i: 0, j: 1, array: [3, 1, 2], blockId: 'cmp' },
  { kind: 'swap', i: 0, j: 1, array: [1, 3, 2], blockId: 'swp' },
  { kind: 'compare', i: 1, j: 2, array: [1, 3, 2], blockId: 'cmp' },
  { kind: 'swap', i: 1, j: 2, array: [1, 2, 3], blockId: 'swp' },
  { kind: 'compare', i: 0, j: 1, array: [1, 2, 3], blockId: 'cmp' },
];

describe('buildProgramSteps', () => {
  it('shows the returned array in a solved final frame', () => {
    // The program sorted a copy; the traced arr is still [2, 1].
    const { steps, sorted, shuffles } = buildProgramSteps([], [2, 1], [1, 2]);
    expect(sorted).toBe(true);
    expect(steps.at(-1).array).toEqual([1, 2]);
    expect(shuffles).toBe(0);
  });

  it('only counts a rearrangement of the input as sorted', () => {
    const overwritten = buildProgramSteps([], [3, 1, 2], [0, 0, 0]);
    expect(overwritten).toMatchObject({ sorted: false, valuesChanged: true });
    expect(overwritten.steps.at(-1).states).toEqual([
      'default',
      'default',
      'default',
    ]);
    expect(overwritten.steps.at(-1).description).toContain(
      'its values changed'
    );

    expect(buildProgramSteps([], [2, 2, 1], [1, 2, 2])).toMatchObject({
      sorted: true,
      valuesChanged: false,
    });
    expect(buildProgramSteps([], [3, 1, 2], [3, 1, 2])).toMatchObject({
      sorted: false,
      valuesChanged: false,
    });
  });

  it('turns events into compare/swap steps that carry their block id', () => {
    const { steps, sorted } = buildProgramSteps(EVENTS, [3, 1, 2], [1, 2, 3]);
    expect(sorted).toBe(true);
    expect(steps).toHaveLength(EVENTS.length + 2);
    expect(steps[0]).toMatchObject({
      array: [3, 1, 2],
      states: ['default', 'default', 'default'],
      blockId: null,
    });
    expect(steps[1]).toMatchObject({
      states: ['comparing', 'comparing', 'default'],
      blockId: 'cmp',
    });
    expect(steps[2]).toMatchObject({
      array: [1, 3, 2],
      states: ['swapping', 'swapping', 'default'],
      blockId: 'swp',
    });
    expect(steps.at(-1)).toMatchObject({
      array: [1, 2, 3],
      states: ['sorted', 'sorted', 'sorted'],
      blockId: null,
    });
  });

  it('gives every step ids that form a permutation, following swapped elements', () => {
    const { steps } = buildProgramSteps(EVENTS, [3, 1, 2], [1, 2, 3]);
    for (const step of steps) {
      expect([...step.ids].sort()).toEqual([0, 1, 2]);
    }
    // The 3 (id 0) slides right across both swaps.
    expect(steps[2].ids[1]).toBe(0);
    expect(steps[4].ids[2]).toBe(0);
  });

  it('marks an unsorted result without the sorted state', () => {
    const { steps, sorted } = buildProgramSteps(
      EVENTS.slice(0, 1),
      [3, 1, 2],
      [3, 1, 2]
    );
    expect(sorted).toBe(false);
    expect(steps.at(-1).states).toEqual(['default', 'default', 'default']);
  });

  it('treats a missing or wrong-length result as not sorted', () => {
    expect(buildProgramSteps([], [2, 1], null).sorted).toBe(false);
    expect(buildProgramSteps([], [2, 1], [1]).sorted).toBe(false);
  });
});

describe('buildProgramSteps: reads, writes, shuffles and checks', () => {
  it('highlights one index per read/write and the whole array otherwise', () => {
    const events = [
      { kind: 'read', i: 1, j: null, array: [3, 1, 2], blockId: 'get' },
      { kind: 'write', i: 0, j: null, array: [1, 1, 2], blockId: 'set' },
      { kind: 'shuffle', i: null, j: null, array: [2, 1, 1], blockId: 'mix' },
      { kind: 'check', i: null, j: null, array: [2, 1, 1], blockId: 'ok' },
    ];
    const { steps } = buildProgramSteps(events, [3, 1, 2], [2, 1, 1], 'demo');
    expect(steps.slice(1, 5).map(step => step.states)).toEqual([
      ['default', 'comparing', 'default'],
      ['swapping', 'default', 'default'],
      ['swapping', 'swapping', 'swapping'],
      ['comparing', 'comparing', 'comparing'],
    ]);
    expect(steps.slice(1, 5).map(step => step.blockId)).toEqual([
      'get',
      'set',
      'mix',
      'ok',
    ]);
    expect(steps[2].array).toEqual([1, 1, 2]);
    for (const step of steps)
      expect(step.description).toEqual(expect.any(String));
  });

  it('ignores out-of-range indexes instead of growing the states', () => {
    const { steps } = buildProgramSteps(
      [{ kind: 'read', i: -1, j: null, array: [3, 1], blockId: 'get' }],
      [3, 1],
      [3, 1]
    );
    expect(steps[1].states).toEqual(['default', 'default']);
  });
});

describe('buildSearchProgramSteps: every array search', () => {
  it.each([
    'linearSearch',
    'binarySearch',
    'ternarySearch',
    'jumpSearch',
    'interpolationSearch',
    'exponentialSearch',
    'fibonacciSearch',
  ])('%s skips reads and finds the returned index', key => {
    const events = [
      { kind: 'read', i: 0, j: null, array: [5, 7, 9], blockId: 'get' },
      { kind: 'compare', i: 2, j: null, array: [5, 7, 9], blockId: 'cmp' },
    ];
    const { steps, solved } = buildSearchProgramSteps(
      events,
      [5, 7, 9],
      9,
      2,
      key
    );
    expect(solved).toBe(true);
    expect(steps).toHaveLength(3);
    expect(steps[1].blockId).toBe('cmp');
    expect(steps.at(-1).states).toEqual(['default', 'default', 'sorted']);
  });
});

describe('isSortedAscending', () => {
  it('accepts ascending runs with duplicates', () => {
    expect(isSortedAscending([])).toBe(true);
    expect(isSortedAscending([1, 1, 2])).toBe(true);
    expect(isSortedAscending([2, 1])).toBe(false);
  });
});

describe('buildSearchProgramSteps', () => {
  const INPUT = [2, 4, 6, 8];
  const checks = indexes =>
    indexes.map(i => ({
      kind: 'compare',
      i,
      j: null,
      array: INPUT,
      blockId: 'cmp',
    }));

  it('highlights each check and marks the returned index as found', () => {
    const { steps, solved } = buildSearchProgramSteps(
      checks([1, 2]),
      INPUT,
      6,
      2,
      'binarySearch'
    );
    expect(solved).toBe(true);
    expect(steps).toHaveLength(4);
    expect(steps.every(step => step.targetValue === 6)).toBe(true);
    expect(steps[1]).toMatchObject({
      states: ['default', 'comparing', 'default', 'default'],
      blockId: 'cmp',
    });
    expect(steps.at(-1)).toMatchObject({
      states: ['default', 'default', 'sorted', 'default'],
      blockId: null,
    });
    expect(steps.at(-1).description).toContain('6');
  });

  it.each([
    ['-1 for a present target', -1],
    ['an index that does not hold the target', 0],
    ['an out-of-range index', 9],
    ['no index at all', null],
  ])('is not solved when the program returns %s', (_label, result) => {
    const { steps, solved } = buildSearchProgramSteps(
      checks([0]),
      INPUT,
      6,
      result,
      'linearSearch'
    );
    expect(solved).toBe(false);
    expect(steps.at(-1).states).toEqual(Array(4).fill('default'));
  });
});

describe('buildPathProgramSteps', () => {
  const GRID = [
    [0, 0, 0],
    [0, 1, 0],
  ];
  const START = { row: 0, col: 0 };
  const END = { row: 1, col: 2 };
  const PATH = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ];
  const EVENTS = [
    { kind: 'visit', cell: [0, 0], blockId: 'pop' },
    { kind: 'open', cell: [0, 1], blockId: 'push' },
    { kind: 'open', cell: [1, 0], blockId: 'push' },
    { kind: 'visit', cell: [0, 1], blockId: 'pop' },
    { kind: 'leave', cell: [1, 0], blockId: 'back' },
  ];

  it('marks frontier and explored cells, never over start or end', () => {
    const { steps, solved } = buildPathProgramSteps(
      EVENTS,
      GRID,
      START,
      END,
      PATH,
      'bfs'
    );
    expect(solved).toBe(true);
    expect(steps).toHaveLength(EVENTS.length + 2);
    expect(steps[0].states).toEqual([
      ['start', 'default', 'default'],
      ['default', 'default', 'end'],
    ]);
    expect(steps[1].states[0][0]).toBe('start');
    expect(steps[2]).toMatchObject({ blockId: 'push', grid: GRID });
    expect(steps[2].states[0][1]).toBe('open');
    expect(steps[4].states[0][1]).toBe('closed');
    expect(steps[5].states[1][0]).toBe('closed');
    expect(steps.at(-1).states).toEqual([
      ['start', 'path', 'path'],
      ['closed', 'default', 'end'],
    ]);
    expect(steps.at(-1).blockId).toBeNull();
  });

  it('rejects an empty path and one that skips or leaves the start', () => {
    expect(buildPathProgramSteps([], GRID, START, END, []).solved).toBe(false);
    const { steps, solved } = buildPathProgramSteps([], GRID, START, END, [
      [0, 0],
      [1, 2],
    ]);
    expect(solved).toBe(false);
    expect(steps.at(-1).states[0][1]).toBe('default');
  });

  it('passes a longer valid path but says it is not the shortest', () => {
    const detour = [
      [0, 0],
      [1, 0],
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ];
    const { steps, solved, shortest } = buildPathProgramSteps(
      [],
      GRID,
      START,
      END,
      detour
    );
    expect(solved).toBe(true);
    expect(shortest).toBe(4);
    expect(steps.at(-1).description).toBe(
      'Path found: 6 cells, but the shortest path has 4. Valid, just not the shortest.'
    );
    const best = buildPathProgramSteps([], GRID, START, END, PATH);
    expect(best.steps.at(-1).description).toBe('Path found! Length: 4 cells');
  });

  it('measures the shortest path around walls, 0 when unreachable', () => {
    expect(shortestPathLength(GRID, START, END)).toBe(4);
    expect(
      shortestPathLength(
        [
          [0, 1, 0],
          [0, 1, 0],
        ],
        START,
        { row: 0, col: 2 }
      )
    ).toBe(0);
  });

  it('validates paths: adjacency, walls, bounds and endpoints', () => {
    expect(isValidGridPath(PATH, GRID, START, END)).toBe(true);
    const throughWall = [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ];
    expect(isValidGridPath(throughWall, GRID, START, END)).toBe(false);
    expect(isValidGridPath(PATH.slice(1), GRID, START, END)).toBe(false);
    expect(
      isValidGridPath(
        [
          [0, 0],
          [0, 3],
        ],
        GRID,
        START,
        END
      )
    ).toBe(false);
    expect(isValidGridPath(null, GRID, START, END)).toBe(false);
  });
});

// 2 at the root, 1 on the left, 3 on the right (values double as node names).
const TREE = {
  nodes: [
    { id: '0', label: '2' },
    { id: '1', label: '1' },
    { id: '2', label: '3' },
  ],
  edges: [
    { from: '0', to: '1' },
    { from: '0', to: '2' },
  ],
  children: {
    0: { left: '1', right: '2' },
    1: { left: null, right: null },
    2: { left: null, right: null },
  },
  rootId: '0',
  nodeValues: { 0: 2, 1: 1, 2: 3 },
};
const output = (node, blockId = 'vis') => ({ kind: 'output', node, blockId });

describe('treeToDict', () => {
  it('nests nodes as { value, left, right } with null leaves', () => {
    expect(treeToDict(TREE)).toEqual({
      value: 2,
      left: { value: 1, left: null, right: null },
      right: { value: 3, left: null, right: null },
    });
  });
});

describe('buildTreeProgramSteps', () => {
  it('plays each visit as visiting then visited and solves the right order', () => {
    const { steps, solved } = buildTreeProgramSteps(
      [output(1), output(2), output(3)],
      TREE,
      'inorderTraversal',
      [1, 2, 3]
    );
    expect(solved).toBe(true);
    expect(steps).toHaveLength(1 + 3 * 2 + 1);
    expect(steps[1].nodeStates).toEqual({
      0: 'default',
      1: 'visiting',
      2: 'default',
    });
    expect(steps[1].blockId).toBe('vis');
    expect(steps[2].nodeStates[1]).toBe('visited');
    expect(steps[2].visitOrder).toEqual(['1']);
    expect(Object.values(steps.at(-1).nodeStates)).toEqual([
      'visited',
      'visited',
      'visited',
    ]);
  });

  it('fails a wrong order and names both orders', () => {
    const { solved, got, expected, steps } = buildTreeProgramSteps(
      [output(2), output(1), output(3)],
      TREE,
      'inorderTraversal',
      [2, 1, 3]
    );
    expect(solved).toBe(false);
    expect(got).toBe('2, 1, 3');
    expect(expected).toBe('1, 2, 3');
    expect(steps.at(-1).description).toContain('1, 2, 3');
    expect(
      buildTreeProgramSteps([], TREE, 'inorderTraversal', null).solved
    ).toBe(false);
  });

  it('mirrors a queue (the untraced [root] included) but not a stack', () => {
    const queue = buildTreeProgramSteps(
      [
        { kind: 'visit', cell: 2, blockId: 'pop' },
        { kind: 'open', cell: 1, blockId: 'push' },
        { kind: 'open', cell: 3, blockId: 'push' },
        { kind: 'visit', cell: 1, blockId: 'pop' },
      ],
      TREE,
      'levelOrderTraversal',
      []
    ).steps;
    expect(queue.map(step => step.queueOrder)).toEqual([
      [],
      [],
      ['1'],
      ['1', '2'],
      ['2'],
      [],
    ]);
    const stack = buildTreeProgramSteps(
      [
        { kind: 'open', cell: 1, blockId: 'push' },
        { kind: 'open', cell: 3, blockId: 'push' },
        { kind: 'leave', cell: 3, blockId: 'pop' },
      ],
      TREE,
      'preorderTraversal',
      []
    ).steps;
    expect(stack[3].queueOrder).toEqual([]);
  });

  it('draws a Morris thread as an extra edge until it is removed', () => {
    const { steps } = buildTreeProgramSteps(
      [
        { kind: 'thread', node: 1, other: 2, blockId: 'th' },
        { kind: 'unthread', node: 1, other: null, blockId: 'un' },
      ],
      TREE,
      'morrisTraversal',
      []
    );
    expect(steps[1].edges).toContainEqual({ from: '1', to: '0' });
    expect(steps[1].description).toContain('1 → 2');
    expect(steps[2].edges).toEqual(TREE.edges);
    expect(steps[2].blockId).toBe('un');
  });

  it('shows the zigzag scan direction of each level from its visits', () => {
    const tree = {
      ...TREE,
      nodes: [
        { id: '0', label: '2', x: 0.5 },
        { id: '1', label: '1', x: 0 },
        { id: '2', label: '3', x: 1 },
      ],
    };
    // Root (one node: depth 0 → ltr), then level 1 right to left.
    const { steps } = buildTreeProgramSteps(
      [output(2), output(3), output(1)],
      tree,
      'zigzagLevelOrderTraversal',
      [2, 3, 1]
    );
    expect(steps[1].levelScanDirection).toBe('ltr');
    expect(steps[3].levelScanDirection).toBe('rtl');
    expect(steps.at(-1).levelScanDirection).toBeUndefined();
    // Other traversals have no badge.
    const inorder = buildTreeProgramSteps(
      [output(1)],
      tree,
      'inorderTraversal',
      [1]
    ).steps;
    expect(inorder[1].levelScanDirection).toBeUndefined();
  });

  it('fails a right order that leaves a Morris thread in the tree', () => {
    const { solved, threadsLeft, steps } = buildTreeProgramSteps(
      [
        { kind: 'thread', node: 1, other: 2, blockId: 'th' },
        output(1),
        output(2),
        output(3),
      ],
      TREE,
      'morrisTraversal',
      [1, 2, 3]
    );
    expect(solved).toBe(false);
    expect(threadsLeft).toBe(1);
    expect(steps.at(-1).description).toContain('still in the tree');
    expect(steps.at(-1).edges).toContainEqual({ from: '1', to: '0' });
  });
});

// A → B → C, directed; node ids differ from the labels the program sees.
const node = (id, label) => ({ id, label, x: 0, y: 0 });
const CHAIN = {
  nodes: [node('0', 'A'), node('1', 'B'), node('2', 'C')],
  edges: [
    { id: '0->1', from: '0', to: '1' },
    { id: '1->2', from: '1', to: '2' },
  ],
  adjacency: { 0: ['1'], 1: ['2'], 2: [] },
  directed: true,
};
// A triangle with weights A-B 1, B-C 2, A-C 3 (MST weight 3).
const TRIANGLE = {
  nodes: CHAIN.nodes,
  edges: [
    { id: '0<->1', from: '0', to: '1', weight: 1 },
    { id: '1<->2', from: '1', to: '2', weight: 2 },
    { id: '0<->2', from: '0', to: '2', weight: 3 },
  ],
  adjacency: { 0: ['1', '2'], 1: ['0', '2'], 2: ['0', '1'] },
  directed: false,
  weighted: true,
};
const ev = (kind, extra) => ({ kind, blockId: 'b', ...extra });

describe('graph program inputs', () => {
  it('names nodes by label, or by id when labels repeat', () => {
    expect(graphNodeNames(CHAIN.nodes)).toEqual({ 0: 'A', 1: 'B', 2: 'C' });
    expect(graphNodeNames([node('0', 'A'), node('1', 'A')])).toEqual({
      0: '0',
      1: '1',
    });
  });

  it('builds the arguments of each algorithm family', () => {
    expect(graphToArgs(CHAIN, 'topologicalSort')).toEqual([
      { A: ['B'], B: ['C'], C: [] },
    ]);
    expect(graphToArgs(TRIANGLE, 'kruskalAlgorithm')).toEqual([
      ['A', 'B', 'C'],
      [
        ['A', 'B', 1],
        ['B', 'C', 2],
        ['A', 'C', 3],
      ],
    ]);
    expect(
      graphToArgs({ ...TRIANGLE, rootId: '0', goalId: '2' }, 'depthFirstSearch')
    ).toEqual([{ A: ['B', 'C'], B: ['A', 'C'], C: ['A', 'B'] }, 'A', 'C']);
  });
});

describe('buildGraphProgramSteps', () => {
  const TOPO_EVENTS = [
    ev('mark', { node: 'A' }),
    ev('edge', { from: 'A', to: 'B' }),
    ev('mark', { node: 'B' }),
    ev('edge', { from: 'B', to: 'C' }),
    ev('mark', { node: 'C' }),
    ev('output', { node: 'C' }),
    ev('output', { node: 'B' }),
    ev('output', { node: 'A' }),
  ];

  it('lights edges, mirrors the recursion stack and accepts a valid order', () => {
    const { steps, solved } = buildGraphProgramSteps(
      TOPO_EVENTS,
      CHAIN,
      'topologicalSort',
      ['A', 'B', 'C']
    );
    expect(solved).toBe(true);
    expect(steps).toHaveLength(1 + TOPO_EVENTS.length + 1);
    expect(steps[1].nodeStates[0]).toBe('current');
    expect(steps[2].edgeStates['0->1']).toBe('active');
    // The next event settles the lit edge.
    expect(steps[3].edgeStates['0->1']).toBe('visited');
    expect(steps[5].graphArtifacts.badges[0].text).toContain('A → B → C');
    expect(steps[6].nodeStates[2]).toBe('path');
    expect(steps.every(step => step.blockId !== undefined)).toBe(true);
    expect(steps.at(-1).graphArtifacts.badges.map(b => b.id)).toEqual([
      'order',
    ]);
    // Appends are the finish order; the end shows the returned order.
    expect(steps[6].graphArtifacts.badges.at(-1).text).toContain(
      'Finish order: C'
    );
    expect(steps.at(-1).graphArtifacts.badges[0].text).toContain(
      'Topological order: A → B → C'
    );
  });

  it('shows in-degrees, index/low-links and the Kosaraju pass from the program', () => {
    const store = (name, key, value) => ev('store', { name, key, value });
    const kahn = buildGraphProgramSteps(
      [
        store('in_degree', 'A', 0),
        store('in_degree', 'B', 1),
        ev('edge', { from: 'A', to: 'B' }),
        store('in_degree', 'B', 0),
        ev('output', { node: 'A' }),
      ],
      CHAIN,
      'kahnAlgorithm',
      null
    );
    // Stores add no step and don't settle the lit edge early.
    expect(kahn.steps).toHaveLength(1 + 2 + 1);
    expect(kahn.steps[1].edgeStates['0->1']).toBe('active');
    const badgeOf = (step, id) =>
      step.graphArtifacts.badges.find(b => b.id === id)?.text;
    expect(badgeOf(kahn.steps[1], 'inDegree')).toContain('A:0, B:1');
    expect(badgeOf(kahn.steps[2], 'inDegree')).toContain('A:0, B:0');

    const tarjan = buildGraphProgramSteps(
      [
        store('index', 'A', 0),
        store('low', 'A', 0),
        ev('open', { cell: 'A' }),
        store('index', 'B', 1),
        ev('open', { cell: 'B' }),
      ],
      CHAIN,
      'tarjanAlgorithm',
      null
    );
    expect(badgeOf(tarjan.steps[2], 'lowLink')).toContain('A:0/0, B:1/1');

    const kosaraju = buildGraphProgramSteps(
      [
        ev('mark', { node: 'A', set: 'visited' }),
        ev('mark', { node: 'A', set: 'assigned' }),
      ],
      CHAIN,
      'kosarajuAlgorithm',
      null
    );
    expect(badgeOf(kosaraju.steps[0], 'pass')).toContain('1');
    expect(badgeOf(kosaraju.steps[1], 'pass')).toContain('1');
    expect(badgeOf(kosaraju.steps[2], 'pass')).toContain('2');
  });

  it('fails an invalid order and names a valid one', () => {
    const { solved, got, expected } = buildGraphProgramSteps(
      TOPO_EVENTS,
      CHAIN,
      'topologicalSort',
      ['C', 'B', 'A']
    );
    expect(solved).toBe(false);
    expect(got).toBe('C, B, A');
    expect(expected).toBe('A, B, C');
  });

  it('expects None from Kahn on a cycle', () => {
    const cycle = {
      ...CHAIN,
      edges: [...CHAIN.edges, { id: '2->0', from: '2', to: '0' }],
      adjacency: { 0: ['1'], 1: ['2'], 2: ['0'] },
    };
    expect(
      buildGraphProgramSteps([], cycle, 'kahnAlgorithm', null).solved
    ).toBe(true);
    expect(
      buildGraphProgramSteps([], cycle, 'kahnAlgorithm', ['A']).solved
    ).toBe(false);
    // `return 0` arrives as a null list, but it isn't None.
    expect(
      buildGraphProgramSteps(
        [],
        cycle,
        'kahnAlgorithm',
        null,
        'f',
        false,
        false
      ).solved
    ).toBe(false);
  });

  it('keeps the queue strip in sorted order and lights transpose edges backwards', () => {
    const both = {
      ...CHAIN,
      edges: [...CHAIN.edges, { id: '1->0', from: '1', to: '0' }],
    };
    const { steps } = buildGraphProgramSteps(
      [
        ev('open', { cell: 'C' }),
        ev('open', { cell: 'B' }),
        ev('reorder', { items: ['B', 'C'] }),
        ev('edge', { from: 'A', to: 'B', reversed: true }),
        ev('visit', { cell: 'B' }),
      ],
      both,
      'kahnAlgorithm',
      null
    );
    const queueOf = step =>
      step.graphArtifacts.badges.find(b => b.id === 'stack')?.text;
    expect(queueOf(steps[1])).toContain('C');
    // The reorder adds no step: the push before it shows the sorted queue,
    // and so does the next step.
    expect(queueOf(steps[2])).toContain('B → C');
    expect(queueOf(steps[3])).toContain('B → C');
    expect(steps[3].edgeStates['1->0']).toBe('active');
    expect(steps[3].edgeStates['0->1']).toBeUndefined();
  });

  it('never passes a program that fell off its end, even where None is right', () => {
    const cycle = {
      ...CHAIN,
      edges: [...CHAIN.edges, { id: '2->0', from: '2', to: '0' }],
      adjacency: { 0: ['1'], 1: ['2'], 2: ['0'] },
    };
    for (const key of ['kahnAlgorithm', 'topologicalSort']) {
      const { steps, solved, noReturn } = buildGraphProgramSteps(
        [],
        cycle,
        key,
        null,
        'f',
        true
      );
      expect(solved).toBe(false);
      expect(noReturn).toBe(true);
      expect(steps.at(-1).description).toContain(
        'finished without returning an answer'
      );
    }
  });

  it('selects spanning-tree edges, rejects the rest, and checks the weight', () => {
    const events = [
      ev('edge', { from: 'A', to: 'B' }),
      ev('output', { node: ['A', 'B', 1] }),
      ev('edge', { from: 'B', to: 'C' }),
      ev('output', { node: ['B', 'C', 2] }),
      ev('edge', { from: 'A', to: 'C' }),
    ];
    const tree = [
      ['A', 'B', 1],
      ['B', 'C', 2],
    ];
    const { steps, solved } = buildGraphProgramSteps(
      events,
      TRIANGLE,
      'kruskalAlgorithm',
      tree
    );
    expect(solved).toBe(true);
    expect(steps.at(-1).edgeStates).toEqual({
      '0<->1': 'selected',
      '1<->2': 'selected',
      '0<->2': 'cycle',
    });
    expect(steps.at(-1).graphArtifacts.badges[0].text).toContain('3');
    // A cycle, a heavier tree, a made-up edge.
    for (const answer of [
      [...tree, ['A', 'C', 3]],
      [
        ['A', 'B', 1],
        ['A', 'C', 3],
      ],
      [
        ['A', 'B', 1],
        ['B', 'C', 9],
      ],
    ]) {
      expect(
        buildGraphProgramSteps([], TRIANGLE, 'primAlgorithm', answer).solved
      ).toBe(false);
    }
  });

  it('highlights each component and compares partitions, not order', () => {
    const { steps, solved } = buildGraphProgramSteps(
      [ev('output', { node: ['C'] })],
      CHAIN,
      'tarjanAlgorithm',
      [['C'], ['B'], ['A']]
    );
    expect(solved).toBe(true);
    expect(steps[1].nodeStates[2]).toBe('path');
    expect(
      buildGraphProgramSteps([], CHAIN, 'kosarajuAlgorithm', [['A', 'B', 'C']])
        .solved
    ).toBe(false);
  });

  it('accepts a search path along edges and flags a long BFS path', () => {
    const square = {
      nodes: [node('0', '0'), node('1', '1'), node('2', '2'), node('3', '3')],
      edges: [
        { from: '0', to: '1' },
        { from: '1', to: '2' },
        { from: '2', to: '3' },
        { from: '0', to: '3' },
      ],
      adjacency: { 0: ['1', '3'], 1: ['0', '2'], 2: ['1', '3'], 3: ['0', '2'] },
      rootId: '0',
      goalId: '2',
    };
    const events = [ev('open', { cell: '1' }), ev('visit', { cell: '1' })];
    const bfs = buildGraphProgramSteps(
      events,
      square,
      'breadthFirstSearchGraph',
      ['0', '1', '2']
    );
    expect(bfs.solved).toBe(true);
    expect(bfs.steps[1].stackOrder).toEqual(['1']);
    expect(bfs.steps[1].nodeStates[1]).toBe('frontier');
    expect(bfs.steps[2].nodeStates[1]).toBe('current');
    expect(bfs.steps.at(-1).nodeStates[0]).toBe('root');
    expect(bfs.steps.at(-1).goalNodeId).toBe('2');
    expect(bfs.length).toBe(bfs.shortest);

    const longer = buildGraphProgramSteps(
      [],
      { ...square, goalId: '3' },
      'breadthFirstSearchGraph',
      ['0', '1', '2', '3']
    );
    expect(longer.solved).toBe(true);
    expect(longer.length).toBeGreaterThan(longer.shortest);
    // DFS makes no shortest-path promise.
    expect(
      buildGraphProgramSteps([], square, 'depthFirstSearch', ['0', '3', '2'])
        .shortest
    ).toBeUndefined();
    expect(
      buildGraphProgramSteps([], square, 'depthFirstSearch', ['0', '2']).solved
    ).toBe(false);
    expect(
      buildGraphProgramSteps([], square, 'depthFirstSearch', null).solved
    ).toBe(false);
  });
});

describe('buildMatrixProgramSteps', () => {
  // A → B 1, B → C 1, A → C 5: going through B improves A → C to 2.
  const GRAPH = {
    nodes: CHAIN.nodes,
    edges: [
      { from: '0', to: '1', weight: 1 },
      { from: '1', to: '2', weight: 1 },
      { from: '0', to: '2', weight: 5 },
    ],
  };
  const write = (i, j, value) => ev('write', { i, j, value });
  const read = (i, j) => ev('read', { i, j });

  it('replays writes and shows an improvement through k', () => {
    const { steps, solved } = buildMatrixProgramSteps(
      [write(0, 2, 5), read(0, 1), read(1, 2), write(0, 2, 2)],
      GRAPH,
      [
        [0, 1, 2],
        [null, 0, 1],
        [null, null, 0],
      ]
    );
    expect(solved).toBe(true);
    expect(steps).toHaveLength(1 + 2 + 1);
    expect(steps[1].matrix.cells[0][2]).toBe('5');
    expect(steps[1].matrix.cellStates[0][2]).toBe('updated');
    const update = steps[2].matrix;
    expect(update.cells[0][2]).toBe('2');
    expect(update.cellStates[1][1]).toBe('current');
    expect(update.cellStates[0][1]).toBe('considering');
    expect(update.cellStates[1][2]).toBe('considering');
    expect(steps[2].blockId).toBe('b');
  });

  it('fails a wrong matrix and shows both', () => {
    const { solved, got, expected } = buildMatrixProgramSteps([], GRAPH, [
      [0, 1, 5],
      [null, 0, 1],
      [null, null, 0],
    ]);
    expect(solved).toBe(false);
    expect(got).toBe('[0, 1, 5] [∞, 0, 1] [∞, ∞, 0]');
    expect(expected).toBe('[0, 1, 2] [∞, 0, 1] [∞, ∞, 0]');
    // The final table is the returned matrix, even with no writes traced.
    expect(
      buildMatrixProgramSteps([], GRAPH, [
        [0, 1, 5],
        [null, 0, 1],
        [null, null, 0],
      ]).steps.at(-1).matrix.cells[0][2]
    ).toBe('5');
  });

  it('fails a list of node names without throwing', () => {
    const { solved, got } = buildMatrixProgramSteps([], GRAPH, ['A', 'B', 'C']);
    expect(solved).toBe(false);
    expect(got).toBe('A B C');
  });

  it('describes a higher write as a plain write, not an improvement', () => {
    const { steps } = buildMatrixProgramSteps(
      [write(0, 2, 5), read(0, 1), read(1, 2), write(0, 2, 8)],
      GRAPH,
      null
    );
    expect(steps[2].matrix.cellStates[1][1]).not.toBe('current');
    expect(steps[2].intermediateId ?? null).toBeNull();
  });
});
