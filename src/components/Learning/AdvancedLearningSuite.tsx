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
  X,
  Plus,
  Edit3,
  Trash2,
  Users,
  Globe,
  Code,
  Palette,
  Music,
  Calculator,
  Languages,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Timer,
  Headphones,
  Video,
  FileText,
  Database
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

// Learning Categories
type LearningCategory = 'programming' | 'design' | 'business' | 'languages' | 'science' | 'arts' | 'technology' | 'health';

// Skill Levels
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

// Learning Path Status
type LearningStatus = 'not_started' | 'in_progress' | 'completed' | 'paused' | 'review';

// Learning Resource Types
type ResourceType = 'video' | 'article' | 'interactive' | 'quiz' | 'project' | 'workshop' | 'mentorship';

// Skill Interface
interface Skill {
  id: string;
  name: string;
  category: LearningCategory;
  current_level: SkillLevel;
  target_level: SkillLevel;
  progress_percentage: number;
  xp_points: number;
  total_xp_needed: number;
  learning_path: LearningPath[];
  related_skills: string[];
  last_practiced: string;
  mastery_score: number;
  time_spent: number; // minutes
  achievements: Achievement[];
  resources: LearningResource[];
}

// Learning Path
interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: SkillLevel;
  estimated_duration: number; // minutes
  prerequisites: string[];
  resources: string[];
  status: LearningStatus;
  completed_at?: string;
  progress: number; // 0-100
}

// Learning Resource
interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  duration: number; // minutes
  difficulty: SkillLevel;
  rating: number; // 1-5
  completed: boolean;
  tags: string[];
  description: string;
}

// Achievement
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
}

// Learning Analytics
interface LearningAnalytics {
  total_skills: number;
  skills_in_progress: number;
  skills_completed: number;
  total_xp: number;
  learning_streak: number;
  weekly_goal_progress: number;
  recommended_skills: Skill[];
  learning_patterns: {
    preferred_time: string;
    preferred_duration: number;
    most_productive_day: string;
  };
  skill_gaps: {
    skill_id: string;
    gap_reason: string;
    recommended_resources: string[];
  }[];
}

// AI Recommendation
interface AIRecommendation {
  skill_id: string;
  reason: string;
  confidence: number;
  suggested_action: 'start_learning' | 'practice_more' | 'take_assessment' | 'find_mentor';
  estimated_impact: 'low' | 'medium' | 'high';
  time_commitment: number; // minutes per day
}

interface AdvancedLearningSuiteProps {
  isActive: boolean;
  onClose?: () => void;
}

