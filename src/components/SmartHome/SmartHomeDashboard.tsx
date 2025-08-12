import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Thermometer, Lock, Unlock, Shield, Wifi, Home, X, CheckCircle, AlertTriangle, Plus, Clock } from 'lucide-react';

interface SmartDevice {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'camera' | 'sensor';
  status: 'on' | 'off' | 'locked' | 'unlocked' | 'active' | 'inactive';
  value?: number;
  location: string;
  last_updated: string;
}

interface SmartAutomation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  schedule?: string;
  devices: string[];
}

interface SmartHomeDashboardProps {
  isActive: boolean;
  onClose?: () => void;
}

export const SmartHomeDashboard: React.FC<SmartHomeDashboardProps> = ({ isActive, onClose }) => {
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [automations, setAutomations] = useState<SmartAutomation[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (isActive) {
      fetch('/api/smarthome/devices')
        .then(res => res.json())
        .then(data => setDevices(data.devices || []));
      fetch('/api/smarthome/automations')
        .then(res => res.json())
        .then(data => setAutomations(data.automations || []));
      fetch('/api/smarthome/alerts')
        .then(res => res.json())
        .then(data => setAlerts(data.alerts || []));
    }
  }, [isActive]);

  const handleToggleDevice = async (id: string) => {
    const res = await fetch(`/api/smarthome/devices/${id}/toggle`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setDevices(devices => devices.map(d => d.id === id ? data.device : d));
    }
  };
  const handleSetTemp = async (id: string, value: number) => {
    const res = await fetch(`/api/smarthome/devices/${id}/set_temp?value=${value}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setDevices(devices => devices.map(d => d.id === id ? data.device : d));
    }
  };
  const handleToggleLock = handleToggleDevice;

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-green-500/30 rounded-2xl w-full max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-500/30">
          <div className="flex items-center space-x-3">
            <Home className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-2xl font-bold text-green-400">Smart Home Dashboard</h1>
              <p className="text-gray-400 text-sm">Unified control of your smart devices and automations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="p-4 bg-green-900/60 text-green-200 text-sm flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-green-400" />
            <div>
              {alerts.map((a, i) => <div key={i}>{a}</div>)}
            </div>
          </div>
        )}
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Devices */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Devices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((d) => (
                <div key={d.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    {d.type === 'light' && <Lightbulb className="w-5 h-5 text-yellow-400" />}
                    {d.type === 'thermostat' && <Thermometer className="w-5 h-5 text-blue-400" />}
                    {d.type === 'lock' && (d.status === 'locked' ? <Lock className="w-5 h-5 text-gray-400" /> : <Unlock className="w-5 h-5 text-green-400" />)}
                    {d.type === 'camera' && <Shield className="w-5 h-5 text-purple-400" />}
                    <span className="font-bold text-white">{d.name}</span>
                  </div>
                  <div className="text-xs text-gray-400">{d.location}</div>
                  <div className="text-xs text-gray-400">Last updated: {new Date(d.last_updated).toLocaleTimeString()}</div>
                  {/* Controls */}
                  {d.type === 'light' && (
                    <button
                      onClick={() => handleToggleDevice(d.id)}
                      className={`px-3 py-1 rounded text-xs font-bold ${d.status === 'on' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'} mt-2`}
                    >
                      {d.status === 'on' ? 'Turn Off' : 'Turn On'}
                    </button>
                  )}
                  {d.type === 'thermostat' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-300">Set Temp:</span>
                      <input
                        type="number"
                        value={d.value || 20}
                        onChange={e => handleSetTemp(d.id, Number(e.target.value))}
                        className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                      <span className="text-xs text-gray-300">°C</span>
                    </div>
                  )}
                  {d.type === 'lock' && (
                    <button
                      onClick={() => handleToggleLock(d.id)}
                      className={`px-3 py-1 rounded text-xs font-bold ${d.status === 'locked' ? 'bg-gray-600 text-white' : 'bg-green-600 text-white'} mt-2`}
                    >
                      {d.status === 'locked' ? 'Unlock' : 'Lock'}
                    </button>
                  )}
                  {d.type === 'camera' && (
                    <div className="text-xs text-purple-300 mt-2">{d.status === 'active' ? 'Active' : 'Inactive'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Automations */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Automations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automations.map((a) => (
                <div key={a.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-white">{a.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{a.description}</div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${a.enabled ? 'text-green-400' : 'text-gray-400'}`}>{a.enabled ? 'Enabled' : 'Disabled'}</span>
                    <span className="text-xs text-gray-400">{a.schedule}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.devices.map(did => {
                      const d = devices.find(dev => dev.id === did);
                      return d ? <span key={did} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">{d.name}</span> : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Automation</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 