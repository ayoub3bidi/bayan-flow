/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ALGORITHM_COMPLEXITY,
  PATHFINDING_COMPLEXITY,
  COMPLEXITY_FUNCTIONS,
} from '../constants';

/**
 * @param {string} algorithm - Current algorithm name
 * @param {boolean} isPathfinding - Whether this is a pathfinding algorithm
 */
function ComplexityPanel({ algorithm, isPathfinding = false }) {
  const [isLogScale, setIsLogScale] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const svgRef = useRef(null);
  const complexityData = isPathfinding
    ? PATHFINDING_COMPLEXITY[algorithm]
    : ALGORITHM_COMPLEXITY[algorithm];

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

  // SVG dimensions - responsive for mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const width = isMobile ? 320 : 650;
  const height = isMobile ? 280 : 350;
  const margin = { top: 30, right: 50, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full h-full bg-surface flex items-center justify-center p-3 sm:p-6 overflow-auto"
    >
      <div className="rounded-xl p-3 sm:p-6 max-w-5xl w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="hidden sm:block">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary">
              Complexity Analysis
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              {algorithm.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-text-secondary">
              Linear
            </span>
            <button
              onClick={() => setIsLogScale(!isLogScale)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation ${
                isLogScale ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isLogScale}
              aria-label="Toggle logarithmic scale"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isLogScale ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs sm:text-sm text-text-secondary">Log</span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4 flex-shrink-0 w-full lg:w-auto">
            <div>
              <h3 className="text-[10px] sm:text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                Time Complexity
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-text-green-500 w-12 sm:w-16">
                    Best:
                  </span>
                  <code className="bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-[10px] sm:text-xs font-semibold">
                    {complexityData.timeComplexity.best}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-text-tertiary w-12 sm:w-16">
                    Average:
                  </span>
                  <code className="bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-[10px] sm:text-xs font-semibold">
                    {complexityData.timeComplexity.average}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-text-tertiary w-12 sm:w-16">
                    Worst:
                  </span>
                  <code className="bg-red-100 text-red-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-[10px] sm:text-xs font-semibold">
                    {complexityData.timeComplexity.worst}
                  </code>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] sm:text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                Space Complexity
              </h3>
              <code className="bg-purple-100 text-purple-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-[10px] sm:text-xs font-semibold inline-block">
                {complexityData.spaceComplexity}
              </code>
            </div>
          </div>
          <div className="flex-1 w-full overflow-x-auto">
            <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-2">
              Performance Graph
            </h3>
            <div className="text-[10px] sm:text-xs text-text-secondary mb-3">
              X-axis: Input size • Y-axis: Operations (
              {complexityData.timeComplexity.average})
            </div>

            <div className="relative w-full overflow-x-auto">
              <svg
                ref={svgRef}
                width={width}
                height={height}
                className="border border-gray-200 rounded bg-bg w-full"
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
                      />
                    ))}
                  <text
                    x={chartWidth / 2}
                    y={chartHeight + 35}
                    textAnchor="middle"
                    className="text-xs font-medium"
                    fill="var(--color-text-secondary)"
                  >
                    Input Size (n)
                  </text>
                  <text
                    x={-chartHeight / 2}
                    y={-45}
                    textAnchor="middle"
                    transform={`rotate(-90, -45, ${chartHeight / 2})`}
                    className="text-xs font-medium"
                    fill="var(--color-text-secondary)"
                  >
                    Operations ({isLogScale ? 'log' : 'linear'})
                  </text>
                  <text
                    x="0"
                    y={chartHeight + 15}
                    textAnchor="start"
                    className="text-xs"
                    fill="var(--color-text-tertiary)"
                  >
                    0
                  </text>
                  <text
                    x={chartWidth}
                    y={chartHeight + 15}
                    textAnchor="end"
                    className="text-xs"
                    fill="var(--color-text-tertiary)"
                  >
                    {maxN.toLocaleString()}
                  </text>
                  <text
                    x="-10"
                    y={chartHeight + 4}
                    textAnchor="end"
                    className="text-xs"
                    fill="var(--color-text-tertiary)"
                  >
                    0
                  </text>
                  <text
                    x="-10"
                    y="4"
                    textAnchor="end"
                    className="text-xs"
                    fill="var(--color-text-tertiary)"
                  >
                    {isLogScale
                      ? `10^${Math.round(Math.log10(maxValue))}`
                      : Math.round(maxValue).toLocaleString()}
                  </text>
                </g>
              </svg>
              {hoveredPoint && (
                <div className="absolute top-2 left-2 bg-surface-elevated border border-gray-200 text-text-primary text-xs px-3 py-2 rounded shadow-lg z-10">
                  <div>n = {hoveredPoint.n}</div>
                  <div>
                    ops ≈ {Math.round(hoveredPoint.value).toLocaleString()}
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
