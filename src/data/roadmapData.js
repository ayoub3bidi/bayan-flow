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
 * - highlights: Bullet points summarizing what was/will be accomplished
 * - videoUrl: (Optional) YouTube embed URL for release video
 * - articleUrl: (Optional) Link to the release DevLog article
 * - status: 'completed' | 'in-progress' | 'planned'
 */

export const roadmapData = [
  {
    id: 1,
    date: 'November 2025',
    title: 'Initial Release (0.1.0)',
    highlights: [
      'Core sorting algorithms: Bubble, Quick, Merge',
      'Pathfinding algorithms: BFS, Dijkstra, A*',
      'Manual stepping and autoplay modes',
    ],
    videoUrl: 'https://www.youtube.com/embed/WcE3O2x77lU',
    articleUrl:
      'https://dev.to/ayoub3bidi/i-built-an-app-that-makes-learning-algorithms-way-easier-nce',
    status: 'completed',
  },
  {
    id: 2,
    date: 'December 2025',
    title: 'UX, Accessibility & Localization (0.2.0)',
    highlights: [
      'Fullscreen mode',
      'Localization: English / Français / العربية (RTL)',
      'Experimental audio cues',
      'Minor visual and layout fixes to improve clarity and usability',
    ],
    videoUrl: 'https://www.youtube.com/embed/8t4vh3ovldo',
    articleUrl:
      'https://dev.to/ayoub3bidi/bayan-flow-020-finishing-the-foundations-i18n-rtl-tests-and-small-ux-wins-4lb7',
    status: 'completed',
  },
  {
    id: 3,
    date: 'March 2026',
    title: 'Algorithm Library Expansion (0.3.0)',
    highlights: [
      'Expanded the sorting catalog to 14 algorithms',
      'Pathfinding expanded to 9 algorithms',
      'Improved animation clarity and performance',
      'Introduced a full test suite',
    ],
    videoUrl: 'https://www.youtube.com/embed/hqxLovhkhrU',
    articleUrl:
      'https://dev.to/ayoub3bidi/bayan-flow-030-from-6-to-20-algorithms-df0',
    status: 'completed',
  },
  {
    id: 4,
    date: 'April 2026',
    title: 'Searching & Educational Tooling (0.4.0)',
    highlights: [
      'New Searching category with 8 algorithms across sorted-array and graph substrates',
      'Insight panel with algorithm history and complexity facts',
      'Interactive Python code panel with LeetCode-style test cases',
      'In-browser video export (horizontal and vertical) powered by Remotion',
    ],
    videoUrl: 'https://www.youtube.com/embed/uL3G3nvjGh4',
    articleUrl:
      'https://dev.to/ayoub3bidi/bayan-flow-040-from-algorithm-visualization-to-real-understanding-3oj3',
    status: 'completed',
  },
  {
    id: 5,
    date: 'Q3 2026',
    title: 'Tree Traversals & Graph Algorithms (0.5.0)',
    highlights: [
      'Tree Traversals: Inorder, Preorder, Postorder, Level-order, Morris Traversal, and Zigzag Level-order',
      "Graph Algorithms: Topological Sort, Kahn's Algorithm, Kruskal's and Prim's (MST), Tarjan's and Kosaraju's (SCC), and Floyd-Warshall",
      'User accounts with saved favorite algorithms',
      'Per-algorithm explanation videos embedded in the insight panel',
    ],
    videoUrl: '',
    articleUrl: '',
    status: 'completed',
  },
  {
    id: 6,
    date: 'Q4 2026',
    title: 'Dynamic Programming & String Algorithms (0.6.0)',
    highlights: [
      'Dynamic Programming: Fibonacci (memoization vs tabulation), 0/1 Knapsack, LCS, LIS, Edit Distance, and Coin Change',
      'Reusable table/matrix renderer for DP visualizations',
      'String Algorithms: KMP, Rabin-Karp, Boyer-Moore, Z Algorithm, and Aho-Corasick',
      'Character-array renderer for string visualizations',
    ],
    videoUrl: '',
    articleUrl: '',
    status: 'planned',
  },
  {
    id: 7,
    date: 'Q1 2027',
    title: 'Pro Plan (0.7.0)',
    highlights: [
      'Custom array and graph input (visualize your own data)',
      'Unlimited video export with watermark control',
      'Shareable step links (encode algorithm + step + input into a URL)',
      'Algorithm comparison mode (run two algorithms side-by-side)',
      'And more...',
    ],
    videoUrl: '',
    articleUrl: '',
    status: 'planned',
  },
];
