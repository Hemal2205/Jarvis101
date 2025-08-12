import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Brain, Shield, Mic, MicOff, Maximize2, Minimize2 
} from 'lucide-react';

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
  processing_time?: number;
  model_used?: string;
}

interface StealthStatus {
  is_active: boolean;
  current_mode: string;
  hardware_fingerprint: string;
  proctoring_bypass_status: {
    active_bypasses: number;
    hardware_fingerprint: string;
    original_fingerprint: string;
    bypass_methods: string[];
  };
  screen_monitoring: boolean;
  audio_monitoring: boolean;
  queue_sizes: {
    questions: number;
    answers: number;
    audio: number;
  };
}

const EnhancedStealthOverlay: React.FC<StealthOverlayProps> = ({ mode, isActive }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.9);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [stealthStatus, setStealthStatus] = useState<StealthStatus | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isListening, setIsListening] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const initializeStealthMode = useCallback(async () => {
    try {
      const response = await fetch('/api/stealth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode.replace('stealth-', '') })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        console.log('Advanced stealth mode activated:', result.features);
      }
    } catch (error) {
      console.error('Stealth mode initialization error:', error);
    }
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      initializeStealthMode();
      startMonitoring();
      startStatusPolling();
    } else {
      cleanup();
    }
  }, [isActive, mode, initializeStealthMode]);

  useEffect(() => {
    // Auto-hide overlay when not in use
    if (answers.length === 0) {
      const timer = setTimeout(() => {
        setIsOverlayVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [answers]);

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

  const startStatusPolling = () => {
    // Poll for stealth status
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/stealth/status');
        const status = await response.json();
        setStealthStatus(status);
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const cleanup = () => {
    setAnswers([]);
    setCurrentAnswer(null);
    setIsOverlayVisible(false);
    setStealthStatus(null);
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && overlayRef.current) {
      const newX = ((e.clientX - dragOffset.x) / window.innerWidth) * 100;
      const newY = ((e.clientY - dragOffset.y) / window.innerHeight) * 100;
      
      setPosition({
        x: Math.max(0, Math.min(90, newX)),
        y: Math.max(0, Math.min(90, newY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getOverlayStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      top: `${position.y}%`,
      left: `${position.x}%`,
      transform: 'translate(-50%, -50%)',
      opacity: opacity,
      zIndex: 9999,
      pointerEvents: 'auto' as const,
      backdropFilter: 'blur(10px)',
      borderRadius: '8px',
      padding: '12px',
      maxWidth: '400px',
      fontSize: '12px',
      fontFamily: 'monospace',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none' as const,
      border: '1px solid rgba(0, 255, 255, 0.3)',
      background: 'rgba(0, 0, 0, 0.8)',
      transition: isDragging ? 'none' : 'all 0.3s ease'
    };

    if (mode === 'stealth-exam') {
      return {
        ...baseStyle,
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 0, 0, 0.3)'
      };
    } else if (mode === 'stealth-interview') {
      return {
        ...baseStyle,
        background: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid rgba(0, 255, 0, 0.3)'
      };
    } else {
      return {
        ...baseStyle,
        background: 'rgba(0, 0, 0, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      };
    }
  };

  const renderExamMode = () => (
    <div 
      ref={overlayRef}
      style={getOverlayStyle()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
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
          <div className={`w-2 h-2 rounded-full ${stealthStatus?.proctoring_bypass_status?.active_bypasses ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Bypass</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${stealthStatus?.screen_monitoring ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Monitor</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${stealthStatus?.audio_monitoring ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Audio</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${answers.length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-xs text-gray-300">Queue</span>
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
            {currentAnswer.processing_time && (
              <span className="text-gray-400">
                {currentAnswer.processing_time.toFixed(2)}s
              </span>
            )}
          </div>

          {currentAnswer.model_used && (
            <div className="text-xs text-gray-500 mt-1">
              Model: {currentAnswer.model_used}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => adjustOpacity(-0.1)}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            -
          </button>
          <span className="text-xs text-gray-400">{Math.round(opacity * 100)}%</span>
          <button
            onClick={() => adjustOpacity(0.1)}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            +
          </button>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => moveOverlay('left')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            ←
          </button>
          <button
            onClick={() => moveOverlay('up')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            ↑
          </button>
          <button
            onClick={() => moveOverlay('down')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            ↓
          </button>
          <button
            onClick={() => moveOverlay('right')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );

  const renderInterviewMode = () => (
    <div 
      ref={overlayRef}
      style={getOverlayStyle()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Mic className={`w-4 h-4 ${isListening ? 'text-green-400' : 'text-gray-400'}`} />
          <span className="text-green-400 font-bold">INTERVIEW MODE</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`p-1 rounded ${isListening ? 'text-red-400' : 'text-gray-400'}`}
          >
            {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
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
          <div className={`w-2 h-2 rounded-full ${stealthStatus?.proctoring_bypass_status?.active_bypasses ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Bypass</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${stealthStatus?.screen_monitoring ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Monitor</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${stealthStatus?.audio_monitoring ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Audio</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${answers.length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-xs text-gray-300">Queue</span>
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
            {currentAnswer.processing_time && (
              <span className="text-gray-400">
                {currentAnswer.processing_time.toFixed(2)}s
              </span>
            )}
          </div>

          {currentAnswer.model_used && (
            <div className="text-xs text-gray-500 mt-1">
              Model: {currentAnswer.model_used}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => adjustOpacity(-0.1)}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            -
          </button>
          <span className="text-xs text-gray-400">{Math.round(opacity * 100)}%</span>
          <button
            onClick={() => adjustOpacity(0.1)}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            +
          </button>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => moveOverlay('left')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            ←
          </button>
          <button
            onClick={() => moveOverlay('up')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            ↑
          </button>
          <button
            onClick={() => moveOverlay('down')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            ↓
          </button>
          <button
            onClick={() => moveOverlay('right')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );

  const renderPassiveCopilotMode = () => (
    <div 
      ref={overlayRef}
      style={getOverlayStyle()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 font-bold">PASSIVE COPILOT</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
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
          <div className={`w-2 h-2 rounded-full ${stealthStatus?.proctoring_bypass_status?.active_bypasses ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Bypass</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${stealthStatus?.screen_monitoring ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Monitor</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${stealthStatus?.audio_monitoring ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">Audio</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${answers.length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-xs text-gray-300">Queue</span>
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
            {currentAnswer.processing_time && (
              <span className="text-gray-400">
                {currentAnswer.processing_time.toFixed(2)}s
              </span>
            )}
          </div>

          {currentAnswer.model_used && (
            <div className="text-xs text-gray-500 mt-1">
              Model: {currentAnswer.model_used}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => adjustOpacity(-0.1)}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            -
          </button>
          <span className="text-xs text-gray-400">{Math.round(opacity * 100)}%</span>
          <button
            onClick={() => adjustOpacity(0.1)}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            +
          </button>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => moveOverlay('left')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            ←
          </button>
          <button
            onClick={() => moveOverlay('up')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            ↑
          </button>
          <button
            onClick={() => moveOverlay('down')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            ↓
          </button>
          <button
            onClick={() => moveOverlay('right')}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOverlayVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: opacity,
            zIndex: 9999,
            pointerEvents: 'auto',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '12px',
            maxWidth: '400px',
            fontSize: '12px',
            fontFamily: 'monospace',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            background: 'rgba(0, 0, 0, 0.8)',
            transition: isDragging ? 'none' : 'all 0.3s ease'
          }}
        >
          {mode === 'stealth-exam' && renderExamMode()}
          {mode === 'stealth-interview' && renderInterviewMode()}
          {mode === 'passive-copilot' && renderPassiveCopilotMode()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedStealthOverlay;