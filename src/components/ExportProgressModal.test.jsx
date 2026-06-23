/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen, fireEvent } from '../test/testUtils';
import ExportProgressModal from './ExportProgressModal';

describe('ExportProgressModal', () => {
  it('does not render when closed', () => {
    renderWithI18n(
      <ExportProgressModal open={false} progress={0} phase="rendering" />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders orientation choices and forwards selection', () => {
    const onOrientationSelect = vi.fn();
    renderWithI18n(
      <ExportProgressModal
        open
        progress={0}
        phase="orientation"
        onOrientationSelect={onOrientationSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /horizontal/i }));
    expect(onOrientationSelect).toHaveBeenCalledWith('horizontal');

    fireEvent.click(screen.getByRole('button', { name: /vertical/i }));
    expect(onOrientationSelect).toHaveBeenCalledWith('vertical');
  });

  it('shows rendering progress and stop action', () => {
    const onStop = vi.fn();
    renderWithI18n(
      <ExportProgressModal
        open
        progress={0.42}
        phase="rendering"
        onStop={onStop}
      />
    );

    expect(screen.getByText('42%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /stop/i }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('shows checking phase without percent label', () => {
    renderWithI18n(
      <ExportProgressModal
        open
        progress={0}
        phase="checking"
        onStop={vi.fn()}
      />
    );

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('renders preview video and download action', () => {
    const onDownload = vi.fn();
    renderWithI18n(
      <ExportProgressModal
        open
        progress={1}
        phase="preview"
        blobUrl="blob:preview"
        onDownload={onDownload}
        onClose={vi.fn()}
      />
    );

    expect(document.querySelector('video')).toHaveAttribute(
      'src',
      'blob:preview'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('shows export error message and close action', () => {
    const onClose = vi.fn();
    renderWithI18n(
      <ExportProgressModal
        open
        progress={0}
        phase="error"
        errorMessage="Codec unavailable"
        onClose={onClose}
      />
    );

    expect(screen.getByText('Codec unavailable')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]);
    expect(onClose).toHaveBeenCalled();
  });
});
