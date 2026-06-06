/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithI18n, screen, waitFor } from '../test/testUtils';
import GitHubRepoBadge from './GitHubRepoBadge';
import {
  GITHUB_REPO_FULL_NAME,
  GITHUB_REPO_PACKAGE_VERSION,
  GITHUB_REPO_URL,
} from '../constants/githubRepo';

describe('GitHubRepoBadge', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async url => {
        if (String(url).includes('/releases/latest')) {
          return {
            ok: true,
            json: async () => ({ tag_name: 'v0.6.0' }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            html_url: GITHUB_REPO_URL,
            full_name: GITHUB_REPO_FULL_NAME,
            stargazers_count: 1200,
            forks_count: 48,
          }),
        };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a loading skeleton before GitHub data resolves', () => {
    renderWithI18n(<GitHubRepoBadge />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders live repo metrics and release tag after fetch succeeds', async () => {
    renderWithI18n(<GitHubRepoBadge />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', GITHUB_REPO_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText(GITHUB_REPO_FULL_NAME)).toBeInTheDocument();
    expect(screen.getByText('0.6.0')).toBeInTheDocument();
    expect(screen.getByText('1.2k')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
  });

  it('falls back to package version when release fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async url => {
        if (String(url).includes('/releases/latest')) {
          return { ok: false };
        }
        return {
          ok: true,
          json: async () => ({
            html_url: GITHUB_REPO_URL,
            full_name: GITHUB_REPO_FULL_NAME,
            stargazers_count: 10,
            forks_count: 2,
          }),
        };
      })
    );

    renderWithI18n(<GitHubRepoBadge />);

    await waitFor(() => {
      expect(screen.getByText(GITHUB_REPO_PACKAGE_VERSION)).toBeInTheDocument();
    });
  });

  it('uses fallback repo data when GitHub API requests throw', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      })
    );

    renderWithI18n(<GitHubRepoBadge />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', GITHUB_REPO_URL);
    expect(screen.getByText(GITHUB_REPO_FULL_NAME)).toBeInTheDocument();
    expect(screen.getByText(GITHUB_REPO_PACKAGE_VERSION)).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('keeps fallback URL when repo response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
      }))
    );

    renderWithI18n(<GitHubRepoBadge />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', GITHUB_REPO_URL);
    expect(screen.getByText(GITHUB_REPO_FULL_NAME)).toBeInTheDocument();
  });
});
