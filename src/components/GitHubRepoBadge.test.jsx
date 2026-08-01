/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen, waitFor } from '../test/testUtils';
import GitHubRepoBadge from './GitHubRepoBadge';
import {
  GITHUB_REPO_FULL_NAME,
  GITHUB_REPO_PACKAGE_VERSION,
  GITHUB_REPO_URL,
} from '../constants/githubRepo';
import {
  loadGitHubRepoData,
  readCachedGitHubRepo,
} from '../services/githubRepoService';

vi.mock('../services/githubRepoService', () => ({
  loadGitHubRepoData: vi.fn(),
  readCachedGitHubRepo: vi.fn(() => null),
  runWhenIdle: task => {
    task();
    return () => {};
  },
}));

const cachedData = {
  url: GITHUB_REPO_URL,
  fullName: GITHUB_REPO_FULL_NAME,
  stars: 1200,
  forks: 48,
  versionTag: '0.6.0',
};

describe('GitHubRepoBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readCachedGitHubRepo).mockReturnValue(null);
  });

  it('shows a loading skeleton before GitHub data resolves', () => {
    vi.mocked(loadGitHubRepoData).mockReturnValue(new Promise(() => {}));

    renderWithI18n(<GitHubRepoBadge />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders live repo metrics and release tag after fetch succeeds', async () => {
    vi.mocked(loadGitHubRepoData).mockResolvedValue({
      data: cachedData,
      fromCache: false,
    });

    renderWithI18n(<GitHubRepoBadge />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', GITHUB_REPO_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText(GITHUB_REPO_FULL_NAME)).toBeInTheDocument();
    expect(screen.getByText('0.6.0')).toBeInTheDocument();
    expect(screen.getByText('1.2k')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
  });

  it('renders cached data immediately without refetching when fresh', () => {
    vi.mocked(readCachedGitHubRepo).mockReturnValue({
      data: cachedData,
      cachedAt: Date.now(),
      isStale: false,
    });

    renderWithI18n(<GitHubRepoBadge />);

    expect(document.querySelector('.animate-pulse')).toBeNull();
    expect(screen.getByText('0.6.0')).toBeInTheDocument();
    expect(screen.getByText('1.2k')).toBeInTheDocument();
    expect(loadGitHubRepoData).not.toHaveBeenCalled();
  });

  it('renders stale cached data and refreshes in the background', async () => {
    vi.mocked(readCachedGitHubRepo).mockReturnValue({
      data: { ...cachedData, versionTag: '0.5.0' },
      cachedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      isStale: true,
    });
    vi.mocked(loadGitHubRepoData).mockResolvedValue({
      data: cachedData,
      fromCache: false,
    });

    renderWithI18n(<GitHubRepoBadge />);

    expect(screen.getByText('0.5.0')).toBeInTheDocument();
    expect(loadGitHubRepoData).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('0.6.0')).toBeInTheDocument();
    });
  });

  it('falls back to package version when the service returns fallback data', async () => {
    vi.mocked(loadGitHubRepoData).mockResolvedValue({
      data: {
        url: GITHUB_REPO_URL,
        fullName: GITHUB_REPO_FULL_NAME,
        stars: 0,
        forks: 0,
        versionTag: GITHUB_REPO_PACKAGE_VERSION,
      },
      fromCache: false,
    });

    renderWithI18n(<GitHubRepoBadge />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', GITHUB_REPO_URL);
    expect(screen.getByText(GITHUB_REPO_FULL_NAME)).toBeInTheDocument();
    expect(screen.getByText(GITHUB_REPO_PACKAGE_VERSION)).toBeInTheDocument();
  });
});
