import React from 'react';
import { motion } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { Wifi, Battery, Clock, User, LogOut } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { state, logout } = useJarvis();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'full': return 'text-green-400';
      case 'stealth-interview': return 'text-orange-400';
      case 'stealth-exam': return 'text-red-400';
      case 'passive-copilot': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout from J.A.R.V.I.S?');
    if (confirmed) {
      logout();
      localStorage.removeItem('jarvis_session_token');
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-30 bg-gray-900 bg-opacity-80 backdrop-blur-sm border-b border-cyan-500 border-opacity-30"
    >
      <div className="flex items-center justify-between px-6 py-2">
        {/* Left Side - System Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-gray-300">System Active</span>
          </div>
          <div className="text-sm text-gray-400">|</div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Mode:</span>
            <span className={`text-sm font-medium ${getModeColor(state.mode)}`}>
              {state.mode.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Center - User Info */}
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-300">{state.currentUser}</span>
        </div>

        {/* Right Side - Status Icons */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-mono">
              {formatTime(currentTime)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-green-400" />
            <Battery className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              className="p-1 rounded hover:bg-red-800/30 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-red-400 hover:text-red-300" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};