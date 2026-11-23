/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Nearest unused source slot to `dest`, optionally restricted to a value.
 * Ties go to the lower index so results are deterministic.
 */
function nearestSource(prevArray, usedSrc, dest, value, matchValue) {
  let best = -1;
  for (let k = 0; k < prevArray.length; k++) {
    if (usedSrc[k]) continue;
    if (matchValue && prevArray[k] !== value) continue;
    if (best === -1 || Math.abs(k - dest) < Math.abs(best - dest)) best = k;
  }
  return best;
}

/**
 * For each slot of `nextArray`, the slot of `prevArray` its element came from.
 * Always a permutation of 0..n-1: unchanged slots keep their element, moved
 * values follow their nearest matching source, and anything left over is an
 * in-place write (overwrite algorithms like merge/insertion sort).
 *
 * @param {number[]} prevArray
 * @param {number[]} nextArray
 * @returns {number[]}
 */
export function matchPositions(prevArray, nextArray) {
  const n = nextArray.length;
  if (!prevArray || prevArray.length !== n) {
    return Array.from({ length: n }, (_, i) => i);
  }

  const fromIndex = Array(n).fill(-1);
  const usedSrc = Array(n).fill(false);
  const changed = [];

  for (let i = 0; i < n; i++) {
    if (prevArray[i] === nextArray[i]) {
      fromIndex[i] = i;
      usedSrc[i] = true;
    } else {
      changed.push(i);
    }
  }

  for (const matchValue of [true, false]) {
    for (const dest of changed) {
      if (fromIndex[dest] !== -1) continue;
      const src = nearestSource(
        prevArray,
        usedSrc,
        dest,
        nextArray[dest],
        matchValue
      );
      if (src !== -1) {
        fromIndex[dest] = src;
        usedSrc[src] = true;
      }
    }
  }

  return fromIndex;
}

/**
 * Attach stable per-element ids to array steps so renderers can animate the
 * same element moving between slots (React keys, Remotion interpolation).
 *
 * @template {{ array: number[] }} T
 * @param {T[]} steps
 * @returns {Array<T & { ids: number[] }>}
 */
export function withElementIds(steps) {
  let prevArray = null;
  let prevIds = null;

  return steps.map(step => {
    const fromIndex = matchPositions(prevArray, step.array);
    const ids =
      prevIds && prevIds.length === step.array.length
        ? fromIndex.map(src => prevIds[src])
        : step.array.map((_, i) => i);
    prevArray = step.array;
    prevIds = ids;
    return { ...step, ids };
  });
}
