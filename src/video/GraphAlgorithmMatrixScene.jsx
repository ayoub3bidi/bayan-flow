/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { interpolateColors, useCurrentFrame } from 'remotion';
import { getVideoExportTheme } from './videoExportTheme.js';

function GraphAlgorithmMatrixSceneInner({
  steps,
  framesPerStep,
  exportTheme = 'dark',
}) {
  const frame = useCurrentFrame();
  const vTheme = getVideoExportTheme(exportTheme);
  const stepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    Math.max(0, steps.length - 1)
  );
  const step = steps[stepIndex] ?? steps[0];
  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const matrix = step?.matrix;
  const graphArtifacts = step?.graphArtifacts ?? {};

  if (!matrix?.cells?.length) return null;

  const rowLabels = matrix.rowLabels ?? [];
  const columnLabels = matrix.columnLabels ?? rowLabels;
  const cells = matrix.cells ?? [];
  const cellStates = matrix.cellStates ?? [];
  const prevCellStates = prevStep?.matrix?.cellStates ?? cellStates;
  const columnCount = Math.max(1, columnLabels.length);
  const rowCount = Math.max(1, cells.length);
  const topSafeArea = 210;
  const bottomSafeArea = 60;
  const sidePadding = 240;
  const maxMatrixWidth = 1280 - sidePadding * 2;
  const maxMatrixHeight = 720 - topSafeArea - bottomSafeArea;
  const cellSize = Math.max(
    96,
    Math.min(
      128,
      Math.floor(Math.min(maxMatrixWidth / columnCount, maxMatrixHeight / rowCount))
    )
  );
  const drawCellSize = cellSize - Math.max(8, Math.round(cellSize * 0.1));
  const labelFontSize = Math.max(24, Math.round(cellSize * 0.28));
  const cellFontSize = Math.max(24, Math.round(cellSize * 0.24));
  const matrixWidth = columnCount * cellSize;
  const matrixHeight = rowCount * cellSize;
  const startX = Math.round((1280 - matrixWidth) / 2);
  const startY =
    topSafeArea +
    Math.max(0, Math.round((maxMatrixHeight - matrixHeight) / 2));

  const getCellColor = state => {
    if (state === 'current') return '#fdba74';
    if (state === 'updated') return '#86efac';
    if (state === 'considering') return '#93c5fd';
    return vTheme.complexity.chartBg;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {graphArtifacts.badges?.length ? (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '88%',
            zIndex: 1,
          }}
        >
          {graphArtifacts.badges.map(badge => (
            <div
              key={badge.id}
              style={{
                padding: '10px 16px',
                borderRadius: 9999,
                background: vTheme.captionBg,
                border: `2px solid ${vTheme.captionBorder}`,
                color: vTheme.descText,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 21,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {badge.text}
            </div>
          ))}
        </div>
      ) : null}
      <svg
        viewBox="0 0 1280 720"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
        role="img"
      >
        <text
          x={startX - 72}
          y={startY - 32}
          fill={vTheme.complexity.subheading}
          fontSize={Math.max(22, labelFontSize - 4)}
          fontWeight="700"
        >
          i \ j
        </text>
        {columnLabels.map((label, columnIndex) => (
          <text
            key={`col-${label}`}
            x={startX + columnIndex * cellSize + cellSize / 2}
            y={startY - 32}
            fill={vTheme.headerText}
            fontSize={labelFontSize}
            fontWeight="700"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
        {cells.map((row, rowIndex) => (
          <g key={`row-${rowLabels[rowIndex] ?? rowIndex}`}>
            <text
              x={startX - 44}
              y={startY + rowIndex * cellSize + cellSize / 2 + 10}
              fill={vTheme.headerText}
              fontSize={labelFontSize}
              fontWeight="700"
              textAnchor="middle"
            >
              {rowLabels[rowIndex] ?? rowIndex}
            </text>
            {row.map((value, columnIndex) => {
              const state = cellStates[rowIndex]?.[columnIndex] ?? 'default';
              const prevState =
                prevCellStates[rowIndex]?.[columnIndex] ?? state;
              const fill =
                prevState !== state
                  ? interpolateColors(
                      Math.min(
                        1,
                        (frame % framesPerStep) /
                          Math.max(1, framesPerStep * 0.35)
                      ),
                      [0, 1],
                      [getCellColor(prevState), getCellColor(state)]
                    )
                  : getCellColor(state);

              return (
                <g key={`${rowIndex}-${columnIndex}`}>
                  <rect
                    x={startX + columnIndex * cellSize}
                    y={startY + rowIndex * cellSize}
                    width={drawCellSize}
                    height={drawCellSize}
                    rx="16"
                    fill={fill}
                    stroke={vTheme.complexity.chartBorder}
                    strokeWidth="3"
                  />
                  <text
                    x={startX + columnIndex * cellSize + drawCellSize / 2}
                    y={startY + rowIndex * cellSize + cellSize / 2 + 8}
                    fill={state === 'default' ? vTheme.headerText : '#111827'}
                    fontSize={cellFontSize}
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
  );
}

export default memo(GraphAlgorithmMatrixSceneInner);
