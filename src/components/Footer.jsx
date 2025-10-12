import { motion } from 'framer-motion';
import { FileText, AlertCircle } from 'lucide-react';

/**
 * @param {string} repoOwner - GitHub repository owner
 * @param {string} repoName - GitHub repository name
 * @param {string} version - Current version (default: '0.0.0')
 * @param {string} authorName - Author name (default: 'Ayoub Abidi')
 * @param {string} authorGithub - Author GitHub username
 */
function Footer({
  repoOwner = 'ayoub3bidi',
  repoName = 'algorithm-visualizer',
  version = '0.0.0',
  authorName = 'Ayoub Abidi',
  authorGithub = 'ayoub3bidi',
}) {
  const currentYear = new Date().getFullYear();
  const links = [
    {
      label: 'Documentation',
      icon: FileText,
      href: `https://github.com/${repoOwner}/${repoName}#readme`,
    },
    {
      label: 'Report Issue',
      icon: AlertCircle,
      href: `https://github.com/${repoOwner}/${repoName}/issues`,
    },
  ];
  const handleLinkClick = href => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };
  return (
    <motion.footer
      className="relative w-full mt-auto border-t border-white/20"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-lg" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4"
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
              <h3 className="text-sm font-bold text-gray-900">
                Algorithm Visualizer
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              An interactive, educational web application for visualizing
              sorting algorithms in real-time.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                MIT License
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                v{version}
              </span>
            </div>
          </div>
          {/* Right: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {links.map(link => (
                <motion.button
                  key={link.label}
                  onClick={() => handleLinkClick(link.href)}
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-white/60 backdrop-blur-sm text-left"
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
        </div>
        {/* Bottom: Copyright centered */}
        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <div className="flex justify-center">
            <p className="text-xs text-gray-600 text-center">
              © {currentYear}{' '}
              <motion.button
                onClick={() =>
                  handleLinkClick(`https://github.com/${authorGithub}`)
                }
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors underline decoration-dotted underline-offset-2"
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
