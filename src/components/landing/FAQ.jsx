/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus } from '@phosphor-icons/react';
import Container from '../ui/Container';
import Section from '../ui/Section';
import {
  marketingEnter,
  getChromeTransition,
  CHROME_DURATION_MARKETING,
} from '../../motion/chromeMotion';

const FAQ_ITEMS = ['difference', 'beginner', 'learn', 'try'];

function FAQ() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = index => setOpenIndex(prev => (prev === index ? null : index));

  return (
    <Section className="relative overflow-hidden" id="faq">
      <div className="absolute inset-0 bg-linear-to-b from-(--color-glass-bg) via-(--color-glass-bg)/40 to-(--color-glass-bg) pointer-events-none" />

      <Container className="relative z-10">
        <motion.div
          {...marketingEnter(reduceMotion)}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="landing-h2 text-text-primary mb-4">
            {t('landing.faq.heading')}
          </h2>
          <p className="landing-body text-text-secondary max-w-2xl mx-auto">
            {t('landing.faq.subheading')}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {FAQ_ITEMS.map((key, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={key}
                {...marketingEnter(reduceMotion, index * 0.05)}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div
                  className={`rounded-2xl bg-(--color-glass-bg) backdrop-blur-xl border transition-colors duration-300 overflow-hidden ${
                    isOpen
                      ? 'border-accent/40'
                      : 'border-white/10 dark:border-white/5'
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggle(index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${key}`}
                      className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left rtl:text-right min-h-touch focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-2xl"
                    >
                      <span className="text-base font-semibold text-text-primary">
                        {t(`landing.faq.items.${key}.question`)}
                      </span>
                      {/* Plus → X on open; symmetric, RTL-safe, no flip needed. */}
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={getChromeTransition(
                          reduceMotion,
                          CHROME_DURATION_MARKETING
                        )}
                        className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent"
                        aria-hidden
                      >
                        <Plus size={16} weight="bold" />
                      </motion.span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${key}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={getChromeTransition(
                          reduceMotion,
                          CHROME_DURATION_MARKETING
                        )}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-5">
                          <p className="text-sm leading-relaxed text-text-secondary">
                            {t(`landing.faq.items.${key}.answer`)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export default FAQ;