export const AdvancedLearningSuite: React.FC<AdvancedLearningSuiteProps> = ({ 
  isActive, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'paths' | 'resources' | 'analytics' | 'recommendations'>('overview');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'progress' | 'name' | 'xp' | 'recent'>('progress');
  const { notify } = useNotification();

  // New skill form
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'programming' as LearningCategory,
    target_level: 'intermediate' as SkillLevel,
    description: ''
  });

  useEffect(() => {
    if (isActive) {
      loadSkills();
      loadAnalytics();
      loadRecommendations();
    }
  }, [isActive]);

  const loadSkills = async () => {
    try {
      const response = await fetch('/api/learning/skills');
      const data = await response.json();
      if (data.success) {
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
      notify('Failed to load skills', 'error');
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/learning/analytics');
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
      const response = await fetch('/api/learning/recommendations');
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const createSkill = async () => {
    if (!newSkill.name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/learning/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill)
      });

      const data = await response.json();
      if (data.success) {
        notify('Skill created successfully!', 'success');
        setNewSkill({
          name: '',
          category: 'programming',
          target_level: 'intermediate',
          description: ''
        });
        await loadSkills();
        await loadAnalytics();
      }
    } catch (error) {
      console.error('Failed to create skill:', error);
      notify('Failed to create skill', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const startLearning = async (skillId: string) => {
    try {
      const response = await fetch(`/api/learning/skills/${skillId}/start`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        notify('Learning session started!', 'success');
        await loadSkills();
      }
    } catch (error) {
      console.error('Failed to start learning:', error);
      notify('Failed to start learning', 'error');
    }
  };

  const completeResource = async (skillId: string, resourceId: string) => {
    try {
      const response = await fetch(`/api/learning/skills/${skillId}/resources/${resourceId}/complete`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        notify('Resource completed! XP gained!', 'success');
        await loadSkills();
        await loadAnalytics();
      }
    } catch (error) {
      console.error('Failed to complete resource:', error);
      notify('Failed to complete resource', 'error');
    }
  };

  const getCategoryIcon = (category: LearningCategory) => {
    switch (category) {
      case 'programming': return Code;
      case 'design': return Palette;
      case 'business': return TrendingUp;
      case 'languages': return Languages;
      case 'science': return Calculator;
      case 'arts': return Music;
      case 'technology': return Globe;
      case 'health': return Users;
      default: return BookOpen;
    }
  };

  const getLevelColor = (level: SkillLevel) => {
    switch (level) {
      case 'beginner': return 'text-green-500 bg-green-500/10';
      case 'intermediate': return 'text-blue-500 bg-blue-500/10';
      case 'advanced': return 'text-purple-500 bg-purple-500/10';
      case 'expert': return 'text-orange-500 bg-orange-500/10';
      case 'master': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 bg-yellow-500/10';
      case 'epic': return 'text-purple-400 bg-purple-500/10';
      case 'rare': return 'text-blue-400 bg-blue-500/10';
      case 'common': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const filteredSkills = skills.filter(skill => {
    if (filterCategory !== 'all' && skill.category !== filterCategory) return false;
    if (filterLevel !== 'all' && skill.current_level !== filterLevel) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return b.progress_percentage - a.progress_percentage;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'xp':
        return b.xp_points - a.xp_points;
      case 'recent':
        return new Date(b.last_practiced).getTime() - new Date(a.last_practiced).getTime();
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
              <h1 className="text-2xl font-bold text-cyan-400">Advanced Learning Suite</h1>
              <p className="text-gray-400 text-sm">AI-powered personalized learning and skill development</p>
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
            { id: 'skills', label: 'Skills', icon: Target },
            { id: 'paths', label: 'Learning Paths', icon: BookOpen },
            { id: 'resources', label: 'Resources', icon: FileText },
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
                  {/* Learning Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-400">Total Skills</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {analytics?.total_skills || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400">In Progress</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {analytics?.skills_in_progress || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-400">Total XP</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {analytics?.total_xp || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-400">Learning Streak</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {analytics?.learning_streak || 0} days
                      </div>
                    </div>
                  </div>

                  {/* Top Skills */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Top Skills</h3>
                    <div className="space-y-3">
                      {skills.slice(0, 5).map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {React.createElement(getCategoryIcon(skill.category), { className: "w-5 h-5 text-cyan-400" })}
                            <div>
                              <div className="font-medium text-white">{skill.name}</div>
                              <div className="text-sm text-gray-400">{skill.category}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-sm text-gray-400">Progress</div>
                              <div className="text-white font-medium">{skill.progress_percentage}%</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">XP</div>
                              <div className="text-white font-medium">{skill.xp_points}</div>
                            </div>
                            <button
                              onClick={() => startLearning(skill.id)}
                              className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                            >
                              Practice
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Patterns */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Learning Patterns</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Preferred Time:</span>
                          <span className="text-white">{analytics?.learning_patterns?.preferred_time || 'Morning'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Session Duration:</span>
                          <span className="text-white">{analytics?.learning_patterns?.preferred_duration || 45} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Most Productive:</span>
                          <span className="text-white">{analytics?.learning_patterns?.most_productive_day || 'Tuesday'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Weekly Goal</h3>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">
                          {analytics?.weekly_goal_progress || 0}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${analytics?.weekly_goal_progress || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-400 mt-2">Weekly learning goal progress</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-6">
                  {/* Filters and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="all">All Categories</option>
                        <option value="programming">Programming</option>
                        <option value="design">Design</option>
                        <option value="business">Business</option>
                        <option value="languages">Languages</option>
                        <option value="science">Science</option>
                        <option value="arts">Arts</option>
                        <option value="technology">Technology</option>
                        <option value="health">Health</option>
                      </select>
                      <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                        <option value="master">Master</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="progress">Sort by Progress</option>
                        <option value="name">Sort by Name</option>
                        <option value="xp">Sort by XP</option>
                        <option value="recent">Sort by Recent</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setSelectedSkill({} as Skill)}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Skill</span>
                    </button>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSkills.map((skill) => (
                      <motion.div
                        key={skill.id}
                        layout
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedSkill(skill)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          {React.createElement(getCategoryIcon(skill.category), { className: "w-6 h-6 text-cyan-400" })}
                          <span className={`px-2 py-1 rounded text-xs ${getLevelColor(skill.current_level)}`}>
                            {skill.current_level}
                          </span>
                        </div>
                        <h3 className="font-medium text-white mb-2">{skill.name}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progress:</span>
                            <span className="text-white">{skill.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${skill.progress_percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">XP:</span>
                            <span className="text-white">{skill.xp_points}/{skill.total_xp_needed}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Time:</span>
                            <span className="text-white">{Math.round(skill.time_spent / 60)}h</span>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); startLearning(skill.id); }}
                            className="flex-1 px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700 transition-colors"
                          >
                            Practice
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'paths' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Learning Paths</h3>
                  
                  {selectedSkill ? (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">{selectedSkill.name} Learning Path</h4>
                      <div className="space-y-3">
                        {selectedSkill.learning_path.map((path) => (
                          <div key={path.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-white">{path.title}</h5>
                              <span className={`px-2 py-1 rounded text-xs ${getLevelColor(path.difficulty)}`}>
                                {path.difficulty}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{path.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Duration: {path.estimated_duration} min</span>
                              <span className="text-gray-400">Progress: {path.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                              <div 
                                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${path.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a skill to view its learning path</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Learning Resources</h3>
                  
                  {selectedSkill ? (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">{selectedSkill.name} Resources</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedSkill.resources.map((resource) => (
                          <div key={resource.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {resource.type === 'video' && <Video className="w-5 h-5 text-red-400" />}
                                {resource.type === 'article' && <FileText className="w-5 h-5 text-blue-400" />}
                                {resource.type === 'interactive' && <Code className="w-5 h-5 text-green-400" />}
                                {resource.type === 'quiz' && <CheckCircle className="w-5 h-5 text-yellow-400" />}
                                <h5 className="font-medium text-white">{resource.title}</h5>
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < resource.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{resource.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">{resource.duration} min</span>
                              <span className={`px-2 py-1 rounded text-xs ${getLevelColor(resource.difficulty)}`}>
                                {resource.difficulty}
                              </span>
                            </div>
                            <button
                              onClick={() => completeResource(selectedSkill.id, resource.id)}
                              disabled={resource.completed}
                              className={`w-full mt-3 px-3 py-2 rounded text-sm transition-colors ${
                                resource.completed
                                  ? 'bg-green-600 text-white cursor-not-allowed'
                                  : 'bg-cyan-600 text-white hover:bg-cyan-700'
                              }`}
                            >
                              {resource.completed ? 'Completed' : 'Start Learning'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a skill to view its learning resources</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Learning Analytics</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Skill Gaps</h4>
                      <div className="space-y-3">
                        {analytics?.skill_gaps?.map((gap) => (
                          <div key={gap.skill_id} className="p-3 bg-gray-700/50 rounded-lg">
                            <div className="font-medium text-white mb-1">{gap.skill_id}</div>
                            <div className="text-sm text-gray-400 mb-2">{gap.gap_reason}</div>
                            <div className="text-xs text-cyan-400">
                              Recommended: {gap.recommended_resources.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Recommended Skills</h4>
                      <div className="space-y-3">
                        {analytics?.recommended_skills?.map((skill) => (
                          <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div>
                              <div className="font-medium text-white">{skill.name}</div>
                              <div className="text-sm text-gray-400">{skill.category}</div>
                            </div>
                            <button
                              onClick={() => startLearning(skill.id)}
                              className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                            >
                              Start
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">AI Recommendations</h3>
                  
                  <div className="space-y-4">
                    {recommendations.map((rec) => {
                      const skill = skills.find(s => s.id === rec.skill_id);
                      return (
                        <div key={rec.skill_id} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-white">{skill?.name}</h4>
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
                                {rec.time_commitment} min/day
                              </span>
                            </div>
                            <button
                              onClick={() => startLearning(rec.skill_id)}
                              className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                            >
                              {rec.suggested_action.replace('_', ' ')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skill Creation Modal */}
        <AnimatePresence>
          {selectedSkill && !selectedSkill.id && (
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
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Add New Skill</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Skill name"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as LearningCategory })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="languages">Languages</option>
                    <option value="science">Science</option>
                    <option value="arts">Arts</option>
                    <option value="technology">Technology</option>
                    <option value="health">Health</option>
                  </select>
                  <select
                    value={newSkill.target_level}
                    onChange={(e) => setNewSkill({ ...newSkill, target_level: e.target.value as SkillLevel })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                    <option value="master">Master</option>
                  </select>
                  <textarea
                    placeholder="Description (optional)"
                    value={newSkill.description}
                    onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-20"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={createSkill}
                      disabled={isCreating}
                      className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-gray-600 transition-colors"
                    >
                      {isCreating ? 'Creating...' : 'Create Skill'}
                    </button>
                    <button
                      onClick={() => setSelectedSkill(null)}
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