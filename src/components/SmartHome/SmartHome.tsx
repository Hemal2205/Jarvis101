import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Lightbulb, 
  Thermometer, 
  Lock, 
  Camera, 
  Speaker, 
  Tv, 
  Wifi,
  Settings,
  Plus,
  Power,
  PowerOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Sun,
  Moon,
  Cloud,
  Droplets
} from 'lucide-react';

interface SmartDevice {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'camera' | 'speaker' | 'tv' | 'sensor';
  status: 'online' | 'offline' | 'error';
  isOn: boolean;
  room: string;
  lastSeen: Date;
  battery?: number;
  temperature?: number;
  humidity?: number;
  brightness?: number;
  volume?: number;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'active' | 'inactive' | 'error';
  lastTriggered: Date;
  devices: string[];
}

const mockDevices: SmartDevice[] = [
  {
    id: '1',
    name: 'Living Room Light',
    type: 'light',
    status: 'online',
    isOn: true,
    room: 'Living Room',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    brightness: 75
  },
  {
    id: '2',
    name: 'Kitchen Light',
    type: 'light',
    status: 'online',
    isOn: false,
    room: 'Kitchen',
    lastSeen: new Date(Date.now() - 1 * 60 * 1000),
    brightness: 0
  },
  {
    id: '3',
    name: 'Smart Thermostat',
    type: 'thermostat',
    status: 'online',
    isOn: true,
    room: 'Living Room',
    lastSeen: new Date(Date.now() - 30 * 1000),
    temperature: 72,
    humidity: 45
  },
  {
    id: '4',
    name: 'Front Door Lock',
    type: 'lock',
    status: 'online',
    isOn: true,
    room: 'Entrance',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    battery: 85
  },
  {
    id: '5',
    name: 'Security Camera',
    type: 'camera',
    status: 'online',
    isOn: true,
    room: 'Front Yard',
    lastSeen: new Date(Date.now() - 10 * 1000),
    battery: 92
  },
  {
    id: '6',
    name: 'Smart Speaker',
    type: 'speaker',
    status: 'online',
    isOn: true,
    room: 'Living Room',
    lastSeen: new Date(Date.now() - 1 * 60 * 1000),
    volume: 30
  },
  {
    id: '7',
    name: 'Smart TV',
    type: 'tv',
    status: 'offline',
    isOn: false,
    room: 'Living Room',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '8',
    name: 'Motion Sensor',
    type: 'sensor',
    status: 'online',
    isOn: true,
    room: 'Hallway',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    battery: 78
  }
];

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Good Morning',
    description: 'Turn on lights and adjust thermostat when waking up',
    trigger: 'Time: 7:00 AM',
    action: 'Lights ON, Thermostat: 72°F',
    status: 'active',
    lastTriggered: new Date(Date.now() - 8 * 60 * 60 * 1000),
    devices: ['1', '3']
  },
  {
    id: '2',
    name: 'Good Night',
    description: 'Turn off lights and lock doors at bedtime',
    trigger: 'Time: 11:00 PM',
    action: 'Lights OFF, Lock doors',
    status: 'active',
    lastTriggered: new Date(Date.now() - 12 * 60 * 60 * 1000),
    devices: ['1', '2', '4']
  },
  {
    id: '3',
    name: 'Security Mode',
    description: 'Activate security when leaving home',
    trigger: 'Motion detected + No phone nearby',
    action: 'Camera ON, Lights ON, Alert',
    status: 'active',
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    devices: ['5', '1', '8']
  },
  {
    id: '4',
    name: 'Energy Saving',
    description: 'Reduce energy usage during peak hours',
    trigger: 'Time: 2:00 PM - 6:00 PM',
    action: 'Lights dim, Thermostat: 75°F',
    status: 'inactive',
    lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000),
    devices: ['1', '2', '3']
  }
];

