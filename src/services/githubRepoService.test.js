/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GITHUB_REPO_CACHE_KEY,
  GITHUB_REPO_CACHE_TTL_MS,
  cacheGitHubRepo,
  fetchGitHubRepo,
  loadGitHubRepoData,
  readCachedGitHubRepo,
} from './githubRepoService';
import {
  GITHUB_REPO_FULL_NAME,
  GITHUB_REPO_PACKAGE_VERSION,
  GITHUB_REPO_URL,
} from '../constants/githubRepo';

function stubSuccessfulFetch() {
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
}

describe('githubRepoService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when no cache exists', () => {
    expect(readCachedGitHubRepo()).toBeNull();
  });

  it('returns null when cached payload is malformed', () => {
    localStorage.setItem(GITHUB_REPO_CACHE_KEY, 'not-json');
    expect(readCachedGitHubRepo()).toBeNull();
  });

  it('marks freshly cached data as fresh', () => {
    cacheGitHubRepo({ versionTag: '0.6.0' });

    const cache = readCachedGitHubRepo();
    expect(cache).not.toBeNull();
    expect(cache.data.versionTag).toBe('0.6.0');
    expect(cache.isStale).toBe(false);
  });

  it('marks cached data as stale after the TTL', () => {
    cacheGitHubRepo({ versionTag: '0.5.0' });
    const stored = JSON.parse(localStorage.getItem(GITHUB_REPO_CACHE_KEY));
    stored.cachedAt = Date.now() - (GITHUB_REPO_CACHE_TTL_MS + 1);
    localStorage.setItem(GITHUB_REPO_CACHE_KEY, JSON.stringify(stored));

    expect(readCachedGitHubRepo().isStale).toBe(true);
  });

  it('loads from cache without fetching when cache is fresh', async () => {
    cacheGitHubRepo({ versionTag: '0.6.0' });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { data, fromCache } = await loadGitHubRepoData();

    expect(fromCache).toBe(true);
    expect(data.versionTag).toBe('0.6.0');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches and persists data when cache is missing', async () => {
    stubSuccessfulFetch();

    const { data, fromCache } = await loadGitHubRepoData();

    expect(fromCache).toBe(false);
    expect(data).toMatchObject({
      url: GITHUB_REPO_URL,
      fullName: GITHUB_REPO_FULL_NAME,
      stars: 1200,
      forks: 48,
      versionTag: '0.6.0',
    });
    const stored = JSON.parse(localStorage.getItem(GITHUB_REPO_CACHE_KEY));
    expect(stored.data.versionTag).toBe('0.6.0');
    expect(typeof stored.cachedAt).toBe('number');
  });

  it('refreshes stale cache but returns cached data on fetch failure', async () => {
    cacheGitHubRepo({ versionTag: '0.5.0' });
    const stored = JSON.parse(localStorage.getItem(GITHUB_REPO_CACHE_KEY));
    stored.cachedAt = Date.now() - (GITHUB_REPO_CACHE_TTL_MS + 1);
    localStorage.setItem(GITHUB_REPO_CACHE_KEY, JSON.stringify(stored));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      })
    );

    const { data, fromCache } = await loadGitHubRepoData();

    expect(fromCache).toBe(true);
    expect(data.versionTag).toBe('0.5.0');
  });

  it('falls back to package version when fetch fails with no cache', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      })
    );

    const { data } = await loadGitHubRepoData();

    expect(data).toMatchObject({
      url: GITHUB_REPO_URL,
      fullName: GITHUB_REPO_FULL_NAME,
      stars: 0,
      forks: 0,
      versionTag: GITHUB_REPO_PACKAGE_VERSION,
    });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('parses release tags stripping a leading v', async () => {
    stubSuccessfulFetch();

    const data = await fetchGitHubRepo();

    expect(data.versionTag).toBe('0.6.0');
  });
});
