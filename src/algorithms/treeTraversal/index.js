/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { inorderTraversal, inorderTraversalPure } from './inorderTraversal';
import { preorderTraversal, preorderTraversalPure } from './preorderTraversal';
import {
  postorderTraversal,
  postorderTraversalPure,
} from './postorderTraversal';
import {
  levelOrderTraversal,
  levelOrderTraversalPure,
} from './levelOrderTraversal';
import {
  zigzagLevelOrderTraversal,
  zigzagLevelOrderTraversalPure,
} from './zigzagLevelOrderTraversal';
import { morrisTraversal, morrisTraversalPure } from './morrisTraversal';

export const treeTraversalAlgorithms = {
  inorderTraversal,
  preorderTraversal,
  postorderTraversal,
  levelOrderTraversal,
  zigzagLevelOrderTraversal,
  morrisTraversal,
};

export const pureTreeTraversalAlgorithms = {
  inorderTraversal: inorderTraversalPure,
  preorderTraversal: preorderTraversalPure,
  postorderTraversal: postorderTraversalPure,
  levelOrderTraversal: levelOrderTraversalPure,
  zigzagLevelOrderTraversal: zigzagLevelOrderTraversalPure,
  morrisTraversal: morrisTraversalPure,
};

export {
  inorderTraversal,
  inorderTraversalPure,
  preorderTraversal,
  preorderTraversalPure,
  postorderTraversal,
  postorderTraversalPure,
  levelOrderTraversal,
  levelOrderTraversalPure,
  zigzagLevelOrderTraversal,
  zigzagLevelOrderTraversalPure,
  morrisTraversal,
  morrisTraversalPure,
};
