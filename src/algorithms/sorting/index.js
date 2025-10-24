/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { bubbleSort, bubbleSortPure } from './bubbleSort';
import { quickSort, quickSortPure } from './quickSort';
import { mergeSort, mergeSortPure } from './mergeSort';

export const sortingAlgorithms = {
  bubbleSort,
  quickSort,
  mergeSort,
};

export const pureSortingAlgorithms = {
  bubbleSort: bubbleSortPure,
  quickSort: quickSortPure,
  mergeSort: mergeSortPure,
};

export { bubbleSort, quickSort, mergeSort };
export { bubbleSortPure, quickSortPure, mergeSortPure };
