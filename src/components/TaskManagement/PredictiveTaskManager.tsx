import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Pause, 
  Zap,
  BarChart3,
  Lightbulb,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Star,
  Timer,
  Activity,
  Users,
  X
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

// Enhanced Task Interface with AI predictions
interface PredictiveTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  category: string;
  tags: string[];
  
  // AI Predictions
  predicted_duration: number; // minutes
  predicted_completion_probability: number; // 0-100
  energy_level_required: 'low' | 'medium' | 'high';
  optimal_start_time?: string;
  risk_factors: string[];
  
  // Historical Data
  historical_avg_duration: number;
  completion_rate: number;
  similar_tasks_completed: number;
  
  // Scheduling
  deadline?: string;
  estimated_start: string;
  estimated_end: string;
  actual_start?: string;
  actual_end?: string;
  
  // Context
  dependencies: string[];
  assigned_to?: string;
  project?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface TaskAnalytics {
  total_tasks: number;
  completed_today: number;
  overdue_tasks: number;
  productivity_score: number;
  focus_time_remaining: number;
  energy_level: 'low' | 'medium' | 'high';
  optimal_work_periods: Array<{
    start_time: string;
    end_time: string;
    productivity_score: number;
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    completion_rate: number;
  }>;
}

interface TaskRecommendation {
  task_id: string;
  reason: string;
  confidence: number;
  suggested_action: 'start_now' | 'schedule_later' | 'delegate' | 'break_down';
  estimated_impact: 'high' | 'medium' | 'low';
}

interface PredictiveTaskManagerProps {
  isActive: boolean;
  onClose?: () => void;
}

