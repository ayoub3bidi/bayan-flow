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
 * Each entry here provides language-agnostic metadata (inventor, year,
 * optional youtubeVideoId) that is displayed alongside the translated content.
 * Set youtubeVideoId to a YouTube video ID (e.g. "dQw4w9WgXcQ") to embed a
 * video; leave null to show a placeholder.
 */
export const ALGORITHM_KNOWLEDGE = {
  // ── Sorting ────────────────────────────────────────────────────────────────
  bubbleSort: {
    inventor: 'Unknown / Edward Harry Friend',
    year: 1956,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  quickSort: {
    inventor: 'Tony Hoare',
    year: 1959,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
  mergeSort: {
    inventor: 'John von Neumann',
    year: 1945,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
  insertionSort: {
    inventor: 'Unknown (ancient technique)',
    year: null,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  selectionSort: {
    inventor: 'Unknown',
    year: null,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  heapSort: {
    inventor: 'J. W. J. Williams',
    year: 1964,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  shellSort: {
    inventor: 'Donald Shell',
    year: 1959,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  radixSort: {
    inventor: 'Herman Hollerith',
    year: 1887,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  countingSort: {
    inventor: 'Harold H. Seward',
    year: 1954,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  bucketSort: {
    inventor: 'Unknown',
    year: null,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  cycleSort: {
    inventor: 'Brendan Kehoe',
    year: 1990,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  combSort: {
    inventor: 'Włodzimierz Dobosiewicz',
    year: 1980,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  timSort: {
    inventor: 'Tim Peters',
    year: 2002,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
  bogoSort: {
    inventor: 'Unknown (folklore)',
    year: null,
    realWorldUsesCount: 2,
    factsCount: 3,
    youtubeVideoId: null,
  },

  // ── Pathfinding ────────────────────────────────────────────────────────────
  bfs: {
    inventor: 'Konrad Zuse',
    year: 1945,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
  dijkstra: {
    inventor: 'Edsger W. Dijkstra',
    year: 1956,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
  aStar: {
    inventor: 'Peter Hart, Nils Nilsson & Bertram Raphael',
    year: 1968,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
  bidirectionalSearch: {
    inventor: 'Pohl (attributed)',
    year: 1969,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  greedyBestFirstSearch: {
    inventor: 'Unknown',
    year: null,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  jumpPointSearch: {
    inventor: 'Daniel Harabor & Alban Grastien',
    year: 2011,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  bellmanFord: {
    inventor: 'Richard Bellman & Lester Ford Jr.',
    year: 1958,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  idaStar: {
    inventor: 'Richard Korf',
    year: 1985,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },
  dStarLite: {
    inventor: 'Sven Koenig & Maxim Likhachev',
    year: 2002,
    realWorldUsesCount: 3,
    factsCount: 3,
    youtubeVideoId: null,
  },

  // ── Searching ─────────────────────────────────────────────────────────────
  binarySearch: {
    inventor: 'John Mauchly (1946); divide-by-half search on sorted data',
    year: 1946,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
  jumpSearch: {
    inventor: 'Classic block search on sorted arrays (teaching √n vs log n)',
    year: 1970,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
  interpolationSearch: {
    inventor:
      'W. W. Peterson (1957); refined by many texts on sorted-table search',
    year: 1957,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
  exponentialSearch: {
    inventor:
      'Doubling search on sorted data; standard in CS texts on unbounded search',
    year: 1970,
    realWorldUsesCount: 4,
    factsCount: 4,
    youtubeVideoId: null,
  },
};
