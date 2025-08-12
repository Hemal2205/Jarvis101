import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  MessageSquare, 
  Code, 
  BarChart3, 
  Settings, 
  Zap, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Database,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Server,
  Cloud,
  Wifi,
  Bluetooth,
  Usb,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  GitCompare,
  GitFork,
  GitRepository,
  GitBranchPlus,
  GitCommitPlus,
  GitPullRequestPlus,
  GitMergePlus,
  GitComparePlus,
  GitForkPlus,
  GitRepositoryPlus,
  GitBranchMinus,
  GitCommitMinus,
  GitPullRequestMinus,
  GitMergeMinus,
  GitCompareMinus,
  GitForkMinus,
  GitRepositoryMinus,
  Plus,
  DollarSign,
  Mic,
  Globe,
  FileText
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

// AI Model Types
type AIModelType = 'gpt-4' | 'claude-3' | 'gemini' | 'llama' | 'custom' | 'local';

// AI Task Types
type AITaskType = 'text_generation' | 'code_analysis' | 'data_analysis' | 'image_generation' | 'speech_recognition' | 'translation' | 'summarization' | 'classification' | 'prediction' | 'optimization';

// AI Model Status
type AIModelStatus = 'idle' | 'loading' | 'running' | 'error' | 'completed' | 'training';

// AI Model Interface
interface AIModel {
  id: string;
  name: string;
  type: AIModelType;
  version: string;
  status: AIModelStatus;
  accuracy: number;
  performance_score: number;
  memory_usage: number;
  cpu_usage: number;
  gpu_usage: number;
  last_updated: string;
  training_data_size: number;
  inference_time: number;
  cost_per_request: number;
  capabilities: AITaskType[];
  is_active: boolean;
  is_public: boolean;
  api_endpoint?: string;
  api_key?: string;
  custom_config?: Record<string, any>;
}

// AI Task Interface
interface AITask {
  id: string;
  name: string;
  type: AITaskType;
  model_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  input_data: any;
  output_data?: any;
  error_message?: string;
  progress: number;
  estimated_completion?: string;
  cost: number;
  user_id: string;
  tags: string[];
}

// AI Analytics Interface
interface AIAnalytics {
  total_models: number;
  active_models: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  total_cost: number;
  cost_trend: number[];
  performance_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  usage_by_model: Record<string, number>;
  usage_by_task: Record<string, number>;
  peak_usage_hours: number[];
  resource_utilization: {
    cpu: number;
    memory: number;
    gpu: number;
    storage: number;
  };
}

// AI Configuration Interface
interface AIConfig {
  auto_scaling: boolean;
  load_balancing: boolean;
  caching_enabled: boolean;
  rate_limiting: boolean;
  max_concurrent_requests: number;
  timeout_seconds: number;
  retry_attempts: number;
  fallback_models: string[];
  monitoring_enabled: boolean;
  logging_level: 'debug' | 'info' | 'warning' | 'error';
  security_level: 'low' | 'medium' | 'high' | 'maximum';
}

interface AdvancedAIIntegrationProps {
  isActive: boolean;
  onClose?: () => void;
}

