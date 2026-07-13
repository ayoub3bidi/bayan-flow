/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoadmapHero from '../components/roadmap/RoadmapHero';
import Timeline from '../components/roadmap/Timeline';
import Footer from '../components/Footer';
import Header from '../components/Header';

function Roadmap() {
  const { t } = useTranslation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-x-hidden">
      <Header />

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
