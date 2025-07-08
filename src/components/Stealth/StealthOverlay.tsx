import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { Eye, EyeOff, Mic, MicOff, MessageCircle, FileText } from 'lucide-react';

interface StealthOverlayProps {
  mode: 'stealth-interview' | 'stealth-exam';
}

export const StealthOverlay: React.FC<StealthOverlayProps> = ({ mode }) => {
  const { state } = useJarvis();
  const [isVisible, setIsVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');

  useEffect(() => {
    // Initialize stealth mode
    if (mode === 'stealth-interview') {
      // Start voice recognition for interview assistance
      startInterviewMode();
    } else if (mode === 'stealth-exam') {
      // Initialize exam assistance
      startExamMode();
    }
  }, [mode]);

  const startInterviewMode = () => {
    setIsListening(true);
    // Voice recognition logic would go here
    // This would connect to the backend for real-time transcription
    console.log('Interview mode activated');
  };

  const startExamMode = () => {
    // Initialize exam assistance
    console.log('Exam mode activated');
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const mockSuggestions = [
    "I have experience with React and TypeScript in my previous projects...",
    "My approach to problem-solving involves breaking down complex issues...",
    "I believe in continuous learning and staying updated with technology...",
    "Team collaboration is essential for successful project delivery...",
  ];

  if (mode === 'stealth-interview') {
    return (
      <div className="fixed inset-0 z-40 pointer-events-none">
        {/* Toggle Button */}
        <button
          onClick={toggleVisibility}
          className="fixed top-4 right-4 p-2 bg-gray-800 bg-opacity-50 rounded-full text-gray-400 hover:text-white transition-colors pointer-events-auto"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Stealth Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          className="fixed top-16 right-4 w-80 bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-lg border border-cyan-500 border-opacity-30 p-4 pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-cyan-400">Interview Assistant</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsListening(!isListening)}
                className={`p-1 rounded ${isListening ? 'text-red-400' : 'text-gray-400'}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Live Transcription */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-1">Live Transcription:</div>
            <div className="p-2 bg-gray-800 rounded text-sm text-gray-300 min-h-[60px]">
              {currentTranscription || 'Listening...'}
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Suggested Responses:</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {mockSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-2 bg-gray-800 rounded text-xs text-gray-300 hover:bg-gray-700 cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(suggestion)}
                >
                  {suggestion}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'stealth-exam') {
    return (
      <div className="fixed inset-0 z-40 pointer-events-none">
        {/* Toggle Button */}
        <button
          onClick={toggleVisibility}
          className="fixed bottom-4 right-4 p-2 bg-gray-800 bg-opacity-50 rounded-full text-gray-400 hover:text-white transition-colors pointer-events-auto"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Stealth Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          className="fixed bottom-16 right-4 w-80 bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-lg border border-cyan-500 border-opacity-30 p-4 pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-cyan-400">Exam Assistant</h3>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Quick Answer Area */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-1">Quick Answer:</div>
            <div className="p-2 bg-gray-800 rounded text-sm text-gray-300 min-h-[60px]">
              Analyzing question... Answer will appear here.
            </div>
          </div>

          {/* Tools */}
          <div className="grid grid-cols-2 gap-2">
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors">
              Calculator
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors">
              Notes
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors">
              Search
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors">
              Code Help
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};