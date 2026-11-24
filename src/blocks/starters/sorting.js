/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Starter programs for every sorting algorithm. Each sorts `arr` in place, the
 * way the JS visualizations in src/algorithms/sorting/ do, so every compare,
 * swap, read and write can be shown in the visualizer.
 */

import {
  program,
  set,
  swap,
  write,
  shuffle,
  listSet,
  append,
  sortList,
  ret,
  brk,
  call,
  callValue,
  ifThen,
  forRange,
  whileLoop,
  op,
  floordiv,
  mod,
  min,
  sqrt,
  cmp,
  and,
  or,
  not,
  bool,
  len,
  arrMax,
  arrMin,
  compare,
  get,
  isSorted,
  zeros,
  buckets,
  slice,
  at,
  listLen,
} from './builders.js';

const bubbleSort = program({
  variables: ['n', 'i', 'j', 'swapped'],
  kind: 'sort',
  signature: 'bubble_sort(arr)',
  main: [
    set('n', len()),
    forRange('i', 0, op('n', '-', 1), [
      set('swapped', bool(false)),
      forRange('j', 0, op(op('n', '-', 'i'), '-', 1), [
        ifThen(compare('j', '>', op('j', '+', 1)), [
          swap('j', op('j', '+', 1)),
          set('swapped', bool(true)),
        ]),
      ]),
      ifThen(not('swapped'), [brk()]),
    ]),
  ],
});

const selectionSort = program({
  variables: ['n', 'i', 'j', 'min_index'],
  kind: 'sort',
  signature: 'selection_sort(arr)',
  main: [
    set('n', len()),
    forRange('i', 0, op('n', '-', 1), [
      set('min_index', 'i'),
      forRange('j', op('i', '+', 1), 'n', [
        ifThen(compare('j', '<', 'min_index'), [set('min_index', 'j')]),
      ]),
      ifThen(cmp('min_index', '!=', 'i'), [swap('i', 'min_index')]),
    ]),
  ],
});

/** Swap-based: walk each new element left while it's smaller. */
const insertionSort = program({
  variables: ['n', 'i', 'j'],
  kind: 'sort',
  signature: 'insertion_sort(arr)',
  main: [
    set('n', len()),
    forRange('i', 1, 'n', [
      set('j', 'i'),
      whileLoop(and(cmp('j', '>', 0), compare(op('j', '-', 1), '>', 'j')), [
        swap(op('j', '-', 1), 'j'),
        set('j', op('j', '-', 1)),
      ]),
    ]),
  ],
});

/** Insertion sort over elements `gap` apart, with a shrinking gap. */
const shellSort = program({
  variables: ['n', 'gap', 'i', 'j'],
  kind: 'sort',
  signature: 'shell_sort(arr)',
  main: [
    set('n', len()),
    set('gap', floordiv('n', 2)),
    whileLoop(cmp('gap', '>', 0), [
      forRange('i', 'gap', 'n', [
        set('j', 'i'),
        whileLoop(
          and(cmp('j', '>=', 'gap'), compare(op('j', '-', 'gap'), '>', 'j')),
          [swap(op('j', '-', 'gap'), 'j'), set('j', op('j', '-', 'gap'))]
        ),
      ]),
      set('gap', floordiv('gap', 2)),
    ]),
  ],
});

/** Bubble sort with a gap that shrinks by 1.3 each pass. */
const combSort = program({
  variables: ['n', 'gap', 'swapped', 'i'],
  kind: 'sort',
  signature: 'comb_sort(arr)',
  main: [
    set('n', len()),
    set('gap', 'n'),
    set('swapped', bool(true)),
    whileLoop(or(cmp('gap', '>', 1), 'swapped'), [
      set('gap', floordiv(op('gap', '*', 10), 13)),
      ifThen(cmp('gap', '<', 1), [set('gap', 1)]),
      set('swapped', bool(false)),
      forRange('i', 0, op('n', '-', 'gap'), [
        ifThen(compare('i', '>', op('i', '+', 'gap')), [
          swap('i', op('i', '+', 'gap')),
          set('swapped', bool(true)),
        ]),
      ]),
    ]),
  ],
});

