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

export const treeTraversalAlgorithms = {
  inorderTraversal,
  preorderTraversal,
  postorderTraversal,
};

export const pureTreeTraversalAlgorithms = {
  inorderTraversal: inorderTraversalPure,
  preorderTraversal: preorderTraversalPure,
  postorderTraversal: postorderTraversalPure,
};

export {
  inorderTraversal,
  inorderTraversalPure,
  preorderTraversal,
  preorderTraversalPure,
  postorderTraversal,
  postorderTraversalPure,
};
