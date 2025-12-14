/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Container from '../ui/Container';

function RoadmapHero() {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 md:py-32 bg-bg overflow-hidden">
      {/* Radial gradient background - matching landing page */}
      <div className="absolute inset-0 radial-gradient-animated" />

      <Container className="relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title with gradient text effect */}
          <motion.h1
            className="landing-h1 text-text-primary mb-6"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.2 },
              y: { duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 },
              scale: { duration: 0.8, delay: 0.2 },
            }}
            style={{
              textShadow: '0 0 40px rgba(43, 127, 255, 0.3)',
            }}
          >
            {t('roadmap.hero.title')}
          </motion.h1>

          {/* Subtitle with stagger animation */}
          <motion.p
            className="landing-body text-text-secondary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              type: 'spring',
              stiffness: 100,
            }}
          >
            {t('roadmap.hero.subtitle')}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}

export default RoadmapHero;
