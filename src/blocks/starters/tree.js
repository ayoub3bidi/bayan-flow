/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Starter programs for the binary tree traversals. Each takes `root`, a node
 * as a nested dict (`{"value", "left", "right"}`, None for a missing child)
 * like src/algorithms/python/*_traversal.py, and returns the node values in
 * visit order. Visits, queue pushes/pops and Morris threads are traced (see
 * blocksTracer.js).
 */

import {
  program,
  set,
  ret,
  ifThen,
  forRange,
  forEach,
  whileLoop,
  cmp,
  and,
  not,
  bool,
  list,
  listLen,
  append,
  call,
  none,
  pop,
  push,
  reverse,
  root,
  left,
  right,
  isSame,
  isNot,
  visit,
  setChild,
} from './builders.js';

/**
 * `result = []`, `walk(root, result)`, `return result`, with a recursive
 * `walk(node, result)` that visits the node at `visitAt` (0 before both
 * subtrees, 1 between them, 2 after them).
 */
function recursive(signature, visitAt) {
  const walkBody = [
    call('walk', left('node'), 'result'),
    call('walk', right('node'), 'result'),
  ];
  walkBody.splice(visitAt, 0, visit('result', 'node'));
  return program({
    variables: ['result', 'node'],
    kind: 'tree',
    signature,
    main: [
      set('result', list()),
      call('walk', root(), 'result'),
      ret('result'),
    ],
    helpers: [
      {
        signature: 'walk(node, result)',
        body: [ifThen(isNot('node', none()), walkBody)],
      },
    ],
  });
}

/** `if node[side] is not None: queue.append(node[side])` */
const pushChild = side => {
  const child = side === 'left' ? left : right;
  return ifThen(isNot(child('node'), none()), [push('queue', child('node'))]);
};

const whileNotEmpty = (lst, statements) =>
  whileLoop(cmp(listLen(lst), '>', 0), statements);

const levelOrder = program({
  variables: ['result', 'queue', 'node'],
  kind: 'tree',
  signature: 'level_order_traversal(root)',
  main: [
    set('result', list()),
    set('queue', list(root())),
    whileNotEmpty('queue', [
      set('node', pop('queue')),
      visit('result', 'node'),
      pushChild('left'),
      pushChild('right'),
    ]),
    ret('result'),
  ],
});

/** Takes a whole level off the queue, then visits it left→right or right→left. */
const zigzag = program({
  variables: ['result', 'queue', 'left_to_right', 'level', 'i', 'node'],
  kind: 'tree',
  signature: 'zigzag_level_order_traversal(root)',
  main: [
    set('result', list()),
    set('queue', list(root())),
    set('left_to_right', bool(true)),
    whileNotEmpty('queue', [
      set('level', list()),
      // range() reads len(queue) once: the children pushed below wait for the next level.
      forRange('i', 0, listLen('queue'), [
        set('node', pop('queue')),
        append('level', 'node'),
        pushChild('left'),
        pushChild('right'),
      ]),
      ifThen(not('left_to_right'), [reverse('level')]),
      forEach('node', 'level', [visit('result', 'node')]),
      set('left_to_right', not('left_to_right')),
    ]),
    ret('result'),
  ],
});

/** Inorder with O(1) extra space: temporary threads replace the stack. */
const morris = program({
  variables: ['result', 'current', 'pred'],
  kind: 'tree',
  signature: 'morris_traversal(root)',
  main: [
    set('result', list()),
    set('current', root()),
    whileLoop(isNot('current', none()), [
      ifThen(
        isSame(left('current'), none()),
        [visit('result', 'current'), set('current', right('current'))],
        [
          set('pred', left('current')),
          whileLoop(
            and(isNot(right('pred'), none()), isNot(right('pred'), 'current')),
            [set('pred', right('pred'))]
          ),
          ifThen(
            isSame(right('pred'), none()),
            [
              setChild('pred', 'right', 'current'),
              set('current', left('current')),
            ],
            [
              setChild('pred', 'right', none()),
              visit('result', 'current'),
              set('current', right('current')),
            ]
          ),
        ]
      ),
    ]),
    ret('result'),
  ],
});

export const TREE_STARTERS = {
  preorderTraversal: recursive('preorder_traversal(root)', 0),
  inorderTraversal: recursive('inorder_traversal(root)', 1),
  postorderTraversal: recursive('postorder_traversal(root)', 2),
  levelOrderTraversal: levelOrder,
  zigzagLevelOrderTraversal: zigzag,
  morrisTraversal: morris,
};
