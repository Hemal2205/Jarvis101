import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Pause, Save, Clock, Brain, BookOpen } from 'lucide-react';
import { useCloseWarning } from './CloseWarningUtils';

interface CloseWarningProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirmClose: () => void;
  onPause: () => void;
  onSave: () => void;
  learningData?: {
    skill_name: string;
    progress: number;
    time_spent: number;
    session_id: string;
  };
}

export const CloseWarning: React.FC<CloseWarningProps> = ({
  isVisible,
  onClose,
  onConfirmClose,
  onPause,
  onSave,
  learningData
}) => {
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const notifyLearningInterruption = useCallback(async () => {
    try {
      await fetch('/api/system/close-warning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_name: learningData?.skill_name || 'Unknown skill'
        })
      });
    } catch (error) {
      console.error('Error notifying learning interruption:', error);
    }
  }, [learningData]);

  const handleSaveAndClose = useCallback(async () => {
    try {
      await onSave();
      onConfirmClose();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [onSave, onConfirmClose]);

  useEffect(() => {
    if (isVisible) {
      // Play voice notification
      notifyLearningInterruption();
      setCountdown(10);
      setIsCountingDown(false);
    }
  }, [isVisible, notifyLearningInterruption]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isCountingDown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      handleSaveAndClose();
    }
    
    return () => clearInterval(interval);
  }, [isCountingDown, countdown, handleSaveAndClose]);

  const handlePauseAndClose = async () => {
    try {
      await onPause();
      onConfirmClose();
    } catch (error) {
      console.error('Error pausing session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-500/50 rounded-2xl p-8 max-w-md w-full relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Warning Icon */}
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center"
            >
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </motion.div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-red-300 text-center mb-4">
            Learning Session Active
          </h2>

          {/* Learning Info */}
          {learningData && (
            <div className="bg-gray-900/50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="font-medium text-white">{learningData.skill_name}</div>
                  <div className="text-sm text-gray-400">Currently learning</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Progress: {learningData.progress.toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Time: {formatTime(learningData.time_spent)}</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${learningData.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="text-center mb-6">
            <p className="text-gray-300 mb-2">
              J.A.R.V.I.S is currently learning and improving. Closing now will interrupt the active session.
            </p>
            <p className="text-sm text-gray-400">
              What would you like to do?
            </p>
          </div>

          {/* Countdown Timer */}
          {isCountingDown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <div className="text-orange-400 font-medium">
                Auto-saving in {countdown} seconds...
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div
                  className="bg-orange-400 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSaveAndClose}
              disabled={isCountingDown}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>Save Progress & Close</span>
            </button>

            <button
              onClick={handlePauseAndClose}
              disabled={isCountingDown}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Pause className="w-5 h-5" />
              <span>Pause Session & Close</span>
            </button>

            <button
              onClick={() => setIsCountingDown(true)}
              disabled={isCountingDown}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isCountingDown ? 'Auto-saving...' : 'Auto-save & Close (10s)'}
            </button>

            <div className="border-t border-gray-600 pt-3">
              <button
                onClick={onConfirmClose}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 px-4 rounded-lg font-medium transition-colors border border-red-500/50"
              >
                Force Close (Lose Progress)
              </button>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Cancel - Continue Learning
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Moved useCloseWarning to CloseWarningUtils.ts

// Component to handle window close/refresh events
export const CloseWarningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const closeWarning = useCloseWarning();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check if there's an active learning session
      const hasActiveSession = localStorage.getItem('jarvis_active_session');
      
      if (hasActiveSession) {
        event.preventDefault();
        event.returnValue = 'J.A.R.V.I.S is currently learning. Are you sure you want to leave?';
        
        // Show our custom warning
        closeWarning.showWarning({
          skill_name: localStorage.getItem('jarvis_current_skill') || 'Unknown skill',
          progress: parseInt(localStorage.getItem('jarvis_progress') || '0'),
          time_spent: parseInt(localStorage.getItem('jarvis_time_spent') || '0'),
          session_id: localStorage.getItem('jarvis_session_id') || ''
        });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Alt+F4 or Ctrl+W
      if (
        (event.altKey && event.key === 'F4') ||
        (event.ctrlKey && event.key === 'w')
      ) {
        const hasActiveSession = localStorage.getItem('jarvis_active_session');
        
        if (hasActiveSession) {
          event.preventDefault();
          closeWarning.showWarning({
            skill_name: localStorage.getItem('jarvis_current_skill') || 'Unknown skill',
            progress: parseInt(localStorage.getItem('jarvis_progress') || '0'),
            time_spent: parseInt(localStorage.getItem('jarvis_time_spent') || '0'),
            session_id: localStorage.getItem('jarvis_session_id') || ''
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeWarning]);

  const handleSave = async () => {
    const sessionId = localStorage.getItem('jarvis_session_id');
    const progress = parseInt(localStorage.getItem('jarvis_progress') || '0');
    
    if (sessionId) {
      try {
        await fetch('/api/skills/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            completion_rate: progress / 100,
            feedback: 'Session saved before closing'
          })
        });
        
        // Clear session data
        localStorage.removeItem('jarvis_active_session');
        localStorage.removeItem('jarvis_current_skill');
        localStorage.removeItem('jarvis_progress');
        localStorage.removeItem('jarvis_time_spent');
        localStorage.removeItem('jarvis_session_id');
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  };

  const handlePause = async () => {
    // Mark session as paused
    localStorage.setItem('jarvis_session_paused', 'true');
  };

  const handleConfirmClose = () => {
    // Clear all session data
    localStorage.removeItem('jarvis_active_session');
    localStorage.removeItem('jarvis_current_skill');
    localStorage.removeItem('jarvis_progress');
    localStorage.removeItem('jarvis_time_spent');
    localStorage.removeItem('jarvis_session_id');
    localStorage.removeItem('jarvis_session_paused');
    
    // Close the application
    window.close();
  };

  return (
    <>
      {children}
      <CloseWarning
        isVisible={closeWarning.isVisible}
        onClose={closeWarning.hideWarning}
        onConfirmClose={handleConfirmClose}
        onPause={handlePause}
        onSave={handleSave}
        learningData={closeWarning.learningData}
      />
    </>
  );
};