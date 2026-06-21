/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import YouTubeFacade from './YouTubeFacade';

describe('YouTubeFacade', () => {
  it('renders a play button and local thumbnail without an iframe', () => {
    const { container } = render(
      <YouTubeFacade videoId="ZwcT68ZRD0U" title="Product Demo Video" />
    );

    expect(
      screen.getByRole('button', { name: 'Play video: Product Demo Video' })
    ).toBeInTheDocument();
    expect(
      container.querySelector('img[src="/thumbnails/ZwcT68ZRD0U.jpg"]')
    ).toBeInTheDocument();
    expect(document.querySelector('iframe')).not.toBeInTheDocument();
  });

  it('loads youtube-nocookie iframe after click', () => {
    render(
      <YouTubeFacade
        videoId="ZwcT68ZRD0U"
        title="Product Demo Video"
        embedParams="modestbranding=1"
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Play video: Product Demo Video' })
    );

    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toContain('youtube-nocookie.com/embed/ZwcT68ZRD0U');
    expect(iframe?.src).toContain('autoplay=1');
    expect(iframe?.src).toContain('modestbranding=1');
    expect(iframe?.title).toBe('Product Demo Video');
  });

  it('activates on Enter key', () => {
    render(<YouTubeFacade videoId="test123" title="Demo" />);

    const button = screen.getByRole('button', { name: 'Play video: Demo' });
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(document.querySelector('iframe')).toBeInTheDocument();
  });
});
