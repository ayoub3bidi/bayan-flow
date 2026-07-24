/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Container from '../ui/Container';
import {
  marketingEnter,
  HOVER_SPRING,
  getChromeTransition,
} from '../../motion/chromeMotion';

function Hero() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Content */}
      <Container className="relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={getChromeTransition(reduceMotion, 0.4)}
        >
          <motion.h1
            className="landing-h1 text-text-primary mb-6"
            {...marketingEnter(reduceMotion, 0.2)}
            style={{
              textShadow: '0 0 40px rgba(43, 127, 255, 0.3)',
            }}
          >
            {t('landing.hero.title')}
          </motion.h1>

          <motion.p
            className="landing-body text-text-secondary max-w-auto mx-auto mb-10"
            {...marketingEnter(reduceMotion, 0.4)}
          >
            {t('landing.hero.subtitle')}
          </motion.p>

          <motion.div {...marketingEnter(reduceMotion, 0.6)}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={HOVER_SPRING}
            >
              <Button to="/app" variant="cta">
                {t('landing.hero.cta')}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

export default Hero;
