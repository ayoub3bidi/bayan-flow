/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShareExportModal from './ShareExportModal';

const mockTranslations = {
  'shareExport.title': 'Share your visualization',
  'shareExport.description': 'Your video is ready!',
  'shareExport.captionLabel': 'Caption',
  'shareExport.shareNative': 'Share',
  'shareExport.shareOnX': 'Share on X',
  'shareExport.copyCaption': 'Copy caption',
  'shareExport.copied': 'Copied!',
  'shareExport.close': 'Close',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => mockTranslations[key] || key,
    i18n: { language: 'en' },
  }),
}));

const defaultProps = {
  open: true,
  algorithmName: 'Bubble Sort',
  videoBlob: new Blob(['fake-video'], { type: 'video/mp4' }),
  videoFileName: 'bubble-sort.mp4',
  onClose: vi.fn(),
  onShare: vi.fn(),
};

function renderModal(overrides = {}) {
  return render(<ShareExportModal {...defaultProps} {...overrides} />);
}

describe('ShareExportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    renderModal({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when open', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Share your visualization')).toBeInTheDocument();
    expect(screen.getByText('Your video is ready!')).toBeInTheDocument();
  });

  it('displays caption textarea with generated text', () => {
    renderModal();
    const textarea = screen.getByLabelText('Caption');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toContain('Bubble Sort');
    expect(textarea.value).toContain('bayanflow.com');
  });

  it('calls onClose when close button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('allows editing the caption', () => {
    renderModal();
    const textarea = screen.getByLabelText('Caption');
    fireEvent.change(textarea, { target: { value: 'Custom caption text' } });
    expect(textarea.value).toBe('Custom caption text');
  });

  it('opens Twitter share intent with updated caption', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});
    renderModal();

    const textarea = screen.getByLabelText('Caption');
    fireEvent.change(textarea, {
      target: { value: 'My custom tweet text' },
    });

    fireEvent.click(screen.getByText('Share on X'));
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy.mock.calls[0][0]).toContain('twitter.com/intent/tweet');
    expect(openSpy.mock.calls[0][0]).toContain('My%20custom%20tweet%20text');
    expect(defaultProps.onShare).toHaveBeenCalledWith({
      platform: 'twitter',
      text: 'My custom tweet text',
    });
    openSpy.mockRestore();
  });

  it('does not show native Share button when navigator.share unavailable', () => {
    vi.stubGlobal('navigator', {});
    renderModal();
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });

  it('shows native Share button when navigator.share is available', () => {
    vi.stubGlobal('navigator', { share: vi.fn(), canShare: vi.fn(() => true) });
    renderModal();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('handles clipboard copy with success feedback', async () => {
    vi.useFakeTimers();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      clipboard: { writeText: writeTextMock },
    });

    renderModal();
    fireEvent.click(screen.getByText('Copy caption'));

    await vi.waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    expect(defaultProps.onShare).toHaveBeenCalledWith({
      platform: 'clipboard',
      text: expect.stringContaining('Bubble Sort'),
    });

    vi.useRealTimers();
  });
});
