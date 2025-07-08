import React from 'react';
import { motion } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { Brain, Shield, Database, Copy, Activity, Wifi, HardDrive } from 'lucide-react';

export const SystemPanel: React.FC = () => {
  const { state } = useJarvis();

  const systemModules = [
    {
      name: 'AI Brain',
      icon: Brain,
      status: state.systemStatus.brain,
      details: 'Multi-LLM Core Active',
    },
    {
      name: 'Security',
      icon: Shield,
      status: state.systemStatus.security,
      details: 'Biometric Lock Enabled',
    },
    {
      name: 'Memory Vault',
      icon: Database,
      status: state.systemStatus.memory,
      details: `${state.memories.length} memories stored`,
    },
    {
      name: 'Copy Engine',
      icon: Copy,
      status: state.systemStatus.copyEngine,
      details: `${state.copies.length} copies deployed`,
    },
  ];

  return (
    <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl border border-cyan-500 border-opacity-30 p-6">
      <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        System Status
      </h2>
      
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

      <div className="mt-6 pt-4 border-t border-gray-700">
        <h3 className="text-sm font-medium text-cyan-300 mb-2">Performance</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">CPU Usage</span>
            <span className="text-cyan-300">23%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Memory</span>
            <span className="text-cyan-300">1.2GB / 16GB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Network</span>
            <span className="text-green-300">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};