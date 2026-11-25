/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Starter programs for the grid pathfinding algorithms. Each takes
 * `(grid, start, end)` with `(row, col)` cells, moves up/down/left/right like
 * src/algorithms/pathfinding/*.js, and returns the path from start to end as a
 * list of cells; reaching the end of the function returns [] (no path).
 * Frontier pushes/pops and cost updates are traced (see blocksTracer.js).
 */

import {
  program,
  set,
  ret,
  ifThen,
  forRange,
  forEach,
  whileLoop,
  op,
  floordiv,
  min,
  cmp,
  and,
  not,
  bool,
  brk,
  cont,
  at,
  listSet,
  listLen,
  append,
  callValue,
  start,
  end,
  none,
  infinity,
  grid,
  rows,
  cols,
  directions,
  newDict,
  neighbors,
  walkable,
  manhattan,
  cell,
  rowOf,
  colOf,
  pair,
  list,
  pop,
  popMin,
  getOr,
  isIn,
  notIn,
  push,
  pushPriority,
  popLast,
  relax,
  reverse,
} from './builders.js';

/** `while len(lst) > 0:` */
const whileNotEmpty = (lst, statements) =>
  whileLoop(cmp(listLen(lst), '>', 0), statements);

/** Walks the parent links back from `cell` and returns them start → cell. */
const buildPath = {
  signature: 'build_path(parent, cell)',
  body: [
    set('path', list()),
    whileLoop(cmp('cell', '!=', none()), [
      append('path', 'cell'),
      set('cell', at('parent', 'cell')),
    ]),
    reverse('path'),
    ret('path'),
  ],
};

/** `parent = {}` then `parent[start] = None` (and the same for more dicts). */
const emptyParent = (name, root = start()) => [
  set(name, newDict()),
  listSet(name, root, none()),
];

/** `if cell == end: return build_path(parent, cell)` */
const returnWhenAtEnd = () =>
  ifThen(cmp('cell', '==', end()), [
    ret(callValue('build_path', 'parent', 'cell')),
  ]);

const bfs = program({
  variables: ['queue', 'parent', 'cell', 'nb', 'path'],
  kind: 'path',
  signature: 'bfs(grid, start, end)',
  main: [
    set('queue', list(start())),
    ...emptyParent('parent'),
    whileNotEmpty('queue', [
      set('cell', pop('queue')),
      returnWhenAtEnd(),
      forEach('nb', neighbors('cell'), [
        ifThen(notIn('nb', 'parent'), [
          listSet('parent', 'nb', 'cell'),
          push('queue', 'nb'),
        ]),
      ]),
    ]),
  ],
  helpers: [buildPath],
});

/**
 * Dijkstra and A*: a priority queue keyed by `priority(nb)`; every step costs 1.
 * With unit costs a cell's first improvement is usually final, so stale heap
 * entries are simply popped again (their neighbours don't improve).
 */
const bestFirst = ({ signature, startPriority, priority }) =>
  program({
    variables: ['dist', 'parent', 'open_set', 'cell', 'nb', 'path'],
    kind: 'path',
    signature,
    main: [
      set('dist', newDict()),
      listSet('dist', start(), 0),
      ...emptyParent('parent'),
      set('open_set', list(pair(startPriority, start()))),
      whileNotEmpty('open_set', [
        set('cell', popMin('open_set')),
        returnWhenAtEnd(),
        forEach('nb', neighbors('cell'), [
          ifThen(
            cmp(
              op(at('dist', 'cell'), '+', 1),
              '<',
              getOr('dist', 'nb', infinity())
            ),
            [
              listSet('dist', 'nb', op(at('dist', 'cell'), '+', 1)),
              listSet('parent', 'nb', 'cell'),
              pushPriority('open_set', priority('nb', at('dist', 'nb')), 'nb'),
            ]
          ),
        ]),
      ]),
    ],
    helpers: [buildPath],
  });

const dijkstra = bestFirst({
  signature: 'dijkstra(grid, start, end)',
  startPriority: 0,
  priority: (_, g) => g,
});

