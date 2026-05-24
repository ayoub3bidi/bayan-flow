/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ComplexityPanel from './ComplexityPanel';
import { getGraphMatrixLayout } from '../utils/graphMatrixLayout.js';

const INTERACTIVE_MATRIX_VIEWPORT = Object.freeze({
  width: 960,
  height: 520,
});

function getMatrixCellStyle(state) {
  if (state === 'current') {
    return {
      fill: '#fed7aa',
      textColor: '#9a3412',
    };
  }
  if (state === 'updated') {
    return {
      fill: '#bbf7d0',
      textColor: '#166534',
    };
  }
  if (state === 'considering') {
    return {
      fill: '#bfdbfe',
      textColor: '#1d4ed8',
    };
  }
  return {
    fill: 'var(--color-bg)',
    textColor: 'var(--color-text-primary)',
  };
}

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
  const rowCount = Math.max(1, cells.length);
  const columnCount = Math.max(
    1,
    Math.max(columnLabels.length, ...(cells.map(row => row.length) ?? [0]))
  );
  const layout = getGraphMatrixLayout({
    rowCount,
    columnCount,
    viewportWidth: INTERACTIVE_MATRIX_VIEWPORT.width,
    viewportHeight: INTERACTIVE_MATRIX_VIEWPORT.height,
    sidePadding: 40,
    topSafeArea: 28,
    bottomSafeArea: 24,
    maxCellSize: 110,
    labelMaxWidth: 56,
    labelMaxHeight: 52,
    axisGap: 18,
    labelFontMin: 16,
    labelFontMax: 28,
    cellFontMin: 16,
    cellFontMax: 24,
  });

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
      <div className="flex-1 min-h-0">
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-start pt-2 sm:pt-3">
          <div className="mb-3 text-center text-sm font-semibold text-text-secondary sm:text-base">
            {t('visualization.graphMatrix')}
          </div>
          <div
            data-testid="graph-matrix-frame"
            data-density={layout.density}
            className="flex-1 min-h-0 w-full overflow-hidden rounded-xl border border-[var(--color-border-strong)] bg-surface-elevated px-2 py-3 sm:px-4 sm:py-5"
          >
            <svg
              viewBox={`0 0 ${layout.viewportWidth} ${layout.viewportHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full"
              role="img"
              aria-label={t('visualization.graphMatrix')}
            >
              <text
                x={layout.startX + layout.labelColumnWidth / 2}
                y={layout.startY + layout.headerRowHeight / 2 + 6}
                fill="var(--color-text-secondary)"
                fontSize={Math.max(14, layout.labelFontSize - 2)}
                fontWeight="700"
                textAnchor="middle"
              >
                {t('visualization.matrixCorner')}
              </text>
              {columnLabels.map((label, columnIndex) => (
                <text
                  key={`col-${label}`}
                  x={layout.gridStartX + columnIndex * layout.cellSize + layout.cellSize / 2}
                  y={layout.startY + layout.headerRowHeight / 2 + 6}
                  fill="var(--color-text-primary)"
                  fontSize={layout.labelFontSize}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {label}
                </text>
              ))}
              {cells.map((row, rowIndex) => (
                <g key={`row-${rowLabels[rowIndex] ?? rowIndex}`}>
                  <text
                    x={layout.startX + layout.labelColumnWidth / 2}
                    y={
                      layout.gridStartY +
                      rowIndex * layout.cellSize +
                      layout.cellSize / 2 +
                      6
                    }
                    fill="var(--color-text-primary)"
                    fontSize={layout.labelFontSize}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {rowLabels[rowIndex] ?? rowIndex}
                  </text>
                  {row.map((value, columnIndex) => {
                    const state = cellStates[rowIndex]?.[columnIndex] ?? 'default';
                    const cellStyle = getMatrixCellStyle(state);

                    return (
                      <g key={`${rowIndex}-${columnIndex}`}>
                        <rect
                          x={
                            layout.gridStartX +
                            columnIndex * layout.cellSize +
                            layout.cellInset / 2
                          }
                          y={
                            layout.gridStartY +
                            rowIndex * layout.cellSize +
                            layout.cellInset / 2
                          }
                          width={layout.drawCellSize}
                          height={layout.drawCellSize}
                          rx={layout.cellRadius}
                          fill={cellStyle.fill}
                          stroke="var(--color-border-strong)"
                          strokeWidth="2.5"
                        />
                        <text
                          x={
                            layout.gridStartX +
                            columnIndex * layout.cellSize +
                            layout.cellSize / 2
                          }
                          y={
                            layout.gridStartY +
                            rowIndex * layout.cellSize +
                            layout.cellSize / 2 +
                            6
                          }
                          fill={cellStyle.textColor}
                          fontSize={layout.cellFontSize}
                          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {value}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
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
