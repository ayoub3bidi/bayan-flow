/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { inorderTraversal, inorderTraversalPure } from './inorderTraversal';
import {
  levelOrderTraversal,
  levelOrderTraversalPure,
} from './levelOrderTraversal';
import { preorderTraversal, preorderTraversalPure } from './preorderTraversal';
import {
  postorderTraversal,
  postorderTraversalPure,
} from './postorderTraversal';

export const treeTraversalAlgorithms = {
  inorderTraversal,
  levelOrderTraversal,
  preorderTraversal,
  postorderTraversal,
};

export const pureTreeTraversalAlgorithms = {
  inorderTraversal: inorderTraversalPure,
  levelOrderTraversal: levelOrderTraversalPure,
  preorderTraversal: preorderTraversalPure,
  postorderTraversal: postorderTraversalPure,
};

export {
  inorderTraversal,
  inorderTraversalPure,
  levelOrderTraversal,
  levelOrderTraversalPure,
  preorderTraversal,
  preorderTraversalPure,
  postorderTraversal,
  postorderTraversalPure,
};
