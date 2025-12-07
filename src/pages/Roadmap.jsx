/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RoadmapHero from '../components/roadmap/RoadmapHero';
import Timeline from '../components/roadmap/Timeline';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';

// Sample timeline data - replace with actual roadmap content
const timelineItems = [
  {
    date: 'December 2025',
    title: 'Initial Release',
    description: 'Launched Bayan Flow with sorting algorithms (Bubble, Quick, Merge) and pathfinding algorithms (BFS, Dijkstra, A*). Features include manual and autoplay modes, dark mode, and multi-language support.',
  },
  {
    date: 'Q1 2026',
    title: 'Enhanced Visualizations',
    description: 'Adding more algorithms including Insertion Sort, Selection Sort, and DFS. Improved mobile experience with better touch gestures and responsive design.',
  },
  {
    date: 'Q2 2026',
    title: 'Interactive Learning',
    description: 'Introduction of step-by-step tutorials, code explanations, and algorithm comparisons. Users can now compare performance across different algorithms side-by-side.',
  },
];

function Roadmap() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Theme Toggle & Language Switcher */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <LanguageSwitcher excludeLanguages={['ar']} />
        <ThemeToggle />
      </div>

      {/* Back to Home Link */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-elevated text-text-primary rounded-lg transition-colors border border-border"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Roadmap Content */}
      <div className="flex-1">
        <RoadmapHero />
        <Timeline items={timelineItems} />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Roadmap;
