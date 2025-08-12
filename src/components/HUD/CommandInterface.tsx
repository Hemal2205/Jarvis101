import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { Mic, Send, MicOff } from 'lucide-react';

export const CommandInterface: React.FC = () => {
  const { state } = useJarvis();
  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceCommand = () => {
    setIsListening(!isListening);
    // Voice recognition logic would go here
  };

  const handleSendCommand = async () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, user: state.currentUser }),
      });
      
      const result = await response.json();
      console.log('Command result:', result);
      
      // Handle response
      if (result.speak) {
        // Text-to-speech logic
        const utterance = new SpeechSynthesisUtterance(result.response);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Command failed:', error);
    } finally {
      setIsProcessing(false);
      setCommand('');
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Voice Visualizer */}
      <div className="relative mb-8">
        <motion.div
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
            opacity: isListening ? [0.5, 1, 0.5] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: isListening ? Infinity : 0,
          }}
          className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50"
        >
          <button
            onClick={handleVoiceCommand}
            className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-red-400" />
            ) : (
              <Mic className="w-8 h-8 text-cyan-400" />
            )}
          </button>
        </motion.div>
        
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-cyan-300 text-sm"
          >
            Listening...
          </motion.div>
        )}
      </div>

      {/* Command Input */}
      <div className="relative">
        <div className="flex items-center space-x-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl border border-cyan-500 border-opacity-30 p-4">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
            placeholder="Enter command or speak to J.A.R.V.I.S..."
            className="flex-1 bg-transparent text-cyan-100 placeholder-gray-500 outline-none"
          />
          <button
            onClick={handleSendCommand}
            disabled={!command.trim() || isProcessing}
            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-8 left-4 text-cyan-300 text-sm"
          >
            Processing...
          </motion.div>
        )}
      </div>

      {/* Quick Commands */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {[
          'What\'s my schedule?',
          'Record a memory',
          'Show system status',
          'Create a copy',
        ].map((quickCommand) => (
          <button
            key={quickCommand}
            onClick={() => setCommand(quickCommand)}
            className="p-3 rounded-lg bg-gray-800 bg-opacity-50 hover:bg-opacity-70 text-cyan-300 text-sm transition-colors"
          >
            {quickCommand}
          </button>
        ))}
      </div>
    </div>
  );
};