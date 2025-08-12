import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Zap,
  Lightbulb,
  BarChart3,
  Calendar,
  Star
} from 'lucide-react';

interface LearningModule {
  id: string;
  name: string;
  description: string;
  category: string;
  progress: number;
  status: 'active' | 'paused' | 'completed' | 'queued';
  lastUpdated: string;
  priority: 'low' | 'medium' | 'high';
}

interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  confidence: number;
  lastAccessed: string;
  usage: number;
}

const learningModules: LearningModule[] = [
  {
    id: '1',
    name: 'Natural Language Processing',
    description: 'Advanced language understanding and generation',
    category: 'AI Core',
    progress: 85,
    status: 'active',
    lastUpdated: '2 hours ago',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Computer Vision',
    description: 'Image and video analysis capabilities',
    category: 'AI Core',
    progress: 62,
    status: 'active',
    lastUpdated: '1 hour ago',
    priority: 'high'
  },
  {
    id: '3',
    name: 'Predictive Analytics',
    description: 'Pattern recognition and future prediction',
    category: 'Analytics',
    progress: 45,
    status: 'paused',
    lastUpdated: '3 hours ago',
    priority: 'medium'
  },
  {
    id: '4',
    name: 'Emotional Intelligence',
    description: 'Understanding and responding to emotions',
    category: 'AI Core',
    progress: 78,
    status: 'active',
    lastUpdated: '30 minutes ago',
    priority: 'high'
  },
  {
    id: '5',
    name: 'Creative Writing',
    description: 'Storytelling and content generation',
    category: 'Creative',
    progress: 92,
    status: 'completed',
    lastUpdated: '1 day ago',
    priority: 'medium'
  },
  {
    id: '6',
    name: 'Code Generation',
    description: 'Programming and software development',
    category: 'Technical',
    progress: 33,
    status: 'queued',
    lastUpdated: '5 hours ago',
    priority: 'low'
  }
];

const knowledgeBase: KnowledgeBase[] = [
  {
    id: '1',
    title: 'User Interaction Patterns',
    content: 'Analysis of common user interaction patterns and preferences',
    category: 'Behavioral',
    confidence: 94,
    lastAccessed: '10 minutes ago',
    usage: 156
  },
  {
    id: '2',
    title: 'Technical Documentation',
    content: 'Comprehensive technical knowledge and system architecture',
    category: 'Technical',
    confidence: 87,
    lastAccessed: '1 hour ago',
    usage: 89
  },
  {
    id: '3',
    title: 'Creative Writing Styles',
    content: 'Various writing styles and creative expression techniques',
    category: 'Creative',
    confidence: 91,
    lastAccessed: '2 hours ago',
    usage: 234
  },
  {
    id: '4',
    title: 'Problem-Solving Strategies',
    content: 'Advanced problem-solving methodologies and approaches',
    category: 'Analytical',
    confidence: 83,
    lastAccessed: '30 minutes ago',
    usage: 67
  }
];

export const AdvancedLearning: React.FC = () => {
  const [modules, setModules] = useState<LearningModule[]>(learningModules);
  const [knowledge, setKnowledge] = useState<KnowledgeBase[]>(knowledgeBase);
  const [overallProgress, setOverallProgress] = useState<number>(68);
  const [learningRate, setLearningRate] = useState<number>(1.2);
  const [activeModules, setActiveModules] = useState<number>(3);
  const [totalKnowledge, setTotalKnowledge] = useState<number>(1247);

  useEffect(() => {
    // Simulate learning progress updates
    const interval = setInterval(() => {
      setOverallProgress(prev => Math.min(100, prev + Math.random() * 0.5));
      setLearningRate(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleModuleStatus = (id: string) => {
    setModules(prev => 
      prev.map(module => {
        if (module.id === id) {
          const newStatus = module.status === 'active' ? 'paused' : 'active';
          return { ...module, status: newStatus };
        }
        return module;
      })
    );
  };

  const resetModule = (id: string) => {
    setModules(prev => 
      prev.map(module => 
        module.id === id ? { ...module, progress: 0, status: 'queued' } : module
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'queued': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'text-red-400';
    if (progress < 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const completedModules = modules.filter(m => m.status === 'completed').length;
  const totalModules = modules.length;

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
            <Brain className="w-8 h-8 mr-3" />
            Advanced Learning
          </h2>
          <p className="text-cyan-200 text-lg">AI knowledge acquisition and skill development</p>
        </div>

        {/* Learning Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-cyan-300 mb-2">{overallProgress.toFixed(1)}%</div>
            <div className="text-sm text-cyan-400">Overall Progress</div>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{learningRate.toFixed(1)}x</div>
            <div className="text-sm text-cyan-400">Learning Rate</div>
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{activeModules}</div>
            <div className="text-sm text-cyan-400">Active Modules</div>
            <Play className="w-6 h-6 text-blue-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{totalKnowledge}</div>
            <div className="text-sm text-cyan-400">Knowledge Items</div>
            <BookOpen className="w-6 h-6 text-purple-400 mx-auto mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Modules */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Learning Modules
                </h3>
                <div className="text-sm text-cyan-400">
                  {completedModules}/{totalModules} Completed
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {modules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border transition-all ${getPriorityColor(module.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-cyan-100">{module.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            module.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            module.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {module.priority}
                          </span>
                        </div>
                        <p className="text-sm text-cyan-400 mb-2">{module.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-cyan-400">
                          <span>{module.category}</span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {module.lastUpdated}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`text-sm font-medium ${getProgressColor(module.progress)}`}>
                          {module.progress}%
                        </span>
                        <div className="flex space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleModuleStatus(module.id)}
                            className={`p-1 rounded ${
                              module.status === 'active' 
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-green-400 hover:text-green-300'
                            } transition`}
                            title={module.status === 'active' ? 'Pause module' : 'Start module'}
                          >
                            {module.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => resetModule(module.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition"
                            title="Reset module"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${getStatusColor(module.status)}`}>
                        {module.status}
                      </span>
                      {module.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Knowledge Base
                </h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                    title="Export knowledge"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    title="Import knowledge"
                  >
                    <Upload className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {knowledge.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10 hover:border-cyan-400/30 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-cyan-100">{item.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-cyan-400">{item.usage} uses</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < Math.floor(item.confidence / 20) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-600'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-cyan-300 mb-3 line-clamp-2">{item.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-cyan-400">
                      <span className="bg-cyan-500/20 px-2 py-1 rounded">{item.category}</span>
                      <span>{item.confidence}% confidence</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.lastAccessed}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Learning Analytics */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Learning Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Knowledge Retention</span>
                  <span className="text-cyan-200 font-medium">94.2%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Learning Efficiency</span>
                  <span className="text-cyan-200 font-medium">87.5%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Adaptation Rate</span>
                  <span className="text-cyan-200 font-medium">91.8%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '91.8%' }}></div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-200 font-medium">Learning Insights</span>
                </div>
                <p className="text-sm text-cyan-300">
                  AI is showing strong performance in creative tasks and emotional intelligence. 
                  Consider focusing on technical skills next.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 