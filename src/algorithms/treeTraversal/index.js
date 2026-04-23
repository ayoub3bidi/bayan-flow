/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { inorderTraversal, inorderTraversalPure } from './inorderTraversal';
import { preorderTraversal, preorderTraversalPure } from './preorderTraversal';

export const treeTraversalAlgorithms = {
  inorderTraversal,
  preorderTraversal,
};

export const pureTreeTraversalAlgorithms = {
  inorderTraversal: inorderTraversalPure,
  preorderTraversal: preorderTraversalPure,
};

export {
  inorderTraversal,
  inorderTraversalPure,
  preorderTraversal,
  preorderTraversalPure,
};
