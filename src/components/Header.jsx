import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, Tag, ExternalLink } from 'lucide-react';

/**
 * @param {string} repoOwner - GitHub repository owner (default: 'ayoub3bidi')
 * @param {string} repoName - GitHub repository name (default: 'algorithm-visualizer')
 */
function Header({
  repoOwner = 'ayoub3bidi',
  repoName = 'algorithm-visualizer',
}) {
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const StatBadge = ({ icon: Icon, value, label }) => (
    <motion.div
      className="flex items-center gap-1.5 px-2.5 py-1 bg-white/40 backdrop-blur-md rounded-full border border-white/60 shadow-sm"
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Icon size={13} className="text-gray-700" />
      <span className="text-xs font-semibold text-gray-900">{value}</span>
      <span className="text-[10px] text-gray-600 hidden sm:inline">
        {label}
      </span>
    </motion.div>
  );

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-lg" />
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
              <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-none">
                Algorithm Visualizer
              </h1>
              <p className="text-[10px] text-gray-600 hidden sm:block leading-none mt-0.5">
                Interactive Sorting Visualization
              </p>
            </div>
          </motion.div>

          {!loading && repoData && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5">
                <StatBadge icon={Tag} value={repoData.latestTag} label="" />
                <StatBadge icon={Star} value={repoData.stars} label="stars" />
                <StatBadge
                  icon={GitFork}
                  value={repoData.forks}
                  label="forks"
                />
              </div>

              <motion.button
                onClick={handleGitHubClick}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white rounded-lg font-medium text-xs shadow-md hover:shadow-lg transition-shadow"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="hidden sm:inline">
                  {repoOwner}/{repoName}
                </span>
                <span className="sm:hidden">GitHub</span>
                <ExternalLink size={12} className="opacity-70" />
              </motion.button>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-6 bg-white/40 backdrop-blur-md rounded-full animate-pulse" />
              <div className="w-16 h-6 bg-white/40 backdrop-blur-md rounded-full animate-pulse" />
              <div className="w-24 h-8 bg-white/40 backdrop-blur-md rounded-lg animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
