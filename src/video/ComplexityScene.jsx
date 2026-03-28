/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCurrentFrame } from 'remotion';
import { AbsoluteFill } from 'remotion';
import { interpolate } from 'remotion';
import { COMPLEXITY_FUNCTIONS } from '../constants/index.js';
import {
  COMPLEXITY_DATASETS,
  DEFAULT_COMPLEXITY_DATASET,
} from '../registry/complexityDatasetRegistry.js';

/**
 * Remotion-compatible complexity analysis display.
 * Renders time/space complexity and a simple animated performance graph.
 * No Framer Motion or requestAnimationFrame.
 *
 * @param {Object} props
 * @param {string} props.algorithmKey - Algorithm key (e.g. 'bubbleSort', 'bfs')
 * @param {string} props.complexityDataset - Key into COMPLEXITY_DATASETS (see CATEGORY_CONFIG.complexityDataset)
 * @param {string} props.algorithmName - Display name of the algorithm
 */
function ComplexityScene({ algorithmKey, complexityDataset, algorithmName }) {
  const frame = useCurrentFrame();
  const map =
    COMPLEXITY_DATASETS[complexityDataset] ??
    COMPLEXITY_DATASETS[DEFAULT_COMPLEXITY_DATASET];
  const complexityData = map[algorithmKey];

  if (!complexityData) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#111827',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: 18,
        }}
      >
        Complexity data not available
      </AbsoluteFill>
    );
  }

  const { timeComplexity, spaceComplexity } = complexityData;

  // Animate chart drawing over first 60 frames
  const chartProgress = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Generate graph data
  const points = [];
  const maxN = 1000;
  const steps = 50;
  const func = COMPLEXITY_FUNCTIONS[timeComplexity.average] ?? (n => n * n);
  for (let i = 1; i <= steps; i++) {
    const n = Math.floor((i / steps) * maxN) + 1;
    const value = func(n);
    points.push({ n, value });
  }
  const maxValue = Math.max(...points.map(p => p.value));

  const width = 500;
  const height = 220;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xScale = n => (n / maxN) * chartWidth;
  const yScale = value => chartHeight - (value / maxValue) * chartHeight;

  const visiblePoints = Math.floor(points.length * chartProgress) + 1;
  const pathData = points
    .slice(0, visiblePoints)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.n)} ${yScale(p.value)}`)
    .join(' ');

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#111827',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      {/* Title */}
      <div
        style={{
          marginBottom: 24,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            color: '#f9fafb',
            fontSize: 28,
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          Complexity Analysis
        </h2>
        <p
          style={{
            color: '#9ca3af',
            fontSize: 18,
            margin: '8px 0 0 0',
          }}
        >
          {algorithmName || complexityData.name}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 48,
          alignItems: 'flex-start',
          maxWidth: 900,
        }}
      >
        {/* Time & Space complexity */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            minWidth: 280,
          }}
        >
          <div>
            <h3
              style={{
                color: '#9ca3af',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                margin: '0 0 8px 0',
              }}
            >
              Time Complexity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#6b7280', fontSize: 14, width: 48 }}>
                  Best:
                </span>
                <code
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {timeComplexity.best}
                </code>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#6b7280', fontSize: 14, width: 48 }}>
                  Avg:
                </span>
                <code
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {timeComplexity.average}
                </code>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#6b7280', fontSize: 14, width: 48 }}>
                  Worst:
                </span>
                <code
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {timeComplexity.worst}
                </code>
              </div>
            </div>
          </div>
          <div>
            <h3
              style={{
                color: '#9ca3af',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                margin: '0 0 8px 0',
              }}
            >
              Space Complexity
            </h3>
            <code
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: '#a78bfa',
                padding: '6px 10px',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {spaceComplexity}
            </code>
          </div>
        </div>

        {/* Performance graph */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <h3
            style={{
              color: '#9ca3af',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              margin: '0 0 8px 0',
            }}
          >
            Performance
          </h3>
          <svg
            width={width}
            height={height}
            style={{
              border: '1px solid #374151',
              borderRadius: 8,
              backgroundColor: '#1f2937',
            }}
          >
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect
                width={chartWidth}
                height={chartHeight}
                fill="transparent"
              />
              <path
                d={pathData}
                fill="none"
                stroke="#10b981"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1={0}
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
                stroke="#6b7280"
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={chartHeight}
                stroke="#6b7280"
                strokeWidth={1}
              />
              <text
                x={chartWidth / 2}
                y={chartHeight + 30}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={12}
              >
                Input size (n)
              </text>
              <text
                x={-chartHeight / 2}
                y={-35}
                textAnchor="middle"
                transform={`rotate(-90, -35, ${chartHeight / 2})`}
                fill="#9ca3af"
                fontSize={12}
              >
                Operations
              </text>
            </g>
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default ComplexityScene;
