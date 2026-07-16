/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen, waitFor } from '../test/testUtils';
import AlgorithmNotesTab from './AlgorithmNotesTab';
import { ALGORITHM_TYPES } from '@/constants';

vi.mock('./NoteEditor', () => ({
  default: ({ content, onUpdate }) => (
    <textarea
      data-testid="note-editor"
      defaultValue={content}
      onChange={event => onUpdate(event.target.value)}
    />
  ),
}));

vi.mock('@/hooks/useNoteAutosave', () => ({
  useNoteAutosave: vi.fn(() => ({
    initialHtml: '<p>note</p>',
    isLoadingNote: false,
    saveStatus: 'idle',
    scheduleSave: vi.fn(),
    flushSave: vi.fn(async () => {}),
  })),
}));

import { useNoteAutosave } from '@/hooks/useNoteAutosave';

describe('AlgorithmNotesTab', () => {
  const user = { id: 'user-1' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows sign-in message when user is missing', () => {
    renderWithI18n(
      <AlgorithmNotesTab
        user={null}
        categoryType={ALGORITHM_TYPES.SORTING}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        isActive={true}
      />
    );

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('registers flush callback for parent panel', async () => {
    const onRegisterFlush = vi.fn();
    const flushSave = vi.fn(async () => {});
    vi.mocked(useNoteAutosave).mockReturnValue({
      initialHtml: '',
      isLoadingNote: false,
      saveStatus: 'idle',
      scheduleSave: vi.fn(),
      flushSave,
    });

    const { unmount } = renderWithI18n(
      <AlgorithmNotesTab
        user={user}
        categoryType={ALGORITHM_TYPES.SORTING}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        isActive={true}
        onRegisterFlush={onRegisterFlush}
      />
    );

    await waitFor(() => {
      expect(onRegisterFlush).toHaveBeenCalledWith(flushSave);
    });

    unmount();
    expect(onRegisterFlush).toHaveBeenLastCalledWith(null);
  });

  it('renders lazy editor for signed-in users', async () => {
    renderWithI18n(
      <AlgorithmNotesTab
        user={user}
        categoryType={ALGORITHM_TYPES.SORTING}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        isActive={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('note-editor')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching the note', () => {
    vi.mocked(useNoteAutosave).mockReturnValue({
      initialHtml: '',
      isLoadingNote: true,
      saveStatus: 'idle',
      scheduleSave: vi.fn(),
      flushSave: vi.fn(async () => {}),
    });

    renderWithI18n(
      <AlgorithmNotesTab
        user={user}
        categoryType={ALGORITHM_TYPES.SORTING}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        isActive={true}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows saving status text when saving', () => {
    vi.mocked(useNoteAutosave).mockReturnValue({
      initialHtml: '<p>note</p>',
      isLoadingNote: false,
      saveStatus: 'saving',
      scheduleSave: vi.fn(),
      flushSave: vi.fn(async () => {}),
    });

    renderWithI18n(
      <AlgorithmNotesTab
        user={user}
        categoryType={ALGORITHM_TYPES.SORTING}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        isActive={true}
      />
    );

    expect(screen.getByText(/Saving/)).toBeInTheDocument();
  });

  it('shows saved status text when saved', () => {
    vi.mocked(useNoteAutosave).mockReturnValue({
      initialHtml: '<p>note</p>',
      isLoadingNote: false,
      saveStatus: 'saved',
      scheduleSave: vi.fn(),
      flushSave: vi.fn(async () => {}),
    });

    renderWithI18n(
      <AlgorithmNotesTab
        user={user}
        categoryType={ALGORITHM_TYPES.SORTING}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        isActive={true}
      />
    );

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('shows error status text when save fails', () => {
    vi.mocked(useNoteAutosave).mockReturnValue({
      initialHtml: '<p>note</p>',
      isLoadingNote: false,
      saveStatus: 'error',
      scheduleSave: vi.fn(),
      flushSave: vi.fn(async () => {}),
    });

    renderWithI18n(
      <AlgorithmNotesTab
        user={user}
        categoryType={ALGORITHM_TYPES.SORTING}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        isActive={true}
      />
    );

    expect(screen.getByText(/retrying/)).toBeInTheDocument();
  });

  it('shows unsaved status text when dirty', () => {
    vi.mocked(useNoteAutosave).mockReturnValue({
      initialHtml: '<p>note</p>',
      isLoadingNote: false,
      saveStatus: 'dirty',
      scheduleSave: vi.fn(),
      flushSave: vi.fn(async () => {}),
    });

    renderWithI18n(
      <AlgorithmNotesTab
        user={user}
        categoryType={ALGORITHM_TYPES.SORTING}
        algorithmKey="bubbleSort"
        algorithmName="Bubble Sort"
        isActive={true}
      />
    );

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });
});
