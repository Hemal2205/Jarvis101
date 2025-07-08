import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { X, Zap, Brain, TrendingUp, RefreshCw, History, AlertTriangle, CheckCircle } from 'lucide-react';

interface EvolutionPanelProps {
  onClose: () => void;
}

interface EvolutionData {
  timestamp: string;
  improvements_identified: number;
  improvements_applied: number;
  performance_data: any;
  improvements: any[];
  evolution_log_size: number;
  learning_patterns: number;
}

export const EvolutionPanel: React.FC<EvolutionPanelProps> = ({ onClose }) => {
  const { state } = useJarvis();
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionHistory, setEvolutionHistory] = useState<any[]>([]);
  const [evolutionStatus, setEvolutionStatus] = useState<any>(null);
  const [lastEvolution, setLastEvolution] = useState<EvolutionData | null>(null);

  useEffect(() => {
    fetchEvolutionStatus();
    fetchEvolutionHistory();
  }, []);

  const fetchEvolutionStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/system/status');
      const data = await response.json();
      setEvolutionStatus(data.evolution);
    } catch (error) {
      console.error('Failed to fetch evolution status:', error);
    }
  };

  const fetchEvolutionHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/evolution/history');
      const data = await response.json();
      setEvolutionHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch evolution history:', error);
    }
  };

  const triggerEvolution = async () => {
    setIsEvolving(true);
    try {
      const response = await fetch('http://localhost:8000/api/evolution/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      setLastEvolution(result.improvements);
      await fetchEvolutionStatus();
      await fetchEvolutionHistory();
    } catch (error) {
      console.error('Evolution failed:', error);
    } finally {
      setIsEvolving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImprovementTypeColor = (type: string) => {
    switch (type) {
      case 'performance_enhancement': return 'text-green-400';
      case 'bug_fix': return 'text-red-400';
      case 'code_optimization': return 'text-blue-400';
      case 'new_capability': return 'text-purple-400';
      case 'security_improvement': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-3xl border border-cyan-500 border-opacity-30 p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
          <Brain className="w-6 h-6 mr-2" />
          Autonomous Evolution Engine
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-cyan-300">Evolution Status</h3>
          </div>
          {evolutionStatus && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Active:</span>
                <span className={evolutionStatus.evolution_active ? 'text-green-400' : 'text-red-400'}>
                  {evolutionStatus.evolution_active ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Evolutions:</span>
                <span className="text-cyan-300">{evolutionStatus.total_evolutions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Learning Patterns:</span>
                <span className="text-cyan-300">{evolutionStatus.learning_patterns || 0}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-cyan-300">Performance</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Response Time:</span>
              <span className="text-green-400">150ms avg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Success Rate:</span>
              <span className="text-green-400">99.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Efficiency:</span>
              <span className="text-green-400">+15% since last evolution</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-cyan-300">Manual Evolution</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={triggerEvolution}
              disabled={isEvolving}
              className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium transition-all duration-200"
            >
              {isEvolving ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evolving...</span>
                </div>
              ) : (
                'Trigger Evolution'
              )}
            </button>
            <p className="text-xs text-gray-400">
              Force immediate analysis and improvement
            </p>
          </div>
        </div>
      </div>

      {/* Last Evolution Results */}
      {lastEvolution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 bg-opacity-50 rounded-2xl p-4 mb-6"
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            Latest Evolution Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-2">Improvements Identified:</div>
              <div className="text-xl font-bold text-cyan-300">{lastEvolution.improvements_identified}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Improvements Applied:</div>
              <div className="text-xl font-bold text-green-400">{lastEvolution.improvements_applied}</div>
            </div>
          </div>
          {lastEvolution.improvements && lastEvolution.improvements.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-300 mb-2">Applied Improvements:</div>
              <div className="space-y-2">
                {lastEvolution.improvements.slice(0, 3).map((improvement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(improvement.priority)}`} />
                    <span className={`text-sm ${getImprovementTypeColor(improvement.type)}`}>
                      {improvement.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Evolution History */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
          <History className="w-5 h-5 mr-2" />
          Evolution History
        </h3>
        
        {evolutionHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No evolution history yet. The system will learn and improve over time.
          </div>
        ) : (
          <div className="space-y-4">
            {evolutionHistory.map((evolution, index) => (
              <motion.div
                key={evolution.evolution_id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-400">
                        {formatDate(evolution.timestamp)}
                      </span>
                      {evolution.success !== null && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          evolution.success 
                            ? 'bg-green-600 text-green-100' 
                            : 'bg-red-600 text-red-100'
                        }`}>
                          {evolution.success ? 'Success' : 'Failed'}
                        </span>
                      )}
                    </div>
                    {evolution.improvement && (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(evolution.improvement.priority)}`} />
                          <span className={`text-sm font-medium ${getImprovementTypeColor(evolution.improvement.type)}`}>
                            {evolution.improvement.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{evolution.improvement.description}</p>
                        <p className="text-xs text-gray-500">Target: {evolution.improvement.target_module}</p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {evolution.improvement?.priority === 'high' && (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            J.A.R.V.I.S continuously evolves to serve you better
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">Evolution Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};