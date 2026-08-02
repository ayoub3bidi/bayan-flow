/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import Hero from '../components/landing/Hero';
import AlgorithmTypes from '../components/landing/AlgorithmTypes';
import Features from '../components/landing/Features';
import ProPreview from '../components/landing/ProPreview';
import ClaritySection from '../components/landing/ClaritySection';
import FAQ from '../components/landing/FAQ';
import RoadmapCTA from '../components/landing/RoadmapCTA';
import TechPattern from '../components/landing/TechPattern';
import Footer from '../components/Footer';
import Header from '../components/Header';
import ProWaitlistBanner from '../components/ProWaitlistBanner';

function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ProWaitlistBanner source="landing" />

      {/* Animated Tech Pattern */}
      <div className="relative">
        <TechPattern />
      </div>

      <Header />

      {/* Landing Sections */}
      <main className="relative z-10">
        <Hero />
        <AlgorithmTypes />
        <Features />
        <ProPreview />
        <ClaritySection />
        <FAQ />
        <RoadmapCTA />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
