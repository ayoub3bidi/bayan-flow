/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from '@phosphor-icons/react';
import { ALGORITHM_KNOWLEDGE } from '../constants/algorithmKnowledge';
import YouTubeFacade from './YouTubeFacade';
import AlgorithmNotesTab from './AlgorithmNotesTab';

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

function getIndexedItems(t, namespace, prefix, count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const key = `${namespace}.${prefix}_${i}`;
    const val = t(key, { defaultValue: '' });
    if (val) items.push(val);
  }
  return items;
}

function AlgorithmInsightPanel({
  isOpen,
  onClose,
  algorithmKey,
  algorithmName,
  categoryType,
  user,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [activeTab, setActiveTab] = useState('insight');
  const notesFlushRef = useRef(
    /** @type {null | (() => void | Promise<void>)} */ (null)
  );

  const meta = algorithmKey ? ALGORITHM_KNOWLEDGE[algorithmKey] : null;
  const i18nBase = `insight_panel.algorithms.${algorithmKey}`;

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

  const handleClose = useCallback(async () => {
    if (notesFlushRef.current) {
      await notesFlushRef.current();
    }
    setActiveTab('insight');
    onClose();
  }, [onClose]);

  const handleTabChange = async nextTab => {
    if (activeTab === 'notes' && nextTab !== 'notes' && notesFlushRef.current) {
      await notesFlushRef.current();
    }
    setActiveTab(nextTab);
  };

  const registerNotesFlush = useCallback(flushFn => {
    notesFlushRef.current = flushFn;
  }, []);

  const panelProps = {
    t,
    isRTL,
    onClose: handleClose,
    algorithmName,
    activeTab,
    onTabChange: handleTabChange,
    meta,
    history,
    intuition,
    realUses,
    facts,
    hasContent,
    categoryType,
    algorithmKey,
    user,
    registerNotesFlush,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="insight-backdrop"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => void handleClose()}
            aria-hidden="true"
          />

          <motion.div
            key="insight-panel-desktop"
            className={`
              hidden md:flex flex-col
              fixed top-14 bottom-0 ${isRTL ? 'left-0' : 'right-0'}
              w-full max-w-2xl
              bg-surface border-${isRTL ? 'r' : 'l'} border-panel-border
              shadow-2xl z-50 overflow-hidden overscroll-contain
            `}
            custom={isRTL}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label={
              algorithmName
                ? `${t('insight_panel.learnTitle')}: ${algorithmName}`
                : t('insight_panel.learnTitle')
            }
          >
            <PanelContent {...panelProps} isMobile={false} />
          </motion.div>

          <motion.div
            key="insight-panel-mobile"
            className="flex md:hidden flex-col fixed inset-0 bg-surface shadow-2xl z-50 overflow-hidden overscroll-contain"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label={
              algorithmName
                ? `${t('insight_panel.learnTitle')}: ${algorithmName}`
                : t('insight_panel.learnTitle')
            }
          >
            <PanelContent {...panelProps} isMobile />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PanelContent({
  t,
  isRTL,
  isMobile,
  onClose,
  algorithmName,
  activeTab,
  onTabChange,
  meta,
  history,
  intuition,
  realUses,
  facts,
  hasContent,
  categoryType,
  algorithmKey,
  user,
  registerNotesFlush,
}) {
  return (
    <>
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`shrink-0 px-4 ${isMobile ? 'pt-3 pb-2' : 'pt-2 pb-2'}`}
      >
        <div
          className={`flex items-center gap-2 ${
            isRTL ? 'flex-row-reverse' : ''
          }`}
        >
          <div
            className="flex-1 flex rounded-lg border-2 border-[var(--color-border-strong)] overflow-hidden bg-surface-elevated"
            role="tablist"
            aria-label={t('insight_panel.tabList')}
          >
            <TabButton
              id="insight-tab"
              isActive={activeTab === 'insight'}
              onClick={() => void onTabChange('insight')}
              label={t('insight_panel.learnTitle')}
            />
            <TabButton
              id="notes-tab"
              isActive={activeTab === 'notes'}
              onClick={() => void onTabChange('notes')}
              label={t('insight_panel.tabNotes')}
            />
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={() => void onClose()}
              className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-panel-hover transition-colors flex-shrink-0"
              aria-label={t('insight_panel.close')}
            >
              <X size={20} weight="bold" />
            </button>
          )}
        </div>
        {algorithmName && (
          <p
            className={`mt-2 text-sm font-semibold text-text-primary leading-tight truncate ${
              isRTL ? 'text-right' : 'text-left'
            }`}
          >
            {algorithmName}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4 min-h-0 flex flex-col">
        {activeTab === 'insight' ? (
          <InsightTabBody
            t={t}
            isRTL={isRTL}
            meta={meta}
            history={history}
            intuition={intuition}
            realUses={realUses}
            facts={facts}
            hasContent={hasContent}
          />
        ) : (
          <AlgorithmNotesTab
            user={user}
            categoryType={categoryType}
            algorithmKey={algorithmKey}
            algorithmName={algorithmName}
            isActive={activeTab === 'notes'}
            onRegisterFlush={registerNotesFlush}
          />
        )}
      </div>
    </>
  );
}

function TabButton({ id, isActive, onClick, label }) {
  return (
    <button
      type="button"
      id={id}
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`flex-1 px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all duration-200 touch-manipulation ${
        isActive
          ? 'bg-theme-primary-consistent text-white shadow-md'
          : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
      }`}
    >
      {label}
    </button>
  );
}

