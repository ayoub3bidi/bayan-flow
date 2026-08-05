/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen, fireEvent } from '../test/testUtils';
import SignInErrorModal from './SignInErrorModal';

describe('SignInErrorModal', () => {
  it('does not render when isOpen is false', () => {
    renderWithI18n(<SignInErrorModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title, message, and close button when open', () => {
    renderWithI18n(<SignInErrorModal isOpen onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName('Sign-in unavailable');
    expect(
      screen.getByText(/sign-in is temporarily unavailable/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    renderWithI18n(<SignInErrorModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking the overlay backdrop', () => {
    const onClose = vi.fn();
    renderWithI18n(<SignInErrorModal isOpen onClose={onClose} />);

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking the panel content', () => {
    const onClose = vi.fn();
    renderWithI18n(<SignInErrorModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByText(/sign-in is temporarily unavailable/i));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    renderWithI18n(<SignInErrorModal isOpen onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on other keys', () => {
    const onClose = vi.fn();
    renderWithI18n(<SignInErrorModal isOpen onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps focus on the close button when Tab is pressed', () => {
    const onClose = vi.fn();
    renderWithI18n(<SignInErrorModal isOpen onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.focus();

    fireEvent.keyDown(closeButton, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
  });

  it('keeps focus on the close button when Shift+Tab is pressed', () => {
    const onClose = vi.fn();
    renderWithI18n(<SignInErrorModal isOpen onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.focus();

    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true });
    expect(closeButton).toHaveFocus();
  });
});
