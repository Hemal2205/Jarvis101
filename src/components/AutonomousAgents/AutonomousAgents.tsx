import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Brain, 
  Zap, 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Star,
  StarOff,
  Filter,
  Search,
  Users,
  MessageSquare,
  Share2,
  Download,
  Upload,
  Globe,
  Network,
  Cpu,
  Database,
  Shield,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Cpu as CpuIcon,
  Bot,
  Sparkles,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Code,
  Terminal,
  FileText,
  Folder,
  Archive,
  Lock,
  Unlock,
  Key,
  Wifi,
  Signal,
  Battery,
  Volume2,
  VolumeX,
  Camera,
  Mic,
  MicOff
} from 'lucide-react';

interface AutonomousAgent {
  id: string;
  name: string;
  type: 'research' | 'analysis' | 'automation' | 'communication' | 'security' | 'creative';
  status: 'active' | 'idle' | 'busy' | 'learning' | 'offline' | 'error';
  capabilities: string[];
  currentTask: string;
  performance: number;
  learningProgress: number;
  uptime: string;
  lastActivity: string;
  memoryUsage: number;
  cpuUsage: number;
  networkUsage: number;
  tasksCompleted: number;
  tasksFailed: number;
  collaborationLevel: 'independent' | 'collaborative' | 'supervised';
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  version: string;
  lastUpdate: string;
}

interface AgentTask {
  id: string;
  title: string;
  description: string;
  assignedAgent: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused';
  progress: number;
  estimatedTime: string;
  actualTime?: string;
  dependencies: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: string;
  error?: string;
}

interface AgentCollaboration {
  id: string;
  agents: string[];
  task: string;
  type: 'parallel' | 'sequential' | 'hierarchical';
  status: 'forming' | 'active' | 'completed' | 'failed';
  efficiency: number;
  communicationLevel: 'low' | 'medium' | 'high';
  startedAt: string;
  estimatedCompletion: string;
  actualCompletion?: string;
}

interface LearningModule {
  id: string;
  name: string;
  description: string;
  type: 'supervised' | 'unsupervised' | 'reinforcement' | 'transfer';
  progress: number;
  accuracy: number;
  status: 'learning' | 'completed' | 'failed' | 'paused';
  dataSize: string;
  trainingTime: string;
  lastUpdate: string;
  performance: number;
}

