import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  Unlock, 
  Monitor, 
  Camera, 
  Mic, 
  Wifi, 
  Bluetooth,
  Smartphone,
  Laptop,
  Settings,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

interface StealthMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  category: 'privacy' | 'security' | 'monitoring';
}

interface Device {
  id: string;
  name: string;
  type: 'camera' | 'microphone' | 'wifi' | 'bluetooth' | 'screen';
  status: 'active' | 'inactive' | 'blocked';
  lastActivity: string;
}

const stealthModes: StealthMode[] = [
  {
    id: '1',
    name: 'Privacy Mode',
    description: 'Disable all cameras and microphones',
    icon: <EyeOff className="w-5 h-5" />,
    active: false,
    category: 'privacy'
  },
  {
    id: '2',
    name: 'Network Isolation',
    description: 'Block all network connections',
    icon: <Wifi className="w-5 h-5" />,
    active: false,
    category: 'security'
  },
  {
    id: '3',
    name: 'Screen Privacy',
    description: 'Enable screen privacy filters',
    icon: <Monitor className="w-5 h-5" />,
    active: false,
    category: 'privacy'
  },
  {
    id: '4',
    name: 'Device Blocking',
    description: 'Block unauthorized device connections',
    icon: <Bluetooth className="w-5 h-5" />,
    active: false,
    category: 'security'
  },
  {
    id: '5',
    name: 'Activity Monitoring',
    description: 'Monitor system for suspicious activity',
    icon: <Activity className="w-5 h-5" />,
    active: true,
    category: 'monitoring'
  },
  {
    id: '6',
    name: 'Encrypted Communication',
    description: 'Enable end-to-end encryption',
    icon: <Lock className="w-5 h-5" />,
    active: true,
    category: 'security'
  }
];

const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Built-in Webcam',
    type: 'camera',
    status: 'active',
    lastActivity: '2 minutes ago'
  },
  {
    id: '2',
    name: 'Microphone Array',
    type: 'microphone',
    status: 'active',
    lastActivity: '1 minute ago'
  },
  {
    id: '3',
    name: 'WiFi Adapter',
    type: 'wifi',
    status: 'active',
    lastActivity: '30 seconds ago'
  },
  {
    id: '4',
    name: 'Bluetooth Module',
    type: 'bluetooth',
    status: 'inactive',
    lastActivity: '5 minutes ago'
  },
  {
    id: '5',
    name: 'External Monitor',
    type: 'screen',
    status: 'active',
    lastActivity: '1 minute ago'
  }
];

