import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  Clock, 
  Search, 
  Play, 
  BarChart3,
  Calendar,
  Star,
  Zap,
  X
} from 'lucide-react';
import { useNotification } from './NotificationContext';

// Define interfaces for dashboard data, skill, and progress
interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  mastery_score: number;
  practice_count: number;
  last_updated: string;
  learned_at: string;
  tags: string[];
  related_skills: string[];
  session_count: number;
  total_time_spent: number;
  avg_completion_rate: number;
};
interface SkillsDashboardData {
  skills: Skill[];
  summary: {
    total_skills: number;
    total_sessions: number;
    categories: Record<string, number>;
    learning_streak: number;
    total_learning_time: number;
  };
  recommendations: string[];
};
interface LearningProgress {
  total_skills: number;
  completed_skills: number;
  in_progress_skills: number;
  learning_streak: number;
  active_session: unknown;
  recent_sessions: unknown[];
  skill_categories: Record<string, number>;
  recommendations: string[];
};  

export const SkillsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SkillsDashboardData | null>(null);
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'progress' | 'recommendations'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'mastery' | 'recent'>('mastery');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();
  const shownSkillIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadDashboardData();
    loadLearningProgress();
  }, []);

  // Poll for new skills every 10 seconds
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/skills/dashboard');
        const data = await res.json();
        setDashboardData(data);
        (data.skills || []).forEach((s: Skill) => {
          if (!shownSkillIds.current.has(s.id)) {
            notify(`New skill learned: ${s.name || s.id}`, 'success');
            shownSkillIds.current.add(s.id);
          }
        });
      } catch {
        notify('Failed to fetch skills.', 'error');
      }
    };
    fetchSkills();
    const interval = window.setInterval(fetchSkills, 10000);
    return () => window.clearInterval(interval);
  }, [notify]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/skills/dashboard');
      if (!response.ok) throw new Error('Failed to load dashboard data');
      
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load skills dashboard');
      console.error(err);
    }
  };

  const loadLearningProgress = async () => {
    try {
      const response = await fetch('/api/skills/progress');
      if (!response.ok) throw new Error('Failed to load learning progress');
      
      const data = await response.json();
      setLearningProgress(data);
    } catch (err) {
      setError('Failed to load learning progress');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startLearning = async (topic: string) => {
    try {
      const response = await fetch('/api/skills/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!response.ok) throw new Error('Failed to start learning');
      
      const result = await response.json();
      if (result.success) {
        await loadDashboardData();
        await loadLearningProgress();
      } else {
        setError(result.message || 'Failed to start learning');
      }
    } catch (err) {
      setError('Failed to start learning session');
      console.error(err);
    }
  };

  const practiceSkill = async (skillId: string) => {
    try {
      const response = await fetch('/api/skills/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId })
      });

      if (!response.ok) throw new Error('Failed to start practice');
      
      const result = await response.json();
      if (result.success) {
        await loadDashboardData();
        await loadLearningProgress();
      } else {
        setError(result.message || 'Failed to start practice');
      }
    } catch (err) {
      setError('Failed to start practice session');
      console.error(err);
    }
  };

  const getFilteredSkills = () => {
    if (!dashboardData) return [];
    
    let filtered = dashboardData.skills;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === filterCategory);
    }
    
    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'mastery':
        filtered.sort((a, b) => b.mastery_score - a.mastery_score);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
        break;
    }
    
    return filtered;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-yellow-400 bg-yellow-400/20';
      case 'intermediate': return 'text-orange-400 bg-orange-400/20';
      case 'advanced': return 'text-blue-400 bg-blue-400/20';
      case 'expert': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      programming: 'bg-green-500/20 text-green-400',
      data_science: 'bg-blue-500/20 text-blue-400',
      business: 'bg-purple-500/20 text-purple-400',
      science: 'bg-cyan-500/20 text-cyan-400',
      technology: 'bg-orange-500/20 text-orange-400',
      creative: 'bg-pink-500/20 text-pink-400',
      language: 'bg-indigo-500/20 text-indigo-400',
      general: 'bg-gray-500/20 text-gray-400'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Learning Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-6 rounded-xl border border-cyan-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cyan-300">Learning Stats</h3>
          <Brain className="w-6 h-6 text-cyan-400" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Skills</span>
            <span className="text-white font-medium">{dashboardData?.summary && typeof dashboardData.summary.total_skills === 'number' ? dashboardData.summary.total_skills : '--'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Learning Streak</span>
            <span className="text-orange-400 font-medium">{learningProgress?.learning_streak || 0} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Time</span>
            <span className="text-green-400 font-medium">{
  dashboardData?.summary && typeof dashboardData.summary.total_learning_time === 'number'
    ? formatTime(dashboardData.summary.total_learning_time)
    : '--'
}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sessions</span>
            <span className="text-blue-400 font-medium">{
  dashboardData?.summary && typeof dashboardData.summary.total_sessions === 'number'
    ? dashboardData.summary.total_sessions
    : '--'
}</span>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-300">Progress</h3>
          <TrendingUp className="w-6 h-6 text-purple-400" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Completed</span>
            <span className="text-green-400 font-medium">{learningProgress?.completed_skills || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">In Progress</span>
            <span className="text-yellow-400 font-medium">{learningProgress?.in_progress_skills || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Categories</span>
            <span className="text-blue-400 font-medium">{
  dashboardData?.summary && dashboardData.summary.categories
    ? Object.keys(dashboardData.summary.categories).length
    : '--'
}</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-300">Quick Actions</h3>
          <Zap className="w-6 h-6 text-green-400" />
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              const topic = prompt('What would you like to learn?');
              if (topic) startLearning(topic);
            }}
            className="w-full bg-green-500/20 hover:bg-green-500/30 p-3 rounded-lg text-green-300 transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start Learning</span>
          </button>
          
          <button
            onClick={() => setActiveTab('skills')}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 p-3 rounded-lg text-blue-300 transition-colors flex items-center justify-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Skills</span>
          </button>
        </div>
      </motion.div>

      {/* Categories Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-300">Skill Categories</h3>
          <BarChart3 className="w-6 h-6 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dashboardData?.summary && dashboardData.summary.categories ? dashboardData.summary.categories : {}).map(([category, count]) => (
            <div key={category} className="text-center">
              <div className={`p-3 rounded-lg ${getCategoryColor(category)} mb-2`}>
                <div className="text-2xl font-bold">{count}</div>
              </div>
              <div className="text-sm text-gray-400 capitalize">{category.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderSkillsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {Object.keys(dashboardData?.summary && dashboardData.summary.categories ? dashboardData.summary.categories : {}).map(category => (
            <option key={category} value={category}>
              {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'mastery' | 'recent')}
          className="bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
        >
          <option value="mastery">Sort by Mastery</option>
          <option value="name">Sort by Name</option>
          <option value="recent">Sort by Recent</option>
        </select>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredSkills().map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-900/50 to-slate-900/50 p-6 rounded-xl border border-gray-600/30 hover:border-cyan-500/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{skill.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{skill.description}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(skill.level)}`}>
                {skill.level}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Mastery</span>
                <span className="text-cyan-400">{(skill.mastery_score * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${skill.mastery_score * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span>Practice: {skill.practice_count}x</span>
              <span>Time: {formatTime(skill.total_time_spent)}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <div className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(skill.category)}`}>
                {skill.category.replace('_', ' ')}
              </div>
              {skill.tags.slice(0, 2).map(tag => (
                <div key={tag} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                  {tag}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => practiceSkill(skill.id)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Practice</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderProgressTab = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-300">Completed</h3>
            <Award className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {learningProgress?.completed_skills || 0}
          </div>
          <div className="text-sm text-gray-400">Skills mastered</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6 rounded-xl border border-yellow-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-yellow-300">In Progress</h3>
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {learningProgress?.in_progress_skills || 0}
          </div>
          <div className="text-sm text-gray-400">Skills learning</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-900/30 to-red-900/30 p-6 rounded-xl border border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-300">Streak</h3>
            <Star className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-2">
            {learningProgress?.learning_streak || 0}
          </div>
          <div className="text-sm text-gray-400">Days learning</div>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 rounded-xl border border-gray-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-300">Recent Sessions</h3>
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {learningProgress?.recent_sessions?.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <div className="font-medium text-white">{session.topic}</div>
                <div className="text-sm text-gray-400">
                  {new Date(session.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-cyan-400">{(session.completion_rate * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-400">{formatTime(session.duration)}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderRecommendationsTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-300">Learning Recommendations</h3>
          <Target className="w-6 h-6 text-purple-400" />
        </div>
        
        <div className="space-y-4">
          {dashboardData?.recommendations?.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-400 font-medium">{index + 1}</span>
                </div>
                <span className="text-white">{recommendation}</span>
              </div>
              <button
                onClick={() => {
                  const topic = recommendation.split(' ')[1]; // Extract topic from recommendation
                  if (topic) startLearning(topic);
                }}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-colors"
              >
                Start Learning
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Loading skills dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Error loading dashboard</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadDashboardData();
              loadLearningProgress();
            }}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">Skills Dashboard</h1>
        <p className="text-gray-400">Track your learning progress and discover new skills</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-900/50 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'skills', label: 'Skills', icon: BookOpen },
          { id: 'progress', label: 'Progress', icon: TrendingUp },
          { id: 'recommendations', label: 'Recommendations', icon: Target }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as 'overview' | 'skills' | 'progress' | 'recommendations')}
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'skills' && renderSkillsTab()}
          {activeTab === 'progress' && renderProgressTab()}
          {activeTab === 'recommendations' && renderRecommendationsTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};