const AutonomousAgents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOffline, setShowOffline] = useState(false);
  const [sortBy, setSortBy] = useState<'performance' | 'uptime' | 'tasks' | 'learning'>('performance');

  const autonomousAgents: AutonomousAgent[] = [
    { 
      id: '1', 
      name: 'Research Agent Alpha', 
      type: 'research', 
      status: 'active', 
      capabilities: ['Data Analysis', 'Pattern Recognition', 'Report Generation'],
      currentTask: 'Analyzing market trends for Q4',
      performance: 94,
      learningProgress: 87,
      uptime: '99.8%',
      lastActivity: '2 min ago',
      memoryUsage: 65,
      cpuUsage: 78,
      networkUsage: 45,
      tasksCompleted: 1247,
      tasksFailed: 3,
      collaborationLevel: 'collaborative',
      securityLevel: 'high',
      version: '2.1.4',
      lastUpdate: '1 hour ago'
    },
    { 
      id: '2', 
      name: 'Security Agent Beta', 
      type: 'security', 
      status: 'busy', 
      capabilities: ['Threat Detection', 'Vulnerability Assessment', 'Incident Response'],
      currentTask: 'Monitoring network traffic for anomalies',
      performance: 98,
      learningProgress: 92,
      uptime: '99.9%',
      lastActivity: '30 sec ago',
      memoryUsage: 82,
      cpuUsage: 91,
      networkUsage: 78,
      tasksCompleted: 2156,
      tasksFailed: 1,
      collaborationLevel: 'independent',
      securityLevel: 'critical',
      version: '3.0.1',
      lastUpdate: '30 min ago'
    },
    { 
      id: '3', 
      name: 'Automation Agent Gamma', 
      type: 'automation', 
      status: 'idle', 
      capabilities: ['Process Automation', 'Workflow Optimization', 'System Integration'],
      currentTask: 'Waiting for new automation requests',
      performance: 89,
      learningProgress: 76,
      uptime: '99.5%',
      lastActivity: '5 min ago',
      memoryUsage: 45,
      cpuUsage: 23,
      networkUsage: 12,
      tasksCompleted: 892,
      tasksFailed: 8,
      collaborationLevel: 'supervised',
      securityLevel: 'medium',
      version: '1.8.2',
      lastUpdate: '2 hours ago'
    },
    { 
      id: '4', 
      name: 'Communication Agent Delta', 
      type: 'communication', 
      status: 'learning', 
      capabilities: ['Natural Language Processing', 'Sentiment Analysis', 'Response Generation'],
      currentTask: 'Learning new communication patterns',
      performance: 82,
      learningProgress: 95,
      uptime: '99.2%',
      lastActivity: '1 min ago',
      memoryUsage: 73,
      cpuUsage: 67,
      networkUsage: 89,
      tasksCompleted: 567,
      tasksFailed: 12,
      collaborationLevel: 'collaborative',
      securityLevel: 'medium',
      version: '2.0.0',
      lastUpdate: '45 min ago'
    },
    { 
      id: '5', 
      name: 'Creative Agent Epsilon', 
      type: 'creative', 
      status: 'active', 
      capabilities: ['Content Generation', 'Design Optimization', 'Creative Problem Solving'],
      currentTask: 'Generating marketing campaign ideas',
      performance: 91,
      learningProgress: 84,
      uptime: '99.7%',
      lastActivity: '3 min ago',
      memoryUsage: 58,
      cpuUsage: 72,
      networkUsage: 34,
      tasksCompleted: 743,
      tasksFailed: 5,
      collaborationLevel: 'collaborative',
      securityLevel: 'low',
      version: '1.9.5',
      lastUpdate: '1 hour ago'
    }
  ];

  const agentTasks: AgentTask[] = [
    { 
      id: '1', 
      title: 'Market Analysis Report', 
      description: 'Comprehensive analysis of market trends and competitor activities', 
      assignedAgent: 'Research Agent Alpha', 
      priority: 'high', 
      status: 'in-progress', 
      progress: 75, 
      estimatedTime: '2h 30m', 
      dependencies: [], 
      createdAt: '1 hour ago',
      startedAt: '1 hour ago'
    },
    { 
      id: '2', 
      title: 'Security Audit', 
      description: 'Complete system security audit and vulnerability assessment', 
      assignedAgent: 'Security Agent Beta', 
      priority: 'critical', 
      status: 'in-progress', 
      progress: 45, 
      estimatedTime: '4h', 
      dependencies: [], 
      createdAt: '30 min ago',
      startedAt: '30 min ago'
    },
    { 
      id: '3', 
      title: 'Process Optimization', 
      description: 'Optimize workflow processes for improved efficiency', 
      assignedAgent: 'Automation Agent Gamma', 
      priority: 'medium', 
      status: 'pending', 
      progress: 0, 
      estimatedTime: '1h 15m', 
      dependencies: ['market-analysis'], 
      createdAt: '15 min ago'
    },
    { 
      id: '4', 
      title: 'Customer Response Generation', 
      description: 'Generate personalized responses to customer inquiries', 
      assignedAgent: 'Communication Agent Delta', 
      priority: 'medium', 
      status: 'completed', 
      progress: 100, 
      estimatedTime: '30m', 
      actualTime: '25m',
      dependencies: [], 
      createdAt: '2 hours ago',
      startedAt: '2 hours ago',
      completedAt: '1h 35m ago',
      result: 'Generated 15 personalized responses with 94% satisfaction rate'
    }
  ];

  const agentCollaborations: AgentCollaboration[] = [
    { 
      id: '1', 
      agents: ['Research Agent Alpha', 'Creative Agent Epsilon'], 
      task: 'Product Development Strategy', 
      type: 'parallel', 
      status: 'active', 
      efficiency: 87, 
      communicationLevel: 'high', 
      startedAt: '2 hours ago', 
      estimatedCompletion: '4 hours from now' 
    },
    { 
      id: '2', 
      agents: ['Security Agent Beta', 'Automation Agent Gamma'], 
      task: 'System Security Enhancement', 
      type: 'sequential', 
      status: 'completed', 
      efficiency: 94, 
      communicationLevel: 'medium', 
      startedAt: '1 day ago', 
      estimatedCompletion: '6 hours ago',
      actualCompletion: '5 hours ago' 
    }
  ];

  const learningModules: LearningModule[] = [
    { 
      id: '1', 
      name: 'Advanced Pattern Recognition', 
      description: 'Enhanced pattern recognition for complex data analysis', 
      type: 'supervised', 
      progress: 92, 
      accuracy: 96, 
      status: 'learning', 
      dataSize: '2.5 GB', 
      trainingTime: '3h 45m', 
      lastUpdate: '30 min ago',
      performance: 94 
    },
    { 
      id: '2', 
      name: 'Natural Language Understanding', 
      description: 'Improved natural language processing capabilities', 
      type: 'transfer', 
      progress: 78, 
      accuracy: 89, 
      status: 'learning', 
      dataSize: '1.8 GB', 
      trainingTime: '2h 20m', 
      lastUpdate: '1 hour ago',
      performance: 87 
    },
    { 
      id: '3', 
      name: 'Anomaly Detection', 
      description: 'Advanced anomaly detection for security applications', 
      type: 'unsupervised', 
      progress: 100, 
      accuracy: 98, 
      status: 'completed', 
      dataSize: '3.2 GB', 
      trainingTime: '5h 10m', 
      lastUpdate: '2 hours ago',
      performance: 96 
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'busy': return 'text-yellow-400 bg-yellow-500/20';
      case 'learning': return 'text-blue-400 bg-blue-500/20';
      case 'idle': return 'text-gray-400 bg-gray-500/20';
      case 'offline': return 'text-red-400 bg-red-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'research': return <Brain className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'automation': return <Zap className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'creative': return <Sparkles className="w-4 h-4" />;
      case 'analysis': return <BarChart3 className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-400';
    if (performance >= 80) return 'text-yellow-400';
    if (performance >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const filteredAgents = autonomousAgents.filter(agent => {
    const matchesType = filterType === 'all' || agent.type === filterType;
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.currentTask.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = showOffline || agent.status !== 'offline';
    return matchesType && matchesStatus && matchesSearch && matchesVisibility;
  });

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'performance':
        return b.performance - a.performance;
      case 'uptime':
        return parseFloat(b.uptime) - parseFloat(a.uptime);
      case 'tasks':
        return b.tasksCompleted - a.tasksCompleted;
      case 'learning':
        return b.learningProgress - a.learningProgress;
      default:
        return 0;
    }
  });

  const toggleAgent = (agentId: string) => {
    setSelectedAgent(selectedAgent === agentId ? null : agentId);
  };

  return (
    <div className="h-full bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <UserCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Autonomous Agents</h2>
            <p className="text-cyan-400/60 text-sm">AI Agent Management & Collaboration</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Deploy Agent
          </motion.button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Active Agents</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{autonomousAgents.filter(a => a.status === 'active').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Total Tasks</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{agentTasks.length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Collaborations</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{agentCollaborations.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Learning</span>
            <Brain className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{learningModules.filter(l => l.status === 'learning').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Types</option>
            <option value="research">Research</option>
            <option value="security">Security</option>
            <option value="automation">Automation</option>
            <option value="communication">Communication</option>
            <option value="creative">Creative</option>
            <option value="analysis">Analysis</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="busy">Busy</option>
            <option value="idle">Idle</option>
            <option value="learning">Learning</option>
            <option value="offline">Offline</option>
            <option value="error">Error</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="performance">Sort by Performance</option>
            <option value="uptime">Sort by Uptime</option>
            <option value="tasks">Sort by Tasks</option>
            <option value="learning">Sort by Learning</option>
          </select>
          <label className="flex items-center space-x-2 text-cyan-400/60">
            <input
              type="checkbox"
              checked={showOffline}
              onChange={(e) => setShowOffline(e.target.checked)}
              className="rounded border-cyan-500/30 bg-black/50 text-cyan-400 focus:ring-cyan-400"
            />
            <span>Show Offline</span>
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'agents', label: 'Agents', icon: Bot },
          { id: 'tasks', label: 'Tasks', icon: Target },
          { id: 'collaboration', label: 'Collaboration', icon: Users },
          { id: 'learning', label: 'Learning', icon: Brain },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-black/20 text-gray-400 border border-gray-600/20 hover:border-cyan-500/30'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                {sortedAgents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedAgent === agent.id
                        ? 'bg-cyan-500/10 border-cyan-500/50'
                        : 'bg-black/30 border-cyan-500/20 hover:border-cyan-500/40'
                    }`}
                    onClick={() => toggleAgent(agent.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        {getTypeIcon(agent.type)}
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{agent.name}</h3>
                          <p className="text-cyan-400/60 text-sm mt-1">{agent.currentTask}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSecurityLevelColor(agent.securityLevel)}`}>
                          {agent.securityLevel}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-cyan-400/60">Performance:</span>
                        <p className={`font-medium ${getPerformanceColor(agent.performance)}`}>{agent.performance}%</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60">Learning:</span>
                        <p className="text-white">{agent.learningProgress}%</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60">Uptime:</span>
                        <p className="text-white">{agent.uptime}</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60">Tasks:</span>
                        <p className="text-white">{agent.tasksCompleted}/{agent.tasksFailed}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-cyan-400/60">Memory:</span>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-cyan-400 h-2 rounded-full transition-all"
                            style={{ width: `${agent.memoryUsage}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-xs">{agent.memoryUsage}%</span>
                      </div>
                      <div>
                        <span className="text-cyan-400/60">CPU:</span>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${agent.cpuUsage}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-xs">{agent.cpuUsage}%</span>
                      </div>
                      <div>
                        <span className="text-cyan-400/60">Network:</span>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-400 h-2 rounded-full transition-all"
                            style={{ width: `${agent.networkUsage}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-xs">{agent.networkUsage}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 3).map((capability, index) => (
                          <span key={index} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                            {capability}
                          </span>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                            +{agent.capabilities.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-400/60 text-xs">v{agent.version}</span>
                        <span className="text-gray-400 text-xs">{agent.lastActivity}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                {agentTasks.map((task) => (
                  <div key={task.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{task.title}</h3>
                        <p className="text-cyan-400/60 text-sm mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                          task.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          task.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm">Agent: {task.assignedAgent}</p>
                      <p className="text-cyan-400/60 text-sm">Estimated: {task.estimatedTime}</p>
                      {task.actualTime && <p className="text-cyan-400/60 text-sm">Actual: {task.actualTime}</p>}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          task.status === 'completed' ? 'bg-green-400' :
                          task.status === 'failed' ? 'bg-red-400' :
                          'bg-cyan-400'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-400/60">Progress: {task.progress}%</span>
                      <span className="text-gray-400">{task.createdAt}</span>
                    </div>
                    {task.result && (
                      <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-sm">
                        <span className="text-green-400 font-medium">Result:</span> {task.result}
                      </div>
                    )}
                    {task.error && (
                      <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm">
                        <span className="text-red-400 font-medium">Error:</span> {task.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'collaboration' && (
            <motion.div
              key="collaboration"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentCollaborations.map((collab) => (
                  <div key={collab.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{collab.task}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          collab.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          collab.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          collab.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {collab.status}
                        </span>
                        <span className="text-cyan-400 font-medium">{collab.efficiency}%</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm">Type: {collab.type}</p>
                      <p className="text-cyan-400/60 text-sm">Communication: {collab.communicationLevel}</p>
                      <p className="text-cyan-400/60 text-sm">Agents: {collab.agents.join(', ')}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-400/60">Started: {collab.startedAt}</span>
                      <span className="text-gray-400">
                        {collab.actualCompletion ? `Completed: ${collab.actualCompletion}` : `ETA: ${collab.estimatedCompletion}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningModules.map((module) => (
                  <div key={module.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{module.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          module.status === 'learning' ? 'bg-blue-500/20 text-blue-400' :
                          module.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          module.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {module.status}
                        </span>
                        <span className="text-cyan-400 font-medium">{module.accuracy}%</span>
                      </div>
                    </div>
                    <p className="text-cyan-400/60 text-sm mb-3">{module.description}</p>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm">Type: {module.type}</p>
                      <p className="text-cyan-400/60 text-sm">Data: {module.dataSize}</p>
                      <p className="text-cyan-400/60 text-sm">Training: {module.trainingTime}</p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          module.status === 'completed' ? 'bg-green-400' :
                          module.status === 'failed' ? 'bg-red-400' :
                          'bg-cyan-400'
                        }`}
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-400/60">Progress: {module.progress}%</span>
                      <span className="text-gray-400">{module.lastUpdate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Total Agents</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">{autonomousAgents.length}</p>
                  <p className="text-cyan-400/60 text-sm">Deployed</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">96.8%</p>
                  <p className="text-cyan-400/60 text-sm">Task completion</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Learning</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">87.3%</p>
                  <p className="text-cyan-400/60 text-sm">Average progress</p>
                </div>
              </div>
              
              <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">Agent Performance by Type</h3>
                <div className="space-y-3">
                  {['research', 'security', 'automation', 'communication', 'creative'].map((type) => {
                    const typeAgents = autonomousAgents.filter(a => a.type === type);
                    const avgPerformance = typeAgents.length > 0 
                      ? typeAgents.reduce((sum, agent) => sum + agent.performance, 0) / typeAgents.length 
                      : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-cyan-400/60 capitalize">{type}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                avgPerformance >= 90 ? 'bg-green-400' :
                                avgPerformance >= 80 ? 'bg-yellow-400' :
                                avgPerformance >= 70 ? 'bg-orange-400' :
                                'bg-red-400'
                              }`}
                              style={{ width: `${avgPerformance}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm">{avgPerformance.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AutonomousAgents; 