export const AdvancedStealth: React.FC = () => {
  const [modes, setModes] = useState<StealthMode[]>(stealthModes);
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [stealthLevel, setStealthLevel] = useState<number>(25);
  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(false);
  const [lastScan, setLastScan] = useState<Date>(new Date());
  const [threats, setThreats] = useState<number>(0);

  useEffect(() => {
    // Simulate periodic security scan
    const interval = setInterval(() => {
      setLastScan(new Date());
      // Simulate random threat detection
      setThreats(Math.floor(Math.random() * 3));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleMode = (id: string) => {
    setModes(prev => 
      prev.map(mode => 
        mode.id === id ? { ...mode, active: !mode.active } : mode
      )
    );
  };

  const toggleDevice = (id: string) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === id 
          ? { 
              ...device, 
              status: device.status === 'active' ? 'blocked' : 'active' 
            } 
          : device
      )
    );
  };

  const activateEmergencyMode = () => {
    setIsEmergencyMode(true);
    // Activate all privacy modes
    setModes(prev => 
      prev.map(mode => 
        mode.category === 'privacy' ? { ...mode, active: true } : mode
      )
    );
    // Block all devices
    setDevices(prev => 
      prev.map(device => ({ ...device, status: 'blocked' }))
    );
    setStealthLevel(100);
  };

  const deactivateEmergencyMode = () => {
    setIsEmergencyMode(false);
    setStealthLevel(25);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'blocked': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'camera': return <Camera className="w-4 h-4" />;
      case 'microphone': return <Mic className="w-4 h-4" />;
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'bluetooth': return <Bluetooth className="w-4 h-4" />;
      case 'screen': return <Monitor className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  const getStealthLevelColor = (level: number) => {
    if (level < 30) return 'text-green-400';
    if (level < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const activeModes = modes.filter(mode => mode.active).length;
  const blockedDevices = devices.filter(device => device.status === 'blocked').length;

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
            <Shield className="w-8 h-8 mr-3" />
            Advanced Stealth
          </h2>
          <p className="text-cyan-200 text-lg">Privacy and security management system</p>
        </div>

        {/* Emergency Mode */}
        {isEmergencyMode && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-900/50 border border-red-500/50 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-300">Emergency Mode Active</h3>
                  <p className="text-red-200 text-sm">All privacy features enabled, devices blocked</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deactivateEmergencyMode}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Deactivate
              </motion.button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Stealth Modes */}
          <div className="space-y-6">
            {/* Stealth Level */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Stealth Level
                </h3>
                <span className={`text-2xl font-bold ${getStealthLevelColor(stealthLevel)}`}>
                  {stealthLevel}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stealthLevel}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-cyan-400">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Stealth Modes */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4">Stealth Modes</h3>
              <div className="space-y-3">
                {modes.map((mode) => (
                  <motion.div
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      mode.active 
                        ? 'border-cyan-400 bg-cyan-900/20' 
                        : 'border-cyan-500/20 bg-gray-800/50 hover:border-cyan-400/40'
                    }`}
                    onClick={() => toggleMode(mode.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          mode.active ? 'bg-cyan-600' : 'bg-gray-700'
                        }`}>
                          {mode.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-cyan-100">{mode.name}</h4>
                          <p className="text-sm text-cyan-400">{mode.description}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        mode.active ? 'bg-cyan-400' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Emergency Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={activateEmergencyMode}
              disabled={isEmergencyMode}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-2xl transition-all disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>EMERGENCY PRIVACY MODE</span>
              </div>
            </motion.button>
          </div>

          {/* Right Panel - Device Control & Monitoring */}
          <div className="space-y-6">
            {/* Security Status */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4">Security Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-300">{activeModes}</div>
                  <div className="text-sm text-cyan-400">Active Modes</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-300">{blockedDevices}</div>
                  <div className="text-sm text-cyan-400">Blocked Devices</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">{threats}</div>
                  <div className="text-sm text-cyan-400">Threats Detected</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {new Date().toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-cyan-400">Last Scan</div>
                </div>
              </div>
            </div>

            {/* Device Control */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4">Device Control</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {devices.map((device) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        device.status === 'active' ? 'bg-green-600' :
                        device.status === 'blocked' ? 'bg-red-600' : 'bg-gray-600'
                      }`}>
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <div className="text-cyan-100 text-sm font-medium">{device.name}</div>
                        <div className="text-cyan-400 text-xs">{device.lastActivity}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleDevice(device.id)}
                        className={`p-1 rounded ${
                          device.status === 'active' 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-green-400 hover:text-green-300'
                        } transition`}
                        title={device.status === 'active' ? 'Block device' : 'Allow device'}
                      >
                        {device.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4">Recent Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-cyan-300">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>Privacy mode activated</span>
                  <span className="text-cyan-400 text-xs">2m ago</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-300">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  <span>Unauthorized access attempt blocked</span>
                  <span className="text-cyan-400 text-xs">5m ago</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-300">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>Security scan completed</span>
                  <span className="text-cyan-400 text-xs">10m ago</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-300">
                  <Activity className="w-3 h-3 text-blue-400" />
                  <span>Network traffic encrypted</span>
                  <span className="text-cyan-400 text-xs">15m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 