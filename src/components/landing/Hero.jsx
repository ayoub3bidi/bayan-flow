/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Container from '../ui/Container';

function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Content */}
      <Container className="relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
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
            {t('landing.hero.title')}
          </motion.h1>

          <motion.p
            className="landing-body text-text-secondary max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.4,
              type: 'spring',
              stiffness: 100
            }}
          >
            {t('landing.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.6,
              type: 'spring',
              stiffness: 100
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button to="/app" variant="primary">
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
