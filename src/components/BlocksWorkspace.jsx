/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Blockly workspace for the code panel's Blocks tab. Lazy-loaded so
 * Blockly never ships with the main bundle.
 */

import { useEffect, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { registerBlocks, applyBlockMessages } from '../blocks/definitions';
import { generateProgram } from '../blocks/generators';

const BLOCKLY_LOCALES = {
  en: () => import('blockly/msg/en'),
  fr: () => import('blockly/msg/fr'),
  ar: () => import('blockly/msg/ar'),
};
const SAVE_DELAY_MS = 300;

const getWorkspaceStorageKey = algorithmKey =>
  `bayan-flow:blocks-workspace:v2:${algorithmKey}`;

function readStoredWorkspace(algorithmKey) {
  try {
    const raw = localStorage.getItem(getWorkspaceStorageKey(algorithmKey));
    const json = raw ? JSON.parse(raw) : null;
    // A saved program always keeps its (undeletable) define block; anything
    // else is a failed load that was saved, so fall back to the starter.
    return json?.blocks?.blocks?.length ? json : null;
  } catch {
    return null;
  }
}

/** Only edits are stored, so an untouched algorithm keeps getting the latest starter. */
function writeStoredWorkspace(algorithmKey, json) {
  try {
    const key = getWorkspaceStorageKey(algorithmKey);
    if (json) localStorage.setItem(key, JSON.stringify(json));
    else localStorage.removeItem(key);
  } catch {
    // Storage unavailable: the workspace still works for this session.
  }
}

function cssToken(name, fallback) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function buildTheme(isDark) {
  return Blockly.Theme.defineTheme(isDark ? 'bayan-dark' : 'bayan-light', {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: cssToken('--color-bg', '#f9fafb'),
      toolboxBackgroundColour: cssToken('--color-surface', '#ffffff'),
      flyoutBackgroundColour: cssToken('--color-surface-elevated', '#f2f4f7'),
      flyoutOpacity: 1,
      scrollbarColour: isDark ? '#4b5563' : '#cbd5e1',
      insertionMarkerColour: isDark ? '#ffffff' : '#000000',
    },
  });
}

/** @param {boolean} [tidy] - stack a starter's functions (not a saved layout) */
function loadInto(workspace, json, tidy = false) {
  Blockly.Events.disable();
  try {
    workspace.clear();
    Blockly.serialization.workspaces.load(json, workspace);
    if (tidy) workspace.cleanUp();
  } finally {
    Blockly.Events.enable();
  }
  frameProgram(workspace);
}

/** Below this, block text gets too small to read. */
const MIN_FIT_SCALE = 0.6;

/**
 * No zoom buttons, so frame the program: fit it (never above 100%); if that
 * would make it unreadable, keep a readable size and show its top instead.
 */
function frameProgram(workspace) {
  workspace.zoomToFit();
  const fitScale = workspace.getScale();
  if (fitScale >= MIN_FIT_SCALE) {
    workspace.setScale(Math.min(1, fitScale));
    workspace.scrollCenter();
    return;
  }
  workspace.setScale(MIN_FIT_SCALE);
  const hat =
    workspace.getBlockById('bf_hat') ?? workspace.getTopBlocks(true)[0];
  if (!hat) return;
  // The hat's label sits at its start edge: the right one in RTL.
  const { top, left, right } = hat.getBoundingRectangle();
  const start = workspace.RTL ? right - 40 : left;
  workspace.scrollBoundsIntoView(
    new Blockly.utils.Rect(top, top + 40, start, start + 40)
  );
}

/**
 * @param {Object} props
 * @param {string} props.algorithmKey
 * @param {{ workspace: object, toolbox: object }} props.starter
 * @param {boolean} props.isRTL
 * @param {boolean} props.isDark
 * @param {boolean} [props.isCompact] - Narrow drawer or phone: collapsible toolbox, smaller zoom.
 * @param {string|null} props.activeBlockId - Block that produced the playing step.
 * @param {(program: ReturnType<typeof generateProgram>) => void} props.onProgramChange
 * @param {(blockId: string|null) => void} props.onSelectBlock
 * @param {import('react').Ref<{ resetToStarter: () => void }>} props.ref
 */
