/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { Play, Hand } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Container from '../ui/Container';
import Section from '../ui/Section';

function LearnYourWay() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Play,
      title: t('landing.learnYourWay.autoPlay.title'),
      description: t('landing.learnYourWay.autoPlay.description'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Hand,
      title: t('landing.learnYourWay.manual.title'),
      description: t('landing.learnYourWay.manual.description'),
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

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
            {t('landing.learnYourWay.heading')}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Glass morphism card */}
              <div className="relative bg-[var(--color-glass-bg)] backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10 dark:border-white/5 overflow-hidden">
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Animated border glow */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />

                <div className="relative flex items-start gap-4">
                  {/* Icon with gradient */}
                  <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-primary mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-xl text-text-secondary italic"
        >
          {t('landing.learnYourWay.tagline')}
        </motion.p>
      </Container>
    </Section>
  );
}

export default LearnYourWay;
