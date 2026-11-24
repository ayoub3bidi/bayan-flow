/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Starter programs for the array searches (the node-link DFS/BFS searches
 * get blocks with the graph category). Each returns the index of `target`;
 * reaching the end of the function returns -1.
 */

import {
  program,
  set,
  ret,
  ifThen,
  forRange,
  whileLoop,
  op,
  floordiv,
  min,
  sqrt,
  cmp,
  and,
  len,
  target,
  compareTarget,
  get,
} from './builders.js';

const linearSearch = program({
  variables: ['i'],
  kind: 'search',
  signature: 'linear_search(arr, target)',
  main: [
    forRange('i', 0, len(), [ifThen(compareTarget('i', '=='), [ret('i')])]),
  ],
});

/** `if arr[mid] < target: left = mid + 1 else: right = mid - 1` */
const halve = () =>
  ifThen(
    compareTarget('mid', '<'),
    [set('left', op('mid', '+', 1))],
    [set('right', op('mid', '-', 1))]
  );

/** The binary search loop over left..right. */
const binaryLoop = () =>
  whileLoop(cmp('left', '<=', 'right'), [
    set('mid', floordiv(op('left', '+', 'right'), 2)),
    ifThen(compareTarget('mid', '=='), [ret('mid')]),
    halve(),
  ]);

const binarySearch = program({
  variables: ['left', 'right', 'mid'],
  kind: 'search',
  signature: 'binary_search(arr, target)',
  main: [set('left', 0), set('right', op(len(), '-', 1)), binaryLoop()],
});

const ternarySearch = program({
  variables: ['left', 'right', 'third', 'mid1', 'mid2'],
  kind: 'search',
  signature: 'ternary_search(arr, target)',
  main: [
    set('left', 0),
    set('right', op(len(), '-', 1)),
    whileLoop(cmp('left', '<=', 'right'), [
      set('third', floordiv(op('right', '-', 'left'), 3)),
      set('mid1', op('left', '+', 'third')),
      set('mid2', op('right', '-', 'third')),
      ifThen(compareTarget('mid1', '=='), [ret('mid1')]),
      ifThen(compareTarget('mid2', '=='), [ret('mid2')]),
      ifThen(
        compareTarget('mid1', '>'),
        [set('right', op('mid1', '-', 1))],
        [
          ifThen(
            compareTarget('mid2', '<'),
            [set('left', op('mid2', '+', 1))],
            [set('left', op('mid1', '+', 1)), set('right', op('mid2', '-', 1))]
          ),
        ]
      ),
    ]),
  ],
});

/** Jump ahead √n at a time, then scan the block that can hold target. */
const jumpSearch = program({
  variables: ['n', 'step', 'prev', 'i'],
  kind: 'search',
  signature: 'jump_search(arr, target)',
  main: [
    set('n', len()),
    set('step', sqrt('n')),
    set('prev', 0),
    whileLoop(
      and(
        cmp('prev', '<', 'n'),
        compareTarget(op(min(op('prev', '+', 'step'), 'n'), '-', 1), '<')
      ),
      [set('prev', op('prev', '+', 'step'))]
    ),
    forRange('i', 'prev', min(op('prev', '+', 'step'), 'n'), [
      ifThen(compareTarget('i', '=='), [ret('i')]),
    ]),
  ],
});

/** Guess the position from the values at both ends, like a phone book. */
const interpolationSearch = program({
  variables: ['low', 'high', 'pos'],
  kind: 'search',
  signature: 'interpolation_search(arr, target)',
  main: [
    set('low', 0),
    set('high', op(len(), '-', 1)),
    whileLoop(
      and(
        cmp('low', '<=', 'high'),
        and(compareTarget('low', '<='), compareTarget('high', '>='))
      ),
      [
        // Also keeps the formula below from dividing by zero.
        ifThen(compareTarget('low', '=='), [ret('low')]),
        set(
          'pos',
          op(
            'low',
            '+',
            floordiv(
              op(op(target(), '-', get('low')), '*', op('high', '-', 'low')),
              op(get('high'), '-', get('low'))
            )
          )
        ),
        ifThen(compareTarget('pos', '=='), [ret('pos')]),
        ifThen(
          compareTarget('pos', '<'),
          [set('low', op('pos', '+', 1))],
          [set('high', op('pos', '-', 1))]
        ),
      ]
    ),
  ],
});

/** Double a bound until it passes target, then binary search that range. */
const exponentialSearch = program({
  variables: ['n', 'bound', 'left', 'right', 'mid'],
  kind: 'search',
  signature: 'exponential_search(arr, target)',
  main: [
    set('n', len()),
    ifThen(compareTarget(0, '=='), [ret(0)]),
    set('bound', 1),
    whileLoop(and(cmp('bound', '<', 'n'), compareTarget('bound', '<')), [
      set('bound', op('bound', '*', 2)),
    ]),
    set('left', floordiv('bound', 2)),
    set('right', min('bound', op('n', '-', 1))),
    binaryLoop(),
  ],
});

/** Like binary search, but splits at Fibonacci numbers (no division). */
const fibonacciSearch = program({
  variables: ['n', 'fib2', 'fib1', 'fib', 'offset', 'i'],
  kind: 'search',
  signature: 'fibonacci_search(arr, target)',
  main: [
    set('n', len()),
    set('fib2', 0),
    set('fib1', 1),
    set('fib', op('fib2', '+', 'fib1')),
    whileLoop(cmp('fib', '<', 'n'), [
      set('fib2', 'fib1'),
      set('fib1', 'fib'),
      set('fib', op('fib2', '+', 'fib1')),
    ]),
    set('offset', -1),
    whileLoop(cmp('fib', '>', 1), [
      set('i', min(op('offset', '+', 'fib2'), op('n', '-', 1))),
      ifThen(compareTarget('i', '=='), [ret('i')]),
      ifThen(
        compareTarget('i', '<'),
        [
          set('fib', 'fib1'),
          set('fib1', 'fib2'),
          set('fib2', op('fib', '-', 'fib1')),
          set('offset', 'i'),
        ],
        [
          set('fib', 'fib2'),
          set('fib1', op('fib1', '-', 'fib2')),
          set('fib2', op('fib', '-', 'fib1')),
        ]
      ),
    ]),
    ifThen(
      and(
        cmp('fib1', '==', 1),
        and(
          cmp(op('offset', '+', 1), '<', 'n'),
          compareTarget(op('offset', '+', 1), '==')
        )
      ),
      [ret(op('offset', '+', 1))]
    ),
  ],
});

export const SEARCHING_STARTERS = {
  linearSearch,
  binarySearch,
  ternarySearch,
  jumpSearch,
  interpolationSearch,
  exponentialSearch,
  fibonacciSearch,
};
