/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Roadmap Data
 *
 * Each checkpoint represents a release/phase in the project journey.
 *
 * Fields:
 * - id: Unique identifier
 * - date: Release date or expected date
 * - title: Checkpoint title
 * - description: Brief description of what was/will be accomplished
 * - videoUrl: (Optional) YouTube embed URL for release video
 * - status: 'completed' | 'in-progress' | 'planned'
 */

export const roadmapData = [
  {
    id: 1,
    date: 'November 2025',
    title: 'Initial Release (0.1.0)',
    description:
      'Shipped the first interactive visualizer: core sorting algorithms (Bubble, Quick, Merge) and pathfinding algorithms (BFS, Dijkstra, A*). Supports manual stepping and autoplay modes.',
    videoUrl: 'https://www.youtube.com/embed/WcE3O2x77lU',
    status: 'completed',
  },
  {
    id: 2,
    date: 'December 2025',
    title: 'UX, Accessibility & Localization (0.2.0)',
    description:
      'Added fullscreen mode, localization (English / Français / العربية), and experimental audio cues. Applied minor visual and layout fixes to improve clarity and usability.',
    videoUrl: 'https://www.youtube.com/embed/8t4vh3ovldo',
    status: 'completed',
  },
  {
    id: 3,
    date: 'March 2026',
    title: 'Algorithm Library Expansion (0.3.0)',
    description:
      'Expanded the sorting catalog to 14 algorithms and pathfinding to 9, improved animation clarity and performance, and introduced a full test suite.',
    videoUrl: 'https://www.youtube.com/embed/hqxLovhkhrU',
    status: 'completed',
  },
  {
    id: 4,
    date: 'April 2026',
    title: 'Searching & Educational Tooling (0.4.0)',
    description:
      'Introduced a Searching category with 8 algorithms across sorted-array and graph substrates (Linear Search, Binary Search, Jump Search, Interpolation, Exponential, Fibonacci, Ternary Search, and DFS). Added an insight panel with algorithm history and complexity facts, an interactive Python code panel with LeetCode-style test cases, and in-browser video export (horizontal and vertical) powered by Remotion.',
    videoUrl: 'https://www.youtube.com/embed/uL3G3nvjGh4',
    status: 'completed',
  },
  {
    id: 5,
    date: 'Q3 2026',
    title: 'Tree Traversals & Graph Algorithms (0.5.0)',
    description:
      "Expand into two new algorithm families built on dedicated renderers. Tree Traversals: Inorder, Preorder, Postorder, Level-order, Morris Traversal, and Zigzag Level-order. Graph Algorithms: Topological Sort, Kahn's Algorithm, Kruskal's and Prim's (MST), Tarjan's and Kosaraju's (SCC), and Floyd-Warshall. Also introduces user accounts with saved favorite algorithms and per-algorithm explanation videos embedded in the insight panel.",
    videoUrl: '',
    status: 'completed',
  },
  {
    id: 6,
    date: 'Q4 2026',
    title: 'Dynamic Programming & String Algorithms (0.6.0)',
    description:
      'Two high-demand categories for CS students and interview prep. Dynamic Programming: Fibonacci (memoization vs tabulation), 0/1 Knapsack, LCS, LIS, Edit Distance, and Coin Change — visualized on a reusable table/matrix renderer. String Algorithms: KMP, Rabin-Karp, Boyer-Moore, Z Algorithm, and Aho-Corasick — visualized on a character-array renderer.',
    videoUrl: '',
    status: 'planned',
  },
  {
    id: 7,
    date: 'Q1 2027',
    title: 'Pro Tier & Power Features (0.7.0)',
    description:
      'Launch the Pro plan. Pro features include custom array and graph input (visualize your own data), unlimited video export with watermark control, shareable step links (encode algorithm + step + input into a URL), and algorithm comparison mode (run two algorithms side-by-side on the same input). Free users retain full access to all algorithm visualizations.',
    videoUrl: '',
    status: 'planned',
  },
];
