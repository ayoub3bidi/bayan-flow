/**
 * Copyright (c) 2025 Ayoub Abidi
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
      'Shipping the first interactive visualizer: core sorting algorithms (Bubble, Quick, Merge) and pathfinding algorithms (BFS, Dijkstra, A*). Supports manual stepping and autoplay modes.',
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
    date: 'Q1 2026',
    title: 'Algorithm Library Expansion (0.3.0)',
    description:
      'Expand the algorithm set for sorting and pathfinding, improve animation clarity and performance, and add educational notes and tests to strengthen learning value.',
    videoUrl: '',
    status: 'in-progress',
  },
  {
    id: 4,
    date: 'Q2 2026',
    title: 'New Algorithm Families (0.4.0)',
    description:
      'Introduce new algorithm categories beyond sorting and pathfinding (e.g., graph operations, dynamic programming basics), refine existing implementations for better time/space complexity, and build a deeper Python integration layer to support algorithm execution, analysis, and educational examples.',
    videoUrl: '',
    status: 'planned',
  },
];
