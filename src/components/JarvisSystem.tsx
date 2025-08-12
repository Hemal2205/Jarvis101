import React, { useEffect, useState, useRef } from 'react';
import { useJarvis } from '../context/JarvisContext';
import { useNotification } from './NotificationContext';

// Icons
import { 
  Send, 
  Mic, 
  MicOff, 
  Settings, 
  Brain, 
  MessageSquare, 
  FileText, 
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
  RotateCcw
} from 'lucide-react';

import ComprehensiveDashboard from './Dashboard/ComprehensiveDashboard';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  isProcessing?: boolean;
}

interface LLMConfig {
  openai_api_key: string;
  gemini_api_key: string;
  local_model_enabled: boolean;
  selected_model: 'openai' | 'gemini' | 'local';
  local_model_name?: string;
  online_model_id?: string; // Add this to track which online model is selected
}

export const JarvisSystem: React.FC = () => {
  const { state } = useJarvis();
  const { notify } = useNotification();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    openai_api_key: localStorage.getItem('openai_api_key') || '',
    gemini_api_key: 'AIzaSyCqXzu-tmqD6UHg5QjsPAz0UJay3wIKfEQ',
    local_model_enabled: true,
    selected_model: 'local'
  });
  const [systemStatus, setSystemStatus] = useState({
    brain: true,
    voice: false,
    local_models: false,
    backend: false
  });
  const [showComprehensiveDashboard, setShowComprehensiveDashboard] = useState(false);
  const [availableModels, setAvailableModels] = useState<{ local_models: any[]; online_models: any[] }>({ local_models: [], online_models: [] });
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize system
  useEffect(() => {
    initializeSystem();
    addSystemMessage('J.A.R.V.I.S is online and ready to assist you.');
  }, []);

  useEffect(() => {
    // Fetch available models on mount
    const fetchModels = async () => {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const res = await fetch('/api/llm/models');
        const data = await res.json();
        setAvailableModels(data);
      } catch (err) {
        setModelsError('Failed to load models');
      }
      setModelsLoading(false);
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (!llmConfig.selected_model || (llmConfig.selected_model === 'local' && !llmConfig.local_model_name)) {
      setShowSettings(true);
    }
  }, []);

  const initializeSystem = async () => {
    try {
      // Check backend status
      const response = await fetch('http://127.0.0.1:8000/api/status');
      if (response.ok) {
        setSystemStatus(prev => ({ ...prev, backend: true }));
        addSystemMessage('Backend connected successfully.');
      }
    } catch (error) {
      addSystemMessage('Backend not available. Running in offline mode.');
    }

    // Check local models
    try {
      const modelResponse = await fetch('http://127.0.0.1:8000/api/models/status');
      if (modelResponse.ok) {
        const modelData = await modelResponse.json();
        if (modelData.available_models?.length > 0) {
          setSystemStatus(prev => ({ ...prev, local_models: true }));
          addSystemMessage(`Local models detected: ${modelData.available_models.map((m: any) => m.name).join(', ')}`);
        }
      }
    } catch (error) {
      addSystemMessage('Local models not available.');
    }
  };

  const addSystemMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  // Browser TTS function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      // Optionally set voice, pitch, rate, etc. here
      window.speechSynthesis.speak(utterance);
    }
  };

  const addAssistantMessage = (content: string, model?: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'assistant',
        content,
        timestamp: new Date(),
        model,
      },
    ]);
    speakText(content); // Speak the reply
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addUserMessage(userMessage);
    setIsProcessing(true);

    try {
      let response;
      const selectedModel = llmConfig.selected_model;
      let modelId = selectedModel;
      let apiKey = '';
      if (selectedModel === 'local') {
        modelId = llmConfig.local_model_name || (availableModels.local_models[0]?.name || '');
      } else if (selectedModel === 'openai' || selectedModel === 'gemini') {
        modelId = llmConfig.online_model_id || (selectedModel === 'openai' ? 'gpt-4' : 'gemini');
        apiKey = selectedModel === 'openai' ? llmConfig.openai_api_key : 'AIzaSyCqXzu-tmqD6UHg5QjsPAz0UJay3wIKfEQ';
      }
      if ((selectedModel === 'openai' && !apiKey) || (selectedModel === 'gemini' && !apiKey)) {
        addAssistantMessage('Please configure your API key in settings.', 'error');
        setIsProcessing(false);
        return;
      }
      response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, model: modelId, api_key: apiKey })
      });
      const data = await response.json();
      if (data.reply) {
        addAssistantMessage(data.reply, selectedModel);
      } else {
        addAssistantMessage('Sorry, I did not receive a reply from the LLM.', 'error');
      }
    } catch (error) {
      addAssistantMessage('Network error. Please check your connection.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    notify('Voice recording started', 'info');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Send audio to backend for transcription
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice.webm');
        try {
          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          if (data.text) {
            addUserMessage(data.text);
            // Trigger LLM reply
            setInputMessage(data.text);
            handleSendMessage();
          } else {
            addSystemMessage('Could not transcribe audio.');
          }
        } catch (err) {
          addSystemMessage('Voice transcription failed.');
        }
      };
      mediaRecorder.start();
    } catch (err) {
      setIsRecording(false);
      notify('Microphone access denied or unavailable.', 'error');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    notify('Voice recording stopped', 'info');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleVoiceOutput = () => {
    setIsListening(!isListening);
    notify(isListening ? 'Voice output disabled' : 'Voice output enabled', 'info');
  };

  const saveSettings = () => {
    localStorage.setItem('openai_api_key', llmConfig.openai_api_key);
    localStorage.setItem('gemini_api_key', llmConfig.gemini_api_key);
    notify('Settings saved successfully', 'success');
    setShowSettings(false);
  };

  const clearChat = () => {
    setMessages([]);
    addSystemMessage('Chat history cleared.');
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Header */}
      <div className="relative z-10 bg-black/80 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="text-cyan-300 font-bold text-xl">J.A.R.V.I.S</div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus.brain ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-cyan-200 text-sm">Brain</span>
              <div className={`w-2 h-2 rounded-full ${systemStatus.backend ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-cyan-200 text-sm">Backend</span>
              <div className={`w-2 h-2 rounded-full ${systemStatus.local_models ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-cyan-200 text-sm">Models</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowComprehensiveDashboard(true)}
              className="p-2 text-cyan-300 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-cyan-300 hover:bg-cyan-500/20 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={24} />
            </button>
            <button
              onClick={clearChat}
              className="p-2 text-cyan-300 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
            </button>
            <div className="text-cyan-200 text-sm">Welcome, {state.currentUser}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full pt-16">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-cyan-600 text-white'
                      : message.type === 'system'
                      ? 'bg-gray-700 text-cyan-200'
                      : 'bg-gray-800 text-cyan-100 border border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {message.type === 'assistant' && <Brain size={16} />}
                    {message.type === 'system' && <Shield size={16} />}
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.model && (
                      <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded">
                        Model: {message.model}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-cyan-100 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span>Processing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-cyan-500/30 bg-black/50 backdrop-blur-sm p-4">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask J.A.R.V.I.S anything..."
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg p-3 text-cyan-100 placeholder-cyan-300/50 focus:outline-none focus:border-cyan-500 resize-none"
                  rows={1}
                  disabled={isProcessing}
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleVoiceRecording}
                  className={`p-3 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-cyan-600 text-white hover:bg-cyan-500'
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={toggleVoiceOutput}
                  className={`p-3 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {isListening ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isProcessing}
                  className="p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-96 bg-gray-900 border-l border-cyan-500/30 p-6 overflow-y-auto">
            <h2 className="text-cyan-300 text-xl font-bold mb-6">Settings</h2>
            {/* LLM Configuration */}
            <div className="space-y-4">
              <h3 className="text-cyan-200 font-semibold">AI Model Configuration</h3>
              {modelsLoading ? (
                <div className="text-cyan-200">Loading models...</div>
              ) : modelsError ? (
                <div className="text-red-400">{modelsError}</div>
              ) : (
                <>
                  <div>
                    <label className="block text-cyan-200 text-sm mb-2">Select Model</label>
                    <select
                      value={llmConfig.selected_model === 'local' ? (llmConfig.local_model_name || '') : llmConfig.selected_model}
                      onChange={e => {
                        const val = e.target.value;
                        // If it's an online model id, set selected_model and online_model_id
                        const isOnline = availableModels.online_models.some(m => m.id === val);
                        if (isOnline) {
                          setLlmConfig(prev => ({ ...prev, selected_model: val.startsWith('gpt') ? 'openai' : 'gemini', online_model_id: val, local_model_name: '' }));
                        } else {
                          setLlmConfig(prev => ({ ...prev, selected_model: 'local', local_model_name: val, online_model_id: '' }));
                        }
                      }}
                      className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg p-2 text-cyan-100"
                    >
                      <optgroup label="Online Models">
                        {availableModels.online_models.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Local Models">
                        {availableModels.local_models.map(m => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  {(llmConfig.selected_model === 'openai') && (
                    <div>
                      <label className="block text-cyan-200 text-sm mb-2">OpenAI API Key</label>
                      <input
                        type="password"
                        value={llmConfig.openai_api_key}
                        onChange={e => setLlmConfig(prev => ({ ...prev, openai_api_key: e.target.value }))}
                        placeholder="sk-..."
                        className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg p-2 text-cyan-100"
                      />
                    </div>
                  )}
                  {(llmConfig.selected_model === 'gemini') && (
                    <div>
                      <label className="block text-cyan-200 text-sm mb-2">Gemini API Key</label>
                      <input
                        type="password"
                        value={llmConfig.gemini_api_key}
                        onChange={e => setLlmConfig(prev => ({ ...prev, gemini_api_key: e.target.value }))}
                        placeholder="AIza..."
                        className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg p-2 text-cyan-100"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-cyan-500/30">
              <button
                onClick={saveSettings}
                className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-500 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Dashboard */}
      {showComprehensiveDashboard && (
        <ComprehensiveDashboard onClose={() => setShowComprehensiveDashboard(false)} />
      )}
    </div>
  );
};