function InsightTabBody({
  t,
  isRTL,
  meta,
  history,
  intuition,
  realUses,
  facts,
  hasContent,
}) {
  return (
    <div className="space-y-5">
      {!hasContent ? (
        <p className="text-sm text-secondary text-center py-8">
          {t('insight_panel.noData')}
        </p>
      ) : (
        <>
          {meta && (
            <div
              dir={isRTL ? 'rtl' : 'ltr'}
              className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-x-6 gap-y-3 py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 items-start"
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

          {history && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-2">
                {t('insight_panel.history')}
              </h3>
              <p className="text-sm text-primary leading-relaxed">{history}</p>
            </section>
          )}

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

          {realUses.length > 0 && (
            <section
              dir={isRTL ? 'rtl' : 'ltr'}
              className={isRTL ? 'text-right' : ''}
            >
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-2">
                {t('insight_panel.realWorldUses')}
              </h3>
              <ul className="space-y-2 text-sm text-primary leading-relaxed list-none ps-0">
                {realUses.map((use, i) => (
                  <li
                    key={i}
                    className={`flex gap-2 items-start ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <span
                      className={`text-amber-500 flex-shrink-0 mt-0.5 ${isRTL ? 'ms-2' : 'me-2'}`}
                      aria-hidden="true"
                    >
                      ▸
                    </span>
                    <span className="flex-1 text-start">{use}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {facts.length > 0 && (
            <section
              dir={isRTL ? 'rtl' : 'ltr'}
              className={isRTL ? 'text-right' : ''}
            >
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-2">
                {t('insight_panel.facts')}
              </h3>
              <ul className="space-y-2 text-sm text-primary leading-relaxed list-none ps-0">
                {facts.map((fact, i) => (
                  <li
                    key={i}
                    className={`flex gap-2 items-start ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <span
                      className={`text-blue-400 flex-shrink-0 mt-0.5 ${isRTL ? 'ms-2' : 'me-2'}`}
                      aria-hidden="true"
                    >
                      ✦
                    </span>
                    <span className="flex-1 text-start">{fact}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {meta && (
        <section className="pt-2">
          {meta.youtubeVideoId ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/10">
              <YouTubeFacade
                videoId={meta.youtubeVideoId}
                title={t('insight_panel.relatedVideo', {
                  defaultValue: 'Related video',
                })}
                className="rounded-xl"
              />
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-panel-border bg-panel-hover text-secondary"
              aria-hidden="true"
            >
              <Play weight="bold" className="w-12 h-12 mb-2 opacity-60" />
              <span className="text-sm font-medium">
                {t('insight_panel.videoComingSoon')}
              </span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function MetaItem({ label, value, isRTL }) {
  return (
    <div
      className={`flex min-w-0 flex-col ${isRTL ? 'items-end text-end' : 'items-start text-start'}`}
    >
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-semibold text-primary break-words">
        {value}
      </span>
    </div>
  );
}

export default AlgorithmInsightPanel;
