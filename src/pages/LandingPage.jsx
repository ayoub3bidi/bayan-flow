/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import Hero from '../components/landing/Hero';
import LearnYourWay from '../components/landing/LearnYourWay';
import AlgorithmTypes from '../components/landing/AlgorithmTypes';
import Features from '../components/landing/Features';
import ClaritySection from '../components/landing/ClaritySection';
import RoadmapCTA from '../components/landing/RoadmapCTA';
import TechPattern from '../components/landing/TechPattern';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';

function LandingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Unified smooth gradient background */}
      <div className="fixed inset-0 bg-linear-to-b from-bg via-bg to-surface-elevated pointer-events-none" />

      {/* Animated Tech Pattern */}
      <div className="relative">
        <TechPattern />
      </div>

      {/* Theme Toggle & Language Switcher */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <LanguageSwitcher excludeLanguages={['ar']} />
        <ThemeToggle />
      </div>

      {/* Landing Sections */}
      <div className="relative z-10">
        <Hero />
        <LearnYourWay />
        <AlgorithmTypes />
        <Features />
        <ClaritySection />
        <RoadmapCTA />
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage;
