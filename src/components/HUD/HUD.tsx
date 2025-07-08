import React from 'react';
import { motion } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { ModeToggle } from './ModeToggle';
import { SystemPanel } from './SystemPanel';
import { CommandInterface } from './CommandInterface';
import { BrainStatus } from './BrainStatus';
import { Database, Copy, Settings, Mic, Eye, Shield, Zap, Brain } from 'lucide-react';

interface HUDProps {
  onOpenMemoryVault: () => void;
  onOpenCopyEngine: () => void;
  onOpenEvolution: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onOpenMemoryVault, onOpenCopyEngine, onOpenEvolution }) => {
  const { state, setMode } = useJarvis();

  const modeConfigs = [
    {
      id: 'full' as const,
      name: 'Full JARVIS',
      icon: Zap,
      color: 'from-green-400 to-emerald-500',
      description: 'Complete AI assistant with all capabilities',
    },
    {
      id: 'stealth-interview' as const,
      name: 'Stealth Interview',
      icon: Mic,
      color: 'from-orange-400 to-red-500',
      description: 'Invisible assistance during interviews',
    },
    {
      id: 'stealth-exam' as const,
      name: 'Stealth Exam',
      icon: Eye,
      color: 'from-red-400 to-pink-500',
      description: 'Undetectable exam assistance',
    },
    {
      id: 'passive-copilot' as const,
      name: 'Passive Copilot',
      icon: Shield,
      color: 'from-yellow-400 to-amber-500',
      description: 'Background monitoring and drafting',
    },
  ];

  return (
    <div className="relative z-10 w-full h-full pointer-events-none">
      {/* Main HUD Container */}
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center p-6 pointer-events-auto"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">J.A.R.V.I.S</h1>
            </div>
            <div className="text-cyan-300 text-sm">
              {state.currentUser}'s Digital Legacy
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenMemoryVault}
              className="p-2 rounded-lg bg-cyan-900 bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 border border-cyan-500 border-opacity-30"
              title="Memory Vault"
            >
              <Database className="w-5 h-5 text-cyan-400" />
            </button>
            <button
              onClick={onOpenCopyEngine}
              className="p-2 rounded-lg bg-cyan-900 bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 border border-cyan-500 border-opacity-30"
              title="Copy Engine"
            >
              <Copy className="w-5 h-5 text-cyan-400" />
            </button>
            <button
              onClick={onOpenEvolution}
              className="p-2 rounded-lg bg-cyan-900 bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 border border-cyan-500 border-opacity-30"
              title="Evolution Engine"
            >
              <Brain className="w-5 h-5 text-cyan-400" />
            </button>
            <button className="p-2 rounded-lg bg-cyan-900 bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 border border-cyan-500 border-opacity-30">
              <Settings className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </motion.div>

        {/* Mode Toggles */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center p-6 pointer-events-auto"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {modeConfigs.map((mode, index) => (
              <ModeToggle
                key={mode.id}
                mode={mode}
                isActive={state.mode === mode.id}
                onClick={() => setMode(mode.id)}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - System Status */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-80 p-6 pointer-events-auto"
          >
            <SystemPanel />
          </motion.div>

          {/* Center - Command Interface */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex-1 flex flex-col items-center justify-center p-6 pointer-events-auto"
          >
            <CommandInterface />
          </motion.div>

          {/* Right Panel - Brain Status */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-80 p-6 pointer-events-auto"
          >
            <BrainStatus />
          </motion.div>
        </div>
      </div>
    </div>
  );
};