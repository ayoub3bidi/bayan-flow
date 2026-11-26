/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * BlocksWorkspace with Blockly mocked (jsdom can't render its SVG): locale
 * fallback, Reset vs. a queued save, and the step highlight after re-injection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, createRef } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithI18n } from '../test/testUtils';
import BlocksWorkspace from './BlocksWorkspace';

const blockly = vi.hoisted(() => ({ workspaces: [], listeners: [] }));
const locale = vi.hoisted(() => ({ fail: false }));

vi.mock('blockly/core', () => {
  const makeWorkspace = () => {
    const workspace = {
      RTL: false,
      clear: vi.fn(),
      cleanUp: vi.fn(),
      zoomToFit: vi.fn(),
      getScale: () => 1,
      setScale: vi.fn(),
      scrollCenter: vi.fn(),
      getBlockById: id => (id === 'cmp' ? { id } : null),
      getTopBlocks: () => [],
      highlightBlock: vi.fn(),
      addChangeListener: fn => blockly.listeners.push(fn),
      dispose: vi.fn(),
    };
    blockly.workspaces.push(workspace);
    return workspace;
  };
  return {
    inject: vi.fn(() => makeWorkspace()),
    setLocale: vi.fn(),
    svgResize: vi.fn(),
    Events: { disable: vi.fn(), enable: vi.fn(), SELECTED: 'selected' },
    serialization: {
      workspaces: { load: vi.fn(), save: vi.fn(() => ({ edited: true })) },
    },
    Theme: { defineTheme: vi.fn(() => ({})) },
    Themes: { Classic: {} },
    utils: { Rect: vi.fn() },
  };
});
vi.mock('blockly/blocks', () => ({}));
vi.mock('../blocks/blocklyLocales', () => ({
  loadBlocklyLocale: vi.fn(async () => {
    if (locale.fail) throw new Error('chunk failed');
    return {};
  }),
}));
vi.mock('../blocks/definitions', () => ({
  registerBlocks: vi.fn(),
  applyBlockMessages: vi.fn(),
}));
vi.mock('../blocks/generators', () => ({
  generateProgram: vi.fn(() => ({ kind: 'sort', functionName: 'f' })),
}));

// The first load awaits the component's async init; allow for a loaded CI box.
const LOAD = { timeout: 5000 };
const STARTER = { workspace: { starter: true }, toolbox: { contents: [] } };

function renderWorkspace(props = {}) {
  const onProgramChange = vi.fn();
  const ref = createRef();
  const element = extra => (
    <BlocksWorkspace
      ref={ref}
      algorithmKey="bubbleSort"
      starter={STARTER}
      isRTL={false}
      isDark={false}
      activeBlockId={null}
      onProgramChange={onProgramChange}
      onSelectBlock={vi.fn()}
      {...props}
      {...extra}
    />
  );
  const utils = renderWithI18n(element());
  return { ...utils, ref, onProgramChange, element };
}

describe('BlocksWorkspace', () => {
  let store;

  beforeEach(() => {
    blockly.workspaces.length = 0;
    blockly.listeners.length = 0;
    locale.fail = false;
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: key => store[key] ?? null,
      setItem: (key, value) => {
        store[key] = value;
      },
      removeItem: key => {
        delete store[key];
      },
    });
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('shows a retryable error when even English fails to load', async () => {
    locale.fail = true;
    renderWorkspace();
    expect(await screen.findByRole('alert', {}, LOAD)).toBeInTheDocument();
    expect(blockly.workspaces).toHaveLength(0);

    locale.fail = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(blockly.workspaces).toHaveLength(1), LOAD);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('publishes the program tagged with its algorithm', async () => {
    const { onProgramChange } = renderWorkspace();
    await waitFor(
      () =>
        expect(onProgramChange).toHaveBeenCalledWith({
          kind: 'sort',
          functionName: 'f',
          algorithmKey: 'bubbleSort',
        }),
      LOAD
    );
  });

  it('cancels a queued save on Reset so the edit is not written back', async () => {
    const { ref } = renderWorkspace();
    await waitFor(() => expect(blockly.listeners).toHaveLength(1), LOAD);
    vi.useFakeTimers();
    // A learner edit queues a debounced save…
    act(() => blockly.listeners[0]({ type: 'change', isUiEvent: false }));
    // …and Reset lands before it fires.
    act(() => ref.current.resetToStarter());
    act(() => vi.advanceTimersByTime(1000));

    expect(store['bayan-flow:blocks-workspace:v2:bubbleSort']).toBeUndefined();
  });

  it('re-applies the paused step highlight to a re-injected workspace', async () => {
    const { rerender, element } = renderWorkspace({ activeBlockId: 'cmp' });
    await waitFor(() => expect(blockly.workspaces).toHaveLength(1), LOAD);
    rerender(element({ activeBlockId: 'cmp', isDark: true }));

    await waitFor(() => expect(blockly.workspaces).toHaveLength(2), LOAD);
    await waitFor(
      () =>
        expect(blockly.workspaces[1].highlightBlock).toHaveBeenCalledWith(
          'cmp'
        ),
      LOAD
    );
  });
});
