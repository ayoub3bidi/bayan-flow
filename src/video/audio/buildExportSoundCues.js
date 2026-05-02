/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  ALGORITHM_TYPES,
  ELEMENT_STATES,
  GRID_ELEMENT_STATES,
  GRAPH_NODE_STATES,
  TREE_NODE_STATES,
} from '../../constants/index.js';
import { isNodeLinkSearchingAlgorithm } from '../../registry/searchingSubstrate.js';

/** @typedef {import('./exportAudioAssets.js').ExportSfxKind} ExportSfxKind */

/**
 * @typedef {Object} ExportSoundCue
 * @property {number} fromFrame — global composition frame
 * @property {ExportSfxKind} kind
 */

function isNodeLinkSearchingStepShape(step) {
  return (
    step &&
    Array.isArray(step.nodes) &&
    step.nodes.length > 0 &&
    Array.isArray(step.edges) &&
    step.nodeStates != null &&
    typeof step.nodeStates === 'object'
  );
}

/**
 * Compare / array cues align with SortingScene compare phase (early portion of step).
 * @param {number} framesPerStep
 * @returns {number}
 */
function compareFrameOffset(framesPerStep) {
  return Math.max(0, Math.floor(framesPerStep * 0.15));
}

/**
 * Sorting cues — mirrors useSortingVisualization.executeStep order.
 * @param {Array} steps
 * @param {number} framesPerStep
 * @returns {ExportSoundCue[]}
 */
function buildSortingCues(steps, framesPerStep) {
  /** @type {ExportSoundCue[]} */
  const cues = [];
  const offset = compareFrameOffset(framesPerStep);

  steps.forEach((step, stepIndex) => {
    const states = step.states ?? [];
    const hasSwapping = states.includes(ELEMENT_STATES.SWAPPING);
    const hasPivot = states.includes(ELEMENT_STATES.PIVOT);
    const hasComparing = states.includes(ELEMENT_STATES.COMPARING);
    const hasSorted = states.includes(ELEMENT_STATES.SORTED);

    const base = stepIndex * framesPerStep;

    if (hasSwapping) {
      cues.push({ fromFrame: base, kind: 'swap' });
    } else if (hasPivot) {
      cues.push({ fromFrame: base, kind: 'pivot' });
    } else if (hasComparing) {
      cues.push({ fromFrame: base + offset, kind: 'compare' });
    }

    if (
      hasSorted &&
      states.every(
        s => s === ELEMENT_STATES.SORTED || s === ELEMENT_STATES.DEFAULT
      )
    ) {
      cues.push({ fromFrame: base, kind: 'sorted' });
    }
  });

  return cues;
}

/**
 * Pathfinding cues — mirrors usePathfindingVisualization.executeStep.
 * @param {Array} steps
 * @param {number} framesPerStep
 * @returns {ExportSoundCue[]}
 */
function buildPathfindingCues(steps, framesPerStep) {
  /** @type {ExportSoundCue[]} */
  const cues = [];

  steps.forEach((step, stepIndex) => {
    const gridStates = step.states ?? [];
    const hasOpen = gridStates.some(row =>
      row.includes(GRID_ELEMENT_STATES.OPEN)
    );
    const hasPath = gridStates.some(row =>
      row.includes(GRID_ELEMENT_STATES.PATH)
    );
    const desc = (step.description ?? '').toLowerCase();
    const base = stepIndex * framesPerStep;

    if (hasPath && desc.includes('path found')) {
      cues.push({ fromFrame: base, kind: 'pathFound' });
    } else if (hasOpen) {
      cues.push({ fromFrame: base, kind: 'nodeVisit' });
    }
  });

  return cues;
}

/**
 * Searching array — mirrors useSearchingVisualization (compare only).
 * @param {Array} steps
 * @param {number} framesPerStep
 * @returns {ExportSoundCue[]}
 */
function buildSearchingArrayCues(steps, framesPerStep) {
  /** @type {ExportSoundCue[]} */
  const cues = [];
  const offset = compareFrameOffset(framesPerStep);

  steps.forEach((step, stepIndex) => {
    const states = step.states ?? [];
    if (states.includes(ELEMENT_STATES.COMPARING)) {
      cues.push({
        fromFrame: stepIndex * framesPerStep + offset,
        kind: 'compare',
      });
    }
  });

  return cues;
}

/**
 * Searching graph — mirrors useSearchingVisualization graph branch.
 * @param {Array} steps
 * @param {number} framesPerStep
 * @returns {ExportSoundCue[]}
 */
function buildSearchingGraphCues(steps, framesPerStep) {
  /** @type {ExportSoundCue[]} */
  const cues = [];

  steps.forEach((step, stepIndex) => {
    const states = step.nodeStates ?? {};
    const vals = Object.values(states);
    const hasFrontier = vals.includes(GRAPH_NODE_STATES.FRONTIER);
    const hasPath = vals.includes(GRAPH_NODE_STATES.PATH);
    const desc = (step.description ?? '').toLowerCase();
    const base = stepIndex * framesPerStep;

    if (hasPath && desc.includes('path')) {
      cues.push({ fromFrame: base, kind: 'pathFound' });
    } else if (hasFrontier) {
      cues.push({ fromFrame: base, kind: 'nodeVisit' });
    }
  });

  return cues;
}

/**
 * Tree traversal — visiting frame uses `VISITING` node state (mirrors hook sound).
 *
 * @param {Array} steps
 * @param {number} framesPerStep
 * @returns {ExportSoundCue[]}
 */
function buildTreeTraversalCues(steps, framesPerStep) {
  /** @type {ExportSoundCue[]} */
  const cues = [];

  steps.forEach((step, stepIndex) => {
    const vals = Object.values(step.nodeStates ?? {});
    const base = stepIndex * framesPerStep;
    if (vals.includes(TREE_NODE_STATES.VISITING)) {
      cues.push({ fromFrame: base, kind: 'nodeVisit' });
    }
  });

  return cues;
}

/**
 * Pure list of sound cues for the main algorithm segment (excludes complexity tail).
 *
 * @param {Object} opts
 * @param {string} opts.algorithmType
 * @param {string} [opts.algorithmKey]
 * @param {Array} opts.steps
 * @param {number} opts.framesPerStep
 * @returns {ExportSoundCue[]}
 */
export function buildExportSoundCues({
  algorithmType,
  algorithmKey = '',
  steps,
  framesPerStep,
}) {
  if (!steps?.length || framesPerStep <= 0) return [];

  if (algorithmType === ALGORITHM_TYPES.SORTING) {
    return buildSortingCues(steps, framesPerStep);
  }

  if (algorithmType === ALGORITHM_TYPES.PATHFINDING) {
    return buildPathfindingCues(steps, framesPerStep);
  }

  if (algorithmType === ALGORITHM_TYPES.SEARCHING) {
    if (isNodeLinkSearchingAlgorithm(algorithmKey)) {
      if (steps[0] && isNodeLinkSearchingStepShape(steps[0])) {
        return buildSearchingGraphCues(steps, framesPerStep);
      }
    }
    return buildSearchingArrayCues(steps, framesPerStep);
  }

  if (algorithmType === ALGORITHM_TYPES.TREE_TRAVERSAL) {
    return buildTreeTraversalCues(steps, framesPerStep);
  }

  return [];
}
