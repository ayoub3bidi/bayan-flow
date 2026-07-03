/**
 * @fileoverview Algorithm entitlements by tier.
 * Defines which algorithms are accessible to anonymous users (no account).
 * Free tier (signed-in users) gets access to all algorithms.
 */

/**
 * @typedef {'anonymous' | 'free' | 'pro'} PlanTier
 */

/**
 * Plan tier enumeration.
 * @enum {PlanTier}
 */
export const PLAN_TIERS = {
  ANONYMOUS: 'anonymous',
  FREE: 'free',
  PRO: 'pro',
};

/**
 * Anonymous tier algorithm allowlist — 18 of 45 algorithms.
 * Curated starter set across all 5 categories.
 * Keys match runtime `ALGORITHM_TYPES` values (camelCase).
 *
 * @type {Record<string, Set<string>>}
 */
export const ANONYMOUS_TIER_ALGORITHMS = {
  sorting: new Set([
    'bubbleSort',
    'selectionSort',
    'insertionSort',
    'mergeSort',
  ]),
  pathfinding: new Set(['bfs', 'dijkstra', 'aStar']),
  searching: new Set([
    'linearSearch',
    'binarySearch',
    'jumpSearch',
    'depthFirstSearch',
  ]),
  treeTraversal: new Set([
    'inorderTraversal',
    'preorderTraversal',
    'postorderTraversal',
    'levelOrderTraversal',
  ]),
  graphAlgorithm: new Set([
    'topologicalSort',
    'kahnAlgorithm',
    'kruskalAlgorithm',
  ]),
};

/**
 * Check if an algorithm is accessible to anonymous users.
 *
 * @param {string} algorithmKey - Runtime algorithm key (camelCase, e.g. 'bubbleSort')
 * @param {string} categoryType - Category type from ALGORITHM_TYPES (e.g. 'sorting')
 * @returns {boolean} True if algorithm is in the anonymous tier allowlist
 */
export function isAlgorithmFreeForAnonymous(algorithmKey, categoryType) {
  const categorySet = ANONYMOUS_TIER_ALGORITHMS[categoryType];
  if (!categorySet) {
    return false;
  }
  return categorySet.has(algorithmKey);
}
