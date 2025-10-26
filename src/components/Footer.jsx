/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { motion } from 'framer-motion';
import { FileText, AlertCircle } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();
  const repoOwner = 'ayoub3bidi';
  const repoName = 'bayan-flow';
  const version = '0.0.0';
  const authorName = 'Ayoub Abidi';
  const authorGithub = 'ayoub3bidi';
  const bmcUsername = 'ayoub3bidi';
  const links = [
    {
      label: 'Documentation',
      icon: FileText,
      href: `https://github.com/${repoOwner}/${repoName}/tree/main/docs`,
    },
    {
      label: 'Report Issue',
      icon: AlertCircle,
      href: `https://github.com/${repoOwner}/${repoName}/issues`,
    },
  ];

  const handleBMCClick = () => {
    window.open(
      `https://www.buymeacoffee.com/${bmcUsername}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleLinkClick = href => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.footer
      className="relative w-full mt-auto border-t border-[var(--color-glass-border)]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="absolute inset-0 bg-[var(--color-glass-bg)] backdrop-blur-lg" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Left: Project Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
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
              <h3 className="text-sm font-bold text-text-primary">
                Bayan Flow
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              An interactive, educational web application for visualizing
              sorting/pathfinding algorithms with clarity. Bayan (بيان) means
              clarity in Arabic.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                MPL-2.0 License
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                v{version}
              </span>
            </div>
          </div>
          {/* Center: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {links.map(link => (
                <motion.button
                  key={link.label}
                  onClick={() => handleLinkClick(link.href)}
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-[#3b82f6] transition-colors p-2 rounded-lg hover:bg-surface-elevated backdrop-blur-sm text-left"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <link.icon size={14} className="opacity-70" />
                  <span>{link.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
          {/* Right: Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary">Support</h3>
            <div className="flex flex-col items-start">
              <p className="text-xs text-text-secondary mb-3">
                Enjoying this project? Support my work!
              </p>
              <motion.button
                onClick={handleBMCClick}
                className="inline-flex items-center gap-2 px-4 py-2 cursor-pointer bg-[#FFDD00] hover:bg-[#FFED4E] border-2 border-black rounded-lg font-semibold text-sm text-black shadow-md transition-colors touch-manipulation min-h-[44px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                aria-label="Buy me a coffee - Support this project"
              >
                <span className="text-lg">☕</span>
                <span>Buy me a coffee</span>
              </motion.button>
            </div>
          </div>
        </div>
        {/* Bottom: Copyright centered */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex justify-center">
            <p className="text-xs text-text-secondary text-center">
              © {currentYear}{' '}
              <motion.button
                onClick={() =>
                  handleLinkClick(`https://github.com/${authorGithub}`)
                }
                className="font-semibold text-text-primary hover:text-[#3b82f6] transition-colors underline decoration-dotted underline-offset-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {authorName}
              </motion.button>
              . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
