/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Container from '../ui/Container';
import Section from '../ui/Section';
import { ALGORITHM_TYPE_LIST } from '../../constants';
import { CATEGORY_CONFIG } from '../../registry/categoryConfig';
import { getAlgorithmTypesGridColsClass } from './algorithmTypesGridCols.js';

const ALGORITHM_TYPE_GRADIENTS = {
  sorting: 'from-blue-500 via-cyan-500 to-blue-600',
  pathfinding: 'from-purple-500 via-pink-500 to-purple-600',
  searching: 'from-emerald-500 via-teal-500 to-emerald-600',
  treeTraversal: 'from-orange-500 via-amber-500 to-orange-600',
};

function AlgorithmTypes() {
  const { t } = useTranslation();

  const getAlgorithmList = cfg => {
    return cfg.algorithmKeys
      .map(algoKey => t(`${cfg.i18nPrefix}.${algoKey}`))
      .join(', ');
  };

  const getCardSpanClass = (index, count) => {
    return count === 4 && index === count - 1 ? 'lg:col-span-3' : '';
  };

  const modes = ALGORITHM_TYPE_LIST.map(type => {
    const cfg = CATEGORY_CONFIG[type];
    if (!cfg) return null;

    const Icon = cfg.icon;
    return {
      type,
      icon: Icon,
      title: t(`landing.algorithmTypes.${type}.title`, {
        defaultValue: t(`modes.${type}`),
      }),
      description: t(`landing.algorithmTypes.${type}.description`),
      algorithms: getAlgorithmList(cfg),
      gradient:
        ALGORITHM_TYPE_GRADIENTS[type] ??
        'from-slate-500 via-slate-600 to-slate-700',
    };
  }).filter(Boolean);

  return (
    <Section className="relative overflow-hidden">
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="landing-h2 text-text-primary mb-4">
            {t('landing.algorithmTypes.heading')}
          </h2>
          <p className="landing-body text-text-secondary max-w-2xl mx-auto">
            {t('landing.algorithmTypes.subheading')}
          </p>
        </motion.div>

        <div
          className={`grid gap-8 items-stretch ${getAlgorithmTypesGridColsClass(modes.length)}`}
        >
          {modes.map((mode, index) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{
                scale: 1.02,
                transition: { type: 'spring', stiffness: 300 },
              }}
              className={`group relative h-full min-h-0 self-stretch ${getCardSpanClass(index, modes.length)}`}
              style={{ perspective: '1000px' }}
            >
              {/* Glass morphism card — parent must fill grid row so inner 1fr + footer align across columns */}
              <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-(--color-glass-bg) p-8 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:border-white/5">
                {/* Gradient glow on hover */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${mode.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Animated border glow */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-linear-to-br ${mode.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`}
                />

                <div className="relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_14rem]">
                  {/* Row 1: absorbs extra row height so divider lines up when descriptions differ */}
                  <div className="flex min-h-0 flex-col">
                    <motion.div
                      className={`mb-6 inline-flex self-start rounded-2xl bg-linear-to-br ${mode.gradient} p-4 shadow-lg`}
                      whileHover={{
                        rotate: [0, -10, 10, -5, 5, 0],
                        scale: 1.1,
                        transition: { duration: 0.5 },
                      }}
                    >
                      <mode.icon className="h-8 w-8 text-white" />
                    </motion.div>

                    <h3 className="mb-3 text-2xl font-bold text-text-primary">
                      {mode.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-text-secondary">
                      {mode.description}
                    </p>
                  </div>

                  {/* Row 2: fixed 11rem (= h-44); border-t aligns across all cards in the row */}
                  <div className="flex min-h-0 flex-col border-t border-white/10 pt-4 dark:border-white/5">
                    <p className="mb-3 shrink-0 text-sm font-semibold text-text-secondary">
                      {t('landing.algorithmTypes.available')}
                    </p>
                    <div className="min-h-0 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                      <p className="text-sm leading-relaxed text-text-primary">
                        {mode.algorithms}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default AlgorithmTypes;