const aStar = bestFirst({
  signature: 'a_star(grid, start, end)',
  startPriority: manhattan(start(), end()),
  priority: (c, g) => op(g, '+', manhattan(c, end())),
});

const greedyBestFirstSearch = program({
  variables: ['parent', 'open_set', 'cell', 'nb', 'path'],
  kind: 'path',
  signature: 'greedy_best_first_search(grid, start, end)',
  main: [
    ...emptyParent('parent'),
    set('open_set', list(pair(manhattan(start(), end()), start()))),
    whileNotEmpty('open_set', [
      set('cell', popMin('open_set')),
      returnWhenAtEnd(),
      forEach('nb', neighbors('cell'), [
        ifThen(notIn('nb', 'parent'), [
          listSet('parent', 'nb', 'cell'),
          pushPriority('open_set', manhattan('nb', end()), 'nb'),
        ]),
      ]),
    ]),
  ],
  helpers: [buildPath],
});

/** One BFS step of a bidirectional search; returns the joined path on contact. */
const expandSide = (queue, mine, other, joinArgs) => [
  set('cell', pop(queue)),
  forEach('nb', neighbors('cell'), [
    ifThen(notIn('nb', mine), [
      listSet(mine, 'nb', 'cell'),
      push(queue, 'nb'),
      ifThen(isIn('nb', other), [
        ret(callValue('join_paths', ...joinArgs, 'nb')),
      ]),
    ]),
  ]),
];

const bidirectionalSearch = program({
  variables: [
    'forward',
    'backward',
    'from_start',
    'from_end',
    'cell',
    'nb',
    'meet',
    'path',
    'parent',
  ],
  kind: 'path',
  signature: 'bidirectional_search(grid, start, end)',
  main: [
    set('forward', list(start())),
    set('backward', list(end())),
    ...emptyParent('from_start'),
    ...emptyParent('from_end', end()),
    whileLoop(
      and(cmp(listLen('forward'), '>', 0), cmp(listLen('backward'), '>', 0)),
      [
        ...expandSide('forward', 'from_start', 'from_end', [
          'from_start',
          'from_end',
        ]),
        ...expandSide('backward', 'from_end', 'from_start', [
          'from_start',
          'from_end',
        ]),
      ]
    ),
  ],
  helpers: [
    {
      // Start → meet from one side, then meet → end from the other.
      signature: 'join_paths(from_start, from_end, meet)',
      body: [
        set('path', callValue('build_path', 'from_start', 'meet')),
        set('cell', at('from_end', 'meet')),
        whileLoop(cmp('cell', '!=', none()), [
          append('path', 'cell'),
          set('cell', at('from_end', 'cell')),
        ]),
        ret('path'),
      ],
    },
    buildPath,
  ],
});

const bellmanFord = program({
  variables: ['dist', 'parent', 'i', 'changed', 'r', 'c', 'cell', 'nb', 'path'],
  kind: 'path',
  signature: 'bellman_ford(grid, start, end)',
  main: [
    set('dist', newDict()),
    relax('dist', start(), 0),
    ...emptyParent('parent'),
    // At most V - 1 rounds; stop early once a round changes nothing.
    forRange('i', 0, op(op(rows(), '*', cols()), '-', 1), [
      set('changed', bool(false)),
      forRange('r', 0, rows(), [
        forRange('c', 0, cols(), [
          set('cell', cell('r', 'c')),
          ifThen(isIn('cell', 'dist'), [
            forEach('nb', neighbors('cell'), [
              ifThen(
                cmp(
                  op(at('dist', 'cell'), '+', 1),
                  '<',
                  getOr('dist', 'nb', infinity())
                ),
                [
                  relax('dist', 'nb', op(at('dist', 'cell'), '+', 1)),
                  listSet('parent', 'nb', 'cell'),
                  set('changed', bool(true)),
                ]
              ),
            ]),
          ]),
        ]),
      ]),
      ifThen(not('changed'), [brk()]),
    ]),
    ifThen(isIn(end(), 'dist'), [
      ret(callValue('build_path', 'parent', end())),
    ]),
  ],
  helpers: [buildPath],
});

