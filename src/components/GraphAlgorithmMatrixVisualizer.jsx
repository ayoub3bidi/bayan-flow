/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ComplexityPanel from './ComplexityPanel';

function GraphAlgorithmMatrixVisualizer({
  matrix = null,
  description,
  isComplete,
  algorithm,
  complexityDataset = 'graphAlgorithm',
}) {
  const { t } = useTranslation();

  if (isComplete) {
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

  return (
    <div className="w-full h-full rounded-xl shadow-2xl overflow-hidden relative bg-surface flex flex-col p-4 sm:p-6">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-3 text-center text-sm font-semibold text-text-secondary">
            {t('visualization.graphMatrix')}
          </div>
          <div className="overflow-auto rounded-xl border border-[var(--color-border-strong)] bg-surface-elevated p-3">
            <table className="mx-auto border-separate border-spacing-2 text-center">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-xs font-semibold text-text-secondary">
                    {t('visualization.matrixCorner')}
                  </th>
                  {columnLabels.map(label => (
                    <th
                      key={`col-${label}`}
                      className="px-2 py-1 text-xs font-semibold text-text-primary"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cells.map((row, rowIndex) => (
                  <tr key={`row-${rowLabels[rowIndex] ?? rowIndex}`}>
                    <th className="px-2 py-1 text-xs font-semibold text-text-primary">
                      {rowLabels[rowIndex] ?? rowIndex}
                    </th>
                    {row.map((value, columnIndex) => {
                      const state = cellStates[rowIndex]?.[columnIndex] ?? 'default';
                      return (
                        <td
                          key={`${rowIndex}-${columnIndex}`}
                          className={`min-w-12 rounded-lg px-3 py-2 text-sm font-mono ${
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
