import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Shuffle,
} from 'lucide-react';

/**
 * ControlPanel Component
 * Provides controls for the visualization playback
 *
 * @param {boolean} isPlaying - Whether animation is currently playing
 * @param {boolean} isComplete - Whether animation has completed
 * @param {boolean} isAutoplayActive - Whether autoplay is currently active
 * @param {string} mode - Current visualization mode ('autoplay' or 'manual')
 * @param {Function} onPlay - Handler for play button
 * @param {Function} onPause - Handler for pause button
 * @param {Function} onReset - Handler for reset button
 * @param {Function} onStepForward - Handler for step forward button
 * @param {Function} onStepBackward - Handler for step backward button
 * @param {number} currentStep - Current step in the animation
 * @param {number} totalSteps - Total number of steps
 * @param {Function} onGenerateArray - Handler for generating new random start/end points
 * @param {string} algorithmType - Current algorithm type ('sorting' or 'pathfinding')
 */
function ControlPanel({
  isPlaying,
  isComplete,
  mode,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  currentStep,
  totalSteps,
  onGenerateArray,
  algorithmType,
}) {
  const buttonBaseClasses =
    'p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100';

  return (
    <motion.div
      className="bg-surface rounded-lg shadow-lg p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Step Backward - Always visible */}
        <button
          onClick={onStepBackward}
          disabled={isPlaying || currentStep === 0}
          className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
          title="Step Backward"
        >
          <SkipBack size={20} />
        </button>

        {/* Play/Pause Button - Different behavior based on mode */}
        {mode === 'autoplay' &&
          (isPlaying ? (
            <button
              onClick={onPause}
              className={`${buttonBaseClasses} bg-amber-500 hover:bg-amber-600text-white`}
              title="Pause"
            >
              <Pause size={20} />
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={isComplete}
              className={`${buttonBaseClasses} bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300`}
              title="Play"
            >
              <Play size={20} />
            </button>
          ))}

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={isPlaying}
          className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>

        {/* Step Forward - Only visible in manual mode */}
        {mode === 'manual' && (
          <button
            onClick={onStepForward}
            disabled={isPlaying || isComplete}
            className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
            title="Step Forward"
          >
            <SkipForward size={20} />
          </button>
        )}

        {/* Random Start & End Points - Only visible in pathfinding mode */}
        {algorithmType === 'pathfinding' && (
          <button
            onClick={onGenerateArray}
            disabled={isPlaying}
            className={`${buttonBaseClasses} bg-blue-500 hover:bg-blue-600 text-white`}
            title="Random Start & End Points"
          >
            <Shuffle size={20} />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-text-secondary mb-1">
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
