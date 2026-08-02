/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, X } from '@phosphor-icons/react';
import Container from '../ui/Container';
import Section from '../ui/Section';
import Button from '../ui/Button';
import { marketingEnter } from '../../motion/chromeMotion';
import { WAITLIST_SOURCES } from '@/constants/waitlist';
import { readStoredWaitlistEmail } from '@/services/waitlistService';

// Feature rows in the Free vs Pro comparison table.
// `free` / `pro` per row: `true` → green check, `false` → red x,
// a string → i18n key for a text value (`landing.proPreview.table.<key>`).
// The shared (check/check) rows mirror the Features-section cards above.
// The video export row uses text cells (not icons): Free is unlimited with a
// watermark, Pro is watermark-free. No daily export count is advertised.
const TABLE_ROWS = [
  { key: 'allAlgorithms', free: true, pro: true },
  { key: 'customization', free: true, pro: true },
  { key: 'pythonCode', free: true, pro: true },
  { key: 'sound', free: true, pro: true },
  { key: 'fullscreen', free: true, pro: true },
  { key: 'insight', free: true, pro: true },
  { key: 'pseudocode', free: true, pro: true },
  { key: 'notes', free: true, pro: true },
  { key: 'videoExport', free: 'videoExportFree', pro: 'videoExportPro' },
  { key: 'customInput', free: false, pro: true },
  { key: 'comparison', free: false, pro: true },
  { key: 'presentation', free: false, pro: true },
];

function ProPreview() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [joined] = useState(() => !!readStoredWaitlistEmail());

  const renderCell = (value, isPro) => {
    if (value === true) {
      return (
        <span className="inline-flex items-center justify-center">
          <Check
            size={20}
            weight="bold"
            aria-label={t('landing.proPreview.table.included')}
            className="text-emerald-500 dark:text-emerald-400"
          />
        </span>
      );
    }
    if (value === false) {
      return (
        <span className="inline-flex items-center justify-center">
          <X
            size={20}
            weight="bold"
            aria-label={t('landing.proPreview.table.notIncluded')}
            className="text-red-500 dark:text-red-400"
          />
        </span>
      );
    }
    return (
      <span
        className={`text-xs sm:text-sm ${
          isPro ? 'font-medium text-text-primary' : 'text-text-secondary'
        }`}
      >
        {t(`landing.proPreview.table.${value}`)}
      </span>
    );
  };

  return (
    <Section className="relative overflow-hidden" id="pro-preview">
      {/* Subtle transition glow */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-(--color-glass-bg)/40 to-(--color-glass-bg) pointer-events-none" />

      <Container className="relative z-10">
        <motion.div
          {...marketingEnter(reduceMotion)}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 bg-linear-to-r from-accent/20 to-accent/10 text-accent text-xs font-semibold rounded-full border border-accent/30 mb-5">
            {joined
              ? t('landing.proPreview.badgeJoined')
              : t('landing.proPreview.badge')}
          </span>
          <h2 className="landing-h2 text-text-primary mb-4">
            {t('landing.proPreview.heading')}
          </h2>
          <p className="landing-body text-text-secondary max-w-2xl mx-auto">
            {t('landing.proPreview.subheading')}
          </p>
        </motion.div>

        <motion.div
          {...marketingEnter(reduceMotion, 0.05)}
          viewport={{ once: true, amount: 0.3 }}
          className="relative bg-(--color-glass-bg) backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 dark:border-white/5 overflow-hidden max-w-4xl mx-auto"
        >
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/10 dark:border-white/5">
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-4 text-start text-xs font-semibold uppercase tracking-wide text-text-secondary"
                >
                  {t('landing.proPreview.table.feature')}
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-4 text-center text-xs font-semibold uppercase text-text-secondary"
                >
                  {t('landing.proPreview.table.freeLabel')}
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-4 text-center text-xs font-semibold uppercase text-accent"
                >
                  {t('landing.proPreview.table.proLabel')}
                </th>
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map(row => (
                <tr
                  key={row.key}
                  className="border-b border-white/10 dark:border-white/5 last:border-b-0"
                >
                  <td className="px-4 sm:px-6 py-4 align-middle text-text-primary">
                    {t(`landing.proPreview.table.${row.key}`)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center align-middle">
                    {renderCell(row.free, false)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center align-middle">
                    {renderCell(row.pro, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          {...marketingEnter(reduceMotion, 0.15)}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mt-10"
        >
          <Link to={`/pro?source=${WAITLIST_SOURCES.LANDING}`}>
            <Button variant="cta">
              {joined
                ? t('landing.proPreview.ctaJoined')
                : t('landing.proPreview.cta')}
            </Button>
          </Link>
        </motion.div>
      </Container>
    </Section>
  );
}

export default ProPreview;