/** Count smaller elements to find where each item belongs, then rotate it in. */
function cyclePlace() {
  return [
    set('pos', 'cycle_start'),
    forRange('i', op('cycle_start', '+', 1), 'n', [
      ifThen(cmp(get('i'), '<', 'item'), [set('pos', op('pos', '+', 1))]),
    ]),
  ];
}
function cycleSkipDuplicatesAndPut() {
  return [
    whileLoop(cmp('item', '==', get('pos')), [set('pos', op('pos', '+', 1))]),
    set('temp', get('pos')),
    write('pos', 'item'),
    set('item', 'temp'),
  ];
}
const cycleSort = program({
  variables: ['n', 'cycle_start', 'item', 'pos', 'i', 'temp'],
  kind: 'sort',
  signature: 'cycle_sort(arr)',
  main: [
    set('n', len()),
    forRange('cycle_start', 0, op('n', '-', 1), [
      set('item', get('cycle_start')),
      ...cyclePlace(),
      ifThen(cmp('pos', '!=', 'cycle_start'), [
        ...cycleSkipDuplicatesAndPut(),
        whileLoop(cmp('pos', '!=', 'cycle_start'), [
          ...cyclePlace(),
          ...cycleSkipDuplicatesAndPut(),
        ]),
      ]),
    ]),
  ],
});

const heapSort = program({
  variables: ['n', 'i', 'end', 'largest', 'left', 'right'],
  kind: 'sort',
  signature: 'heap_sort(arr)',
  main: [
    set('n', len()),
    // Build a max-heap from the last parent up to the root.
    set('i', op(floordiv('n', 2), '-', 1)),
    whileLoop(cmp('i', '>=', 0), [
      call('heapify', 'n', 'i'),
      set('i', op('i', '-', 1)),
    ]),
    // Move the largest to the end, then repair the smaller heap.
    set('end', op('n', '-', 1)),
    whileLoop(cmp('end', '>', 0), [
      swap(0, 'end'),
      call('heapify', 'end', 0),
      set('end', op('end', '-', 1)),
    ]),
  ],
  helpers: [
    {
      signature: 'heapify(arr, n, i)',
      body: [
        set('largest', 'i'),
        set('left', op(op(2, '*', 'i'), '+', 1)),
        set('right', op(op(2, '*', 'i'), '+', 2)),
        ifThen(and(cmp('left', '<', 'n'), compare('left', '>', 'largest')), [
          set('largest', 'left'),
        ]),
        ifThen(and(cmp('right', '<', 'n'), compare('right', '>', 'largest')), [
          set('largest', 'right'),
        ]),
        ifThen(cmp('largest', '!=', 'i'), [
          swap('i', 'largest'),
          call('heapify', 'n', 'largest'),
        ]),
      ],
    },
  ],
});

const quickSort = program({
  variables: ['low', 'high', 'p', 'i', 'j'],
  kind: 'sort',
  signature: 'quick_sort(arr)',
  main: [call('quick_sort_range', 0, op(len(), '-', 1))],
  helpers: [
    {
      signature: 'quick_sort_range(arr, low, high)',
      body: [
        ifThen(cmp('low', '<', 'high'), [
          set('p', callValue('partition', 'low', 'high')),
          call('quick_sort_range', 'low', op('p', '-', 1)),
          call('quick_sort_range', op('p', '+', 1), 'high'),
        ]),
      ],
    },
    {
      // Lomuto: the last element is the pivot.
      signature: 'partition(arr, low, high)',
      body: [
        set('i', op('low', '-', 1)),
        forRange('j', 'low', 'high', [
          ifThen(compare('j', '<=', 'high'), [
            set('i', op('i', '+', 1)),
            swap('i', 'j'),
          ]),
        ]),
        swap(op('i', '+', 1), 'high'),
        ret(op('i', '+', 1)),
      ],
    },
  ],
});