export const PredictiveTaskManager: React.FC<PredictiveTaskManagerProps> = ({ 
  isActive, 
  onClose 
}) => {
  const [tasks, setTasks] = useState<PredictiveTask[]>([]);
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [selectedTask, setSelectedTask] = useState<PredictiveTask | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'analytics' | 'recommendations'>('overview');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'probability' | 'duration'>('priority');
  const { notify } = useNotification();

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: '',
    deadline: '',
    tags: [] as string[],
    project: ''
  });

  useEffect(() => {
    if (isActive) {
      loadTasks();
      loadAnalytics();
      loadRecommendations();
    }
  }, [isActive]);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks/predictive');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      notify('Failed to load tasks', 'error');
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/tasks/analytics');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/tasks/recommendations');
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/tasks/predictive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      const data = await response.json();
      if (data.success) {
        notify('Task created with AI predictions!', 'success');
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          category: '',
          deadline: '',
          tags: [],
          project: ''
        });
        await loadTasks();
        await loadAnalytics();
        await loadRecommendations();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      notify('Failed to create task', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const startTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/start`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        notify('Task started!', 'success');
        await loadTasks();
      }
    } catch (error) {
      console.error('Failed to start task:', error);
      notify('Failed to start task', 'error');
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        notify('Task completed!', 'success');
        await loadTasks();
        await loadAnalytics();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      notify('Failed to complete task', 'error');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'in_progress': return 'text-blue-500 bg-blue-500/10';
      case 'blocked': return 'text-red-500 bg-red-500/10';
      case 'pending': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'deadline':
        return new Date(a.deadline || '9999').getTime() - new Date(b.deadline || '9999').getTime();
      case 'probability':
        return b.predicted_completion_probability - a.predicted_completion_probability;
      case 'duration':
        return a.predicted_duration - b.predicted_duration;
      default:
        return 0;
    }
  });

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border border-cyan-500/30 rounded-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Predictive Task Manager</h1>
              <p className="text-gray-400 text-sm">AI-powered task prioritization and scheduling</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAnalyzing(true)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Analyze</span>
            </button>
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
            { id: 'tasks', label: 'Tasks', icon: Target },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
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
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-400">Total Tasks</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {analytics?.total_tasks || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400">Completed Today</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {analytics?.completed_today || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-gray-400">Overdue</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {analytics?.overdue_tasks || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-400">Productivity</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {analytics?.productivity_score || 0}%
                      </div>
                    </div>
                  </div>

                  {/* Top Recommendations */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Top AI Recommendations</h3>
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec) => {
                        const task = tasks.find(t => t.id === rec.task_id);
                        return (
                          <div key={rec.task_id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div>
                              <div className="font-medium text-white">{task?.title}</div>
                              <div className="text-sm text-gray-400">{rec.reason}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                rec.estimated_impact === 'high' ? 'bg-red-500/20 text-red-400' :
                                rec.estimated_impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {rec.estimated_impact} impact
                              </span>
                              <button
                                onClick={() => startTask(rec.task_id)}
                                className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                              >
                                {rec.suggested_action === 'start_now' ? 'Start' : 'View'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Energy Level & Optimal Times */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Current Energy Level</h3>
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          analytics?.energy_level === 'high' ? 'bg-red-500' :
                          analytics?.energy_level === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="text-white capitalize">{analytics?.energy_level || 'medium'}</span>
                      </div>
                      <div className="mt-4 text-sm text-gray-400">
                        Focus time remaining: {analytics?.focus_time_remaining || 0} minutes
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Optimal Work Periods</h3>
                      <div className="space-y-2">
                        {analytics?.optimal_work_periods?.slice(0, 2).map((period, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              {period.start_time} - {period.end_time}
                            </span>
                            <span className="text-cyan-400">{period.productivity_score}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Filters and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="all">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="priority">Sort by Priority</option>
                        <option value="deadline">Sort by Deadline</option>
                        <option value="probability">Sort by Probability</option>
                        <option value="duration">Sort by Duration</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setSelectedTask({} as PredictiveTask)}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Task</span>
                    </button>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-white">{task.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{task.predicted_duration}m</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Target className="w-3 h-3" />
                                <span>{task.predicted_completion_probability}%</span>
                              </span>
                              <span className={`flex items-center space-x-1 ${getEnergyColor(task.energy_level_required)}`}>
                                <Zap className="w-3 h-3" />
                                <span>{task.energy_level_required}</span>
                              </span>
                              {task.deadline && (
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {task.status === 'pending' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); startTask(task.id); }}
                                className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {task.status === 'in_progress' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); completeTask(task.id); }}
                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Productivity Trends */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Productivity Trends</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{analytics?.productivity_score || 0}%</div>
                        <div className="text-sm text-gray-400">Overall Productivity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{analytics?.completed_today || 0}</div>
                        <div className="text-sm text-gray-400">Tasks Completed Today</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{analytics?.focus_time_remaining || 0}m</div>
                        <div className="text-sm text-gray-400">Focus Time Remaining</div>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Category Performance</h3>
                    <div className="space-y-3">
                      {analytics?.category_breakdown?.map((category) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <span className="text-white">{category.category}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-400">{category.count} tasks</span>
                            <span className="text-cyan-400">{category.completion_rate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">AI Recommendations</h3>
                    <div className="space-y-4">
                      {recommendations.map((rec) => {
                        const task = tasks.find(t => t.id === rec.task_id);
                        return (
                          <div key={rec.task_id} className="border border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-white">{task?.title}</h4>
                                <p className="text-gray-400 text-sm">{rec.reason}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-400">Confidence</div>
                                <div className="text-lg font-bold text-cyan-400">{rec.confidence}%</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  rec.estimated_impact === 'high' ? 'bg-red-500/20 text-red-400' :
                                  rec.estimated_impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {rec.estimated_impact} impact
                                </span>
                                <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                                  {rec.suggested_action.replace('_', ' ')}
                                </span>
                              </div>
                              <button
                                onClick={() => startTask(rec.task_id)}
                                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                              >
                                Take Action
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Task Creation Modal */}
        <AnimatePresence>
          {selectedTask && !selectedTask.id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Create New Task</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <textarea
                    placeholder="Description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-20"
                  />
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Category"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <input
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={createTask}
                      disabled={isCreating}
                      className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-gray-600 transition-colors"
                    >
                      {isCreating ? 'Creating...' : 'Create Task'}
                    </button>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 