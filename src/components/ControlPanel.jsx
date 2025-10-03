import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

/**
 * ControlPanel Component
 * Provides controls for the visualization playback
 *
 * @param {boolean} isPlaying - Whether animation is currently playing
 * @param {boolean} isComplete - Whether animation has completed
 * @param {Function} onPlay - Handler for play button
 * @param {Function} onPause - Handler for pause button
 * @param {Function} onReset - Handler for reset button
 * @param {Function} onStepForward - Handler for step forward button
 * @param {Function} onStepBackward - Handler for step backward button
 * @param {number} currentStep - Current step in the animation
 * @param {number} totalSteps - Total number of steps
 */
function ControlPanel({
  isPlaying,
  isComplete,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  currentStep,
  totalSteps,
}) {
  const buttonBaseClasses =
    'p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100';

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Step Backward */}
        <button
          onClick={onStepBackward}
          disabled={isPlaying || currentStep === 0}
          className={`${buttonBaseClasses} bg-gray-100 hover:bg-gray-200 text-gray-700`}
          title="Step Backward"
        >
          <SkipBack size={20} />
        </button>

        {/* Reset - moved to center */}
        <button
          onClick={onReset}
          disabled={isPlaying}
          className={`${buttonBaseClasses} bg-gray-100 hover:bg-gray-200 text-gray-700`}
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>

        {/* Step Forward */}
        <button
          onClick={onStepForward}
          disabled={isPlaying || isComplete}
          className={`${buttonBaseClasses} bg-gray-100 hover:bg-gray-200 text-gray-700`}
          title="Step Forward"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Step {currentStep + 1}</span>
          <span>Total: {totalSteps} Steps</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full shadow-inner"
            initial={{ width: '0%' }}
            animate={{
              width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%`,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default ControlPanel;