export const SmartHome: React.FC = () => {
  const [devices, setDevices] = useState<SmartDevice[]>(mockDevices);
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showAddAutomation, setShowAddAutomation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = (id: string) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === id ? { ...device, isOn: !device.isOn } : device
      )
    );
  };

  const updateDeviceSetting = (id: string, setting: string, value: number) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === id ? { ...device, [setting]: value } : device
      )
    );
  };

  const toggleAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { 
          ...auto, 
          status: auto.status === 'active' ? 'inactive' : 'active' 
        } : auto
      )
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'light': return <Lightbulb className="w-5 h-5" />;
      case 'thermostat': return <Thermometer className="w-5 h-5" />;
      case 'lock': return <Lock className="w-5 h-5" />;
      case 'camera': return <Camera className="w-5 h-5" />;
      case 'speaker': return <Speaker className="w-5 h-5" />;
      case 'tv': return <Tv className="w-5 h-5" />;
      case 'sensor': return <Activity className="w-5 h-5" />;
      default: return <Home className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'offline': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getAutomationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getBatteryColor = (level: number) => {
    if (level > 80) return 'text-green-400';
    if (level > 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const activeDevices = devices.filter(d => d.isOn).length;
  const activeAutomations = automations.filter(a => a.status === 'active').length;
  const rooms = [...new Set(devices.map(d => d.room))];

  const filteredDevices = selectedRoom === 'all' 
    ? devices 
    : devices.filter(d => d.room === selectedRoom);

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
            <Home className="w-8 h-8 mr-3" />
            Smart Home
          </h2>
          <p className="text-cyan-200 text-lg">IoT device management and home automation</p>
        </div>

        {/* Current Time and Weather */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-cyan-300 mb-2">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-sm text-cyan-400">Current Time</div>
            <Clock className="w-6 h-6 text-cyan-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">72°F</div>
            <div className="text-sm text-cyan-400">Indoor Temperature</div>
            <Thermometer className="w-6 h-6 text-blue-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">45%</div>
            <div className="text-sm text-cyan-400">Humidity</div>
            <Droplets className="w-6 h-6 text-purple-400 mx-auto mt-2" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{onlineDevices}</div>
            <div className="text-sm text-cyan-400">Online Devices</div>
            <Wifi className="w-6 h-6 text-green-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{activeDevices}</div>
            <div className="text-sm text-cyan-400">Active Devices</div>
            <Power className="w-6 h-6 text-blue-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{activeAutomations}</div>
            <div className="text-sm text-cyan-400">Active Automations</div>
            <Zap className="w-6 h-6 text-purple-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{rooms.length}</div>
            <div className="text-sm text-cyan-400">Connected Rooms</div>
            <Home className="w-6 h-6 text-cyan-400 mx-auto mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Devices */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Smart Devices
                </h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="px-3 py-1 bg-gray-800 text-cyan-100 border border-cyan-500/20 rounded focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="all">All Rooms</option>
                    {rooms.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddDevice(!showAddDevice)}
                    className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredDevices.map((device) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          device.isOn ? 'bg-cyan-600' : 'bg-gray-700'
                        }`}>
                          {getDeviceIcon(device.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-cyan-100">{device.name}</h4>
                          <p className="text-sm text-cyan-400">{device.room}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={getStatusColor(device.status)}>
                          {getStatusIcon(device.status)}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleDevice(device.id)}
                          className={`p-2 rounded-lg transition ${
                            device.isOn 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                        >
                          {device.isOn ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {device.temperature && (
                        <div>
                          <span className="text-cyan-400">Temperature:</span>
                          <div className="text-cyan-200">{device.temperature}°F</div>
                        </div>
                      )}
                      {device.humidity && (
                        <div>
                          <span className="text-cyan-400">Humidity:</span>
                          <div className="text-cyan-200">{device.humidity}%</div>
                        </div>
                      )}
                      {device.brightness !== undefined && (
                        <div>
                          <span className="text-cyan-400">Brightness:</span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={device.brightness}
                              onChange={(e) => updateDeviceSetting(device.id, 'brightness', parseInt(e.target.value))}
                              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-cyan-200 min-w-[2rem]">{device.brightness}%</span>
                          </div>
                        </div>
                      )}
                      {device.volume !== undefined && (
                        <div>
                          <span className="text-cyan-400">Volume:</span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={device.volume}
                              onChange={(e) => updateDeviceSetting(device.id, 'volume', parseInt(e.target.value))}
                              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-cyan-200 min-w-[2rem]">{device.volume}%</span>
                          </div>
                        </div>
                      )}
                      {device.battery && (
                        <div>
                          <span className="text-cyan-400">Battery:</span>
                          <div className={`${getBatteryColor(device.battery)}`}>{device.battery}%</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-cyan-500 mt-2">
                      Last seen: {formatTimeAgo(device.lastSeen)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Automations */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Automations
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddAutomation(!showAddAutomation)}
                  className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {automations.map((automation) => (
                  <motion.div
                    key={automation.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-cyan-100">{automation.name}</h4>
                          <div className={getAutomationStatusColor(automation.status)}>
                            <div className={`w-2 h-2 rounded-full ${
                              automation.status === 'active' ? 'bg-green-400' :
                              automation.status === 'inactive' ? 'bg-gray-400' : 'bg-red-400'
                            }`}></div>
                          </div>
                        </div>
                        <p className="text-sm text-cyan-400">{automation.description}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleAutomation(automation.id)}
                        className={`p-2 rounded-lg transition ${
                          automation.status === 'active' 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {automation.status === 'active' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                      </motion.button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-cyan-400">Trigger:</span>
                        <div className="text-cyan-200">{automation.trigger}</div>
                      </div>
                      <div>
                        <span className="text-cyan-400">Action:</span>
                        <div className="text-cyan-200">{automation.action}</div>
                      </div>
                      <div>
                        <span className="text-cyan-400">Devices:</span>
                        <div className="text-cyan-200">{automation.devices.length} devices</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-cyan-500 mt-2">
                      Last triggered: {formatTimeAgo(automation.lastTriggered)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Front Door</span>
                  <span className="text-green-400 font-medium">Locked</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Security Camera</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Motion Sensors</span>
                  <span className="text-green-400 font-medium">Armed</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Alarm System</span>
                  <span className="text-green-400 font-medium">Ready</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-200 font-medium">All Systems Secure</span>
                </div>
                <p className="text-sm text-cyan-300">
                  No security alerts. All devices are functioning normally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 