function BlocksWorkspace({
  algorithmKey,
  starter,
  isRTL,
  isDark,
  isCompact = false,
  activeBlockId,
  onProgramChange,
  onSelectBlock,
  ref,
}) {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const workspaceRef = useRef(null);
  /**
   * Workspace JSON per algorithm for this session. Re-injection (theme,
   * language, layout) restores it so block ids, which playing steps refer to,
   * survive; localStorage only keeps edits.
   */
  const sessionJsonRef = useRef({});
  const callbacksRef = useRef({ onProgramChange, onSelectBlock });
  callbacksRef.current = { onProgramChange, onSelectBlock };
  const language = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2);

  useImperativeHandle(ref, () => {
    return {
      resetToStarter: () => {
        const workspace = workspaceRef.current;
        if (!workspace) return;
        loadInto(workspace, starter.workspace, true);
        writeStoredWorkspace(algorithmKey, null);
        delete sessionJsonRef.current[algorithmKey];
        callbacksRef.current.onProgramChange(generateProgram(workspace));
      },
    };
  }, [algorithmKey, starter]);

  // Inject (and re-inject on language/RTL/theme change: Blockly can't switch
  // those live). A pending edit is saved first so nothing is lost.
  useEffect(() => {
    let cancelled = false;
    let workspace = null;
    let saveTimer = null;
    let resizeObserver = null;
    const listeners = new AbortController();
    const sessionJson = sessionJsonRef.current;

    const save = () => {
      saveTimer = null;
      if (workspace) {
        writeStoredWorkspace(
          algorithmKey,
          Blockly.serialization.workspaces.save(workspace)
        );
      }
    };

    (async () => {
      const locale = await (BLOCKLY_LOCALES[language] ?? BLOCKLY_LOCALES.en)();
      if (cancelled || !containerRef.current) return;
      Blockly.setLocale(locale);
      applyBlockMessages(t);
      registerBlocks();

      workspace = Blockly.inject(containerRef.current, {
        // Stacked layout: a collapsible category instead of an always-open
        // flyout, which would cover most of a narrow workspace.
        toolbox: isCompact
          ? {
              kind: 'categoryToolbox',
              contents: [
                {
                  kind: 'category',
                  name: t('python_code.blocks.toolbox'),
                  colour: '#3b82f6',
                  contents: starter.toolbox.contents,
                },
              ],
            }
          : starter.toolbox,
        rtl: isRTL,
        // No UI sounds (project rule); media served locally (CSP).
        sounds: false,
        media: '/blockly-media/',
        renderer: 'zelos',
        theme: buildTheme(isDark),
        // A clean canvas: delete by dragging back to the toolbox or Delete.
        trashcan: false,
        // No zooming at all (no buttons, no wheel/pinch zoom); the program is
        // framed automatically and the wheel scrolls it instead.
        zoom: {
          controls: false,
          wheel: false,
          pinch: false,
          startScale: isCompact ? 0.6 : 0.75,
        },
        move: { scrollbars: true, drag: true, wheel: true },
      });
      workspaceRef.current = workspace;

      const saved =
        sessionJson[algorithmKey] ?? readStoredWorkspace(algorithmKey);
      try {
        loadInto(workspace, saved ?? starter.workspace, !saved);
      } catch {
        loadInto(workspace, starter.workspace, true);
      }
      callbacksRef.current.onProgramChange(generateProgram(workspace));

      workspace.addChangeListener(event => {
        if (event.type === Blockly.Events.SELECTED) {
          callbacksRef.current.onSelectBlock(event.newElementId ?? null);
          return;
        }
        if (event.isUiEvent) return;
        callbacksRef.current.onProgramChange(generateProgram(workspace));
        clearTimeout(saveTimer);
        saveTimer = setTimeout(save, SAVE_DELAY_MS);
      });

      // Re-frame while the panel animates/resizes, until the learner scrolls
      // or zooms the workspace themselves.
      let autoFrame = true;
      const stopAutoFrame = () => (autoFrame = false);
      const { signal } = listeners;
      containerRef.current.addEventListener('pointerdown', stopAutoFrame, {
        signal,
      });
      containerRef.current.addEventListener('wheel', stopAutoFrame, { signal });
      resizeObserver = new ResizeObserver(() => {
        Blockly.svgResize(workspace);
        if (autoFrame) frameProgram(workspace);
      });
      resizeObserver.observe(containerRef.current);
    })();

    return () => {
      cancelled = true;
      clearTimeout(saveTimer);
      resizeObserver?.disconnect();
      listeners.abort();
      if (saveTimer) save();
      if (workspace) {
        sessionJson[algorithmKey] =
          Blockly.serialization.workspaces.save(workspace);
      }
      workspace?.dispose();
      workspaceRef.current = null;
    };
    // `t` changes with the language, which is already a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, starter, language, isRTL, isDark, isCompact]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const exists = activeBlockId && workspace.getBlockById(activeBlockId);
    workspace.highlightBlock(exists ? activeBlockId : null);
  }, [activeBlockId]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[240px]"
      data-testid="blocks-workspace"
      aria-label={t('python_code.blocks.workspaceLabel')}
      role="region"
    />
  );
}

export default BlocksWorkspace;
