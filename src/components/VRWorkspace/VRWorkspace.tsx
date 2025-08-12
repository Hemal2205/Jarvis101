import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  Minimize,
  Headphones,
  Hand,
  Globe,
  Monitor,
  Zap,
  BarChart3,
  Clock,
  User,
  MessageSquare,
  Share2,
  Download,
  Upload
} from 'lucide-react';

interface VREnvironment {
  id: string;
  name: string;
  description: string;
  type: 'workspace' | 'meeting' | 'gaming' | 'training' | 'social';
  users: number;
  status: 'active' | 'inactive' | 'maintenance';
  lastAccessed: string;
}

interface VRControl {
  id: string;
  name: string;
  type: 'movement' | 'interaction' | 'display' | 'audio';
  value: number;
  min: number;
  max: number;
  unit: string;
}

interface VRUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  currentEnvironment: string;
  lastActivity: string;
}

const VRWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('environments');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const [isVRActive, setIsVRActive] = useState(false);
  const [vrControls, setVrControls] = useState<VRControl[]>([
    { id: '1', name: 'Movement Speed', type: 'movement', value: 75, min: 0, max: 100, unit: '%' },
    { id: '2', name: 'Interaction Sensitivity', type: 'interaction', value: 60, min: 0, max: 100, unit: '%' },
    { id: '3', name: 'Display Resolution', type: 'display', value: 90, min: 50, max: 100, unit: '%' },
    { id: '4', name: 'Audio Volume', type: 'audio', value: 80, min: 0, max: 100, unit: '%' },
    { id: '5', name: 'Field of View', type: 'display', value: 110, min: 60, max: 180, unit: '°' },
    { id: '6', name: 'Haptic Feedback', type: 'interaction', value: 70, min: 0, max: 100, unit: '%' }
  ]);
  const [vrUsers, setVrUsers] = useState<VRUser[]>([
    { id: '1', name: 'Tony Stark', avatar: 'TS', status: 'online', currentEnvironment: 'Tech Lab', lastActivity: '2 min ago' },
    { id: '2', name: 'Pepper Potts', avatar: 'PP', status: 'away', currentEnvironment: 'Conference Room', lastActivity: '15 min ago' },
    { id: '3', name: 'Bruce Banner', avatar: 'BB', status: 'online', currentEnvironment: 'Research Lab', lastActivity: '1 min ago' },
    { id: '4', name: 'Natasha Romanoff', avatar: 'NR', status: 'busy', currentEnvironment: 'Training Arena', lastActivity: '5 min ago' }
  ]);

  const environments: VREnvironment[] = [
    { id: '1', name: 'Tech Lab', description: 'Advanced research and development workspace', type: 'workspace', users: 3, status: 'active', lastAccessed: '2 min ago' },
    { id: '2', name: 'Conference Room', description: 'Virtual meeting and presentation space', type: 'meeting', users: 2, status: 'active', lastAccessed: '15 min ago' },
    { id: '3', name: 'Training Arena', description: 'Combat and skill training environment', type: 'training', users: 1, status: 'active', lastAccessed: '5 min ago' },
    { id: '4', name: 'Social Hub', description: 'Casual interaction and networking space', type: 'social', users: 0, status: 'inactive', lastAccessed: '1 hour ago' },
    { id: '5', name: 'Gaming Zone', description: 'Entertainment and gaming environment', type: 'gaming', users: 0, status: 'maintenance', lastAccessed: '3 hours ago' }
  ];

  const handleControlChange = (controlId: string, value: number) => {
    setVrControls(prev => 
      prev.map(control => 
        control.id === controlId ? { ...control, value } : control
      )
    );
  };

  const toggleVR = () => {
    setIsVRActive(!isVRActive);
  };

  const resetControls = () => {
    setVrControls(prev => 
      prev.map(control => ({ ...control, value: 75 }))
    );
  };

  const joinEnvironment = (environmentId: string) => {
    setSelectedEnvironment(environmentId);
    setIsVRActive(true);
  };

  return (
    <div className="h-full bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Eye className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">VR Workspace</h2>
            <p className="text-cyan-400/60 text-sm">Virtual Reality Environment Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVR}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isVRActive 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {isVRActive ? (
              <>
                <Pause className="w-4 h-4 inline mr-2" />
                Exit VR
              </>
            ) : (
              <>
                <Play className="w-4 h-4 inline mr-2" />
                Enter VR
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">VR Status</span>
            <div className={`w-2 h-2 rounded-full ${isVRActive ? 'bg-green-400' : 'bg-gray-500'}`}></div>
          </div>
          <p className="text-white font-medium">{isVRActive ? 'Active' : 'Inactive'}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Active Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{vrUsers.filter(u => u.status === 'online').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Environments</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{environments.filter(e => e.status === 'active').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Performance</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">98%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'environments', label: 'Environments', icon: Globe },
          { id: 'controls', label: 'Controls', icon: Settings },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-black/20 text-gray-400 border border-gray-600/20 hover:border-cyan-500/30'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'environments' && (
            <motion.div
              key="environments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {environments.map((env) => (
                  <motion.div
                    key={env.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedEnvironment === env.id
                        ? 'bg-cyan-500/10 border-cyan-500/50'
                        : 'bg-black/30 border-cyan-500/20 hover:border-cyan-500/40'
                    }`}
                    onClick={() => setSelectedEnvironment(env.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{env.name}</h3>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        env.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        env.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {env.status}
                      </div>
                    </div>
                    <p className="text-cyan-400/60 text-sm mb-3">{env.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-400/60">
                        <Users className="w-3 h-3 inline mr-1" />
                        {env.users} users
                      </span>
                      <span className="text-gray-400">Last: {env.lastAccessed}</span>
                    </div>
                    {selectedEnvironment === env.id && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => joinEnvironment(env.id)}
                        className="w-full mt-3 px-3 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all"
                      >
                        Join Environment
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'controls' && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">VR Controls</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetControls}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-500/20 text-gray-300 border border-gray-600/30 rounded-lg hover:bg-gray-500/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vrControls.map((control) => (
                  <div key={control.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">{control.name}</span>
                      <span className="text-cyan-400 font-mono">{control.value}{control.unit}</span>
                    </div>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      value={control.value}
                      onChange={(e) => handleControlChange(control.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{control.min}{control.unit}</span>
                      <span>{control.max}{control.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vrUsers.map((user) => (
                  <div key={user.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                        <span className="text-cyan-400 font-medium">{user.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-medium">{user.name}</h3>
                          <div className={`w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-400' :
                            user.status === 'away' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}></div>
                        </div>
                        <p className="text-cyan-400/60 text-sm">{user.currentEnvironment}</p>
                        <p className="text-gray-400 text-xs">Last activity: {user.lastActivity}</p>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                        >
                          <User className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Session Time</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">2h 34m</p>
                  <p className="text-cyan-400/60 text-sm">Today's total</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Collaborations</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">12</p>
                  <p className="text-cyan-400/60 text-sm">This week</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Environments</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">5</p>
                  <p className="text-cyan-400/60 text-sm">Active</p>
                </div>
              </div>
              
              <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">Usage Analytics</h3>
                <div className="space-y-3">
                  {environments.map((env) => (
                    <div key={env.id} className="flex items-center justify-between">
                      <span className="text-cyan-400/60">{env.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-cyan-400 h-2 rounded-full transition-all"
                            style={{ width: `${(env.users / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm">{env.users}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0ea5e9;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0ea5e9;
        }
      `}</style>
    </div>
  );
};

export default VRWorkspace; 