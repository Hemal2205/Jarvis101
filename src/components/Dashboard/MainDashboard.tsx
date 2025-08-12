import React, { useState, useEffect } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Brain, 
  Mic, 
  Camera, 
  Settings, 
  BarChart3, 
  Users, 
  Shield, 
  Zap,
  Volume2,
  VolumeX,
  Key,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  User,
  UserCheck,
  FileText,
  Code,
  Palette,
  Music,
  Video,
  Image,
  Database,
  Cloud,
  HardDrive,
  Network,
  Activity,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Rocket,
  Star,
  Heart,
  Activity as ActivityIcon,
  MessageSquare
} from 'lucide-react';
import DraggablePanel from '../DraggablePanel';

interface DashboardProps {
  onOpenChat: () => void;
  onOpenSkills: () => void;
  onOpenAnalytics: () => void;
  onOpenVoice: () => void;
  onOpenFace: () => void;
  onOpenTTS: () => void;
  onOpenSettings: () => void;
}

export const MainDashboard: React.FC<DashboardProps> = ({
  onOpenChat,
  onOpenSkills,
  onOpenAnalytics,
  onOpenVoice,
  onOpenFace,
  onOpenTTS,
  onOpenSettings
}) => {
  const { state, setMode } = useJarvis();
  const { notify } = useNotification();
  const [currentMode, setCurrentMode] = useState(state.mode);
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    activeTasks: 0,
    completedTasks: 0,
    skillsLearned: 0,
    voiceCommands: 0
  });
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isFaceRecognitionActive, setIsFaceRecognitionActive] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState('local');
  const [apiKeys, setApiKeys] = useState({
    openai: localStorage.getItem('openai_api_key') || '',
    gemini: localStorage.getItem('gemini_api_key') || ''
  });

  useEffect(() => {
    loadSystemStats();
    const interval = setInterval(loadSystemStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitor/status');
      if (response.ok) {
        const data = await response.json();
        setSystemStats({
          cpu: data.cpu_usage || 0,
          memory: data.memory_usage || 0,
          disk: data.disk_usage || 0,
          network: data.network_usage || 0,
          activeTasks: data.active_tasks || 0,
          completedTasks: data.completed_tasks || 0,
          skillsLearned: data.skills_learned || 0,
          voiceCommands: data.voice_commands || 0
        });
      }
    } catch (error) {
      console.error('Failed to load system stats:', error);
    }
  };

  const handleModeChange = async (mode: string) => {
    try {
      await setMode(mode as any);
      setCurrentMode(mode as any);
      notify(`Switched to ${mode} mode`, 'success');
    } catch (error) {
      notify('Failed to change mode', 'error');
    }
  };

  const toggleVoiceRecognition = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/voice/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isVoiceActive })
      });
      
      if (response.ok) {
        setIsVoiceActive(!isVoiceActive);
        notify(isVoiceActive ? 'Voice recognition disabled' : 'Voice recognition enabled', 'success');
      }
    } catch (error) {
      notify('Failed to toggle voice recognition', 'error');
    }
  };

  const toggleFaceRecognition = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/face/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isFaceRecognitionActive })
      });
      
      if (response.ok) {
        setIsFaceRecognitionActive(!isFaceRecognitionActive);
        notify(isFaceRecognitionActive ? 'Face recognition disabled' : 'Face recognition enabled', 'success');
      }
    } catch (error) {
      notify('Failed to toggle face recognition', 'error');
    }
  };

  const toggleTTS = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tts/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isTTSActive })
      });
      
      if (response.ok) {
        setIsTTSActive(!isTTSActive);
        notify(isTTSActive ? 'Text-to-speech disabled' : 'Text-to-speech enabled', 'success');
      }
    } catch (error) {
      notify('Failed to toggle TTS', 'error');
    }
  };

  const changeModel = async (model: string) => {
    setSelectedModel(model);
    localStorage.setItem('selected_model', model);
    notify(`Switched to ${model} model`, 'success');
  };

  const saveApiKeys = () => {
    localStorage.setItem('openai_api_key', apiKeys.openai);
    localStorage.setItem('gemini_api_key', apiKeys.gemini);
    notify('API keys saved successfully', 'success');
  };

  return (
    <DraggablePanel
      title="J.A.R.V.I.S Dashboard"
      defaultPosition={{ x: 120, y: 60 }}
      minWidth={1000}
      minHeight={700}
      className="dashboard-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cyan-300">J.A.R.V.I.S Dashboard</h1>
          <p className="text-cyan-200">Welcome back, {state.currentUser}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-cyan-300">Mode:</span> {currentMode}
          </div>
          <div className="text-sm">
            <span className="text-cyan-300">Model:</span> {selectedModel}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-300 font-semibold">CPU Usage</p>
              <p className="text-2xl font-bold">{systemStats.cpu}%</p>
            </div>
            <ActivityIcon className="text-cyan-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-300 font-semibold">Memory</p>
              <p className="text-2xl font-bold">{systemStats.memory}%</p>
            </div>
            <Database className="text-cyan-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-300 font-semibold">Active Tasks</p>
              <p className="text-2xl font-bold">{systemStats.activeTasks}</p>
            </div>
            <Target className="text-cyan-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-300 font-semibold">Skills Learned</p>
              <p className="text-2xl font-bold">{systemStats.skillsLearned}</p>
            </div>
            <Award className="text-cyan-400" size={24} />
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-cyan-300 mb-4">System Modes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'full', name: 'Full Mode', icon: Brain, desc: 'Complete functionality' },
            { id: 'stealth-interview', name: 'Interview', icon: User, desc: 'Interview assistance' },
            { id: 'stealth-exam', name: 'Exam Mode', icon: BookOpen, desc: 'Exam support' },
            { id: 'passive-copilot', name: 'Copilot', icon: Zap, desc: 'Background assistance' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`p-4 rounded-lg border transition-colors ${
                currentMode === mode.id
                  ? 'bg-cyan-600 border-cyan-400 text-white'
                  : 'bg-gray-800/50 border-cyan-500/30 text-cyan-200 hover:bg-gray-800/70'
              }`}
            >
              <mode.icon size={24} className="mb-2" />
              <div className="font-semibold">{mode.name}</div>
              <div className="text-xs opacity-70">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Chat Interface */}
        <button
          onClick={onOpenChat}
          className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-6 hover:bg-gray-800/70 transition-colors text-left"
        >
          <MessageSquare size={32} className="text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold text-cyan-300 mb-2">AI Chat</h3>
          <p className="text-cyan-200 text-sm">Chat with J.A.R.V.I.S using multiple AI models</p>
        </button>

        {/* Skills Dashboard */}
        <button
          onClick={onOpenSkills}
          className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-6 hover:bg-gray-800/70 transition-colors text-left"
        >
          <GraduationCap size={32} className="text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold text-cyan-300 mb-2">Skills Dashboard</h3>
          <p className="text-cyan-200 text-sm">Learn and practice new skills</p>
        </button>

        {/* Analytics */}
        <button
          onClick={onOpenAnalytics}
          className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-6 hover:bg-gray-800/70 transition-colors text-left"
        >
          <BarChart3 size={32} className="text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold text-cyan-300 mb-2">Analytics</h3>
          <p className="text-cyan-200 text-sm">View system insights and performance</p>
        </button>

        {/* Voice Recognition */}
        <button
          onClick={onOpenVoice}
          className={`border rounded-lg p-6 transition-colors text-left ${
            isVoiceActive
              ? 'bg-green-600/20 border-green-500/50'
              : 'bg-gray-800/50 border-cyan-500/30 hover:bg-gray-800/70'
          }`}
        >
          <Mic size={32} className={`mb-4 ${isVoiceActive ? 'text-green-400' : 'text-cyan-400'}`} />
          <h3 className="text-xl font-bold text-cyan-300 mb-2">Voice Recognition</h3>
          <p className="text-cyan-200 text-sm">Voice commands and speech-to-text</p>
          <div className={`text-xs mt-2 ${isVoiceActive ? 'text-green-400' : 'text-gray-400'}`}>
            {isVoiceActive ? 'Active' : 'Inactive'}
          </div>
        </button>

        {/* Face Recognition */}
        <button
          onClick={onOpenFace}
          className={`border rounded-lg p-6 transition-colors text-left ${
            isFaceRecognitionActive
              ? 'bg-green-600/20 border-green-500/50'
              : 'bg-gray-800/50 border-cyan-500/30 hover:bg-gray-800/70'
          }`}
        >
          <Camera size={32} className={`mb-4 ${isFaceRecognitionActive ? 'text-green-400' : 'text-cyan-400'}`} />
          <h3 className="text-xl font-bold text-cyan-300 mb-2">Face Recognition</h3>
          <p className="text-cyan-200 text-sm">Biometric authentication</p>
          <div className={`text-xs mt-2 ${isFaceRecognitionActive ? 'text-green-400' : 'text-gray-400'}`}>
            {isFaceRecognitionActive ? 'Active' : 'Inactive'}
          </div>
        </button>

        {/* Text-to-Speech */}
        <button
          onClick={onOpenTTS}
          className={`border rounded-lg p-6 transition-colors text-left ${
            isTTSActive
              ? 'bg-green-600/20 border-green-500/50'
              : 'bg-gray-800/50 border-cyan-500/30 hover:bg-gray-800/70'
          }`}
        >
          <Volume2 size={32} className={`mb-4 ${isTTSActive ? 'text-green-400' : 'text-cyan-400'}`} />
          <h3 className="text-xl font-bold text-cyan-300 mb-2">Text-to-Speech</h3>
          <p className="text-cyan-200 text-sm">Voice synthesis and audio output</p>
          <div className={`text-xs mt-2 ${isTTSActive ? 'text-green-400' : 'text-gray-400'}`}>
            {isTTSActive ? 'Active' : 'Inactive'}
          </div>
        </button>
      </div>

      {/* Model Configuration */}
      <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-cyan-300 mb-4">AI Model Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model Selection */}
          <div>
            <h3 className="text-cyan-200 font-semibold mb-3">Select Model</h3>
            <div className="space-y-2">
              {[
                { id: 'local', name: 'Local Models (GGUF)', desc: 'Mistral & Llama models' },
                { id: 'openai', name: 'OpenAI GPT-4', desc: 'Requires API key' },
                { id: 'gemini', name: 'Google Gemini', desc: 'Requires API key' }
              ].map((model) => (
                <button
                  key={model.id}
                  onClick={() => changeModel(model.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    selectedModel === model.id
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : 'bg-gray-700 border-cyan-500/30 text-cyan-200 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold">{model.name}</div>
                  <div className="text-xs opacity-70">{model.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Keys */}
          <div>
            <h3 className="text-cyan-200 font-semibold mb-3">API Keys</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-cyan-200 text-sm mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg p-2 text-cyan-100"
                />
              </div>
              <div>
                <label className="block text-cyan-200 text-sm mb-1">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKeys.gemini}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                  placeholder="AIza..."
                  className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg p-2 text-cyan-100"
                />
              </div>
              <button
                onClick={saveApiKeys}
                className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-500 transition-colors"
              >
                Save API Keys
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={toggleVoiceRecognition}
          className={`p-4 rounded-lg border transition-colors ${
            isVoiceActive
              ? 'bg-green-600/20 border-green-500/50 text-green-400'
              : 'bg-gray-800/50 border-cyan-500/30 text-cyan-200 hover:bg-gray-800/70'
          }`}
        >
          <Mic size={20} className="mb-2" />
          <div className="text-sm font-semibold">Voice</div>
        </button>

        <button
          onClick={toggleFaceRecognition}
          className={`p-4 rounded-lg border transition-colors ${
            isFaceRecognitionActive
              ? 'bg-green-600/20 border-green-500/50 text-green-400'
              : 'bg-gray-800/50 border-cyan-500/30 text-cyan-200 hover:bg-gray-800/70'
          }`}
        >
          <Camera size={20} className="mb-2" />
          <div className="text-sm font-semibold">Face</div>
        </button>

        <button
          onClick={toggleTTS}
          className={`p-4 rounded-lg border transition-colors ${
            isTTSActive
              ? 'bg-green-600/20 border-green-500/50 text-green-400'
              : 'bg-gray-800/50 border-cyan-500/30 text-cyan-200 hover:bg-gray-800/70'
          }`}
        >
          <Volume2 size={20} className="mb-2" />
          <div className="text-sm font-semibold">TTS</div>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-4 rounded-lg bg-gray-800/50 border border-cyan-500/30 text-cyan-200 hover:bg-gray-800/70 transition-colors"
        >
          <Settings size={20} className="mb-2" />
          <div className="text-sm font-semibold">Settings</div>
        </button>
      </div>
    </DraggablePanel>
  );
}; 