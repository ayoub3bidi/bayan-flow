/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ComplexityPanel from './ComplexityPanel';
import SwipeTutorial from './SwipeTutorial';
import AutoHidingLegend from './AutoHidingLegend';
import {
  GRAPH_EDGE_STATES,
  GRAPH_EDGE_STATE_COLORS,
  GRAPH_NODE_STATES,
  GRAPH_NODE_STATE_COLORS,
} from '../constants';
import { useTheme } from '../hooks/useTheme';
import useSwipe from '../hooks/useSwipe';

const VIEW_PAD = 8;
const VIEW_INNER = 100 - 2 * VIEW_PAD;

function getWeightLabelPosition(line, edgeIndex, directed) {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.hypot(dx, dy) || 1;
  const normalX = -dy / length;
  const normalY = dx / length;
  const side = directed ? 1 : edgeIndex % 2 === 0 ? 1 : -1;
  const offset = directed ? 2.1 : 2.8;

  return {
    x: line.mx + normalX * offset * side,
    y: line.my + normalY * offset * side,
  };
}

function getWeightBadgeWidth(weight) {
  return Math.max(7.4, String(weight).length * 2.35 + 3.6);
}

/**
 * @param {Array<{ id: string, x: number, y: number, label?: string }>} nodes
 * @param {Array<{ id?: string, from: string, to: string, weight?: number }>} edges
 * @param {Record<string, string>} nodeStates
 * @param {Record<string, string>} [edgeStates]
 * @param {string[]} [stackOrder]
 * @param {string[]} [outputOrder]
 * @param {{ badges?: Array<{ id: string, text: string }> }} [graphArtifacts]
 * @param {string} description
 * @param {boolean} isComplete
 * @param {string} algorithm
 * @param {Function} onStepForward
 * @param {Function} onStepBackward
 * @param {string} mode
 * @param {'searching'|'graphAlgorithm'} [complexityDataset]
 * @param {{ from: string, to: string } | undefined} [activeEdge]
 * @param {boolean} [directed]
 * @param {boolean} [weighted]
 * @param {'searching'|'graphAlgorithm'} [graphVariant]
 */
