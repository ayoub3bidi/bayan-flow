/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen, fireEvent, waitFor } from '../test/testUtils';
import SignInPromptModal from './SignInPromptModal';

const signInWithGoogle = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ signInWithGoogle }),
}));

const FEATURES = ['code', 'insight', 'export', 'sound', 'fullscreen'];

const FEATURE_LABELS = {
  code: 'Code Panel',
  insight: 'Algorithm Insight',
  export: 'Video Export',
  sound: 'Sound',
  fullscreen: 'Fullscreen Mode',
};

describe('SignInPromptModal', () => {
  beforeEach(() => {
    signInWithGoogle.mockClear();
  });

  FEATURES.forEach(featureKey => {
    it(`renders legacy unlock copy for "${featureKey}" feature`, () => {
      renderWithI18n(
        <SignInPromptModal feature={featureKey} isOpen onClose={vi.fn()} />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAccessibleName(
        `Unlock ${FEATURE_LABELS[featureKey]}`
      );
      expect(
        screen.getByText(
          `Sign in with Google to access the ${FEATURE_LABELS[featureKey]} and get the full Bayan Flow experience.`
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
      expect(screen.getByText('Maybe later')).toBeInTheDocument();
    });
  });

  it('renders custom gate copy for algorithm_lock with metadata', () => {
    renderWithI18n(
      <SignInPromptModal
        feature="algorithm_lock"
        isOpen
        onClose={vi.fn()}
        metadata={{ algorithmName: 'Quick Sort' }}
      />
    );

    expect(screen.getByText('Unlock Quick Sort')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Sign in to access all 45 algorithms across 5 categories.'
      )
    ).toBeInTheDocument();
  });

  it('calls signInWithGoogle when the sign-in button is clicked', () => {
    signInWithGoogle.mockResolvedValue(undefined);
    renderWithI18n(
      <SignInPromptModal feature="code" isOpen onClose={vi.fn()} />
    );

    fireEvent.click(screen.getByText('Sign in with Google'));
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('shows unavailable message when sign-in fails', async () => {
    signInWithGoogle.mockRejectedValue({
      message: 'Invalid payload sent to hook',
      code: 'unexpected_failure',
    });
    renderWithI18n(
      <SignInPromptModal feature="code" isOpen onClose={vi.fn()} />
    );

    fireEvent.click(screen.getByText('Sign in with Google'));

    await waitFor(() => {
      expect(
        screen.getByText(/sign-in is temporarily unavailable/i)
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when the dismiss button is clicked', () => {
    const onClose = vi.fn();
    renderWithI18n(
      <SignInPromptModal feature="code" isOpen onClose={onClose} />
    );

    fireEvent.click(screen.getByText('Maybe later'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    renderWithI18n(
      <SignInPromptModal feature="code" isOpen={false} onClose={vi.fn()} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when clicking the overlay backdrop', () => {
    const onClose = vi.fn();
    renderWithI18n(
      <SignInPromptModal feature="code" isOpen onClose={onClose} />
    );

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    renderWithI18n(
      <SignInPromptModal feature="code" isOpen onClose={onClose} />
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on other keys', () => {
    const onClose = vi.fn();
    renderWithI18n(
      <SignInPromptModal feature="code" isOpen onClose={onClose} />
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
