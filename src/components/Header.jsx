/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import GitHubRepoBadge from './GitHubRepoBadge';

function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const branchName = (import.meta.env.VITE_GIT_BRANCH ?? '').trim();
  const isDevBranch =
    !!branchName && !['main', 'master', 'production'].includes(branchName);
  const devSiteUrl =
    import.meta.env.VITE_DEV_SITE_URL || 'https://dev.bayanflow.com';

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <motion.header
      className="relative sm:fixed sm:top-0 sm:left-0 sm:right-0 sm:z-50 w-full"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      role="banner"
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-(--color-glass-bg) backdrop-blur-lg border-b border-(--color-glass-border) shadow-lg" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center justify-between h-12 sm:h-14 gap-1 sm:gap-2 md:gap-4"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <motion.div
              className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={handleLogoClick}
              role="button"
              aria-label="Navigate to landing page"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLogoClick();
                }
              }}
            >
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
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
              <div className="flex flex-col min-w-0">
                <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-text-primary tracking-tight leading-none truncate">
                  {t('header.title')}
                </h1>
                <p className="text-[9px] sm:text-[10px] text-text-secondary hidden sm:block leading-tight mt-0.5 truncate">
                  {t('header.subtitle')}
                </p>
              </div>
            </motion.div>

            {isDevBranch && (
              <a
                href={devSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-900 text-xs font-medium border border-green-200 shadow-sm hover:shadow-md transition-all animate-pulse"
                aria-label={`Dev site — branch ${branchName}`}
                title={`Dev preview — branch: ${branchName}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <GitBranch className="w-3 h-3" />
                <span className="font-mono tabular-nums text-xs">
                  {branchName}
                </span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <GitHubRepoBadge />
            <LanguageSwitcher />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </nav>
      </div>
    </motion.header>
  );
}

export default Header;
