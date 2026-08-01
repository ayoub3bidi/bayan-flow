/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */
import {
  GITHUB_REPO_FULL_NAME,
  GITHUB_REPO_NAME,
  GITHUB_REPO_OWNER,
  GITHUB_REPO_PACKAGE_VERSION,
  GITHUB_REPO_URL,
} from '../constants/githubRepo.js';

export const GITHUB_REPO_CACHE_KEY = 'bayan-flow:github-repo';
export const GITHUB_REPO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const GITHUB_REPO_ENDPOINT = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;

const parseReleaseTag = tagName => {
  if (typeof tagName !== 'string' || !tagName.trim()) {
    return null;
  }
  return tagName.trim().replace(/^v/i, '');
};

export function createFallbackGitHubRepo() {
  return {
    url: GITHUB_REPO_URL,
    fullName: GITHUB_REPO_FULL_NAME,
    stars: 0,
    forks: 0,
    versionTag: GITHUB_REPO_PACKAGE_VERSION,
  };
}

export function readCachedGitHubRepo() {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(GITHUB_REPO_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.data ||
      typeof parsed.cachedAt !== 'number'
    ) {
      return null;
    }
    return {
      data: parsed.data,
      cachedAt: parsed.cachedAt,
      isStale: Date.now() - parsed.cachedAt >= GITHUB_REPO_CACHE_TTL_MS,
    };
  } catch {
    return null;
  }
}

export function cacheGitHubRepo(data) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(
      GITHUB_REPO_CACHE_KEY,
      JSON.stringify({ data, cachedAt: Date.now() })
    );
  } catch {
    // Ignore quota / private-mode errors; the fetch can run again next time.
  }
}

export async function fetchGitHubRepo() {
  const fallback = createFallbackGitHubRepo();

  const [repoResponse, releaseResponse] = await Promise.all([
    fetch(GITHUB_REPO_ENDPOINT),
    fetch(`${GITHUB_REPO_ENDPOINT}/releases/latest`),
  ]);

  let next = { ...fallback };

  if (repoResponse.ok) {
    const repoJson = await repoResponse.json();
    next = {
      url: repoJson.html_url || fallback.url,
      fullName: repoJson.full_name || fallback.fullName,
      stars: repoJson.stargazers_count ?? 0,
      forks: repoJson.forks_count ?? 0,
      versionTag: fallback.versionTag,
    };
  }

  if (releaseResponse.ok) {
    const releaseJson = await releaseResponse.json();
    const parsed = parseReleaseTag(releaseJson.tag_name);
    if (parsed) {
      next.versionTag = parsed;
    }
  }

  return next;
}

export async function loadGitHubRepoData() {
  const cached = readCachedGitHubRepo();
  if (cached && !cached.isStale) {
    return { data: cached.data, fromCache: true };
  }
  try {
    const data = await fetchGitHubRepo();
    cacheGitHubRepo(data);
    return { data, fromCache: false };
  } catch (error) {
    if (cached) {
      return { data: cached.data, fromCache: true, error };
    }
    console.error('Failed to fetch GitHub data:', error);
    return { data: createFallbackGitHubRepo(), fromCache: false, error };
  }
}

export function runWhenIdle(task) {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(task, { timeout: 2000 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(task, 200);
  return () => clearTimeout(id);
}
