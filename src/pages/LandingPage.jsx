/**
 * Copyright (c) 2025 Bayan Flow
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
import Header from '../components/Header';
import ProWaitlistBanner from '../components/ProWaitlistBanner';

function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ProWaitlistBanner source="landing" />
      {/* Unified smooth gradient background */}
      <div className="fixed inset-0 bg-linear-to-b from-bg via-bg to-surface-elevated pointer-events-none" />

      {/* Animated Tech Pattern */}
      <div className="relative">
        <TechPattern />
      </div>

      <Header />

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
