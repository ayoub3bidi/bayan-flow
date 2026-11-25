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
