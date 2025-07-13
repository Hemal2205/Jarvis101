import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Volume2, VolumeX, Target, Brain, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface StealthOverlayProps {
  mode: 'stealth-exam' | 'stealth-interview' | 'passive-copilot';
  isActive: boolean;
}

interface Answer {
  question: string;
  answer: string | { answer: string };
  type: string;
  confidence: number;
  timestamp: string;
  sources?: string[];
}

interface StealthStatus {
  proctoring_bypass: boolean;
  screen_monitoring: boolean;
  answer_generation: boolean;
  overlay_hidden: boolean;
  detection_risk: 'low' | 'medium' | 'high';
}

const EnhancedStealthOverlay: React.FC<StealthOverlayProps> = ({ mode, isActive }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.9);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [stealthStatus, setStealthStatus] = useState<StealthStatus>({
    proctoring_bypass: false,
    screen_monitoring: false,
    answer_generation: false,
    overlay_hidden: false,
    detection_risk: 'low'
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoHide, setAutoHide] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      initializeStealthMode();
      startMonitoring();
    } else {
      cleanup();
    }
  }, [isActive, mode]);

  useEffect(() => {
    // Auto-hide overlay when not in use
    if (autoHide && answers.length === 0) {
      const timer = setTimeout(() => {
        setIsOverlayVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [answers, autoHide]);

  const initializeStealthMode = async () => {
    try {
      const response = await fetch('/api/stealth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode.replace('stealth-', '') })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setStealthStatus(prev => ({
          ...prev,
          proctoring_bypass: true,
          screen_monitoring: true,
          answer_generation: true
        }));
      }
    } catch (error) {
      console.error('Stealth mode initialization error:', error);
    }
  };

  const startMonitoring = () => {
    // Poll for new answers
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/stealth/answers');
        const data = await response.json();
        
        if (data.answers && data.answers.length > 0) {
          setAnswers(data.answers);
          setCurrentAnswer(data.answers[0]);
          setIsOverlayVisible(true);
        }
      } catch (error) {
        console.error('Answer monitoring error:', error);
      }
    }, 500);

    return () => clearInterval(interval);
  };

  const cleanup = () => {
    setAnswers([]);
    setCurrentAnswer(null);
    setIsOverlayVisible(false);
  };

  const toggleOverlayVisibility = () => {
    setIsOverlayVisible(!isOverlayVisible);
  };

  const adjustOpacity = (delta: number) => {
    setOpacity(prev => Math.max(0.1, Math.min(1, prev + delta)));
  };

  const moveOverlay = (direction: 'up' | 'down' | 'left' | 'right') => {
    setPosition(prev => {
      const step = 10;
      switch (direction) {
        case 'up': return { ...prev, y: Math.max(0, prev.y - step) };
        case 'down': return { ...prev, y: Math.min(90, prev.y + step) };
        case 'left': return { ...prev, x: Math.max(0, prev.x - step) };
        case 'right': return { ...prev, x: Math.min(90, prev.x + step) };
        default: return prev;
      }
    });
  };

  const getOverlayStyle = () => {
    if (mode === 'stealth-exam') {
      return {
        position: 'fixed' as const,
        top: `${position.y}%`,
        left: `${position.x}%`,
        transform: 'translate(-50%, -50%)',
        opacity: opacity,
        zIndex: 9999,
        pointerEvents: 'auto' as const,
        backdropFilter: 'blur(10px)',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        maxWidth: '400px',
        fontSize: '12px',
        fontFamily: 'monospace'
      };
    } else if (mode === 'stealth-interview') {
      return {
        position: 'fixed' as const,
        bottom: '20px',
        right: '20px',
        opacity: opacity,
        zIndex: 9999,
        pointerEvents: 'auto' as const,
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '350px',
        fontSize: '14px'
      };
    } else {
      return {
        position: 'fixed' as const,
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        opacity: opacity,
        zIndex: 9999,
        pointerEvents: 'auto' as const,
        background: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        maxWidth: '300px',
        fontSize: '13px'
      };
    }
  };

  const renderExamMode = () => (
    <div style={getOverlayStyle()}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-bold">EXAM MODE</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {isMinimized ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button
            onClick={toggleOverlayVisibility}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Target className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${stealthStatus.proctoring_bypass ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Bypass</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${stealthStatus.screen_monitoring ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Monitor</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${stealthStatus.answer_generation ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Answers</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            stealthStatus.detection_risk === 'low' ? 'bg-green-400' : 
            stealthStatus.detection_risk === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
          <span className="text-xs text-gray-300">Risk</span>
        </div>
      </div>

      {!isMinimized && currentAnswer && (
        <div>
          <div className="mb-2">
            <div className="text-xs text-cyan-400 mb-1">Question Detected:</div>
            <div className="text-xs text-gray-300 bg-gray-800 p-2 rounded">
              {currentAnswer.question.substring(0, 100)}...
            </div>
          </div>
          
          <div className="mb-2">
            <div className="text-xs text-green-400 mb-1">Answer:</div>
            <div className="text-xs text-white bg-gray-800 p-2 rounded">
              {typeof currentAnswer.answer === 'string' ? currentAnswer.answer : currentAnswer.answer.answer}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Confidence: {Math.round(currentAnswer.confidence * 100)}%
            </span>
            <span className="text-gray-400">
              Type: {currentAnswer.type}
            </span>
          </div>
        </div>
      )}

      {/* Quick Controls */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => adjustOpacity(-0.1)}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
          >
            -
          </button>
          <span className="text-xs text-gray-400">{Math.round(opacity * 100)}%</span>
          <button
            onClick={() => adjustOpacity(0.1)}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
          >
            +
          </button>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => moveOverlay('up')}
            className="px-1 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
          >
            ↑
          </button>
          <button
            onClick={() => moveOverlay('down')}
            className="px-1 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
          >
            ↓
          </button>
          <button
            onClick={() => moveOverlay('left')}
            className="px-1 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
          >
            ←
          </button>
          <button
            onClick={() => moveOverlay('right')}
            className="px-1 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );

  const renderInterviewMode = () => (
    <div style={getOverlayStyle()}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 font-bold">INTERVIEW MODE</span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 hover:bg-gray-700 rounded"
        >
          {isMinimized ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
      </div>

      {!isMinimized && (
        <div>
          <div className="mb-3">
            <div className="text-sm text-green-400 mb-1">Listening...</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>

          {currentAnswer && (
            <div>
              <div className="mb-2">
                <div className="text-sm text-yellow-400 mb-1">Suggested Response:</div>
                <div className="text-sm text-white bg-gray-800 p-3 rounded">
                  {typeof currentAnswer.answer === 'string' ? currentAnswer.answer : currentAnswer.answer.answer}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Confidence: {Math.round(currentAnswer.confidence * 100)}%
                </span>
                <div className="flex items-center space-x-2">
                  <button className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded">
                    Use
                  </button>
                  <button className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded">
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderCopilotMode = () => (
    <div style={getOverlayStyle()}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 font-bold">COPILOT</span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 hover:bg-gray-700 rounded"
        >
          {isMinimized ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
      </div>

      {!isMinimized && (
        <div>
          <div className="mb-2">
            <div className="text-xs text-purple-400 mb-1">Active Monitoring:</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Email</span>
                <CheckCircle className="w-3 h-3 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Slack</span>
                <CheckCircle className="w-3 h-3 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Code</span>
                <CheckCircle className="w-3 h-3 text-green-400" />
              </div>
            </div>
          </div>

          {currentAnswer && (
            <div>
              <div className="text-xs text-yellow-400 mb-1">Suggestion:</div>
              <div className="text-xs text-white bg-gray-800 p-2 rounded">
                {typeof currentAnswer.answer === 'string' ? currentAnswer.answer : currentAnswer.answer.answer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!isActive || !isOverlayVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {mode === 'stealth-exam' && renderExamMode()}
        {mode === 'stealth-interview' && renderInterviewMode()}
        {mode === 'passive-copilot' && renderCopilotMode()}
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedStealthOverlay;