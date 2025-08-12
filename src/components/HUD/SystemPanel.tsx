import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, Database, Copy, Activity, RefreshCw } from 'lucide-react';

export const SystemPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memoriesCount, setMemoriesCount] = useState<number | null>(null);
  const [copiesCount, setCopiesCount] = useState<number | null>(null);
  const [aiBrainStatus, setAiBrainStatus] = useState<'active' | 'inactive' | 'error'>('inactive');
  const [securityStatus, setSecurityStatus] = useState<'active' | 'inactive' | 'error'>('inactive');
  const [metrics, setMetrics] = useState<any>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch system metrics
      const metricsRes = await fetch('/api/monitor/status');
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.system_status || metricsData.system_status === undefined ? metricsData : null);
      } else {
        setMetrics(null);
      }
      // Fetch memories
      const memRes = await fetch('/api/memories');
      if (memRes.ok) {
        const memData = await memRes.json();
        setMemoriesCount(Array.isArray(memData.memories) ? memData.memories.length : 0);
      } else {
        setMemoriesCount(null);
      }
      // Fetch copies (history)
      let copies = null;
      try {
        const copyRes = await fetch('/api/copy/history');
        if (copyRes.ok) {
          const copyData = await copyRes.json();
          copies = Array.isArray(copyData.history) ? copyData.history.length : 0;
        } else {
          copies = null;
        }
      } catch {
        copies = null;
      }
      setCopiesCount(copies);
      // Fetch AI Brain status
      const aiRes = await fetch('/api/models/status');
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiBrainStatus(aiData.status?.status === 'active' ? 'active' : 'inactive');
      } else {
        setAiBrainStatus('error');
      }
      // Fetch Security status
      const secRes = await fetch('/api/status');
      if (secRes.ok) {
        const secData = await secRes.json();
        setSecurityStatus(secData.modules?.security === 'online' ? 'active' : 'inactive');
      } else {
        setSecurityStatus('error');
      }
    } catch (err) {
      setError('Failed to fetch system status');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const systemModules = [
    {
      name: 'AI Brain',
      icon: Brain,
      status: aiBrainStatus === 'active',
      details: aiBrainStatus === 'active' ? 'Multi-LLM Core Active' : aiBrainStatus === 'error' ? 'Error' : 'Inactive',
    },
    {
      name: 'Security',
      icon: Shield,
      status: securityStatus === 'active',
      details: securityStatus === 'active' ? 'Biometric Lock Enabled' : securityStatus === 'error' ? 'Error' : 'Inactive',
    },
    {
      name: 'Memory Vault',
      icon: Database,
      status: memoriesCount !== null,
      details: memoriesCount !== null ? `${memoriesCount} memories stored` : 'Loading...',
    },
    {
      name: 'Copy Engine',
      icon: Copy,
      status: copiesCount !== null,
      details: copiesCount !== null ? `${copiesCount} copies deployed` : 'Unavailable',
    },
  ];

  return (
    <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl border border-cyan-500 border-opacity-30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cyan-400 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          System Status
        </h2>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center px-3 py-1 rounded bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-medium transition disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-cyan-200 text-center py-8">Loading system status...</div>
      ) : error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : (
        <div className="space-y-4">
          {systemModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.name}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800 bg-opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${module.status ? 'bg-green-500' : 'bg-red-500'}
                  `}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-cyan-200">{module.name}</h3>
                    <p className="text-xs text-gray-400">{module.details}</p>
                  </div>
                </div>
                <div className={`
                  w-3 h-3 rounded-full animate-pulse
                  ${module.status ? 'bg-green-400' : 'bg-red-400'}
                `} />
              </motion.div>
            );
          })}
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h3 className="text-sm font-medium text-cyan-300 mb-2">Performance</h3>
        {loading ? (
          <div className="text-cyan-200">Loading...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : metrics ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">CPU Usage</span>
              <span className="text-cyan-300">{metrics.cpu?.usage ?? '--'}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Memory</span>
              <span className="text-cyan-300">{metrics.memory?.available ?? '--'}GB / {metrics.memory?.total ?? '--'}GB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network</span>
              <span className="text-green-300">{metrics.network?.latency !== undefined ? `${metrics.network.latency}ms` : 'Connected'}</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">No performance data.</div>
        )}
      </div>
    </div>
  );
};