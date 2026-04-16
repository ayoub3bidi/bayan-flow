/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Searching category can visualize on a sorted array (classic search) or on an
 * explicit node–link graph (e.g. depth-first search). Use this module as the single branch point.
 */
export const SEARCHING_SUBSTRATES = {
  ARRAY: 'array',
  NODE_LINK: 'nodeLink',
};

/** @type {ReadonlySet<string>} */
const NODE_LINK_ALGORITHM_KEYS = new Set([
  'depthFirstSearch',
  'breadthFirstSearchGraph',
]);

/**
 * @param {string | undefined | null} algorithmKey
 * @returns {string}
 */
export function getSearchingSubstrate(algorithmKey) {
  if (!algorithmKey) return SEARCHING_SUBSTRATES.ARRAY;
  return NODE_LINK_ALGORITHM_KEYS.has(algorithmKey)
    ? SEARCHING_SUBSTRATES.NODE_LINK
    : SEARCHING_SUBSTRATES.ARRAY;
}

/**
 * @param {string | undefined | null} algorithmKey
 * @returns {boolean}
 */
export function isNodeLinkSearchingAlgorithm(algorithmKey) {
  return getSearchingSubstrate(algorithmKey) === SEARCHING_SUBSTRATES.NODE_LINK;
}
