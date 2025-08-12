import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  History, 
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Zap,
  User,
  Brain
} from 'lucide-react';

interface VoiceCommand {
  id: string;
  command: string;
  response: string;
  timestamp: Date;
  confidence: number;
  status: 'success' | 'error' | 'processing';
}

interface VoiceModel {
  id: string;
  name: string;
  language: string;
  accuracy: number;
  status: 'active' | 'training' | 'offline';
  lastUpdated: string;
}

const mockCommands: VoiceCommand[] = [
  {
    id: '1',
    command: 'Open system status',
    response: 'Opening system status dashboard',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    confidence: 95,
    status: 'success'
  },
  {
    id: '2',
    command: 'What\'s the weather like?',
    response: 'I\'m sorry, I don\'t have access to weather data at the moment',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    confidence: 88,
    status: 'success'
  },
  {
    id: '3',
    command: 'Set reminder for tomorrow',
    response: 'Reminder set for tomorrow at 9:00 AM',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    confidence: 92,
    status: 'success'
  },
  {
    id: '4',
    command: 'Unknown command',
    response: 'I didn\'t understand that command. Please try again.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    confidence: 45,
    status: 'error'
  }
];

const mockModels: VoiceModel[] = [
  {
    id: '1',
    name: 'JARVIS Core',
    language: 'English',
    accuracy: 96.5,
    status: 'active',
    lastUpdated: '2 hours ago'
  },
  {
    id: '2',
    name: 'Multi-Language',
    language: 'Spanish',
    accuracy: 89.2,
    status: 'training',
    lastUpdated: '1 day ago'
  },
  {
    id: '3',
    name: 'Technical Terms',
    language: 'English',
    accuracy: 94.8,
    status: 'active',
    lastUpdated: '3 hours ago'
  }
];

export const VoiceRecognition: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>(mockCommands);
  const [models, setModels] = useState<VoiceModel[]>(mockModels);
  const [confidence, setConfidence] = useState(0);
  const [volume, setVolume] = useState(70);
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    // Initialize audio context for visualization
    if (typeof window !== 'undefined') {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (audioContext.current && analyser.current) {
        microphone.current = audioContext.current.createMediaStreamSource(stream);
        microphone.current.connect(analyser.current);
        
        // Start visualization
        visualize();
      }
      
      setIsListening(true);
      setIsProcessing(true);
      
      // Simulate voice recognition
      setTimeout(() => {
        const mockCommand = 'Open dashboard';
        setCurrentTranscript(mockCommand);
        setIsProcessing(false);
        
        // Add to commands history
        const newCommand: VoiceCommand = {
          id: Date.now().toString(),
          command: mockCommand,
          response: 'Opening dashboard...',
          timestamp: new Date(),
          confidence: Math.random() * 20 + 80, // 80-100%
          status: 'success'
        };
        
        setCommands(prev => [newCommand, ...prev]);
        setCurrentTranscript('');
      }, 3000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setIsProcessing(false);
    setCurrentTranscript('');
    setConfidence(0);
    
    if (microphone.current) {
      microphone.current.disconnect();
      microphone.current = null;
    }
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
  };

  const visualize = () => {
    if (!analyser.current) return;
    
    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume for confidence
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
    setConfidence(Math.min(100, average * 2));
    
    animationFrame.current = requestAnimationFrame(visualize);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'processing': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'training': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-cyan-300 mb-2 flex items-center justify-center">
            <Mic className="w-8 h-8 mr-3" />
            Voice Recognition
          </h2>
          <p className="text-cyan-200 text-lg">Advanced speech-to-text and voice command system</p>
        </div>

        {/* Voice Control Panel */}
        <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-8 shadow-xl">
          <div className="flex items-center justify-center space-x-8">
            {/* Main Voice Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              disabled={isMuted}
              className={`relative p-8 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-cyan-600 hover:bg-cyan-700'
              } ${isMuted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
              
              {/* Confidence Ring */}
              {isListening && (
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="rgba(34, 197, 94, 0.3)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="#22c55e"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${confidence * 2.83} 283`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
              )}
            </motion.button>

            {/* Controls */}
            <div className="flex flex-col space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMute}
                className={`p-4 rounded-full transition ${
                  isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-cyan-400 hover:bg-gray-600'
                }`}
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(!showHistory)}
                className="p-4 rounded-full bg-gray-700 text-cyan-400 hover:bg-gray-600 transition"
              >
                <History className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Status Display */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">
                  {isListening ? 'Listening...' : 'Ready'}
                </div>
                <div className="text-sm text-cyan-400">
                  {isListening ? 'Speak now' : 'Click to start'}
                </div>
              </div>
              
              {isListening && (
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{confidence.toFixed(1)}%</div>
                  <div className="text-sm text-cyan-400">Confidence</div>
                </div>
              )}
            </div>
          </div>

          {/* Current Transcript */}
          {currentTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-cyan-500/20"
            >
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-200 font-medium">Current Transcript</span>
              </div>
              <div className="text-cyan-100">{currentTranscript}</div>
              {isProcessing && (
                <div className="flex items-center space-x-2 mt-2 text-yellow-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                  <span className="text-sm">Processing...</span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Models */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Voice Models
              </h3>
              
              <div className="space-y-4">
                {models.map((model) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-cyan-100">{model.name}</h4>
                        <p className="text-sm text-cyan-400">{model.language}</p>
                      </div>
                      <div className={`text-sm font-medium ${getModelStatusColor(model.status)}`}>
                        {model.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-400">Accuracy</span>
                      <span className="text-cyan-200">{model.accuracy}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${model.accuracy}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-cyan-500 mt-2">
                      Updated: {model.lastUpdated}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Audio Settings */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Audio Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400">Volume</span>
                    <span className="text-cyan-200">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition text-center"
                  >
                    <Download className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                    <div className="text-sm text-cyan-200">Export Model</div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition text-center"
                  >
                    <Upload className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                    <div className="text-sm text-cyan-200">Import Model</div>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Command History */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <History className="w-5 h-5 mr-2" />
                Recent Commands
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {commands.map((command) => (
                  <motion.div
                    key={command.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={getStatusColor(command.status)}>
                          {getStatusIcon(command.status)}
                        </div>
                        <h4 className="font-medium text-cyan-100">{command.command}</h4>
                      </div>
                      <span className="text-sm text-cyan-400">{command.confidence.toFixed(1)}%</span>
                    </div>
                    
                    <p className="text-sm text-cyan-300 mb-2">{command.response}</p>
                    
                    <div className="flex items-center justify-between text-xs text-cyan-500">
                      <span>{formatTimeAgo(command.timestamp)}</span>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-cyan-400 hover:text-cyan-300 transition"
                          title="Replay command"
                        >
                          <Play className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-red-400 hover:text-red-300 transition"
                          title="Delete command"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Voice Analytics */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Voice Analytics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-300">{commands.length}</div>
                  <div className="text-sm text-cyan-400">Total Commands</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {commands.filter(c => c.status === 'success').length}
                  </div>
                  <div className="text-sm text-cyan-400">Successful</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {(commands.reduce((acc, cmd) => acc + cmd.confidence, 0) / commands.length).toFixed(1)}%
                  </div>
                  <div className="text-sm text-cyan-400">Avg Confidence</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {models.filter(m => m.status === 'active').length}
                  </div>
                  <div className="text-sm text-cyan-400">Active Models</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 