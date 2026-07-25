/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import Section from '../ui/Section';
import Button from '../ui/Button';
import { marketingEnter } from '../../motion/chromeMotion';

function RoadmapCTA() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <Section className="relative overflow-hidden">
      {/* Gradient transition to footer background */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-(--color-glass-bg)/30 to-(--color-glass-bg) pointer-events-none" />

      <Container className="relative z-10">
        <motion.div
          {...marketingEnter(reduceMotion)}
          viewport={{ once: true, amount: 0.3 }}
          className="relative"
        >
          {/* Content */}
          <div className="relative px-8 py-12 md:px-12 md:py-16 text-center">
            <h2 className="landing-h2 text-text-primary mb-4">
              {t('landing.roadmapCTA.heading')}
            </h2>
            <p className="landing-body text-text-secondary max-w-2xl mx-auto mb-8">
              {t('landing.roadmapCTA.description')}
            </p>

            <Link to="/roadmap">
              <Button variant="cta">{t('landing.roadmapCTA.button')}</Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

export default RoadmapCTA;
