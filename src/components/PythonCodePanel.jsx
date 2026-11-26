/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import {
  getPythonCode,
  getAlgorithmDisplayName,
  getTestCases,
} from '../algorithms/python';
import { getPseudocodeForLocale } from '../algorithms/pseudocode';
import { highlightPseudocodeToHtml } from '../utils/pseudocodeHighlight';
import { getFocusableElements } from '../utils/focusableElements';
import Editor from '@monaco-editor/react';
import { useTheme } from '../hooks/useTheme';
import { usePythonExecution } from '../hooks/usePythonExecution';
import { useIsBelowLg } from '../hooks/useIsBelowLg';
import { useMediaQuery } from '../hooks/useMediaQuery';
import OutputConsole from './OutputConsole';
import { getBlocksStarter } from '../blocks/starters/index.js';
import {
  buildProgramSteps,
  buildSearchProgramSteps,
  buildPathProgramSteps,
  buildTreeProgramSteps,
  treeToDict,
  buildGraphProgramSteps,
  buildMatrixProgramSteps,
  graphToArgs,
} from '../blocks/programSteps';
import {
  trackBlocksTabOpened,
  trackBlocksProgramRun,
} from '../services/analyticsEvents';
import {
  drawerPanelVariants,
  sheetPanelVariants,
  getChromeTransition,
  fadeOverlayTransition,
  OVERLAY_CLASS_LIGHT,
} from '../motion/chromeMotion';

const BlocksWorkspace = lazy(() => import('./BlocksWorkspace'));

const STORAGE_KEY_OUTPUT_PERCENT = 'python-panel-output-percent';
/** Console message keys per program kind: [solved, not solved]. */
const BLOCKS_OUTPUT_KEYS = {
  sort: ['run_sorted', 'run_not_sorted'],
  search: ['run_found', 'run_not_found'],
  path: ['run_path_found', 'run_path_not_found'],
  tree: ['run_tree_ok', 'run_tree_wrong_order'],
  graph: ['run_graph_ok', 'run_graph_wrong'],
};
/**
 * Drawer width while the Blocks tab docks beside the visualizer. Always leaves
 * room for the visualizer + control bar (the settings sidebar hides while docked).
 */
const DOCK_WIDTH = 'min(60vw, calc(100vw - 820px))';
/** The Blocks tab is a laptop/desktop feature: hidden below this width. */
const DOCK_MEDIA_QUERY = '(min-width: 1280px)';
/** Room for blocks and Python side by side; below it they stack. */
const SPLIT_MEDIA_QUERY = '(min-width: 1600px)';

const getCustomTestsStorageKey = algo => `python-test-cases-${algo}`;
const DEFAULT_OUTPUT_PERCENT = 35;
const MIN_OUTPUT_PERCENT = 15;
const MAX_OUTPUT_PERCENT = 70;

/** Python's share of the Blocks tab (beside or below the workspace). */
const STORAGE_KEY_BLOCKS_PYTHON_PERCENT = 'bayan-flow:blocks-python-percent';
const DEFAULT_BLOCKS_PYTHON_PERCENT = 33;
const MIN_BLOCKS_PYTHON_PERCENT = 20;
const MAX_BLOCKS_PYTHON_PERCENT = 70;
const KEYBOARD_RESIZE_STEP = 5;
/** How long the Blocks "Reset" stays armed for its confirming second click. */
const RESET_CONFIRM_MS = 3000;

function getStoredPercent(key, min, max, fallback) {
  try {
    const v = parseInt(localStorage.getItem(key), 10);
    if (Number.isFinite(v) && v >= min && v <= max) {
      return v;
    }
  } catch {
    // localStorage not available
  }
  return fallback;
}

function storePercent(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // localStorage not available
  }
}

const sameCell = (a, b) => a?.row === b?.row && a?.col === b?.col;

/**
 * Whether the visualizer still shows the input a block run was given.
 * Trees and graphs are hook state, replaced (not mutated) on regenerate.
 */
function isSameRunInput(run, current) {
  switch (run.kind) {
    case 'path':
      return (
        sameCell(run.grid?.start, current.grid?.start) &&
        sameCell(run.grid?.end, current.grid?.end)
      );
    case 'tree':
      return run.tree === current.tree;
    case 'graph':
      return run.graph === current.graph;
    default: {
      const now = current.array ?? [];
      return (
        run.array.length === now.length &&
        run.array.every((value, i) => value === now[i]) &&
        (run.kind !== 'search' || run.target === current.target)
      );
    }
  }
}

const clampBlocksPythonPercent = percent =>
  Math.round(
    Math.max(
      MIN_BLOCKS_PYTHON_PERCENT,
      Math.min(MAX_BLOCKS_PYTHON_PERCENT, percent)
    )
  );

