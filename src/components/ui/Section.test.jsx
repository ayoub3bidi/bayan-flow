/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Section from './Section';

describe('Section', () => {
  it('should render children', () => {
    render(
      <Section>
        <div>Test content</div>
      </Section>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply default classes', () => {
    const { container } = render(
      <Section>
        <div>Content</div>
      </Section>
    );

    const sectionElement = container.firstChild;
    expect(sectionElement).toHaveClass('py-20');
    expect(sectionElement).toHaveClass('md:py-32');
    expect(sectionElement.tagName).toBe('SECTION');
  });

  it('should merge custom className with default classes', () => {
    const { container } = render(
      <Section className="custom-section-class">
        <div>Content</div>
      </Section>
    );

    const sectionElement = container.firstChild;
    expect(sectionElement).toHaveClass('custom-section-class');
    expect(sectionElement).toHaveClass('py-20');
    expect(sectionElement).toHaveClass('md:py-32');
  });

  it('should handle empty className', () => {
    const { container } = render(
      <Section className="">
        <div>Content</div>
      </Section>
    );

    const sectionElement = container.firstChild;
    expect(sectionElement).toHaveClass('py-20');
    expect(sectionElement).toHaveClass('md:py-32');
  });

  it('should render multiple children', () => {
    render(
      <Section>
        <h2>Title</h2>
        <p>Description</p>
        <button>Action</button>
      </Section>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should use semantic section element', () => {
    const { container } = render(
      <Section>
        <div>Content</div>
      </Section>
    );

    const sectionElement = container.firstChild;
    expect(sectionElement.tagName).toBe('SECTION');
  });
});
