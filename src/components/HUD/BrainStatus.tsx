import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, RefreshCw } from 'lucide-react';

interface LLMModel {
  name: string;
  role: string;
  status: string;
  load: number;
  color?: string;
}

export const BrainStatus: React.FC = () => {
  const [llmModels, setLlmModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cognitive, setCognitive] = useState<any>(null);
  const [cognitiveLoading, setCognitiveLoading] = useState(true);
  const [cognitiveError, setCognitiveError] = useState<string | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/models/status');
      if (res.ok) {
        const data = await res.json();
        let models: LLMModel[] = [];
        if (Array.isArray(data.models)) {
          models = data.models;
        } else if (Array.isArray(data.available_models)) {
          // Try to use per-model status/load if available
          models = data.available_models.map((m: any) => ({
            name: m.name || m.path || 'Unknown',
            role: m.type || 'N/A',
            status: data.status?.status || 'unknown',
            load: typeof m.load === 'number' ? m.load : (data.status?.models_loaded ? 100 : 0),
            color: 'from-cyan-400 to-blue-500',
          }));
        }
        setLlmModels(models);
      } else {
        setError('Failed to fetch model status');
      }
    } catch {
      setError('Failed to fetch model status');
    }
    setLoading(false);
  };

  const fetchCognitive = async () => {
    setCognitiveLoading(true);
    setCognitiveError(null);
    try {
      const res = await fetch('/api/ai/cognitive');
      if (res.ok) {
        const data = await res.json();
        setCognitive(data);
      } else {
        setCognitiveError('Failed to fetch cognitive data');
      }
    } catch {
      setCognitiveError('Failed to fetch cognitive data');
    }
    setCognitiveLoading(false);
  };

  const fetchAll = async () => {
    await Promise.all([fetchModels(), fetchCognitive()]);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const cognitiveProcesses = [
    { name: 'Learning', value: 89 },
    { name: 'Memory Formation', value: 95 },
    { name: 'Pattern Recognition', value: 92 },
    { name: 'Decision Making', value: 88 },
  ];

  return (
    <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl border border-cyan-500 border-opacity-30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cyan-400 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          AI Brain Status
        </h2>
        <button
          onClick={fetchAll}
          disabled={loading || cognitiveLoading}
          className="flex items-center px-3 py-1 rounded bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-medium transition disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${(loading || cognitiveLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      {/* LLM Models */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-cyan-300">Active Models</h3>
        {loading ? <div className="text-cyan-200 text-sm">Loading models...</div> : error ? <div className="text-red-400 text-sm">{error}</div> : !llmModels.length ? <div className="text-gray-400 text-sm">No models found.</div> : null}
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
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${model.color || 'from-cyan-400 to-blue-500'}`} />
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
                animate={{ width: `${model.load ?? 0}%` }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`h-2 rounded-full bg-gradient-to-r ${model.color || 'from-cyan-400 to-blue-500'}`}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">{model.load ?? 0}% Load</div>
          </motion.div>
        ))}
      </div>
      {/* Cognitive Processes */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-cyan-300">Cognitive Processes</h3>
        {cognitiveLoading ? (
          <div className="text-cyan-200 text-sm">Loading cognitive data...</div>
        ) : cognitiveError ? (
          <div className="text-red-400 text-sm">{cognitiveError}</div>
        ) : cognitive ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span>Learning</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cognitive.learning}%` }}
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
                <span className="text-xs text-cyan-300 w-8">{cognitive.learning}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span>Memory Formation</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cognitive.memory_formation}%` }}
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
                <span className="text-xs text-cyan-300 w-8">{cognitive.memory_formation}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span>Pattern Recognition</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cognitive.pattern_recognition}%` }}
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
                <span className="text-xs text-cyan-300 w-8">{cognitive.pattern_recognition}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span>Decision Making</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cognitive.decision_making}%` }}
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
                <span className="text-xs text-cyan-300 w-8">{cognitive.decision_making}%</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
      {/* Neural Activity */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-cyan-300">Neural Activity</h3>
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>
        <div className="text-xs text-gray-400">
          {cognitiveLoading ? 'Loading...' : cognitiveError ? cognitiveError : cognitive ? `Processing ${cognitive.neural_activity} thoughts/second` : 'No data'}
        </div>
      </div>
    </div>
  );
};