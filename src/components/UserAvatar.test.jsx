/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import UserAvatar from './UserAvatar';

describe('UserAvatar', () => {
  const profile = {
    displayName: 'Test User',
    email: 'user@example.com',
    avatarSrc: 'data:image/svg+xml;charset=utf-8,test',
  };

  it('renders avatar image with size class', () => {
    const { container } = render(<UserAvatar profile={profile} size="sm" />);
    const img = container.querySelector('img');
    expect(img).toHaveClass('h-9', 'w-9');
    expect(img).toHaveAttribute('src', profile.avatarSrc);
  });

  it('falls back to generated avatar when remote image fails', () => {
    const { container } = render(
      <UserAvatar
        profile={{
          ...profile,
          avatarSrc: 'https://lh3.googleusercontent.com/broken',
        }}
      />
    );
    const img = container.querySelector('img');
    fireEvent.error(img);
    expect(img.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
  });
});
