/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ComplexityPanel from './ComplexityPanel';
import SwipeTutorial from './SwipeTutorial';
import AutoHidingLegend from './AutoHidingLegend';
import { GRAPH_NODE_STATES, GRAPH_NODE_STATE_COLORS } from '../constants';
import useSwipe from '../hooks/useSwipe';

const VIEW_PAD = 8;
const VIEW_INNER = 100 - 2 * VIEW_PAD;

/**
 * @param {Array<{ id: string, x: number, y: number, label?: string }>} nodes
 * @param {Array<{ from: string, to: string }>} edges
 * @param {Record<string, string>} nodeStates
 * @param {string[]} [stackOrder]
 * @param {string} description
 * @param {boolean} isComplete
 * @param {string} algorithm
 * @param {Function} onStepForward
 * @param {Function} onStepBackward
 * @param {string} mode
 * @param {'searching'} [complexityDataset]
 * @param {{ from: string, to: string } | undefined} [activeEdge]
 */
function GraphVisualizer({
  nodes = [],
  edges = [],
  nodeStates = {},
  stackOrder = [],
  description,
  isComplete,
  algorithm,
  onStepForward,
  onStepBackward,
  mode,
  complexityDataset = 'searching',
  activeEdge,
}) {
  const { t } = useTranslation();

  // BFS uses a queue (FIFO); DFS uses a stack (LIFO) — label the badge accordingly.
  const isBfsGraph = algorithm === 'breadthFirstSearchGraph';
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

  const legendItems = [
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
    ((activeEdge.from === from && activeEdge.to === to) ||
      (activeEdge.from === to && activeEdge.to === from));

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

            {/* Stack / Queue badge — container is ALWAYS mounted so height is reserved. */}
            <div
              className="flex justify-center mt-1 mb-1 shrink-0 h-7"
              aria-label={t('legend.searchingGraph.stackFrontier')}
              aria-live="polite"
            >
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
            </div>

            <div className="flex-1 flex flex-col items-center justify-center overflow-auto touch-pan-y pb-12 sm:pb-14 min-h-0">
              <svg
                viewBox="0 0 100 100"
                className="w-full max-w-2xl aspect-square select-none"
                role="img"
                aria-label={ariaSummary}
              >
                <title>{ariaSummary}</title>
                {edges.map((e, i) => {
                  const a = posById.get(e.from);
                  const b = posById.get(e.to);
                  if (!a || !b) return null;
                  const active = isActiveEdge(e.from, e.to);
                  return (
                    <line
                      key={`${e.from}-${e.to}-${i}`}
                      x1={a.cx}
                      y1={a.cy}
                      x2={b.cx}
                      y2={b.cy}
                      stroke={active ? '#f97316' : '#9ca3af'}
                      strokeWidth={active ? 0.9 : 0.45}
                      strokeLinecap="round"
                    />
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
