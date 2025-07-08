import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ModeToggleProps {
  mode: {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    description: string;
  };
  isActive: boolean;
  onClick: () => void;
  delay: number;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, isActive, onClick, delay }) => {
  const Icon = mode.icon;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-2xl border-2 transition-all duration-300 min-w-[200px] min-h-[100px]
        ${isActive 
          ? 'border-cyan-400 bg-gradient-to-br from-cyan-900 to-blue-900 shadow-lg shadow-cyan-500/50' 
          : 'border-gray-600 bg-gray-900 bg-opacity-50 hover:border-cyan-600 hover:bg-opacity-70'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isActive 
            ? `bg-gradient-to-r ${mode.color}` 
            : 'bg-gray-700'
          }
        `}>
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-300'}`} />
        </div>
        <h3 className={`font-semibold text-sm ${isActive ? 'text-cyan-300' : 'text-gray-300'}`}>
          {mode.name}
        </h3>
        <p className={`text-xs text-center ${isActive ? 'text-cyan-200' : 'text-gray-500'}`}>
          {mode.description}
        </p>
      </div>
      
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-400 shadow-lg shadow-green-400/50"
        />
      )}
    </motion.button>
  );
};