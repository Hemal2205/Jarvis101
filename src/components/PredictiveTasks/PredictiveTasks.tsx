import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Brain,
  Zap,
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  StarOff,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  User,
  Users,
  Tag,
  Flag,
  Lightbulb,
  Cpu,
  Database,
  Network,
  Shield,
  Activity
} from 'lucide-react';

interface PredictiveTask {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'personal' | 'health' | 'security' | 'maintenance' | 'learning';
  priority: 'critical' | 'high' | 'medium' | 'low';
  predictedTime: string;
  confidence: number;
  status: 'predicted' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
  dependencies: string[];
  tags: string[];
  createdAt: string;
  predictedStart: string;
  actualStart?: string;
  actualEnd?: string;
}

interface TaskPattern {
  id: string;
  pattern: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  confidence: number;
  tasks: string[];
  lastOccurrence: string;
  nextPredicted: string;
  accuracy: number;
}

interface AutomationSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'workflow' | 'trigger' | 'schedule' | 'ai-assist';
  impact: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedSavings: string;
  status: 'suggested' | 'implemented' | 'rejected';
  tasks: string[];
}

const PredictiveTasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'confidence' | 'created'>('priority');

  const predictiveTasks: PredictiveTask[] = [
    { 
      id: '1', 
      title: 'System Security Scan', 
      description: 'Automated security vulnerability assessment and patch deployment', 
      category: 'security', 
      priority: 'critical', 
      predictedTime: '15m', 
      confidence: 95, 
      status: 'predicted', 
      automationLevel: 'full-auto',
      dependencies: [],
      tags: ['security', 'automation', 'critical'],
      createdAt: '2 hours ago',
      predictedStart: '10:00 AM'
    },
    { 
      id: '2', 
      title: 'Data Backup & Sync', 
      description: 'Scheduled backup of critical data to secure cloud storage', 
      category: 'maintenance', 
      priority: 'high', 
      predictedTime: '45m', 
      confidence: 88, 
      status: 'scheduled', 
      automationLevel: 'semi-auto',
      dependencies: ['system-scan'],
      tags: ['backup', 'data', 'cloud'],
      createdAt: '1 hour ago',
      predictedStart: '11:30 AM'
    },
    { 
      id: '3', 
      title: 'AI Model Training', 
      description: 'Retrain machine learning models with new data', 
      category: 'learning', 
      priority: 'medium', 
      predictedTime: '2h 30m', 
      confidence: 72, 
      status: 'predicted', 
      automationLevel: 'full-auto',
      dependencies: ['data-sync'],
      tags: ['ai', 'training', 'ml'],
      createdAt: '30 min ago',
      predictedStart: '2:00 PM'
    },
    { 
      id: '4', 
      title: 'Performance Optimization', 
      description: 'Analyze and optimize system performance metrics', 
      category: 'maintenance', 
      priority: 'medium', 
      predictedTime: '1h 15m', 
      confidence: 65, 
      status: 'in-progress', 
      automationLevel: 'semi-auto',
      dependencies: [],
      tags: ['performance', 'optimization'],
      createdAt: '45 min ago',
      predictedStart: '9:15 AM',
      actualStart: '9:15 AM'
    },
    { 
      id: '5', 
      title: 'User Behavior Analysis', 
      description: 'Analyze user interaction patterns for UX improvements', 
      category: 'work', 
      priority: 'low', 
      predictedTime: '3h', 
      confidence: 58, 
      status: 'predicted', 
      automationLevel: 'manual',
      dependencies: ['performance-opt'],
      tags: ['analytics', 'ux', 'behavior'],
      createdAt: '15 min ago',
      predictedStart: '4:00 PM'
    }
  ];

  const taskPatterns: TaskPattern[] = [
    { 
      id: '1', 
      pattern: 'Daily Security Maintenance', 
      frequency: 'daily', 
      confidence: 92, 
      tasks: ['System Security Scan', 'Threat Assessment'], 
      lastOccurrence: 'Yesterday 10:00 AM', 
      nextPredicted: 'Today 10:00 AM', 
      accuracy: 94 
    },
    { 
      id: '2', 
      pattern: 'Weekly Data Management', 
      frequency: 'weekly', 
      confidence: 87, 
      tasks: ['Data Backup & Sync', 'Storage Optimization'], 
      lastOccurrence: 'Last Monday 11:30 AM', 
      nextPredicted: 'Next Monday 11:30 AM', 
      accuracy: 89 
    },
    { 
      id: '3', 
      pattern: 'Monthly AI Updates', 
      frequency: 'monthly', 
      confidence: 78, 
      tasks: ['AI Model Training', 'Performance Tuning'], 
      lastOccurrence: 'Last month 15th', 
      nextPredicted: 'Next month 15th', 
      accuracy: 82 
    }
  ];

  const automationSuggestions: AutomationSuggestion[] = [
    { 
      id: '1', 
      title: 'Smart Task Scheduling', 
      description: 'Automatically schedule tasks based on priority and dependencies', 
      type: 'workflow', 
      impact: 'high', 
      complexity: 'moderate', 
      estimatedSavings: '2h/day', 
      status: 'suggested', 
      tasks: ['System Security Scan', 'Data Backup & Sync'] 
    },
    { 
      id: '2', 
      title: 'Predictive Maintenance', 
      description: 'Proactive system maintenance based on performance patterns', 
      type: 'trigger', 
      impact: 'medium', 
      complexity: 'complex', 
      estimatedSavings: '1h/day', 
      status: 'implemented', 
      tasks: ['Performance Optimization'] 
    },
    { 
      id: '3', 
      title: 'AI-Powered Task Prioritization', 
      description: 'Use machine learning to optimize task priority based on context', 
      type: 'ai-assist', 
      impact: 'high', 
      complexity: 'complex', 
      estimatedSavings: '30m/day', 
      status: 'suggested', 
      tasks: ['User Behavior Analysis'] 
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'learning': return <Brain className="w-4 h-4" />;
      case 'work': return <Target className="w-4 h-4" />;
      case 'personal': return <User className="w-4 h-4" />;
      case 'health': return <Activity className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getAutomationLevelColor = (level: string) => {
    switch (level) {
      case 'full-auto': return 'text-green-400 bg-green-500/20';
      case 'semi-auto': return 'text-yellow-400 bg-yellow-500/20';
      case 'manual': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredTasks = predictiveTasks.filter(task => {
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showCompleted || task.status !== 'completed';
    return matchesCategory && matchesPriority && matchesSearch && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      case 'time':
        return parseInt(a.predictedTime) - parseInt(b.predictedTime);
      case 'confidence':
        return b.confidence - a.confidence;
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="h-full bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Target className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Predictive Tasks</h2>
            <p className="text-cyan-400/60 text-sm">AI-Powered Task Prediction & Automation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            New Task
          </motion.button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Predicted</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{predictiveTasks.filter(t => t.status === 'predicted').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">In Progress</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{predictiveTasks.filter(t => t.status === 'in-progress').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Completed</span>
            <CheckCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{predictiveTasks.filter(t => t.status === 'completed').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Accuracy</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">87%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Categories</option>
            <option value="security">Security</option>
            <option value="maintenance">Maintenance</option>
            <option value="learning">Learning</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="health">Health</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="priority">Sort by Priority</option>
            <option value="time">Sort by Time</option>
            <option value="confidence">Sort by Confidence</option>
            <option value="created">Sort by Created</option>
          </select>
          <label className="flex items-center space-x-2 text-cyan-400/60">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded border-cyan-500/30 bg-black/50 text-cyan-400 focus:ring-cyan-400"
            />
            <span>Show Completed</span>
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'tasks', label: 'Tasks', icon: Target },
          { id: 'patterns', label: 'Patterns', icon: Brain },
          { id: 'automation', label: 'Automation', icon: Zap },
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
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                {sortedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedTask === task.id
                        ? 'bg-cyan-500/10 border-cyan-500/50'
                        : 'bg-black/30 border-cyan-500/20 hover:border-cyan-500/40'
                    }`}
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        {getCategoryIcon(task.category)}
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{task.title}</h3>
                          <p className="text-cyan-400/60 text-sm mt-1">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getAutomationLevelColor(task.automationLevel)}`}>
                          {task.automationLevel}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-cyan-400/60">Time:</span>
                        <p className="text-white">{task.predictedTime}</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60">Confidence:</span>
                        <p className="text-white">{task.confidence}%</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60">Start:</span>
                        <p className="text-white">{task.predictedStart}</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60">Status:</span>
                        <p className="text-white capitalize">{task.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                        >
                          <Play className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'patterns' && (
            <motion.div
              key="patterns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taskPatterns.map((pattern) => (
                  <div key={pattern.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{pattern.pattern}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                          {pattern.frequency}
                        </span>
                        <span className="text-cyan-400 font-medium">{pattern.confidence}%</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm">Tasks: {pattern.tasks.join(', ')}</p>
                      <p className="text-cyan-400/60 text-sm">Last: {pattern.lastOccurrence}</p>
                      <p className="text-cyan-400/60 text-sm">Next: {pattern.nextPredicted}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400/60 text-sm">Accuracy: {pattern.accuracy}%</span>
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-400 h-2 rounded-full transition-all"
                          style={{ width: `${pattern.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'automation' && (
            <motion.div
              key="automation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {automationSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{suggestion.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          suggestion.impact === 'high' ? 'bg-green-500/20 text-green-400' :
                          suggestion.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {suggestion.impact}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          suggestion.status === 'implemented' ? 'bg-green-500/20 text-green-400' :
                          suggestion.status === 'suggested' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {suggestion.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-cyan-400/60 text-sm mb-3">{suggestion.description}</p>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm">Type: {suggestion.type}</p>
                      <p className="text-cyan-400/60 text-sm">Complexity: {suggestion.complexity}</p>
                      <p className="text-cyan-400/60 text-sm">Savings: {suggestion.estimatedSavings}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400/60 text-sm">Tasks: {suggestion.tasks.length}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30"
                      >
                        Implement
                      </motion.button>
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
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Total Tasks</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">{predictiveTasks.length}</p>
                  <p className="text-cyan-400/60 text-sm">This week</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Accuracy</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">87%</p>
                  <p className="text-cyan-400/60 text-sm">Prediction rate</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Automation</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">73%</p>
                  <p className="text-cyan-400/60 text-sm">Auto-completed</p>
                </div>
              </div>
              
              <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">Task Completion by Category</h3>
                <div className="space-y-3">
                  {['security', 'maintenance', 'learning', 'work'].map((category) => {
                    const categoryTasks = predictiveTasks.filter(t => t.category === category);
                    const completedTasks = categoryTasks.filter(t => t.status === 'completed').length;
                    const totalTasks = categoryTasks.length;
                    const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-cyan-400/60 capitalize">{category}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-cyan-400 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm">{completedTasks}/{totalTasks}</span>
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

export default PredictiveTasks; 