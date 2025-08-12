import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Brain,
  Mic,
  Camera,
  Volume2,
  Settings,
  BarChart3,
  BookOpen,
  Zap,
  Shield,
  Users,
  Cog,
  Menu,
  X,
  ChevronRight,
  Activity,
  Target,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useNotification } from '../NotificationContext';

interface DashboardProps {
  onClose?: () => void;
}

interface SystemStatus {
  voice_recognition: boolean;
  face_recognition: boolean;
  tts: boolean;
  ai_models: string[];
  active_model: string;
  system_health: 'good' | 'warning' | 'error';
  uptime: string;
  memory_usage: number;
  cpu_usage: number;
}

interface AnalyticsData {
  recent_events: any[];
  event_counts: any[];
  skills_summary: any;
  tasks_summary: any;
}

const ComprehensiveDashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'text-blue-400' },
    { id: 'skills', label: 'Skills', icon: Brain, color: 'text-green-400' },
    { id: 'voice', label: 'Voice Recognition', icon: Mic, color: 'text-purple-400' },
    { id: 'face', label: 'Face Recognition', icon: Camera, color: 'text-pink-400' },
    { id: 'tts', label: 'Text-to-Speech', icon: Volume2, color: 'text-orange-400' },
    { id: 'models', label: 'AI Models', icon: Zap, color: 'text-yellow-400' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-cyan-400' },
    { id: 'automation', label: 'Automation', icon: Cog, color: 'text-indigo-400' },
    { id: 'security', label: 'Security', icon: Shield, color: 'text-red-400' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-400' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load system status
      const statusResponse = await fetch('/api/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSystemStatus({
          voice_recognition: statusData.voice_recognition?.enabled || false,
          face_recognition: statusData.face_recognition?.enabled || false,
          tts: statusData.tts?.enabled || true,
          ai_models: statusData.ai_models || [],
          active_model: statusData.active_model || 'local',
          system_health: 'good',
          uptime: '2h 15m',
          memory_usage: 65,
          cpu_usage: 45
        });
      }

      // Load analytics data
      const analyticsResponse = await fetch('/api/analytics/dashboard');
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        setAnalyticsData(analytics);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      notify('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeature = async (feature: string, enabled: boolean) => {
    try {
      let endpoint = '';
      switch (feature) {
        case 'voice':
          endpoint = '/api/voice/recognition/toggle';
          break;
        case 'face':
          endpoint = '/api/face/recognition/toggle';
          break;
        case 'tts':
          endpoint = '/api/tts/toggle';
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        notify(`${feature} ${enabled ? 'enabled' : 'disabled'}`, 'success');
        await loadDashboardData();
      } else {
        notify(`Failed to toggle ${feature}`, 'error');
      }
    } catch (error) {
      console.error(`Failed to toggle ${feature}:`, error);
      notify(`Failed to toggle ${feature}`, 'error');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-6 rounded-xl border border-blue-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm">System Health</p>
              <p className="text-2xl font-bold text-blue-100">
                {systemStatus?.system_health === 'good' ? 'Good' : 'Warning'}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-900/30 to-green-800/30 p-6 rounded-xl border border-green-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm">Uptime</p>
              <p className="text-2xl font-bold text-green-100">{systemStatus?.uptime}</p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-6 rounded-xl border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">Memory Usage</p>
              <p className="text-2xl font-bold text-purple-100">{systemStatus?.memory_usage}%</p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 p-6 rounded-xl border border-orange-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm">CPU Usage</p>
              <p className="text-2xl font-bold text-orange-100">{systemStatus?.cpu_usage}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Feature Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-300">Voice Recognition</h3>
            <Mic className={`w-6 h-6 ${systemStatus?.voice_recognition ? 'text-green-400' : 'text-gray-400'}`} />
          </div>
          <button
            onClick={() => toggleFeature('voice', !systemStatus?.voice_recognition)}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              systemStatus?.voice_recognition
                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
            }`}
          >
            {systemStatus?.voice_recognition ? 'Active' : 'Inactive'}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-300">Face Recognition</h3>
            <Camera className={`w-6 h-6 ${systemStatus?.face_recognition ? 'text-green-400' : 'text-gray-400'}`} />
          </div>
          <button
            onClick={() => toggleFeature('face', !systemStatus?.face_recognition)}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              systemStatus?.face_recognition
                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
            }`}
          >
            {systemStatus?.face_recognition ? 'Active' : 'Inactive'}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-300">Text-to-Speech</h3>
            <Volume2 className={`w-6 h-6 ${systemStatus?.tts ? 'text-green-400' : 'text-gray-400'}`} />
          </div>
          <button
            onClick={() => toggleFeature('tts', !systemStatus?.tts)}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              systemStatus?.tts
                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
            }`}
          >
            {systemStatus?.tts ? 'Active' : 'Inactive'}
          </button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center space-y-2 p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors">
            <Play className="w-6 h-6 text-blue-400" />
            <span className="text-sm text-blue-300">Start Learning</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors">
            <Target className="w-6 h-6 text-green-400" />
            <span className="text-sm text-green-300">Set Goal</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors">
            <Zap className="w-6 h-6 text-purple-400" />
            <span className="text-sm text-purple-300">Run Task</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-colors">
            <BarChart3 className="w-6 h-6 text-orange-400" />
            <span className="text-sm text-orange-300">View Analytics</span>
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Skills Overview</h3>
        {analyticsData?.skills_summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{analyticsData.skills_summary.total_skills}</p>
              <p className="text-sm text-gray-400">Total Skills</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{analyticsData.skills_summary.active_skills}</p>
              <p className="text-sm text-gray-400">Active Skills</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{Math.round(analyticsData.skills_summary.avg_mastery)}%</p>
              <p className="text-sm text-gray-400">Avg Mastery</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No skills data available</p>
        )}
      </motion.div>
    </div>
  );

  const renderVoiceRecognition = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Voice Recognition Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Sensitivity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.8"
              className="w-32"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Wake Word</span>
            <input
              type="text"
              defaultValue="Jarvis"
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Language</span>
            <select className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white">
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
            </select>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderFaceRecognition = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Face Recognition Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Confidence Threshold</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.8"
              className="w-32"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Max Faces</span>
            <input
              type="number"
              min="1"
              max="20"
              defaultValue="10"
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white w-20"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderTTS = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Text-to-Speech Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Voice Profile</span>
            <select className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white">
              <option value="default">Default</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Speed</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              defaultValue="1"
              className="w-32"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Pitch</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              defaultValue="1"
              className="w-32"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="1"
              className="w-32"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderAIModels = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">AI Models</h3>
        <div className="space-y-4">
          {systemStatus?.ai_models.map((model, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-gray-300 font-medium">{model}</p>
                <p className="text-sm text-gray-400">Available</p>
              </div>
              <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors">
                Activate
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Analytics Overview</h3>
        {analyticsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-300 mb-3">Recent Events</h4>
              <div className="space-y-2">
                {analyticsData.recent_events.slice(0, 5).map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-sm text-gray-300">{event.type}</span>
                    <span className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-300 mb-3">Event Counts</h4>
              <div className="space-y-2">
                {analyticsData.event_counts.map((count, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-sm text-gray-300">{count.type}</span>
                    <span className="text-sm text-gray-400">{count.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No analytics data available</p>
        )}
      </motion.div>
    </div>
  );

  const renderAutomation = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Automation Workflows</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-gray-300 font-medium">Morning Routine</p>
              <p className="text-sm text-gray-400">Automated daily tasks</p>
            </div>
            <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors">
              Active
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-gray-300 font-medium">Learning Reminder</p>
              <p className="text-sm text-gray-400">Daily skill practice</p>
            </div>
            <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors">
              Activate
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Security Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Authentication</span>
            </div>
            <span className="text-green-400">Secure</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Encryption</span>
            </div>
            <span className="text-green-400">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Session Management</span>
            </div>
            <span className="text-yellow-400">Warning</span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">User Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Theme</span>
            <select className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Language</span>
            <select className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'skills':
        return renderSkills();
      case 'voice':
        return renderVoiceRecognition();
      case 'face':
        return renderFaceRecognition();
      case 'tts':
        return renderTTS();
      case 'models':
        return renderAIModels();
      case 'analytics':
        return renderAnalytics();
      case 'automation':
        return renderAutomation();
      case 'security':
        return renderSecurity();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900/90 p-8 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
            <span className="text-gray-300">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex z-50">
      {/* Main Content (remove internal sidebar) */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-900/95 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <h1 className="text-xl font-semibold text-gray-300">
              {navigationItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadDashboardData}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveDashboard; 