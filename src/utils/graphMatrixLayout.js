/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getGraphMatrixLayout({
  rowCount,
  columnCount,
  viewportWidth,
  viewportHeight,
  sidePadding,
  topSafeArea,
  bottomSafeArea,
  maxCellSize,
  labelMaxWidth,
  labelMaxHeight,
  axisGap,
  cellInsetRatio = 0.14,
  cellInsetMin = 6,
  cellInsetMax = 14,
  cellRadiusRatio = 0.18,
  cellRadiusMin = 10,
  cellRadiusMax = 18,
  labelFontMin = 16,
  labelFontMax = 28,
  cellFontMin = 16,
  cellFontMax = 26,
}) {
  const safeRowCount = Math.max(1, rowCount);
  const safeColumnCount = Math.max(1, columnCount);
  const safeWidth = Math.max(1, viewportWidth - sidePadding * 2);
  const safeHeight = Math.max(1, viewportHeight - topSafeArea - bottomSafeArea);
  const matrixDimension = Math.max(safeRowCount, safeColumnCount);
  const density = matrixDimension >= 6 ? 'compact' : 'comfortable';

  const labelColumnWidth =
    matrixDimension >= 6 ? labelMaxWidth - 6 : labelMaxWidth;
  const headerRowHeight =
    matrixDimension >= 6 ? labelMaxHeight - 4 : labelMaxHeight;
  const effectiveAxisGap = matrixDimension >= 6 ? axisGap - 2 : axisGap;
  const availableCellWidth = Math.max(
    1,
    safeWidth - labelColumnWidth - effectiveAxisGap
  );
  const availableCellHeight = Math.max(
    1,
    safeHeight - headerRowHeight - effectiveAxisGap
  );
  const rawCellSize = Math.floor(
    Math.min(
      availableCellWidth / safeColumnCount,
      availableCellHeight / safeRowCount
    )
  );
  const cellSize = Math.max(1, Math.min(maxCellSize, rawCellSize));
  const matrixWidth =
    labelColumnWidth + effectiveAxisGap + safeColumnCount * cellSize;
  const matrixHeight =
    headerRowHeight + effectiveAxisGap + safeRowCount * cellSize;
  const startX = Math.round((viewportWidth - matrixWidth) / 2);
  const startY =
    topSafeArea +
    Math.max(0, Math.round((safeHeight - matrixHeight) / 2));
  const gridStartX = startX + labelColumnWidth + effectiveAxisGap;
  const gridStartY = startY + headerRowHeight + effectiveAxisGap;
  const cellInset = clamp(
    Math.round(cellSize * cellInsetRatio),
    cellInsetMin,
    cellInsetMax
  );
  const drawCellSize = Math.max(1, cellSize - cellInset);
  const cellRadius = clamp(
    Math.round(drawCellSize * cellRadiusRatio),
    cellRadiusMin,
    cellRadiusMax
  );
  const labelFontSize = clamp(
    Math.round(cellSize * 0.34),
    labelFontMin,
    labelFontMax
  );
  const cellFontSize = clamp(
    Math.round(cellSize * 0.28),
    cellFontMin,
    cellFontMax
  );

  return {
    density,
    matrixDimension,
    viewportWidth,
    viewportHeight,
    startX,
    startY,
    gridStartX,
    gridStartY,
    labelColumnWidth,
    headerRowHeight,
    axisGap: effectiveAxisGap,
    cellSize,
    drawCellSize,
    cellInset,
    cellRadius,
    labelFontSize,
    cellFontSize,
    matrixWidth,
    matrixHeight,
  };
}