/** Merge arr[left..mid] and arr[mid+1..right] back into arr. */
const mergeHelper = {
  signature: 'merge(arr, left, mid, right)',
  body: [
    set('left_part', slice('left', op('mid', '+', 1))),
    set('right_part', slice(op('mid', '+', 1), op('right', '+', 1))),
    set('i', 0),
    set('j', 0),
    set('k', 'left'),
    whileLoop(
      and(
        cmp('i', '<', listLen('left_part')),
        cmp('j', '<', listLen('right_part'))
      ),
      [
        ifThen(
          cmp(at('left_part', 'i'), '<=', at('right_part', 'j')),
          [write('k', at('left_part', 'i')), set('i', op('i', '+', 1))],
          [write('k', at('right_part', 'j')), set('j', op('j', '+', 1))]
        ),
        set('k', op('k', '+', 1)),
      ]
    ),
    whileLoop(cmp('i', '<', listLen('left_part')), [
      write('k', at('left_part', 'i')),
      set('i', op('i', '+', 1)),
      set('k', op('k', '+', 1)),
    ]),
    whileLoop(cmp('j', '<', listLen('right_part')), [
      write('k', at('right_part', 'j')),
      set('j', op('j', '+', 1)),
      set('k', op('k', '+', 1)),
    ]),
  ],
};
const MERGE_VARIABLES = ['left', 'mid', 'right', 'left_part', 'right_part'];

const mergeSort = program({
  variables: [...MERGE_VARIABLES, 'i', 'j', 'k'],
  kind: 'sort',
  signature: 'merge_sort(arr)',
  main: [call('merge_sort_range', 0, op(len(), '-', 1))],
  helpers: [
    {
      signature: 'merge_sort_range(arr, left, right)',
      body: [
        ifThen(cmp('left', '<', 'right'), [
          set('mid', floordiv(op('left', '+', 'right'), 2)),
          call('merge_sort_range', 'left', 'mid'),
          call('merge_sort_range', op('mid', '+', 1), 'right'),
          call('merge', 'left', 'mid', 'right'),
        ]),
      ],
    },
    mergeHelper,
  ],
});

/** Insertion-sort runs of 32, then merge runs of doubling size. */
const timSort = program({
  variables: [...MERGE_VARIABLES, 'n', 'run', 'start', 'size', 'i', 'j', 'k'],
  kind: 'sort',
  signature: 'tim_sort(arr)',
  main: [
    set('n', len()),
    set('run', 32),
    set('start', 0),
    whileLoop(cmp('start', '<', 'n'), [
      call(
        'insertion_sort_range',
        'start',
        min(op(op('start', '+', 'run'), '-', 1), op('n', '-', 1))
      ),
      set('start', op('start', '+', 'run')),
    ]),
    set('size', 'run'),
    whileLoop(cmp('size', '<', 'n'), [
      set('left', 0),
      whileLoop(cmp('left', '<', 'n'), [
        set('mid', min(op(op('left', '+', 'size'), '-', 1), op('n', '-', 1))),
        set(
          'right',
          min(op(op('left', '+', op(2, '*', 'size')), '-', 1), op('n', '-', 1))
        ),
        ifThen(cmp('mid', '<', 'right'), [
          call('merge', 'left', 'mid', 'right'),
        ]),
        set('left', op('left', '+', op(2, '*', 'size'))),
      ]),
      set('size', op('size', '*', 2)),
    ]),
  ],
  helpers: [
    {
      signature: 'insertion_sort_range(arr, left, right)',
      body: [
        forRange('i', op('left', '+', 1), op('right', '+', 1), [
          set('j', 'i'),
          whileLoop(
            and(cmp('j', '>', 'left'), compare(op('j', '-', 1), '>', 'j')),
            [swap(op('j', '-', 1), 'j'), set('j', op('j', '-', 1))]
          ),
        ]),
      ],
    },
    mergeHelper,
  ],
});