/** Keys pressed inside another dialog (e.g. the settings drawer) are its own. */
function isInOtherDialog(event, panel) {
  const dialog = event.target.closest?.('[role="dialog"]');
  return Boolean(dialog) && dialog !== panel;
}

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the panel is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.algorithm - Current algorithm name
 * @param {number[]} [props.currentArray] - Visualizer input a block program runs on
 * @param {number|null} [props.currentTarget] - Search target a block search runs with
 * @param {{ grid: number[][], start: {row: number, col: number},
 *   end: {row: number, col: number} }|null} [props.currentGrid] - Grid a block
 *   pathfinding program runs on
 * @param {object|null} [props.currentTree] - Tree a block traversal runs on
 *   (`generateTreeForTraversal()` output)
 * @param {object|null} [props.currentGraph] - Graph a block graph program runs
 *   on (the graph or graph-search hook's `graphContext`)
 * @param {string|null} [props.activeBlockId] - Block behind the playing step
 * @param {(steps: object[]) => void} [props.onProgramSteps] - Play a block program's steps
 * @param {(width: string|null) => void} [props.onDockChange] - Docked drawer width, or null
 */
function PythonCodePanel({
  isOpen,
  onClose,
  algorithm,
  currentArray,
  currentTarget = null,
  currentGrid = null,
  currentTree = null,
  currentGraph = null,
  activeBlockId = null,
  onProgramSteps,
  onDockChange,
}) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsBelowLg();
  const canDock = useMediaQuery(DOCK_MEDIA_QUERY);
  const canSplit = useMediaQuery(SPLIT_MEDIA_QUERY);
  const [mountEditor, setMountEditor] = useState(false);
  const panelRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const { isDark } = useTheme();
  const isRTL = i18n.dir() === 'rtl';
  const reduceMotion = useReducedMotion();

  // Handle escape key
  useEffect(() => {
    const handleEscape = event => {
      if (isInOtherDialog(event, panelRef.current)) return;
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  const blocksStarter = getBlocksStarter(algorithm);
  const supportsBlocks = Boolean(blocksStarter);
  const [selectedCodeTab, setActiveCodeTab] = useState(
    /** @type {'pseudocode' | 'python' | 'blocks'} */ ('python')
  );
  // Blocks is hidden below the dock width; fall back to Python there.
  const activeCodeTab =
    selectedCodeTab === 'blocks' && !canDock ? 'python' : selectedCodeTab;
  const isBlocksTab = activeCodeTab === 'blocks';
  const isBlocksView = isBlocksTab && supportsBlocks;
  const isDocked = isBlocksView;
  const dockWidth = isDocked ? DOCK_WIDTH : null;

  useEffect(() => {
    onDockChange?.(isOpen ? dockWidth : null);
  }, [isOpen, dockWidth, onDockChange]);

  // Focus trap (modal drawer only; docked Blocks/Split leaves the page usable)
  useEffect(() => {
    if (isOpen && !isDocked && panelRef.current) {
      const handleKeyDown = event => {
        if (isInOtherDialog(event, panelRef.current)) return;
        if (event.key === 'Escape') {
          onClose();
        } else if (event.key === 'Tab') {
          const focusableElements = getFocusableElements(panelRef.current);
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      getFocusableElements(panelRef.current)[0]?.focus();

      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isDocked, onClose]);
  const pythonCode = getPythonCode(algorithm);
  const displayName = getAlgorithmDisplayName(algorithm);
  const pseudocodeText = useMemo(
    () =>
      getPseudocodeForLocale(
        algorithm,
        i18n.resolvedLanguage ?? i18n.language
      ) ?? t('python_code.noPseudocode'),
    [algorithm, i18n.resolvedLanguage, i18n.language, t]
  );

  const pseudocodeHtml = useMemo(
    () => highlightPseudocodeToHtml(pseudocodeText),
    [pseudocodeText]
  );

  const [code, setCode] = useState(pythonCode);
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);
  const [outputHeightPercent, setOutputHeightPercent] = useState(() =>
    getStoredPercent(
      STORAGE_KEY_OUTPUT_PERCENT,
      MIN_OUTPUT_PERCENT,
      MAX_OUTPUT_PERCENT,
      DEFAULT_OUTPUT_PERCENT
    )
  );
  const [isResizing, setIsResizing] = useState(false);
  const resizeContainerRef = useRef(null);
  const lastPercentRef = useRef(outputHeightPercent);
  lastPercentRef.current = outputHeightPercent;
  const isModified = code !== pythonCode;

  const handleResizeStart = useCallback(e => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const container = resizeContainerRef.current;
    if (!container) return;

    const handleMove = e => {
      const rect = container.getBoundingClientRect();
      const totalHeight = rect.height;
      const handleOffset = rect.top;
      const mouseY = e.clientY;
      const yFromTop = mouseY - handleOffset;
      if (totalHeight <= 0) return;
      let percent = (1 - yFromTop / totalHeight) * 100;
      percent = Math.max(
        MIN_OUTPUT_PERCENT,
        Math.min(MAX_OUTPUT_PERCENT, percent)
      );
      lastPercentRef.current = Math.round(percent);
      setOutputHeightPercent(lastPercentRef.current);
    };

    const handleUp = () => {
      setIsResizing(false);
      storePercent(STORAGE_KEY_OUTPUT_PERCENT, lastPercentRef.current);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const {
    status,
    output,
    error,
    runCode,
    runTests,
    cancelExecution,
    clearOutput,
    clearTestResults,
    testResults,
    testStatus,
    testError,
    vizResult,
    runVisualization,
    warmUp,
  } = usePythonExecution();

  const predefined = getTestCases(algorithm);
  const [customTests, setCustomTests] = useState(() => {
    try {
      const key = getCustomTestsStorageKey(algorithm);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      const key = getCustomTestsStorageKey(algorithm);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCustomTests(Array.isArray(parsed) ? parsed : []);
      } else {
        setCustomTests([]);
      }
    } catch {
      setCustomTests([]);
    }
  }, [algorithm]);

  const testCases = useMemo(
    () => [
      ...(predefined?.testCases?.map(tc => ({ ...tc, isCustom: false })) ?? []),
      ...customTests.map(tc => ({ ...tc, isCustom: true })),
    ],
    [predefined?.testCases, customTests]
  );

  const handleAddTestCase = useCallback(
    (name, input, expected) => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newTest = { id, name, input, expected };
      setCustomTests(prev => {
        const next = [...prev, newTest];
        try {
          localStorage.setItem(
            getCustomTestsStorageKey(algorithm),
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    [algorithm]
  );

  const handleEditTestCase = useCallback(
    (id, name, input, expected) => {
      setCustomTests(prev => {
        const next = prev.map(tc =>
          tc.id === id ? { ...tc, name, input, expected } : tc
        );
        try {
          localStorage.setItem(
            getCustomTestsStorageKey(algorithm),
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    [algorithm]
  );

  const handleDeleteTestCase = useCallback(
    id => {
      setCustomTests(prev => {
        const next = prev.filter(tc => tc.id !== id);
        try {
          localStorage.setItem(
            getCustomTestsStorageKey(algorithm),
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    [algorithm]
  );

  // ── Blocks mode ────────────────────────────────────────────────────────────
  const blocksRef = useRef(null);
  const splitEditorRef = useRef(null);
  const splitDecorationsRef = useRef(null);
  /** What the last Run used: { kind, functionName, array, target, grid, tree, graph }. */
  const runInputRef = useRef(null);
  const [program, setProgram] = useState(null);

  // Adjustable split between the workspace and its Python (like the output).
  const blocksSplitRef = useRef(null);
  const [blocksPythonPercent, setBlocksPythonPercent] = useState(() =>
    getStoredPercent(
      STORAGE_KEY_BLOCKS_PYTHON_PERCENT,
      MIN_BLOCKS_PYTHON_PERCENT,
      MAX_BLOCKS_PYTHON_PERCENT,
      DEFAULT_BLOCKS_PYTHON_PERCENT
    )
  );
  const [isResizingBlocksSplit, setIsResizingBlocksSplit] = useState(false);
  const blocksPythonPercentRef = useRef(blocksPythonPercent);
  blocksPythonPercentRef.current = blocksPythonPercent;

  useEffect(() => {
    if (!isResizingBlocksSplit) return;
    const container = blocksSplitRef.current;
    if (!container) return;

    // The split is always LTR: Python on the right, or below when stacked.
    const handleMove = e => {
      const rect = container.getBoundingClientRect();
      const percent = canSplit
        ? ((rect.right - e.clientX) / rect.width) * 100
        : ((rect.bottom - e.clientY) / rect.height) * 100;
      if (Number.isFinite(percent)) {
        setBlocksPythonPercent(clampBlocksPythonPercent(percent));
      }
    };
    const handleUp = () => {
      setIsResizingBlocksSplit(false);
      storePercent(
        STORAGE_KEY_BLOCKS_PYTHON_PERCENT,
        blocksPythonPercentRef.current
      );
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    document.body.style.cursor = canSplit ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingBlocksSplit, canSplit]);

  const handleBlocksSplitKeyDown = useCallback(
    e => {
      // Arrows move the divider: toward the workspace grows Python.
      const grow = canSplit ? 'ArrowLeft' : 'ArrowUp';
      const shrink = canSplit ? 'ArrowRight' : 'ArrowDown';
      if (e.key !== grow && e.key !== shrink) return;
      e.preventDefault();
      const next = clampBlocksPythonPercent(
        blocksPythonPercentRef.current +
          (e.key === grow ? KEYBOARD_RESIZE_STEP : -KEYBOARD_RESIZE_STEP)
      );
      setBlocksPythonPercent(next);
      storePercent(STORAGE_KEY_BLOCKS_PYTHON_PERCENT, next);
    },
    [canSplit]
  );
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [blocksRun, setBlocksRun] = useState(null);

  const selectBlocksTab = useCallback(() => {
    setActiveCodeTab('blocks');
    trackBlocksTabOpened(algorithm, supportsBlocks);
  }, [algorithm, supportsBlocks]);

  // Download Pyodide while the learner is still building.
  useEffect(() => {
    if (isOpen && isBlocksView) warmUp();
  }, [isOpen, isBlocksView, warmUp]);

  const handleRunBlocks = useCallback(() => {
    if (status === 'running' || !program) return;
    const { kind } = program;
    if (kind === 'search' && currentTarget == null) return;
    if (kind === 'path' && !currentGrid?.start) return;
    if (kind === 'tree' && currentTree?.rootId == null) return;
    if (kind === 'graph' && !currentGraph?.nodes?.length) return;
    const array = [...(currentArray ?? [])];
    const target = kind === 'search' ? currentTarget : null;
    runInputRef.current = {
      kind,
      functionName: program.functionName,
      array,
      target,
      grid: currentGrid,
      tree: currentTree,
      graph: currentGraph,
    };
    let args = [array];
    if (kind === 'search') args = [array, target];
    if (kind === 'path') {
      const { grid, start, end } = currentGrid;
      args = [grid, [start.row, start.col], [end.row, end.col]];
    }
    if (kind === 'tree') args = [treeToDict(currentTree)];
    if (kind === 'graph') args = graphToArgs(currentGraph, algorithm);
    setBlocksRun(null);
    runVisualization(program.execCode, args, {
      functionName: program.functionName,
      kind,
    });
    setIsOutputExpanded(true);
  }, [
    status,
    program,
    currentArray,
    currentTarget,
    currentGrid,
    currentTree,
    currentGraph,
    algorithm,
    runVisualization,
  ]);

  const onProgramStepsRef = useRef(onProgramSteps);
  onProgramStepsRef.current = onProgramSteps;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // A run can finish after the learner left Blocks (closed the panel, another
  // tab, narrow viewport); its steps must not reach the visualizer then.
  const isBlocksActiveRef = useRef(false);
  isBlocksActiveRef.current = isOpen && isBlocksView;

  // The visualizer's input now, to tell whether it changed during a run.
  const currentInputRef = useRef(null);
  currentInputRef.current = {
    array: currentArray,
    target: currentTarget,
    grid: currentGrid,
    tree: currentTree,
    graph: currentGraph,
  };

  useEffect(() => {
    if (!vizResult || !isBlocksActiveRef.current) return;
    if (vizResult.errorKind) {
      setBlocksRun({ errorKind: vizResult.errorKind, error: vizResult.error });
      trackBlocksProgramRun(algorithm, false);
      return;
    }
    const run = runInputRef.current;
    if (!run) return;
    // "Generate New Input" during a run (e.g. while Pyodide loads): these
    // steps belong to the old input, so don't play them over the new one.
    if (!isSameRunInput(run, currentInputRef.current)) {
      setBlocksRun({ kind: run.kind, inputChanged: true });
      return;
    }
    const events = vizResult.events ?? [];
    let built;
    if (run.kind === 'search') {
      built = buildSearchProgramSteps(
        events,
        run.array,
        run.target,
        vizResult.result,
        algorithm
      );
    } else if (run.kind === 'path') {
      built = buildPathProgramSteps(
        events,
        run.grid.grid,
        run.grid.start,
        run.grid.end,
        vizResult.finalArray,
        run.functionName
      );
    } else if (run.kind === 'graph' && algorithm === 'floydWarshallAlgorithm') {
      built = buildMatrixProgramSteps(
        events,
        run.graph,
        vizResult.finalArray,
        run.functionName
      );
    } else if (run.kind === 'graph') {
      built = buildGraphProgramSteps(
        events,
        run.graph,
        algorithm,
        vizResult.finalArray,
        run.functionName,
        Boolean(vizResult.noReturn)
      );
    } else if (run.kind === 'tree') {
      built = buildTreeProgramSteps(
        events,
        run.tree,
        algorithm,
        vizResult.finalArray,
        run.functionName
      );
    } else {
      built = buildProgramSteps(
        events,
        run.array,
        vizResult.finalArray,
        run.functionName
      );
    }
    const {
      steps,
      solved,
      sorted,
      shortest,
      got,
      expected,
      threadsLeft,
      valuesChanged,
      noReturn,
    } = built;
    const isSolved = Boolean(solved ?? sorted);
    setBlocksRun({
      kind: run.kind,
      solved: isSolved,
      stepCount: steps.length,
      target: run.target,
      index: vizResult.result,
      length: vizResult.finalArray?.length ?? 0,
      shortest,
      got,
      expected,
      threadsLeft,
      valuesChanged,
      noReturn,
    });
    trackBlocksProgramRun(algorithm, isSolved);
    onProgramStepsRef.current?.(steps);
    // Only a new worker result should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vizResult]);

  // Blocks output comes from `blocksRun`, not the hook's output/error.
  const handleClearOutput = useCallback(() => {
    clearOutput();
    setBlocksRun(null);
  }, [clearOutput]);

  // A correct bogo sort usually gives up (1000 shuffles), like its visualization.
  let blocksOutputKey =
    blocksRun && BLOCKS_OUTPUT_KEYS[blocksRun.kind]?.[blocksRun.solved ? 0 : 1];
  if (blocksRun?.inputChanged) {
    blocksOutputKey = 'run_input_changed';
  } else if (blocksRun?.valuesChanged) {
    blocksOutputKey = 'run_values_changed';
  } else if (blocksRun?.noReturn) {
    blocksOutputKey = 'run_graph_no_return';
  } else if (blocksRun && !blocksRun.solved && algorithm === 'bogoSort') {
    blocksOutputKey = 'run_gave_up';
  } else if (blocksRun?.solved && blocksRun.length > blocksRun.shortest) {
    // A valid path still passes; say when it isn't a shortest one.
    blocksOutputKey =
      blocksRun.kind === 'graph' ? 'run_graph_path_longer' : 'run_path_longer';
  } else if (blocksRun?.threadsLeft) {
    // Right order, but Morris left threads in the tree.
    blocksOutputKey = 'run_tree_threads_left';
  }
  const blocksOutput =
    blocksRun && !blocksRun.errorKind
      ? t(`python_code.blocks.${blocksOutputKey}`, {
          count: blocksRun.stepCount,
          target: blocksRun.target,
          index: blocksRun.index,
          length: blocksRun.length,
          shortest: blocksRun.shortest,
          got: blocksRun.got,
          expected: blocksRun.expected,
          threads: blocksRun.threadsLeft,
        })
      : '';
  const blocksError = !blocksRun?.errorKind
    ? null
    : blocksRun.errorKind === 'loop-limit'
      ? t('python_code.blocks.loop_error')
      : t('python_code.blocks.runtime_error', { error: blocksRun.error });

  // Lines of the Split view's Python to highlight: the block behind the
  // playing step, otherwise the block the learner selected.
  const highlightedLines = useMemo(() => {
    const blockId = activeBlockId ?? selectedBlockId;
    if (!program || !blockId) return [];
    const statementId = program.statementIds[blockId] ?? blockId;
    return program.lineBlockIds.flatMap((id, index) =>
      id === statementId ? [index + 1] : []
    );
  }, [program, activeBlockId, selectedBlockId]);

  useEffect(() => {
    const editor = splitEditorRef.current;
    if (!editor || !monacoRef.current) return;
    const { Range } = monacoRef.current;
    const decorations = highlightedLines.map(line => ({
      range: new Range(line, 1, line, 1),
      options: { isWholeLine: true, className: 'bf-active-line' },
    }));
    if (splitDecorationsRef.current) {
      splitDecorationsRef.current.set(decorations);
    } else {
      splitDecorationsRef.current =
        editor.createDecorationsCollection(decorations);
    }
    if (highlightedLines[0])
      editor.revealLineInCenterIfOutsideViewport(highlightedLines[0]);
  }, [highlightedLines, isBlocksView, canSplit]);

  const handleRunTests = useCallback(() => {
    if (!predefined?.functionName || testCases.length === 0) return;
    runTests(code, predefined.functionName, testCases);
    setIsOutputExpanded(true);
  }, [code, predefined, testCases, runTests]);

  useEffect(() => {
    setCode(pythonCode);
  }, [pythonCode]);

  // A new algorithm opens on Python, except that Blocks stays on Blocks.
  useEffect(() => {
    setActiveCodeTab(tab => (tab === 'blocks' ? tab : 'python'));
  }, [algorithm]);

  useEffect(() => {
    clearOutput();
    clearTestResults();
    return () => cancelExecution();
  }, [algorithm, cancelExecution, clearOutput, clearTestResults]);

  // Clear the last run's result on algorithm change. `program` is left alone:
  // the workspace re-reports it, and a reset here would race its mount effect.
  useEffect(() => {
    setBlocksRun(null);
    setSelectedBlockId(null);
  }, [algorithm]);

  // Reset can't be undone (it also drops the saved program): the first click
  // only arms it, a second one within RESET_CONFIRM_MS resets.
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    if (!confirmReset) return;
    const timer = setTimeout(() => setConfirmReset(false), RESET_CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirmReset]);
  useEffect(() => setConfirmReset(false), [algorithm]);
  const handleResetBlocks = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    blocksRef.current?.resetToStarter();
  };

  const handleRun = useCallback(() => {
    if (status === 'running') return;
    runCode(code);
    setIsOutputExpanded(true);
  }, [code, runCode, status]);

  const runHandlerRef = useRef(handleRun);
  runHandlerRef.current = handleRun;

  // Update Monaco editor theme when theme changes
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const newTheme = isDark ? 'vs-dark' : 'vs-light';
      monacoRef.current.editor.setTheme(newTheme);
    }
  }, [isDark]);

  useEffect(() => {
    if (!isOpen) {
      setMountEditor(false);
    } else if (reduceMotion) {
      setMountEditor(true);
    }
  }, [isOpen, reduceMotion]);

  const toggleOutput = () => setIsOutputExpanded(prev => !prev);
  // The Blocks tab gets Run + verdict only: no code reset, no tests.
  const consoleProps = isBlocksView
    ? {
        output: blocksOutput,
        error: blocksError,
        onClear: handleClearOutput,
        isExpanded: isOutputExpanded,
        onToggleExpand: toggleOutput,
        onRun: handleRunBlocks,
      }
    : {
        output,
        error,
        onClear: clearOutput,
        isExpanded: isOutputExpanded,
        onToggleExpand: toggleOutput,
        onRun: handleRun,
        onReset: () => setCode(pythonCode),
        isModified,
        testCases,
        testResults,
        testStatus,
        testError,
        onRunTests: handleRunTests,
        onAddTestCase: handleAddTestCase,
        onEditTestCase: handleEditTestCase,
        onDeleteTestCase: handleDeleteTestCase,
        onClearTestResults: clearTestResults,
      };

  const panelVariants = isMobile
    ? sheetPanelVariants()
    : drawerPanelVariants(isRTL);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (not while docked beside the visualizer) */}
          {!isDocked && (
            <motion.div
              className={`fixed inset-0 ${OVERLAY_CLASS_LIGHT} z-[55]`}
              style={!isMobile ? { top: '56px' } : {}}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeOverlayTransition(reduceMotion)}
              onClick={onClose}
            />
          )}

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={`
              fixed z-[60] bg-surface shadow-xl overscroll-contain
              ${
                isMobile
                  ? 'inset-0'
                  : `${isRTL ? 'left-0' : 'right-0'} w-full top-14 bottom-0 ${isDocked ? 'border-s border-[var(--color-border-strong)]' : 'max-w-2xl'}`
              }
            `}
            style={dockWidth ? { width: dockWidth } : undefined}
            data-docked={isDocked || undefined}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={getChromeTransition(reduceMotion)}
            onAnimationComplete={definition => {
              if (definition === 'visible' || definition === undefined) {
                setMountEditor(true);
              }
            }}
          >
            <div className={`flex flex-col h-full ${!isMobile ? 'pt-2' : ''}`}>
              {/* Header - show on mobile */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {t('python_code.title')}: {displayName}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center h-touch w-touch min-h-touch min-w-touch rounded-lg bg-surface-elevated text-text-primary hover:bg-border touch-manipulation"
                    aria-label={t('python_code.close')}
                  >
                    <X size={20} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* Pseudocode vs Python (pseudocode first) */}
              <div className="mx-2 shrink-0 flex items-center gap-2">
                <div
                  className="flex-1 flex rounded-lg border-2 border-[var(--color-border-strong)] overflow-hidden bg-surface-elevated"
                  role="tablist"
                  aria-label={t('python_code.title')}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCodeTab === 'pseudocode'}
                    onClick={() => setActiveCodeTab('pseudocode')}
                    className={`flex-1 px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all duration-200 touch-manipulation ${
                      activeCodeTab === 'pseudocode'
                        ? 'bg-theme-primary-consistent text-white shadow-md'
                        : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
                    }`}
                  >
                    {t('python_code.tabPseudocode')}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCodeTab === 'python'}
                    onClick={() => setActiveCodeTab('python')}
                    className={`flex-1 px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all duration-200 touch-manipulation ${
                      activeCodeTab === 'python'
                        ? 'bg-theme-primary-consistent text-white shadow-md'
                        : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
                    }`}
                  >
                    {t('python_code.tabPython')}
                  </button>
                  {canDock && (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isBlocksTab}
                      onClick={selectBlocksTab}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all duration-200 touch-manipulation ${
                        isBlocksTab
                          ? 'bg-theme-primary-consistent text-white shadow-md'
                          : `bg-transparent hover:bg-bg cursor-pointer ${supportsBlocks ? 'text-text-primary' : 'text-text-tertiary'}`
                      }`}
                    >
                      {t('python_code.tabBlocks')}
                      {!supportsBlocks && (
                        <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-text-secondary">
                          {t('python_code.blocks.soon_badge')}
                        </span>
                      )}
                    </button>
                  )}
                </div>
                {/* Docked: no backdrop to click and the sidebar is hidden, so
                    say plainly how to get the normal layout back. */}
                {isDocked && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-1.5 h-touch min-h-touch px-3 rounded-lg bg-surface-elevated text-sm font-medium text-text-primary hover:bg-border whitespace-nowrap"
                  >
                    <X size={18} weight="bold" aria-hidden="true" />
                    {t('python_code.blocks.exit')}
                  </button>
                )}
              </div>

              {isBlocksView && (
                <div className="mx-2 mt-2 shrink-0 flex justify-end text-xs">
                  <button
                    type="button"
                    onClick={handleResetBlocks}
                    aria-live="polite"
                    className={`rounded-md px-2 py-1 min-h-[32px] hover:bg-surface-elevated ${
                      confirmReset
                        ? 'font-medium text-red-600 dark:text-red-400'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {confirmReset
                      ? t('python_code.blocks.reset_confirm')
                      : t('python_code.blocks.reset_blocks')}
                  </button>
                </div>
              )}

              {isBlocksTab && !supportsBlocks ? (
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-text-secondary">
                  <h3 className="text-lg font-medium text-text-primary">
                    {t('python_code.blocks.coming_soon')}
                  </h3>
                  <p className="text-sm">
                    {t('python_code.blocks.coming_soon_desc')}
                  </p>
                </div>
              ) : activeCodeTab === 'pseudocode' ? (
                <div className="flex-1 min-h-0 flex flex-col p-2">
                  <pre
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className="pseudocode-view flex-1 min-h-0 overflow-auto rounded-lg p-4 leading-relaxed shadow-inner"
                  >
                    <code
                      className="block w-full font-mono text-sm [word-spacing:normal]"
                      dangerouslySetInnerHTML={{ __html: pseudocodeHtml }}
                    />
                  </pre>
                </div>
              ) : !pythonCode ? (
                <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-0">
                  {!isMobile && (
                    <button
                      type="button"
                      onClick={onClose}
                      className={`self-end mb-2 p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors ${isRTL ? 'ml-auto' : 'mr-auto'}`}
                      aria-label={t('python_code.close')}
                    >
                      <X size={20} weight="bold" />
                    </button>
                  )}
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary">
                    <div className="text-6xl mb-4">🐍</div>
                    <h3 className="text-lg font-medium mb-2 text-text-primary">
                      {t('python_code.not_available') ||
                        'No Python Implementation Available'}
                    </h3>
                    <p className="text-sm">
                      {t('python_code.not_available_desc', {
                        algorithm: displayName,
                      }) ||
                        `Python code for ${displayName} is not yet available.`}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Code Editor + Output (resizable on desktop) */}
                  <div className="flex-1 min-h-0 flex flex-col p-2" dir="ltr">
                    <div
                      ref={resizeContainerRef}
                      className="min-h-0 flex flex-col overflow-hidden flex-1"
                    >
                      <div
                        className={`min-h-0 overflow-hidden ${isMobile ? 'touch-pan-y' : ''}`}
                        style={{
                          flex:
                            isMobile || !isOutputExpanded
                              ? '1 1 0'
                              : `0 0 calc(${100 - outputHeightPercent}% - 2px)`,
                          minHeight: isMobile ? 100 : 80,
                        }}
                      >
                        {isBlocksView ? (
                          <div
                            ref={blocksSplitRef}
                            className={`flex h-full min-h-0 ${canSplit ? 'flex-row' : 'flex-col'}`}
                          >
                            <div className="flex-1 min-w-0 min-h-0 rounded-lg overflow-hidden border border-[var(--color-border-strong)]">
                              <Suspense
                                fallback={
                                  <div className="flex h-full items-center justify-center text-text-secondary">
                                    {t('python_code.loading')}
                                  </div>
                                }
                              >
                                <BlocksWorkspace
                                  ref={blocksRef}
                                  algorithmKey={algorithm}
                                  starter={blocksStarter}
                                  isRTL={isRTL}
                                  isDark={isDark}
                                  // Stacked layout: too narrow for an always-open flyout.
                                  isCompact={!canSplit}
                                  activeBlockId={activeBlockId}
                                  onProgramChange={setProgram}
                                  onSelectBlock={setSelectedBlockId}
                                />
                              </Suspense>
                            </div>
                            <div
                              role="separator"
                              tabIndex={0}
                              aria-orientation={
                                canSplit ? 'vertical' : 'horizontal'
                              }
                              aria-valuenow={100 - blocksPythonPercent}
                              aria-valuemin={100 - MAX_BLOCKS_PYTHON_PERCENT}
                              aria-valuemax={100 - MIN_BLOCKS_PYTHON_PERCENT}
                              aria-label={t('python_code.blocks.resize_split')}
                              data-testid="blocks-split-handle"
                              onMouseDown={e => {
                                e.preventDefault();
                                setIsResizingBlocksSplit(true);
                              }}
                              onKeyDown={handleBlocksSplitKeyDown}
                              className={`shrink-0 flex items-center justify-center group rounded-full transition-colors hover:bg-blue-500/30 focus-visible:outline-none focus-visible:bg-blue-500/40 ${
                                canSplit
                                  ? 'w-2 mx-0.5 cursor-col-resize'
                                  : 'h-2 my-0.5 cursor-row-resize'
                              } ${isResizingBlocksSplit ? 'bg-blue-500/50' : ''}`}
                            >
                              <div
                                className={`rounded-full bg-gray-400 opacity-0 group-hover:opacity-100 group-hover:bg-blue-500 group-focus-visible:opacity-100 ${
                                  canSplit ? 'w-0.5 h-12' : 'h-0.5 w-12'
                                }`}
                              />
                            </div>
                            <div
                              className="min-h-0 min-w-0 rounded-lg overflow-hidden"
                              style={{ flex: `0 0 ${blocksPythonPercent}%` }}
                              data-testid="split-python"
                            >
                              <Editor
                                height="100%"
                                defaultLanguage="python"
                                value={program?.displayCode ?? ''}
                                theme={isDark ? 'vs-dark' : 'vs-light'}
                                onMount={(editor, monaco) => {
                                  splitEditorRef.current = editor;
                                  splitDecorationsRef.current = null;
                                  monacoRef.current = monaco;
                                }}
                                options={{
                                  readOnly: true,
                                  domReadOnly: true,
                                  minimap: { enabled: false },
                                  scrollBeyondLastLine: false,
                                  fontSize: 13,
                                  lineNumbers: 'on',
                                  wordWrap: 'on',
                                  automaticLayout: true,
                                  padding: { top: 12, bottom: 12 },
                                  // Its pinned header hid the line below it.
                                  stickyScroll: { enabled: false },
                                }}
                              />
                            </div>
                          </div>
                        ) : mountEditor ? (
                          <Editor
                            height="100%"
                            defaultLanguage="python"
                            value={code}
                            onChange={value => setCode(value ?? '')}
                            theme={isDark ? 'vs-dark' : 'vs-light'}
                            onMount={(editor, monaco) => {
                              editorRef.current = editor;
                              monacoRef.current = monaco;
                              editor.addAction({
                                id: 'run-python',
                                label: 'Run Python',
                                keybindings: [
                                  monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                                ],
                                run: () => runHandlerRef.current?.(),
                              });
                              if (isMobile) {
                                const container =
                                  editor.getContainerDomNode?.();
                                if (container) {
                                  container.style.touchAction = 'pan-y';
                                  const scrollable =
                                    container.querySelector(
                                      '.monaco-scrollable-element'
                                    ) ??
                                    container.querySelector(
                                      '[class*="scrollable"]'
                                    );
                                  if (scrollable) {
                                    scrollable.style.webkitOverflowScrolling =
                                      'touch';
                                  }
                                }
                              }
                            }}
                            options={{
                              readOnly: false,
                              minimap: { enabled: !isMobile },
                              scrollBeyondLastLine: false,
                              fontSize: isMobile ? 12 : 14,
                              lineNumbers: 'on',
                              folding: true,
                              wordWrap: 'on',
                              automaticLayout: true,
                              padding: { top: 16, bottom: 16 },
                              scrollbar: {
                                vertical: 'auto',
                                horizontal: 'auto',
                              },
                            }}
                            loading={
                              <div className="flex items-center justify-center h-full bg-surface">
                                <div className="text-text-secondary">
                                  {t('python_code.loading') ||
                                    'Loading editor...'}
                                </div>
                              </div>
                            }
                          />
                        ) : (
                          <div
                            className="flex h-full items-center justify-center bg-surface animate-pulse"
                            aria-hidden="true"
                          >
                            <div className="h-8 w-8 rounded-md bg-surface-elevated" />
                          </div>
                        )}
                      </div>
                      {!isMobile && isOutputExpanded && (
                        <div
                          role="separator"
                          aria-orientation="horizontal"
                          aria-valuenow={outputHeightPercent}
                          aria-valuemin={MIN_OUTPUT_PERCENT}
                          aria-valuemax={MAX_OUTPUT_PERCENT}
                          aria-label={t('python_code.resize_output', {
                            defaultValue: 'Resize output panel',
                          })}
                          onMouseDown={handleResizeStart}
                          className={`shrink-0 h-1 flex items-center justify-center cursor-row-resize hover:bg-blue-500/30 active:bg-blue-500/50 transition-colors group ${
                            isResizing
                              ? 'bg-blue-500/50'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <div className="w-12 h-0.5 rounded-full bg-gray-400 group-hover:bg-blue-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
                        </div>
                      )}
                      {isOutputExpanded && (
                        <div
                          className="min-h-0 overflow-hidden flex flex-col shrink-0"
                          style={{
                            flex: isMobile
                              ? '0 0 auto'
                              : `0 0 calc(${outputHeightPercent}% - 2px)`,
                            minHeight: !isMobile ? 80 : undefined,
                          }}
                        >
                          <OutputConsole status={status} {...consoleProps} />
                        </div>
                      )}
                    </div>
                    {!isOutputExpanded && (
                      <div className="shrink-0 z-10">
                        <OutputConsole status={status} {...consoleProps} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PythonCodePanel;
