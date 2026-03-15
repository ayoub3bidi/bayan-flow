/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Registry of algorithms that have insight data.
 * The actual translated content lives in the i18n locale files under
 * insight_panel.algorithms.<key>.{history, intuition, realWorldUses_N, facts_N}
 *
 * Each entry here provides language-agnostic metadata (inventor, year) that is
 * displayed alongside the translated content.
 */
export const ALGORITHM_KNOWLEDGE = {
  // ── Sorting ────────────────────────────────────────────────────────────────
  bubbleSort: {
    inventor: 'Unknown / Edward Harry Friend',
    year: 1956,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  quickSort: {
    inventor: 'Tony Hoare',
    year: 1959,
    realWorldUsesCount: 4,
    factsCount: 4,
  },
  mergeSort: {
    inventor: 'John von Neumann',
    year: 1945,
    realWorldUsesCount: 4,
    factsCount: 4,
  },
  insertionSort: {
    inventor: 'Unknown (ancient technique)',
    year: null,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  selectionSort: {
    inventor: 'Unknown',
    year: null,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  heapSort: {
    inventor: 'J. W. J. Williams',
    year: 1964,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  shellSort: {
    inventor: 'Donald Shell',
    year: 1959,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  radixSort: {
    inventor: 'Herman Hollerith',
    year: 1887,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  countingSort: {
    inventor: 'Harold H. Seward',
    year: 1954,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  bucketSort: {
    inventor: 'Unknown',
    year: null,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  cycleSort: {
    inventor: 'Brendan Kehoe',
    year: 1990,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  combSort: {
    inventor: 'Włodzimierz Dobosiewicz',
    year: 1980,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  timSort: {
    inventor: 'Tim Peters',
    year: 2002,
    realWorldUsesCount: 4,
    factsCount: 4,
  },
  bogoSort: {
    inventor: 'Unknown (folklore)',
    year: null,
    realWorldUsesCount: 2,
    factsCount: 3,
  },

  // ── Pathfinding ────────────────────────────────────────────────────────────
  bfs: {
    inventor: 'Konrad Zuse',
    year: 1945,
    realWorldUsesCount: 4,
    factsCount: 4,
  },
  dijkstra: {
    inventor: 'Edsger W. Dijkstra',
    year: 1956,
    realWorldUsesCount: 4,
    factsCount: 4,
  },
  aStar: {
    inventor: 'Peter Hart, Nils Nilsson & Bertram Raphael',
    year: 1968,
    realWorldUsesCount: 4,
    factsCount: 4,
  },
  bidirectionalSearch: {
    inventor: 'Pohl (attributed)',
    year: 1969,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  greedyBestFirstSearch: {
    inventor: 'Unknown',
    year: null,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  jumpPointSearch: {
    inventor: 'Daniel Harabor & Alban Grastien',
    year: 2011,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  bellmanFord: {
    inventor: 'Richard Bellman & Lester Ford Jr.',
    year: 1958,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  idaStar: {
    inventor: 'Richard Korf',
    year: 1985,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
  dStarLite: {
    inventor: 'Sven Koenig & Maxim Likhachev',
    year: 2002,
    realWorldUsesCount: 3,
    factsCount: 3,
  },
};
