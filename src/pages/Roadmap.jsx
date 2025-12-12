/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RoadmapHero from '../components/roadmap/RoadmapHero';
import Timeline from '../components/roadmap/Timeline';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Roadmap() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-x-hidden">
      {/* Theme Toggle & Language Switcher */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher excludeLanguages={['ar']} />
        <ThemeToggle />
      </div>

      {/* Back to Home Link */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-surface hover:bg-surface-elevated text-text-primary rounded-lg transition-colors border border-border text-sm"
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-medium hidden xs:inline">
            Back to Home
          </span>
          <span className="text-xs sm:text-sm font-medium xs:hidden">Back</span>
        </Link>
      </div>

      {/* Roadmap Content */}
      <div className="flex-1">
        <RoadmapHero />
        <Timeline />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Roadmap;