/** -1 means "found"; otherwise the smallest f that went over the threshold. */
const idaSearch = {
  signature: 'search(grid, path, g, threshold, end)',
  body: [
    set('cell', at('path', op(listLen('path'), '-', 1))),
    set('f', op('g', '+', manhattan('cell', end()))),
    ifThen(cmp('f', '>', 'threshold'), [ret('f')]),
    ifThen(cmp('cell', '==', end()), [ret(-1)]),
    set('minimum', infinity()),
    forEach('nb', neighbors('cell'), [
      ifThen(notIn('nb', 'path'), [
        push('path', 'nb'),
        set(
          't',
          callValue(
            'search',
            grid(),
            'path',
            op('g', '+', 1),
            'threshold',
            end()
          )
        ),
        ifThen(cmp('t', '==', -1), [ret(-1)]),
        set('minimum', min('minimum', 't')),
        popLast('path'),
      ]),
    ]),
    ret('minimum'),
  ],
};

const idaStar = program({
  variables: ['path', 'threshold', 't', 'cell', 'f', 'g', 'minimum', 'nb'],
  kind: 'path',
  signature: 'ida_star(grid, start, end)',
  main: [
    set('path', list(start())),
    set('threshold', manhattan(start(), end())),
    whileLoop(cmp('threshold', '<', infinity()), [
      set('t', callValue('search', grid(), 'path', 0, 'threshold', end())),
      ifThen(cmp('t', '==', -1), [ret('path')]),
      set('threshold', 't'),
    ]),
  ],
  helpers: [idaSearch],
});

/** One move of `d` from `x`. */
const step = (x, d) =>
  cell(op(rowOf(x), '+', rowOf(d)), op(colOf(x), '+', colOf(d)));

const jumpPointSearch = program({
  variables: [
    'dist',
    'parent',
    'open_set',
    'cell',
    'd',
    'jp',
    'g',
    'nxt',
    'path',
    'p',
    'n',
    'i',
  ],
  kind: 'path',
  signature: 'jump_point_search(grid, start, end)',
  main: [
    set('dist', newDict()),
    listSet('dist', start(), 0),
    ...emptyParent('parent'),
    set('open_set', list(pair(manhattan(start(), end()), start()))),
    whileNotEmpty('open_set', [
      set('cell', popMin('open_set')),
      ifThen(cmp('cell', '==', end()), [
        ret(callValue('walk_path', 'parent', 'cell')),
      ]),
      forEach('d', directions(), [
        set('jp', callValue('jump', grid(), 'cell', 'd', end())),
        ifThen(cmp('jp', '!=', none()), [
          set('g', op(at('dist', 'cell'), '+', manhattan('cell', 'jp'))),
          ifThen(cmp('g', '<', getOr('dist', 'jp', infinity())), [
            listSet('dist', 'jp', 'g'),
            listSet('parent', 'jp', 'cell'),
            pushPriority(
              'open_set',
              op('g', '+', manhattan('jp', end())),
              'jp'
            ),
          ]),
        ]),
      ]),
    ]),
  ],
  helpers: [
    {
      // shortcut: no forced-neighbour check, which only matters next to
      // walls; the grid has none yet. Add it when walls can be drawn.
      // Moving sideways stops in the goal's column, moving up/down in its row.
      signature: 'jump(grid, cell, d, end)',
      body: [
        set('nxt', step('cell', 'd')),
        whileLoop(walkable('nxt'), [
          ifThen(
            and(
              cmp(rowOf('d'), '==', 0),
              cmp(colOf('nxt'), '==', colOf(end()))
            ),
            [ret('nxt')]
          ),
          ifThen(
            and(
              cmp(colOf('d'), '==', 0),
              cmp(rowOf('nxt'), '==', rowOf(end()))
            ),
            [ret('nxt')]
          ),
          set('nxt', step('nxt', 'd')),
        ]),
        ret(none()),
      ],
    },
    {
      // Jump points sit on straight lines: fill in the cells between them.
      signature: 'walk_path(parent, cell)',
      body: [
        set('path', list('cell')),
        whileLoop(cmp(at('parent', 'cell'), '!=', none()), [
          set('p', at('parent', 'cell')),
          set('n', manhattan('cell', 'p')),
          set(
            'd',
            cell(
              floordiv(op(rowOf('p'), '-', rowOf('cell')), 'n'),
              floordiv(op(colOf('p'), '-', colOf('cell')), 'n')
            )
          ),
          forRange('i', 0, 'n', [
            set('cell', step('cell', 'd')),
            append('path', 'cell'),
          ]),
        ]),
        reverse('path'),
        ret('path'),
      ],
    },
  ],
});

