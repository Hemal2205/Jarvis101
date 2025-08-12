import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Upload,
  Settings,
  History,
  Save,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Waveform,
  Zap,
  Brain,
  Type,
  Mic,
  FileText
} from 'lucide-react';

interface VoiceModel {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  speed: number;
  pitch: number;
  quality: 'standard' | 'high' | 'ultra';
  isActive: boolean;
}

interface SpeechHistory {
  id: string;
  text: string;
  voice: string;
  timestamp: Date;
  duration: number;
  status: 'completed' | 'processing' | 'failed';
}

const mockVoices: VoiceModel[] = [
  {
    id: '1',
    name: 'JARVIS Voice',
    language: 'English',
    gender: 'male',
    speed: 1.0,
    pitch: 1.0,
    quality: 'ultra',
    isActive: true
  },
  {
    id: '2',
    name: 'Natural Female',
    language: 'English',
    gender: 'female',
    speed: 1.0,
    pitch: 1.0,
    quality: 'high',
    isActive: false
  },
  {
    id: '3',
    name: 'Robotic Assistant',
    language: 'English',
    gender: 'neutral',
    speed: 1.2,
    pitch: 0.9,
    quality: 'standard',
    isActive: false
  },
  {
    id: '4',
    name: 'Spanish Voice',
    language: 'Spanish',
    gender: 'female',
    speed: 1.0,
    pitch: 1.0,
    quality: 'high',
    isActive: false
  }
];

const mockHistory: SpeechHistory[] = [
  {
    id: '1',
    text: 'Welcome to JARVIS. All systems are operational.',
    voice: 'JARVIS Voice',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    duration: 3.2,
    status: 'completed'
  },
  {
    id: '2',
    text: 'System status check completed. All modules are functioning normally.',
    voice: 'JARVIS Voice',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    duration: 4.1,
    status: 'completed'
  },
  {
    id: '3',
    text: 'New message received from Sarah Chen regarding project updates.',
    voice: 'Natural Female',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    duration: 3.8,
    status: 'completed'
  },
  {
    id: '4',
    text: 'Error detected in voice recognition module. Attempting to restart.',
    voice: 'Robotic Assistant',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    duration: 3.5,
    status: 'failed'
  }
];

export const TextToSpeech: React.FC = () => {
  const [voices, setVoices] = useState<VoiceModel[]>(mockVoices);
  const [history, setHistory] = useState<SpeechHistory[]>(mockHistory);
  const [inputText, setInputText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<VoiceModel>(mockVoices[0]);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(70);
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async () => {
    if (!inputText.trim() || isMuted) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate TTS processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create audio element for playback
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Simulate speech synthesis
      const utterance = new SpeechSynthesisUtterance(inputText);
      utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes('Google')) || null;
      utterance.rate = speed;
      utterance.pitch = pitch;
      utterance.volume = volume / 100;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsProcessing(false);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        
        // Add to history
        const newEntry: SpeechHistory = {
          id: Date.now().toString(),
          text: inputText,
          voice: currentVoice.name,
          timestamp: new Date(),
          duration: inputText.length * 0.06, // Rough estimate
          status: 'completed'
        };
        
        setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsProcessing(false);
        
        const newEntry: SpeechHistory = {
          id: Date.now().toString(),
          text: inputText,
          voice: currentVoice.name,
          timestamp: new Date(),
          duration: 0,
          status: 'failed'
        };
        
        setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
      };
      
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('TTS Error:', error);
      setIsProcessing(false);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsProcessing(false);
  };

  const pauseSpeaking = () => {
    speechSynthesis.pause();
    setIsPlaying(false);
  };

  const resumeSpeaking = () => {
    speechSynthesis.resume();
    setIsPlaying(true);
  };

  const selectVoice = (voice: VoiceModel) => {
    setVoices(prev => 
      prev.map(v => ({ ...v, isActive: v.id === voice.id }))
    );
    setCurrentVoice(voice);
  };

  const saveVoice = () => {
    const newVoice: VoiceModel = {
      id: Date.now().toString(),
      name: `Custom Voice ${voices.length + 1}`,
      language: 'English',
      gender: 'neutral',
      speed,
      pitch,
      quality: 'standard',
      isActive: false
    };
    setVoices(prev => [...prev, newVoice]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tts-history.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const formatDuration = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
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
            <Volume2 className="w-8 h-8 mr-3" />
            Text-to-Speech
          </h2>
          <p className="text-cyan-200 text-lg">Advanced voice synthesis and speech generation</p>
        </div>

        {/* Main TTS Interface */}
        <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
              <Type className="w-5 h-5 mr-2" />
              Speech Synthesis
            </h3>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg transition ${
                  isMuted ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 text-cyan-400 hover:bg-gray-600'
                }`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-cyan-400 rounded-lg transition"
              >
                <History className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Text Input */}
          <div className="mb-6">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              className="w-full p-4 bg-gray-800 text-cyan-100 border border-cyan-500/20 rounded-lg focus:outline-none focus:border-cyan-400 transition resize-none"
              rows={4}
            />
            <div className="flex items-center justify-between mt-2 text-sm text-cyan-400">
              <span>{inputText.length} characters</span>
              <span>Estimated duration: {(inputText.length * 0.06).toFixed(1)}s</span>
            </div>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={speak}
              disabled={!inputText.trim() || isMuted || isProcessing}
              className={`p-4 rounded-full transition ${
                isPlaying 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-cyan-600 hover:bg-cyan-700'
              } ${(!inputText.trim() || isMuted || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </motion.button>

            {isPlaying && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseSpeaking}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition"
                >
                  <Pause className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resumeSpeaking}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition"
                >
                  <Play className="w-5 h-5" />
                </motion.button>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopSpeaking}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Voice Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Speed</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-cyan-200 min-w-[3rem] text-right">{speed}x</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Pitch</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-cyan-200 min-w-[3rem] text-right">{pitch}x</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Volume</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-cyan-200 min-w-[3rem] text-right">{volume}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Models */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Voice Models
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveVoice}
                  className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                >
                  <Save className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="space-y-3">
                {voices.map((voice) => (
                  <motion.div
                    key={voice.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      voice.isActive 
                        ? 'border-cyan-400 bg-cyan-900/20' 
                        : 'border-cyan-500/20 bg-gray-800/50 hover:border-cyan-400/40'
                    }`}
                    onClick={() => selectVoice(voice)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-cyan-100">{voice.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-cyan-400">
                          <span>{voice.language}</span>
                          <span className="capitalize">{voice.gender}</span>
                          <span className="capitalize">{voice.quality}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          voice.isActive ? 'bg-cyan-400' : 'bg-gray-600'
                        }`}></div>
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Speech History */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Speech History
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportHistory}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                        </div>
                        <h4 className="font-medium text-cyan-100">{item.voice}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-cyan-400">{formatDuration(item.duration)}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-cyan-300 mb-2 line-clamp-2">{item.text}</p>
                    
                    <div className="text-xs text-cyan-500">
                      {formatTimeAgo(item.timestamp)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* TTS Analytics */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                TTS Analytics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-300">{history.length}</div>
                  <div className="text-sm text-cyan-400">Total Speeches</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {history.filter(h => h.status === 'completed').length}
                  </div>
                  <div className="text-sm text-cyan-400">Successful</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {voices.filter(v => v.isActive).length}
                  </div>
                  <div className="text-sm text-cyan-400">Active Voices</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {history.reduce((acc, h) => acc + h.duration, 0).toFixed(1)}s
                  </div>
                  <div className="text-sm text-cyan-400">Total Duration</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 