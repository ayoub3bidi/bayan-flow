/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ComplexityPanel from './ComplexityPanel';

function GraphAlgorithmMatrixVisualizer({
  matrix = null,
  graphArtifacts = {},
  description,
  isComplete,
  algorithm,
  complexityDataset = 'graphAlgorithm',
}) {
  const { t } = useTranslation();
  const [showComplexityPanel, setShowComplexityPanel] = useState(false);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShowComplexityPanel(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setShowComplexityPanel(false);
  }, [isComplete]);

  if (showComplexityPanel) {
    return (
      <ComplexityPanel
        algorithm={algorithm}
        complexityDataset={complexityDataset}
      />
    );
  }

  const rowLabels = matrix?.rowLabels ?? [];
  const columnLabels = matrix?.columnLabels ?? rowLabels;
  const cells = matrix?.cells ?? [];
  const cellStates = matrix?.cellStates ?? [];
  const badgeItems = Array.isArray(graphArtifacts.badges)
    ? graphArtifacts.badges
    : [];

  return (
    <div className="w-full h-full rounded-xl shadow-2xl overflow-hidden relative bg-surface flex flex-col px-3 pb-24 pt-4 sm:px-5 sm:pb-28 sm:pt-6">
      <div className="mb-3 flex min-h-14 shrink-0 flex-wrap content-start justify-center gap-2 sm:mb-4 sm:min-h-16">
        {badgeItems.length > 0 &&
          badgeItems.map(badge => (
            <span
              key={badge.id}
              className="inline-flex items-center rounded-full border border-gray-300 bg-surface-elevated px-3 py-1 text-xs font-mono font-semibold text-text-primary shadow-sm"
            >
              {badge.text}
            </span>
          ))}
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col items-center justify-start pt-2 sm:pt-4">
          <div className="mb-3 text-center text-sm font-semibold text-text-secondary sm:text-base">
            {t('visualization.graphMatrix')}
          </div>
          <div className="w-full overflow-auto rounded-xl border border-[var(--color-border-strong)] bg-surface-elevated p-2 sm:p-4">
            <table className="mx-auto border-separate border-spacing-3 text-center sm:border-spacing-4">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-xs font-semibold text-text-secondary sm:text-sm">
                    {t('visualization.matrixCorner')}
                  </th>
                  {columnLabels.map(label => (
                    <th
                      key={`col-${label}`}
                      className="px-2 py-1 text-xs font-semibold text-text-primary sm:text-sm"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cells.map((row, rowIndex) => (
                  <tr key={`row-${rowLabels[rowIndex] ?? rowIndex}`}>
                    <th className="px-2 py-1 text-xs font-semibold text-text-primary sm:text-sm">
                      {rowLabels[rowIndex] ?? rowIndex}
                    </th>
                    {row.map((value, columnIndex) => {
                      const state = cellStates[rowIndex]?.[columnIndex] ?? 'default';
                      return (
                        <td
                          key={`${rowIndex}-${columnIndex}`}
                          className={`min-w-16 rounded-xl px-4 py-3 text-base font-mono sm:min-w-20 sm:px-5 sm:py-4 sm:text-lg ${
                            state === 'current'
                              ? 'bg-orange-100 text-orange-800'
                              : state === 'updated'
                                ? 'bg-green-100 text-green-800'
                                : state === 'considering'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-bg text-text-primary'
                          }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {description ? (
        <motion.div
          key={description}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-4 sm:bottom-6 left-1/2 max-w-lg w-[90%] -translate-x-1/2 transform"
        >
          <div className="rounded-full border-2 border-gray-200 bg-surface-elevated px-4 py-3 shadow-xl backdrop-blur-sm">
            <p className="text-center text-xs font-semibold text-text-primary sm:text-sm">
              {t(description)}
            </p>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export default GraphAlgorithmMatrixVisualizer;