/**
 * shortcut: plans once on a static grid, so only the "overconsistent" branch
 * of D* Lite runs (g > rhs). Add the cost-change replanning loop when walls
 * can change during a run.
 */
const dStarLite = program({
  variables: ['g', 'rhs', 'open_set', 'cell', 'nb', 'path', 'best'],
  kind: 'path',
  signature: 'd_star_lite(grid, start, end)',
  main: [
    // Search backward from end; rhs is the one-step lookahead cost.
    set('g', newDict()),
    set('rhs', newDict()),
    listSet('rhs', end(), 0),
    set('open_set', list(pair(pair(manhattan(start(), end()), 0), end()))),
    whileNotEmpty('open_set', [
      set('cell', popMin('open_set')),
      ifThen(cmp(getOr('g', 'cell', infinity()), '==', at('rhs', 'cell')), [
        cont(),
      ]),
      listSet('g', 'cell', at('rhs', 'cell')),
      ifThen(cmp('cell', '==', start()), [brk()]),
      forEach('nb', neighbors('cell'), [
        ifThen(
          cmp(op(at('g', 'cell'), '+', 1), '<', getOr('rhs', 'nb', infinity())),
          [
            relax('rhs', 'nb', op(at('g', 'cell'), '+', 1)),
            pushPriority(
              'open_set',
              pair(
                op(at('rhs', 'nb'), '+', manhattan(start(), 'nb')),
                at('rhs', 'nb')
              ),
              'nb'
            ),
          ]
        ),
      ]),
    ]),
    ifThen(isIn(start(), 'g'), [
      ret(callValue('walk_down', grid(), 'g', start(), end())),
    ]),
  ],
  helpers: [
    {
      // Walk from start, always to the neighbour closest to end.
      signature: 'walk_down(grid, g, start, end)',
      body: [
        set('cell', start()),
        set('path', list(start())),
        whileLoop(cmp('cell', '!=', end()), [
          set('best', 'cell'),
          forEach('nb', neighbors('cell'), [
            ifThen(
              cmp(
                getOr('g', 'nb', infinity()),
                '<',
                getOr('g', 'best', infinity())
              ),
              [set('best', 'nb')]
            ),
          ]),
          set('cell', 'best'),
          append('path', 'cell'),
        ]),
        ret('path'),
      ],
    },
  ],
});

/** Path helpers take every argument: mark each call so it doesn't add `arr`. */
function withoutImplicitArr(block) {
  if (!block) return;
  if (block.type === 'bf_call' || block.type === 'bf_call_value') {
    block.extraState.noArr = true;
  }
  for (const input of Object.values(block.inputs ?? {})) {
    withoutImplicitArr(input.block);
  }
  withoutImplicitArr(block.next?.block);
}

export const PATHFINDING_STARTERS = {
  bfs,
  dijkstra,
  aStar,
  greedyBestFirstSearch,
  bidirectionalSearch,
  bellmanFord,
  idaStar,
  jumpPointSearch,
  dStarLite,
};
for (const workspace of Object.values(PATHFINDING_STARTERS)) {
  workspace.blocks.blocks.forEach(withoutImplicitArr);
}
