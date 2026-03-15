/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { ALGORITHM_KNOWLEDGE } from '../constants/algorithmKnowledge';

// ─── Animation variants (mirror PythonCodePanel style) ──────────────────────

const panelVariants = {
  hidden: isRTL => ({ x: isRTL ? '-100%' : '100%', opacity: 0 }),
  visible: { x: 0, opacity: 1 },
  exit: isRTL => ({ x: isRTL ? '-100%' : '100%', opacity: 0 }),
};

const mobileVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a list of string values from indexed i18n keys.
 * e.g. realWorldUses_0, realWorldUses_1, ... up to `count`.
 */
function getIndexedItems(t, namespace, prefix, count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const key = `${namespace}.${prefix}_${i}`;
    const val = t(key, { defaultValue: '' });
    if (val) items.push(val);
  }
  return items;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * @param {Object}   props
 * @param {boolean}  props.isOpen         - Whether the panel is shown
 * @param {Function} props.onClose        - Close handler
 * @param {string}   props.algorithmKey   - Key matching ALGORITHM_KNOWLEDGE & i18n
 * @param {string}   props.algorithmName  - Human-readable algorithm name (translated)
 */
function AlgorithmInsightPanel({
  isOpen,
  onClose,
  algorithmKey,
  algorithmName,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const meta = algorithmKey ? ALGORITHM_KNOWLEDGE[algorithmKey] : null;
  const i18nBase = `insight_panel.algorithms.${algorithmKey}`;

  // Translated text fields (fall back to empty string)
  const history = meta ? t(`${i18nBase}.history`, { defaultValue: '' }) : '';
  const intuition = meta
    ? t(`${i18nBase}.intuition`, { defaultValue: '' })
    : '';
  const realUses = meta
    ? getIndexedItems(t, i18nBase, 'realWorldUses', meta.realWorldUsesCount)
    : [];
  const facts = meta
    ? getIndexedItems(t, i18nBase, 'facts', meta.factsCount)
    : [];

  const hasContent =
    meta && (history || intuition || realUses.length > 0 || facts.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop (desktop + mobile) ──────────────────────────── */}
          <motion.div
            key="insight-backdrop"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Desktop panel ──────────────────────────────────────────── */}
          <motion.div
            key="insight-panel-desktop"
            className={`
              hidden md:flex flex-col
              fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full
              w-full max-w-2xl
              bg-surface border-${isRTL ? 'r' : 'l'} border-panel-border
              shadow-2xl z-50 overflow-hidden
            `}
            custom={isRTL}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label={t('insight_panel.title')}
          >
            <PanelContent
              t={t}
              isRTL={isRTL}
              algorithmName={algorithmName}
              meta={meta}
              history={history}
              intuition={intuition}
              realUses={realUses}
              facts={facts}
              hasContent={hasContent}
            />
          </motion.div>

          {/* ── Mobile bottom-sheet ────────────────────────────────────── */}
          <motion.div
            key="insight-panel-mobile"
            className={`
              flex md:hidden flex-col
              fixed bottom-0 left-0 right-0
              h-[80vh] rounded-t-2xl
              bg-surface border-t border-panel-border
              shadow-2xl z-50 overflow-hidden
            `}
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label={t('insight_panel.title')}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div
                className="w-10 h-1 rounded-full bg-panel-border"
                aria-hidden="true"
              />
            </div>
            <PanelContent
              t={t}
              isRTL={isRTL}
              algorithmName={algorithmName}
              meta={meta}
              history={history}
              intuition={intuition}
              realUses={realUses}
              facts={facts}
              hasContent={hasContent}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Panel inner content (shared between desktop / mobile) ───────────────────

function PanelContent({
  t,
  isRTL,
  algorithmName,
  meta,
  history,
  intuition,
  realUses,
  facts,
  hasContent,
}) {
  return (
    <>
      {/* Header */}
      <div
        className={`
        flex items-center px-5 py-4
        border-b border-panel-border flex-shrink-0
        ${isRTL ? 'flex-row-reverse' : ''}
      `}
      >
        <div
          className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Lightbulb
            className="w-5 h-5 text-amber-500 flex-shrink-0"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-base font-bold text-primary leading-tight">
              {t('insight_panel.title')}
            </h2>
            {algorithmName && (
              <p className="text-xs text-secondary leading-tight mt-0.5">
                {algorithmName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {!hasContent ? (
          <p className="text-sm text-secondary text-center py-8">
            {t('insight_panel.noData')}
          </p>
        ) : (
          <>
            {/* Meta banner: inventor + year */}
            {meta && (
              <div
                className={`
                flex flex-wrap gap-4 py-3 px-4 rounded-xl
                bg-amber-500/10 border border-amber-500/20
                ${isRTL ? 'flex-row-reverse' : ''}
              `}
              >
                <MetaItem
                  label={t('insight_panel.inventor')}
                  value={meta.inventor || t('insight_panel.unknown')}
                  isRTL={isRTL}
                />
                {meta.year && (
                  <MetaItem
                    label={t('insight_panel.year')}
                    value={String(meta.year)}
                    isRTL={isRTL}
                  />
                )}
              </div>
            )}

            {/* History */}
            {history && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-2">
                  {t('insight_panel.history')}
                </h3>
                <p className="text-sm text-primary leading-relaxed">
                  {history}
                </p>
              </section>
            )}

            {/* Core Idea / Intuition */}
            {intuition && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-2">
                  {t('insight_panel.intuition')}
                </h3>
                <p className="text-sm text-primary leading-relaxed">
                  {intuition}
                </p>
              </section>
            )}

            {/* Real-world Uses */}
            {realUses.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-2">
                  {t('insight_panel.realWorldUses')}
                </h3>
                <ul
                  className={`space-y-2 text-sm text-primary leading-relaxed ${
                    isRTL ? 'list-none' : 'list-none'
                  }`}
                >
                  {realUses.map((use, i) => (
                    <li
                      key={i}
                      className={`flex gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <span
                        className="text-amber-500 flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        ▸
                      </span>
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Facts */}
            {facts.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-2">
                  {t('insight_panel.facts')}
                </h3>
                <ul className="space-y-2 text-sm text-primary leading-relaxed">
                  {facts.map((fact, i) => (
                    <li
                      key={i}
                      className={`flex gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <span
                        className="text-blue-400 flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        ✦
                      </span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}

function MetaItem({ label, value, isRTL }) {
  return (
    <div className={`flex flex-col ${isRTL ? 'items-end' : ''}`}>
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-semibold text-primary">{value}</span>
    </div>
  );
}

export default AlgorithmInsightPanel;
