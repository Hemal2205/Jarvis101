import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Activity, Cpu } from 'lucide-react';

export const BrainStatus: React.FC = () => {
  const llmModels = [
    {
      name: 'Nous Hermes',
      role: 'Reasoning',
      status: 'active',
      load: 75,
      color: 'from-purple-400 to-pink-500',
    },
    {
      name: 'Dolphin-Phi-2',
      role: 'Command Parser',
      status: 'active',
      load: 45,
      color: 'from-blue-400 to-cyan-500',
    },
    {
      name: 'Qwen2.5 Coder',
      role: 'Code Generation',
      status: 'active',
      load: 60,
      color: 'from-green-400 to-emerald-500',
    },
  ];

  const cognitiveProcesses = [
    { name: 'Learning', value: 89 },
    { name: 'Memory Formation', value: 95 },
    { name: 'Pattern Recognition', value: 92 },
    { name: 'Decision Making', value: 88 },
  ];

  return (
    <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl border border-cyan-500 border-opacity-30 p-6">
      <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2" />
        AI Brain Status
      </h2>
      
      {/* LLM Models */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-cyan-300">Active Models</h3>
        {llmModels.map((model, index) => (
          <motion.div
            key={model.name}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg bg-gray-800 bg-opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${model.color}`} />
                <span className="text-cyan-200 font-medium text-sm">{model.name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                model.status === 'active' ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
              }`}>
                {model.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 mb-2">{model.role}</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${model.load}%` }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`h-2 rounded-full bg-gradient-to-r ${model.color}`}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">{model.load}% Load</div>
          </motion.div>
        ))}
      </div>

      {/* Cognitive Processes */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-cyan-300">Cognitive Processes</h3>
        {cognitiveProcesses.map((process, index) => (
          <motion.div
            key={process.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-gray-300">{process.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${process.value}%` }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </div>
              <span className="text-xs text-cyan-300 w-8">{process.value}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Neural Activity */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-cyan-300">Neural Activity</h3>
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>
        <div className="text-xs text-gray-400">
          Processing 1,247 thoughts/second
        </div>
      </div>
    </div>
  );
};