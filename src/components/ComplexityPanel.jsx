/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { COMPLEXITY_FUNCTIONS } from '../constants';
import {
  modalPanelInitial,
  modalPanelAnimate,
  modalPanelTransition,
} from '../motion/chromeMotion';
import {
  COMPLEXITY_DATASETS,
  DEFAULT_COMPLEXITY_DATASET,
} from '../registry/complexityDatasetRegistry';
import { useMediaQuery } from '../hooks/useMediaQuery';

// Fixed internal viewBox — CSS scales the SVG to its container
const VIEWBOX_WIDTH = 650;
const VIEWBOX_HEIGHT = 350;

/**
 * @param {string} algorithm - Current algorithm key
 * @param {string} complexityDataset - Key into COMPLEXITY_DATASETS (sorting | pathfinding | searching)
 */
function ComplexityPanel({
  algorithm,
  complexityDataset = DEFAULT_COMPLEXITY_DATASET,
}) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [isLogScale, setIsLogScale] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const svgRef = useRef(null);

  const isSmall = useMediaQuery('(max-width: 639px)');
  const isBelowLg = useMediaQuery('(max-width: 1023px)');

  const dataset =
    COMPLEXITY_DATASETS[complexityDataset] ??
    COMPLEXITY_DATASETS[DEFAULT_COMPLEXITY_DATASET];
  const complexityData = dataset[algorithm];

  // Touch-friendly tooltip: tap toggles, tap elsewhere dismisses
  const handlePointInteraction = useCallback(point => {
    setHoveredPoint(prev => (prev && prev.n === point.n ? null : point));
  }, []);

  const dismissTooltip = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  // Animate curve drawing on mount
  useEffect(() => {
    setAnimationProgress(0);
    const duration = 2000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [algorithm]);

  if (!complexityData) {
    return null;
  }

  // Generate sample points for the graph
  const generateGraphData = () => {
    const points = [];
    const maxN = 1000;
    const steps = 50;
    for (let i = 1; i <= steps; i++) {
      const n = Math.floor((i / steps) * maxN) + 1;
      const avgComplexity = complexityData.timeComplexity.average;
      const func = COMPLEXITY_FUNCTIONS[avgComplexity];
      const value = func ? func(n) : n;
      points.push({ n, value, complexity: avgComplexity });
    }
    return points;
  };

  const graphData = generateGraphData();

  // Responsive margins for the SVG viewBox coordinate system
  const margin = isSmall
    ? { top: 20, right: 25, bottom: 50, left: 50 }
    : isBelowLg
      ? { top: 25, right: 35, bottom: 55, left: 55 }
      : { top: 30, right: 50, bottom: 60, left: 60 };
  const chartWidth = VIEWBOX_WIDTH - margin.left - margin.right;
  const chartHeight = VIEWBOX_HEIGHT - margin.top - margin.bottom;

  // Scales
  const maxN = Math.max(...graphData.map(d => d.n));
  const maxValue = Math.max(...graphData.map(d => d.value));
  const xScale = n => (n / maxN) * chartWidth;
  const yScale = value => {
    if (isLogScale && value > 0) {
      const logMax = Math.log10(maxValue);
      const logValue = Math.log10(value);
      return chartHeight - (logValue / logMax) * chartHeight;
    }
    return chartHeight - (value / maxValue) * chartHeight;
  };

  // Generate animated path for the complexity curve
  const generatePath = () => {
    const totalPoints = graphData.length;
    const visiblePoints = Math.floor(totalPoints * animationProgress);
    const visibleData = graphData.slice(0, visiblePoints + 1);
    return visibleData
      .map((point, index) => {
        const x = xScale(point.n);
        const y = yScale(point.value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const svgTextClass = isSmall
    ? 'text-[8px]'
    : isBelowLg
      ? 'text-[9px]'
      : 'text-xs';

  return (
    <motion.div
      initial={modalPanelInitial(reduceMotion)}
      animate={modalPanelAnimate()}
      transition={modalPanelTransition(reduceMotion)}
      className="w-full h-full bg-surface flex items-center justify-center p-3 sm:p-6 overflow-auto leading-consistent"
      dir="auto"
    >
      <div className="rounded-xl p-3 sm:p-6 max-w-5xl w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 border-b border-gray-200">
          <div>
            <h2 className="text-sm sm:text-xl font-bold text-text-primary">
              {t('complexity_panel.title')}
            </h2>
            <p className="text-[10px] sm:text-sm text-text-secondary">
              {t(`algorithms.${complexityDataset}.${algorithm}`, {
                defaultValue: complexityData.name || algorithm,
              })}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-text-secondary">
              {t('complexity_panel.linearScale')}
            </span>
            <button
              onClick={() => setIsLogScale(!isLogScale)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation ${
                isLogScale ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isLogScale}
              aria-label={t('complexity_panel.toggleScale')}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  isLogScale
                    ? 'translate-x-6 rtl:-translate-x-6'
                    : 'translate-x-1 rtl:-translate-x-1'
                }`}
              />
            </button>
            <span className="hidden sm:inline text-sm text-text-secondary">
              {t('complexity_panel.logScale')}
            </span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6">
          {/* Complexity badges */}
          <div
            className={`flex-shrink-0 w-full lg:w-auto ${
              isSmall
                ? 'flex flex-row flex-wrap gap-x-4 gap-y-2'
                : 'space-y-3 sm:space-y-4'
            }`}
          >
            <div className={isSmall ? 'min-w-0' : ''}>
              <h3 className="text-[10px] sm:text-xs font-semibold text-text-secondary mb-1.5 sm:mb-2 uppercase tracking-wide">
                {t('complexity_panel.timeComplexity')}
              </h3>
              <div
                className={
                  isSmall ? 'flex flex-wrap gap-x-3 gap-y-1' : 'space-y-1.5'
                }
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-text-green-500 w-10 sm:w-16 rtl:text-right">
                    {t('complexity_panel.best')}:
                  </span>
                  <code className="bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-[10px] sm:text-xs font-semibold">
                    {complexityData.timeComplexity.best}
                  </code>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-text-tertiary w-10 sm:w-16 rtl:text-right">
                    {t('complexity_panel.average')}:
                  </span>
                  <code className="bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-[10px] sm:text-xs font-semibold">
                    {complexityData.timeComplexity.average}
                  </code>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-text-tertiary w-10 sm:w-16 rtl:text-right">
                    {t('complexity_panel.worst')}:
                  </span>
                  <code className="bg-red-100 text-red-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-[10px] sm:text-xs font-semibold">
                    {complexityData.timeComplexity.worst}
                  </code>
                </div>
              </div>
            </div>
            <div className={isSmall ? 'min-w-0' : ''}>
              <h3 className="text-[10px] sm:text-xs font-semibold text-text-secondary mb-1.5 sm:mb-2 uppercase tracking-wide">
                {t('complexity_panel.spaceComplexity')}
              </h3>
              <code className="bg-purple-100 text-purple-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-[10px] sm:text-xs font-semibold inline-block">
                {complexityData.spaceComplexity}
              </code>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 w-full min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-1 sm:mb-2">
              {t('complexity_panel.performance')}
            </h3>
            <div className="text-[10px] sm:text-xs text-text-secondary mb-2 sm:mb-3">
              {t('complexity_panel.axisLabels', {
                complexity: complexityData.timeComplexity.average,
              })}
            </div>

            <div className="relative w-full" onClick={dismissTooltip}>
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                className="border border-gray-200 rounded bg-bg w-full h-auto"
                preserveAspectRatio="xMidYMid meet"
              >
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                  <defs>
                    <pattern
                      id="grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width={chartWidth}
                    height={chartHeight}
                    fill="url(#grid)"
                  />
                  <line
                    x1="0"
                    y1={chartHeight}
                    x2={chartWidth}
                    y2={chartHeight}
                    stroke="var(--color-text-secondary)"
                    strokeWidth="2"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={chartHeight}
                    stroke="var(--color-text-secondary)"
                    strokeWidth="2"
                  />
                  <path
                    d={generatePath()}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {graphData
                    .slice(
                      0,
                      Math.floor(graphData.length * animationProgress) + 1
                    )
                    .map((point, index) => (
                      <circle
                        key={index}
                        cx={xScale(point.n)}
                        cy={yScale(point.value)}
                        r="3"
                        fill="var(--color-primary)"
                        stroke="var(--color-surface)"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={e => {
                          e.stopPropagation();
                          handlePointInteraction(point);
                        }}
                      />
                    ))}
                  <text
                    x={chartWidth / 2}
                    y={chartHeight + (isSmall ? 30 : 35)}
                    textAnchor="middle"
                    className={`${svgTextClass} font-medium`}
                    fill="var(--color-text-secondary)"
                  >
                    {t('complexity_panel.inputSize')}
                  </text>
                  <text
                    x={-chartHeight / 2}
                    y={isSmall ? -38 : -45}
                    textAnchor="middle"
                    transform={`rotate(-90, ${isSmall ? -38 : -45}, ${chartHeight / 2})`}
                    className={`${svgTextClass} font-medium`}
                    fill="var(--color-text-secondary)"
                  >
                    {t('complexity_panel.operations', {
                      scale: isLogScale
                        ? t('complexity_panel.log')
                        : t('complexity_panel.linear'),
                    })}
                  </text>
                  <text
                    x="0"
                    y={chartHeight + 15}
                    textAnchor="start"
                    className={svgTextClass}
                    fill="var(--color-text-tertiary)"
                  >
                    0
                  </text>
                  <text
                    x={chartWidth}
                    y={chartHeight + 15}
                    textAnchor="end"
                    className={svgTextClass}
                    fill="var(--color-text-tertiary)"
                  >
                    {maxN.toLocaleString()}
                  </text>
                  <text
                    x="-10"
                    y={chartHeight + 4}
                    textAnchor="end"
                    className={svgTextClass}
                    fill="var(--color-text-tertiary)"
                  >
                    0
                  </text>
                  <text
                    x="-10"
                    y="4"
                    textAnchor="end"
                    className={svgTextClass}
                    fill="var(--color-text-tertiary)"
                  >
                    {isLogScale
                      ? `10^${Math.round(Math.log10(maxValue))}`
                      : Math.round(maxValue).toLocaleString()}
                  </text>
                </g>
              </svg>
              {hoveredPoint && (
                <div
                  className="absolute top-2 ltr:left-2 rtl:right-2 bg-surface-elevated border border-gray-200 text-text-primary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded shadow-lg z-10"
                  role="status"
                  aria-live="polite"
                >
                  <div>
                    {t('complexity_panel.hoverN')} = {hoveredPoint.n}
                  </div>
                  <div>
                    {t('complexity_panel.hoverOps')} ≈{' '}
                    {Math.round(hoveredPoint.value).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ComplexityPanel;
