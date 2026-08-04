/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Container from '../ui/Container';
import HeroVisualizerDemo from './HeroVisualizerDemo';
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
      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
          <motion.div
            className="lg:w-[40%] text-center lg:text-start"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={getChromeTransition(reduceMotion, 0.4)}
          >
            <motion.h1
              className="landing-h1 text-text-primary mb-6"
              {...marketingEnter(reduceMotion, 0.2)}
            >
              {t('landing.hero.title')}
            </motion.h1>

            <motion.p
              className="landing-body text-text-secondary max-w-xl mx-auto lg:mx-0 mb-8"
              {...marketingEnter(reduceMotion, 0.4)}
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            <motion.div
              className="flex flex-col items-center lg:items-start gap-3 mb-8 lg:mb-0"
              {...marketingEnter(reduceMotion, 0.6)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={HOVER_SPRING}
              >
                <Button to="/app" variant="cta">
                  {t('landing.hero.cta')}
                </Button>
              </motion.div>
              <p className="text-sm text-text-secondary max-w-md">
                {t('landing.hero.outcome')}
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:w-[60%] w-full"
            {...marketingEnter(reduceMotion, 0.5)}
          >
            <HeroVisualizerDemo />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
