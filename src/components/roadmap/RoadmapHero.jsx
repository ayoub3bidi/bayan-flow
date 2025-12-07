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
      <Container>
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="landing-h1 text-text-primary mb-6">
            {t('roadmap.hero.title')}
          </h1>
          <p className="landing-body text-text-secondary">
            {t('roadmap.hero.subtitle')}
          </p>
        </motion.div>
      </Container>
    </section>
  );
}

export default RoadmapHero;