function GraphVisualizer({
  nodes = [],
  edges = [],
  nodeStates = {},
  edgeStates = {},
  stackOrder = [],
  outputOrder = [],
  graphArtifacts = {},
  description,
  isComplete,
  algorithm,
  onStepForward,
  onStepBackward,
  mode,
  complexityDataset = 'searching',
  activeEdge,
  directed = false,
  weighted = false,
  graphVariant = 'searching',
}) {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  // BFS uses a queue (FIFO); DFS/topological sort use stack-like frontiers.
  const isBfsGraph = algorithm === 'breadthFirstSearchGraph';
  const isGraphAlgorithm = graphVariant === 'graphAlgorithm';
  const [showComplexityPanel, setShowComplexityPanel] = useState(false);
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);

  const nodeCount = nodes.length;
  const nodeRadius = useMemo(
    () => Math.max(2.8, Math.min(5.5, 6.2 - nodeCount * 0.12)),
    [nodeCount]
  );

  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const hasSteps = nodes.length > 0;
    const isManualMode = mode === 'manual';
    const hasSeenTutorial = localStorage.getItem('swipeTutorialSeen');

    if (
      isMobile &&
      isManualMode &&
      hasSteps &&
      !hasSeenTutorial &&
      !isComplete
    ) {
      const handleScroll = () => {
        if (window.scrollY > 100) {
          setShowSwipeTutorial(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [mode, nodes.length, isComplete]);

  const handleDismissTutorial = () => {
    setShowSwipeTutorial(false);
    localStorage.setItem('swipeTutorialSeen', 'true');
  };

  const weightLabelPalette = isDark
    ? {
        fill: '#f9fafb',
        stroke: 'rgba(15, 23, 42, 0.98)',
        bg: 'rgba(15, 23, 42, 0.82)',
        border: 'rgba(148, 163, 184, 0.48)',
      }
    : {
        fill: '#111827',
        stroke: 'rgba(248, 250, 252, 0.98)',
        bg: 'rgba(255, 255, 255, 0.94)',
        border: 'rgba(148, 163, 184, 0.36)',
      };

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShowComplexityPanel(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setShowComplexityPanel(false);
  }, [isComplete]);

  const posById = useMemo(() => {
    const m = new Map();
    for (const n of nodes) {
      m.set(n.id, {
        cx: VIEW_PAD + n.x * VIEW_INNER,
        cy: VIEW_PAD + n.y * VIEW_INNER,
      });
    }
    return m;
  }, [nodes]);
  const labelById = useMemo(
    () => Object.fromEntries(nodes.map(n => [n.id, n.label ?? n.id])),
    [nodes]
  );
  const graphBadgeItems =
    Array.isArray(graphArtifacts.badges)
      ? graphArtifacts.badges
      : [
          stackOrder.length > 0
            ? {
                id: 'frontier',
                text: t('visualization.recursionStackBadge', {
                  order: stackOrder
                    .map(id => labelById[id] ?? id)
                    .join(' → '),
                }),
              }
            : null,
          outputOrder.length > 0
            ? {
                id: 'result',
                text: t('visualization.topologicalOrderBadge', {
                  order: outputOrder
                    .map(id => labelById[id] ?? id)
                    .join(' → '),
                }),
              }
            : null,
        ].filter(Boolean);

  const legendItems = isGraphAlgorithm
    ? [
        {
          state: GRAPH_NODE_STATES.DEFAULT,
          label: t('legend.graphAlgorithm.unvisited'),
        },
        {
          state: GRAPH_NODE_STATES.FRONTIER,
          label: t('legend.graphAlgorithm.frontier'),
        },
        {
          state: GRAPH_NODE_STATES.CURRENT,
          label: t('legend.graphAlgorithm.current'),
        },
        {
          state: GRAPH_NODE_STATES.VISITED,
          label: t('legend.graphAlgorithm.completed'),
        },
        {
          state: GRAPH_NODE_STATES.PATH,
          label: t('legend.graphAlgorithm.result'),
        },
        {
          state: GRAPH_NODE_STATES.CYCLE,
          label: t('legend.graphAlgorithm.cycle'),
        },
      ]
    : [
        {
          state: GRAPH_NODE_STATES.ROOT,
          label: t('legend.searchingGraph.root'),
        },
        {
          state: GRAPH_NODE_STATES.GOAL,
          label: t('legend.searchingGraph.goal'),
        },
        {
          state: GRAPH_NODE_STATES.FRONTIER,
          label: t('legend.searchingGraph.stackFrontier'),
        },
        {
          state: GRAPH_NODE_STATES.VISITED,
          label: t('legend.searchingGraph.visited'),
        },
        {
          state: GRAPH_NODE_STATES.PATH,
          label: t('legend.searchingGraph.discoveryPath'),
        },
      ];

  const swipe = useSwipe({
    onLeft: mode === 'manual' && onStepBackward ? onStepBackward : undefined,
    onRight: mode === 'manual' && onStepForward ? onStepForward : undefined,
    threshold: 50,
  });

  const isActiveEdge = (from, to) =>
    activeEdge &&
    (directed
      ? activeEdge.from === from && activeEdge.to === to
      : (activeEdge.from === from && activeEdge.to === to) ||
        (activeEdge.from === to && activeEdge.to === from));

  const getEdgeState = edge => {
    const edgeId = edge.id ?? `${edge.from}->${edge.to}`;
    if (edgeStates[edgeId]) return edgeStates[edgeId];
    if (isActiveEdge(edge.from, edge.to)) return GRAPH_EDGE_STATES.ACTIVE;
    return GRAPH_EDGE_STATES.DEFAULT;
  };

  const getShortenedLine = (a, b) => {
    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;
    const length = Math.hypot(dx, dy) || 1;
    const pad = directed ? nodeRadius + 1.2 : nodeRadius;
    return {
      x1: a.cx + (dx / length) * nodeRadius,
      y1: a.cy + (dy / length) * nodeRadius,
      x2: b.cx - (dx / length) * pad,
      y2: b.cy - (dy / length) * pad,
      mx: (a.cx + b.cx) / 2,
      my: (a.cy + b.cy) / 2,
    };
  };

  const ariaSummary =
    nodes.length > 0
      ? t('visualization.graphAria', {
          count: nodes.length,
          defaultValue: `Graph with ${nodes.length} nodes`,
        })
      : t('visualization.graphAriaEmpty', { defaultValue: 'Empty graph' });

  return (
    <div className="w-full h-full rounded-xl shadow-2xl overflow-hidden relative">
      <AnimatePresence mode="wait">
        {showComplexityPanel ? (
          <ComplexityPanel
            algorithm={algorithm}
            complexityDataset={complexityDataset}
          />
        ) : (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-surface flex flex-col p-2 sm:p-4"
            {...(mode === 'manual' ? swipe : {})}
            role="application"
            aria-label="Graph visualization — swipe left or right to change steps in manual mode"
          >
            <AutoHidingLegend
              legendItems={legendItems.map(item => ({
                ...item,
                color: GRAPH_NODE_STATE_COLORS[item.state],
              }))}
              isComplete={isComplete}
            />

            {/* Stack / queue / graph badges */}
            <div
              className="flex justify-center gap-2 mt-1 mb-1 shrink-0 h-7 flex-wrap"
              aria-label={
                isGraphAlgorithm
                  ? t('visualization.graphSubstrate')
                  : t('legend.searchingGraph.stackFrontier')
              }
              aria-live="polite"
            >
              {isGraphAlgorithm
                ? graphBadgeItems.map(badge => (
                    <motion.span
                      key={badge.id}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-elevated px-3 py-1 text-xs font-mono text-text-secondary shadow-sm"
                    >
                      <span className="font-semibold text-text-primary">
                        {badge.text}
                      </span>
                    </motion.span>
                  ))
                : (
                    <motion.span
                      animate={{ opacity: stackOrder.length > 0 ? 1 : 0 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-surface-elevated px-3 py-1 text-xs font-mono text-text-secondary shadow-sm"
                    >
                      <span className="font-semibold text-text-primary">
                        {stackOrder.length > 0
                          ? isBfsGraph
                            ? t('visualization.queueFront', {
                                front: stackOrder[0],
                                defaultValue: `Queue front: ${stackOrder[0]}`,
                              })
                            : t('visualization.stackTop', {
                                top: stackOrder[stackOrder.length - 1],
                                defaultValue: `Stack top: ${stackOrder[stackOrder.length - 1]}`,
                              })
                          : '\u00a0'}
                      </span>
                    </motion.span>
                  )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center overflow-auto touch-pan-y pb-12 sm:pb-14 min-h-0">
              <svg
                viewBox="0 0 100 100"
                className="w-full max-w-2xl aspect-square select-none"
                role="img"
                aria-label={ariaSummary}
              >
                <title>{ariaSummary}</title>
                <defs>
                  <marker
                    id="graph-arrowhead"
                    markerWidth="5"
                    markerHeight="5"
                    refX="4"
                    refY="2.5"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M 0 0 L 5 2.5 L 0 5 z" fill="#6b7280" />
                  </marker>
                </defs>
                {edges.map((e, i) => {
                  const a = posById.get(e.from);
                  const b = posById.get(e.to);
                  if (!a || !b) return null;
                  const state = getEdgeState(e);
                  const active = state === GRAPH_EDGE_STATES.ACTIVE;
                  const stroke =
                    GRAPH_EDGE_STATE_COLORS[state] ??
                    GRAPH_EDGE_STATE_COLORS[GRAPH_EDGE_STATES.DEFAULT];
                  const line = getShortenedLine(a, b);
                  return (
                    <g key={`${e.from}-${e.to}-${i}`}>
                      <line
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={stroke}
                        strokeWidth={active ? 0.9 : 0.5}
                        strokeLinecap="round"
                        markerEnd={
                          directed ? 'url(#graph-arrowhead)' : undefined
                        }
                      />
                      {weighted && e.weight != null ? (() => {
                        const label = getWeightLabelPosition(
                          line,
                          i,
                          directed
                        );
                        const badgeWidth = getWeightBadgeWidth(e.weight);
                        const badgeHeight = 5.9;

                        return (
                          <g aria-hidden="true">
                            <rect
                              x={label.x - badgeWidth / 2}
                              y={label.y - badgeHeight / 2}
                              width={badgeWidth}
                              height={badgeHeight}
                              rx={2.25}
                              fill={weightLabelPalette.bg}
                              stroke={weightLabelPalette.border}
                              strokeWidth={0.32}
                            />
                            <text
                              x={label.x}
                              y={label.y + 0.05}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={weightLabelPalette.fill}
                              className="pointer-events-none"
                              style={{
                                fontSize: 3.1,
                                fontWeight: 800,
                                paintOrder: 'stroke',
                                stroke: weightLabelPalette.stroke,
                                strokeWidth: 0.55,
                              }}
                            >
                              {e.weight}
                            </text>
                          </g>
                        );
                      })() : null}
                    </g>
                  );
                })}
                {nodes.map(n => {
                  const p = posById.get(n.id);
                  if (!p) return null;
                  const state = nodeStates[n.id] ?? GRAPH_NODE_STATES.DEFAULT;
                  const fill =
                    GRAPH_NODE_STATE_COLORS[state] ??
                    GRAPH_NODE_STATE_COLORS[GRAPH_NODE_STATES.DEFAULT];
                  const label = n.label ?? n.id;
                  return (
                    <g key={n.id}>
                      <motion.circle
                        cx={p.cx}
                        cy={p.cy}
                        r={nodeRadius}
                        fill={fill}
                        stroke="#374151"
                        strokeWidth={0.35}
                        initial={false}
                        animate={{ fill }}
                        transition={{ duration: 0.22 }}
                      />
                      <text
                        x={p.cx}
                        y={p.cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-gray-900 pointer-events-none"
                        style={{
                          fontSize: nodeRadius * 1.35,
                          fontWeight: 700,
                        }}
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <AnimatePresence mode="wait">
              {description && (
                <motion.div
                  key={description}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 max-w-lg w-[90%] flex justify-center"
                >
                  <div className="bg-surface-elevated px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-xl border-2 border-gray-200 backdrop-blur-sm">
                    <p
                      className="text-xs sm:text-sm font-semibold text-center text-text-primary"
                      role="status"
                      aria-live="polite"
                    >
                      {t(description)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Output order badge moved to top badges row */}
          </motion.div>
        )}
      </AnimatePresence>

      <SwipeTutorial
        show={showSwipeTutorial}
        onDismiss={handleDismissTutorial}
      />
    </div>
  );
}

export default GraphVisualizer;