/** Count each value, then write the values back in order. */
const countingSort = program({
  variables: ['n', 'min_value', 'count', 'i', 'value', 'k'],
  kind: 'sort',
  signature: 'counting_sort(arr)',
  main: [
    set('n', len()),
    set('min_value', arrMin()),
    set('count', zeros(op(op(arrMax(), '-', 'min_value'), '+', 1))),
    forRange('i', 0, 'n', [
      set('value', op(get('i'), '-', 'min_value')),
      listSet('count', 'value', op(at('count', 'value'), '+', 1)),
    ]),
    set('k', 0),
    forRange('value', 0, listLen('count'), [
      whileLoop(cmp(at('count', 'value'), '>', 0), [
        write('k', op('value', '+', 'min_value')),
        set('k', op('k', '+', 1)),
        listSet('count', 'value', op(at('count', 'value'), '-', 1)),
      ]),
    ]),
  ],
});

/** Sort by each digit (ones, tens, …) using 10 buckets. */
const radixSort = program({
  variables: [
    'n',
    'max_value',
    'exp',
    'digit_buckets',
    'i',
    'value',
    'k',
    'b',
    'j',
  ],
  kind: 'sort',
  signature: 'radix_sort(arr)',
  main: [
    set('n', len()),
    set('max_value', arrMax()),
    set('exp', 1),
    whileLoop(cmp(floordiv('max_value', 'exp'), '>', 0), [
      set('digit_buckets', buckets(10)),
      forRange('i', 0, 'n', [
        set('value', get('i')),
        append(at('digit_buckets', mod(floordiv('value', 'exp'), 10)), 'value'),
      ]),
      set('k', 0),
      forRange('b', 0, 10, [
        forRange('j', 0, listLen(at('digit_buckets', 'b')), [
          write('k', at(at('digit_buckets', 'b'), 'j')),
          set('k', op('k', '+', 1)),
        ]),
      ]),
      set('exp', op('exp', '*', 10)),
    ]),
  ],
});

/** Spread values over √n buckets by range, sort each, write them back. */
const bucketSort = program({
  variables: [
    'n',
    'min_value',
    'bucket_count',
    'width',
    'value_buckets',
    'i',
    'value',
    'k',
    'b',
    'j',
  ],
  kind: 'sort',
  signature: 'bucket_sort(arr)',
  main: [
    set('n', len()),
    set('min_value', arrMin()),
    set('bucket_count', op(sqrt('n'), '+', 1)),
    set(
      'width',
      op(floordiv(op(arrMax(), '-', 'min_value'), 'bucket_count'), '+', 1)
    ),
    set('value_buckets', buckets('bucket_count')),
    forRange('i', 0, 'n', [
      set('value', get('i')),
      append(
        at('value_buckets', floordiv(op('value', '-', 'min_value'), 'width')),
        'value'
      ),
    ]),
    set('k', 0),
    forRange('b', 0, 'bucket_count', [
      sortList(at('value_buckets', 'b')),
      forRange('j', 0, listLen(at('value_buckets', 'b')), [
        write('k', at(at('value_buckets', 'b'), 'j')),
        set('k', op('k', '+', 1)),
      ]),
    ]),
  ],
});

/** Shuffle until sorted, giving up after 1000 tries like the visualization. */
const bogoSort = program({
  variables: ['attempts'],
  kind: 'sort',
  signature: 'bogo_sort(arr)',
  main: [
    set('attempts', 0),
    whileLoop(and(not(isSorted()), cmp('attempts', '<', 1000)), [
      shuffle(),
      set('attempts', op('attempts', '+', 1)),
    ]),
  ],
});

export const SORTING_STARTERS = {
  bubbleSort,
  selectionSort,
  insertionSort,
  shellSort,
  combSort,
  cycleSort,
  heapSort,
  quickSort,
  mergeSort,
  timSort,
  countingSort,
  radixSort,
  bucketSort,
  bogoSort,
};