export const AdvancedAIIntegration: React.FC<AdvancedAIIntegrationProps> = ({ 
  isActive, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'tasks' | 'analytics' | 'config' | 'deployment'>('overview');
  const [models, setModels] = useState<AIModel[]>([]);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const { notify } = useNotification();

  // New model form
  const [newModel, setNewModel] = useState({
    name: '',
    type: 'custom' as AIModelType,
    version: '1.0.0',
    capabilities: [] as AITaskType[],
    is_public: false
  });

  // New task form
  const [newTask, setNewTask] = useState({
    name: '',
    type: 'text_generation' as AITaskType,
    model_id: '',
    priority: 'medium' as const,
    input_data: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (isActive) {
      loadModels();
      loadTasks();
      loadAnalytics();
      loadConfig();
    }
  }, [isActive]);

  const loadModels = async () => {
    try {
      const response = await fetch('/api/ai/models');
      const data = await response.json();
      if (data.success) {
        setModels(data.models || []);
      }
    } catch (error) {
      console.error('Failed to load AI models:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/ai/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load AI tasks:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/ai/analytics');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load AI analytics:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/ai/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
    }
  };

  const createModel = async () => {
    if (!newModel.name.trim()) return;

    try {
      const response = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModel)
      });

      const data = await response.json();
      if (data.success) {
        notify('AI model created successfully!', 'success');
        setNewModel({
          name: '',
          type: 'custom',
          version: '1.0.0',
          capabilities: [],
          is_public: false
        });
        await loadModels();
      }
    } catch (error) {
      console.error('Failed to create AI model:', error);
      notify('Failed to create AI model', 'error');
    }
  };

  const createTask = async () => {
    if (!newTask.name.trim() || !newTask.model_id) return;

    try {
      const response = await fetch('/api/ai/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      const data = await response.json();
      if (data.success) {
        notify('AI task created successfully!', 'success');
        setNewTask({
          name: '',
          type: 'text_generation',
          model_id: '',
          priority: 'medium',
          input_data: '',
          tags: []
        });
        await loadTasks();
      }
    } catch (error) {
      console.error('Failed to create AI task:', error);
      notify('Failed to create AI task', 'error');
    }
  };

  const startTraining = async (modelId: string) => {
    try {
      const response = await fetch(`/api/ai/models/${modelId}/train`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setIsTraining(true);
        notify('Model training started!', 'success');
        await loadModels();
      }
    } catch (error) {
      console.error('Failed to start training:', error);
      notify('Failed to start training', 'error');
    }
  };

  const deployModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/ai/models/${modelId}/deploy`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setIsDeploying(true);
        notify('Model deployment started!', 'success');
        await loadModels();
      }
    } catch (error) {
      console.error('Failed to deploy model:', error);
      notify('Failed to deploy model', 'error');
    }
  };

  const getModelIcon = (type: AIModelType) => {
    switch (type) {
      case 'gpt-4': return Brain;
      case 'claude-3': return MessageSquare;
      case 'gemini': return Code;
      case 'llama': return Database;
      case 'custom': return Settings;
      case 'local': return Cpu;
      default: return Brain;
    }
  };

  const getTaskIcon = (type: AITaskType) => {
    switch (type) {
      case 'text_generation': return MessageSquare;
      case 'code_analysis': return Code;
      case 'data_analysis': return BarChart3;
      case 'image_generation': return Eye;
      case 'speech_recognition': return Mic;
      case 'translation': return Globe;
      case 'summarization': return FileText;
      case 'classification': return Target;
      case 'prediction': return TrendingUp;
      case 'optimization': return Zap;
      default: return Brain;
    }
  };

  const getStatusColor = (status: AIModelStatus | string) => {
    switch (status) {
      case 'idle': return 'text-gray-400 bg-gray-500/10';
      case 'loading': return 'text-blue-400 bg-blue-500/10';
      case 'running': return 'text-green-400 bg-green-500/10';
      case 'error': return 'text-red-400 bg-red-500/10';
      case 'completed': return 'text-purple-400 bg-purple-500/10';
      case 'training': return 'text-orange-400 bg-orange-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'failed': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-purple-400">Advanced AI Integration</h1>
              <p className="text-gray-400 text-sm">Intelligent automation and machine learning capabilities</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-4 bg-gray-800/50">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'models', label: 'AI Models', icon: Brain },
            { id: 'tasks', label: 'Tasks', icon: Code },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'config', label: 'Config', icon: Settings },
            { id: 'deployment', label: 'Deployment', icon: Server }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-6"
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* AI Performance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-400">Active Models</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {analytics?.active_models || 0}
                      </div>
                      <div className="text-sm text-gray-400">
                        of {analytics?.total_models || 0} total
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Code className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-400">Total Requests</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {analytics?.total_requests || 0}
                      </div>
                      <div className="text-sm text-gray-400">
                        {analytics?.successful_requests || 0} successful
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-400">Avg Response</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {analytics?.average_response_time || 0}ms
                      </div>
                      <div className="text-sm text-gray-400">
                        Response time
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400">Total Cost</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">
                        ${analytics?.total_cost || 0}
                      </div>
                      <div className="text-sm text-gray-400">
                        This month
                      </div>
                    </div>
                  </div>

                  {/* Resource Utilization */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">Resource Utilization</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">CPU</span>
                          <span className="text-white">{analytics?.resource_utilization.cpu || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analytics?.resource_utilization.cpu || 0}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Memory</span>
                          <span className="text-white">{analytics?.resource_utilization.memory || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics?.resource_utilization.memory || 0}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">GPU</span>
                          <span className="text-white">{analytics?.resource_utilization.gpu || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${analytics?.resource_utilization.gpu || 0}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Storage</span>
                          <span className="text-white">{analytics?.resource_utilization.storage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${analytics?.resource_utilization.storage || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Tasks */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">Recent AI Tasks</h3>
                    <div className="space-y-3">
                      {tasks.slice(0, 5).map((task) => {
                        const Icon = getTaskIcon(task.type);
                        return (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5 text-purple-400" />
                              <div>
                                <div className="font-medium text-white">{task.name}</div>
                                <div className="text-sm text-gray-400">{task.type.replace('_', ' ')}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'models' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-purple-400">AI Models</h3>
                    <button
                      onClick={() => setSelectedModel({} as AIModel)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Model</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {models.map((model) => {
                      const Icon = getModelIcon(model.type);
                      return (
                        <div key={model.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Icon className="w-6 h-6 text-purple-400" />
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(model.status)}`}>
                              {model.status}
                            </span>
                          </div>
                          <h4 className="font-medium text-white mb-1">{model.name}</h4>
                          <div className="text-sm text-gray-400 mb-3">{model.type} v{model.version}</div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Accuracy:</span>
                              <span className="text-white">{model.accuracy}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Performance:</span>
                              <span className="text-white">{model.performance_score}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Memory:</span>
                              <span className="text-white">{model.memory_usage}MB</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 mt-4">
                            {model.status === 'idle' && (
                              <button
                                onClick={() => startTraining(model.id)}
                                className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                Train
                              </button>
                            )}
                            {model.status === 'completed' && (
                              <button
                                onClick={() => deployModel(model.id)}
                                className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Deploy
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedModel(model)}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-purple-400">AI Tasks</h3>
                    <button
                      onClick={() => setSelectedTask({} as AITask)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Task</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {tasks.map((task) => {
                      const Icon = getTaskIcon(task.type);
                      return (
                        <div key={task.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5 text-purple-400" />
                              <div>
                                <h4 className="font-medium text-white">{task.name}</h4>
                                <p className="text-sm text-gray-400">{task.type.replace('_', ' ')}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                  Created: {new Date(task.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              {task.progress > 0 && task.progress < 100 && (
                                <div className="text-xs text-gray-400">
                                  {task.progress}%
                                </div>
                              )}
                            </div>
                          </div>
                          {task.progress > 0 && task.progress < 100 && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-purple-400">AI Analytics</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Performance Metrics</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Accuracy</span>
                            <span className="text-white">{analytics?.performance_metrics.accuracy || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics?.performance_metrics.accuracy || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Precision</span>
                            <span className="text-white">{analytics?.performance_metrics.precision || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analytics?.performance_metrics.precision || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Recall</span>
                            <span className="text-white">{analytics?.performance_metrics.recall || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${analytics?.performance_metrics.recall || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">F1 Score</span>
                            <span className="text-white">{analytics?.performance_metrics.f1_score || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${analytics?.performance_metrics.f1_score || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Usage by Model</h4>
                      <div className="space-y-3">
                        {Object.entries(analytics?.usage_by_model || {}).map(([model, usage]) => (
                          <div key={model} className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">{model}</span>
                            <span className="text-sm text-white">{usage} requests</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'config' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-purple-400">AI Configuration</h3>
                  
                  {config && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Auto Scaling</span>
                            <button
                              className={`px-3 py-1 rounded text-sm ${
                                config.auto_scaling
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-600 text-white'
                              }`}
                            >
                              {config.auto_scaling ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Load Balancing</span>
                            <button
                              className={`px-3 py-1 rounded text-sm ${
                                config.load_balancing
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-600 text-white'
                              }`}
                            >
                              {config.load_balancing ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Caching</span>
                            <button
                              className={`px-3 py-1 rounded text-sm ${
                                config.caching_enabled
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-600 text-white'
                              }`}
                            >
                              {config.caching_enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Rate Limiting</span>
                            <button
                              className={`px-3 py-1 rounded text-sm ${
                                config.rate_limiting
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-600 text-white'
                              }`}
                            >
                              {config.rate_limiting ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-gray-400 text-sm">Max Concurrent Requests</label>
                            <input
                              type="number"
                              value={config.max_concurrent_requests}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Timeout (seconds)</label>
                            <input
                              type="number"
                              value={config.timeout_seconds}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Retry Attempts</label>
                            <input
                              type="number"
                              value={config.retry_attempts}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Security Level</label>
                            <select
                              value={config.security_level}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white mt-1"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="maximum">Maximum</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'deployment' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-purple-400">Model Deployment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Server className="w-6 h-6 text-blue-400" />
                        <span className="text-gray-400">Production</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">3</div>
                      <div className="text-sm text-gray-400">Active models</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Cloud className="w-6 h-6 text-green-400" />
                        <span className="text-gray-400">Staging</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">2</div>
                      <div className="text-sm text-gray-400">Testing models</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Cpu className="w-6 h-6 text-purple-400" />
                        <span className="text-gray-400">Local</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">1</div>
                      <div className="text-sm text-gray-400">Development</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}; 