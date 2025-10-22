import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';

function Header() {
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const repoOwner = 'ayoub3bidi';
  const repoName = 'algorithm-visualizer';
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const repoResponse = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}`
        );

        if (!repoResponse.ok) {
          throw new Error('Failed to fetch repo data');
        }

        const repoJson = await repoResponse.json();

        const tagsResponse = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/tags`
        );
        const tagsJson = await tagsResponse.json();

        setRepoData({
          stars: repoJson.stargazers_count || 0,
          forks: repoJson.forks_count || 0,
          latestTag: tagsJson[0]?.name || 'v0.0.0',
          url:
            repoJson.html_url || `https://github.com/${repoOwner}/${repoName}`,
        });
      } catch (error) {
        console.error('Failed to fetch GitHub data:', error);
        setRepoData({
          stars: 0,
          forks: 0,
          latestTag: 'v0.0.0',
          url: `https://github.com/${repoOwner}/${repoName}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, [repoOwner, repoName]);

  const handleGitHubClick = e => {
    e.preventDefault();
    window.open(repoData.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-[var(--color-glass-bg)] backdrop-blur-lg border-b border-[var(--color-glass-border)] shadow-lg" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          <motion.div
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8L12 3L21 8L12 13L3 8Z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <path
                  d="M3 12L12 17L21 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 16L12 21L21 16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-text-primary tracking-tight leading-none">
                Algorithm Visualizer
              </h1>
              <p className="text-[10px] text-text-secondary hidden sm:block leading-none mt-0.5">
                Interactive Sorting/Pathfinding Visualization
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            {!loading && repoData && (
              <motion.button
                onClick={handleGitHubClick}
                className="flex items-center cursor-pointer gap-2 px-3 py-1.5 bg-interactive-bg backdrop-blur-md rounded-full border border-interactive-border shadow-sm hover:shadow-md transition-shadow"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'var(--color-interactive-bg-hover)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <div className="flex items-center gap-1.5">
                  <Star
                    size={14}
                    className="text-interactive-text"
                    fill="currentColor"
                  />
                  <span className="text-xs font-semibold text-interactive-text">
                    {repoData.stars}
                  </span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5 text-interactive-text"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <ExternalLink size={12} className="text-interactive-text" />
                </div>
              </motion.button>
            )}
            {/* Theme Toggle */}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            {loading && (
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-6 bg-interactive-bg backdrop-blur-md rounded-full animate-pulse" />
                <div className="w-16 h-6 bg-interactive-bg backdrop-blur-md rounded-full animate-pulse" />
                <div className="w-24 h-8 bg-interactive-bg backdrop-blur-md rounded-lg animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
