/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';

function Header() {
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const repoOwner = 'ayoub3bidi';
  const repoName = 'bayan-flow';
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

        setRepoData({
          stars: repoJson.stargazers_count || 0,
          url:
            repoJson.html_url || `https://github.com/${repoOwner}/${repoName}`,
        });
      } catch (error) {
        console.error('Failed to fetch GitHub data:', error);
        setRepoData({
          stars: 0,
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
    window.open(
      repoData?.url || `https://github.com/${repoOwner}/${repoName}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      role="banner"
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-[var(--color-glass-bg)] backdrop-blur-lg border-b border-[var(--color-glass-border)] shadow-lg" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav
          className="flex items-center justify-between h-14 gap-2 sm:gap-4"
          role="navigation"
          aria-label="Main navigation"
        >
          <motion.div
            className="flex items-center gap-2 sm:gap-2.5"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 sm:w-6 sm:h-6"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Bayan Flow logo - representing clarity through flowing waves */}
                <path
                  d="M3 7C3 7 6 4 12 4C18 4 21 7 21 7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.95"
                />
                <path
                  d="M3 12C3 12 6 9 12 9C18 9 21 12 21 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.75"
                />
                <path
                  d="M3 17C3 17 6 14 12 14C18 14 21 17 21 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.55"
                />
                {/* Clarity dot */}
                <circle
                  cx="12"
                  cy="12"
                  r="1.5"
                  fill="white"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-text-primary tracking-tight leading-none">
                Bayan Flow
              </h1>
              <p className="text-[10px] text-text-secondary hidden sm:block leading-none mt-0.5">
                Clarity in Algorithms
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="h-9 w-16 sm:w-[170px] bg-interactive-bg backdrop-blur-md rounded-md animate-pulse" />
            ) : (
              repoData && (
                <>
                  {/* Full GitHub button - Desktop only */}
                  <motion.button
                    onClick={handleGitHubClick}
                    className="relative hidden sm:flex overflow-hidden items-center gap-2 h-9 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md shadow-sm transition-all duration-300 ease-out group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    aria-label={`Star on GitHub (${repoData.stars} stars)`}
                  >
                    <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-white dark:bg-black opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40" />
                    <div className="flex items-center gap-1.5 relative z-10">
                      <svg
                        className="w-4 h-4 fill-current"
                        viewBox="0 0 438.549 438.549"
                        aria-hidden="true"
                      >
                        <path d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z" />
                      </svg>
                      <span className="text-sm font-medium">
                        Star on GitHub
                      </span>
                    </div>
                    <div className="w-px h-5 bg-white/20 dark:bg-black/20 relative z-10" />
                    <div className="flex items-center gap-1.5 relative z-10">
                      <Star
                        size={14}
                        className="transition-colors duration-300 group-hover:text-yellow-300"
                        fill="currentColor"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold tabular-nums">
                        {repoData.stars}
                      </span>
                    </div>
                  </motion.button>

                  {/* Compact stars indicator - Mobile only */}
                  <motion.button
                    onClick={handleGitHubClick}
                    className="flex sm:hidden items-center gap-1.5 h-9 px-3 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md shadow-sm transition-all duration-200 cursor-pointer touch-manipulation"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    aria-label={`View on GitHub (${repoData.stars} stars)`}
                  >
                    <Star
                      size={14}
                      className="transition-colors duration-300"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-semibold tabular-nums">
                      {repoData.stars}
                    </span>
                  </motion.button>
                </>
              )
            )}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </nav>
      </div>
    </motion.header>
  );
}

export default Header;
