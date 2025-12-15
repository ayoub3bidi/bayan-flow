/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Container from './Container';

describe('Container', () => {
  it('should render children', () => {
    render(
      <Container>
        <div>Test content</div>
      </Container>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply default classes', () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    );

    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass('max-w-[1200px]');
    expect(containerElement).toHaveClass('mx-auto');
    expect(containerElement).toHaveClass('px-6');
    expect(containerElement).toHaveClass('sm:px-8');
    expect(containerElement).toHaveClass('lg:px-12');
  });

  it('should merge custom className with default classes', () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Content</div>
      </Container>
    );

    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass('custom-class');
    expect(containerElement).toHaveClass('max-w-[1200px]');
  });

  it('should handle empty className', () => {
    const { container } = render(
      <Container className="">
        <div>Content</div>
      </Container>
    );

    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass('max-w-[1200px]');
  });

  it('should render multiple children', () => {
    render(
      <Container>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </Container>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('should handle complex nested children', () => {
    render(
      <Container>
        <header>
          <h1>Title</h1>
        </header>
        <main>
          <p>Content</p>
        </main>
      </Container>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
