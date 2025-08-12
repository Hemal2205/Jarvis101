import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Monitor,
  TrendingUp,
} from 'lucide-react';

interface SystemStatus {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
  };
  memory: {
    usage: number;
    available: number;
    total: number;
  };
  disk: {
    usage: number;
    free: number;
    total: number;
  };
  network: {
    latency: number;
    bandwidth: number;
  };
  applications: string[];
  active_window: string | null;
  last_update: string;
}

interface PerformanceAlert {
  type: string;
  severity: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
  value: number;
}

const MonitoringPanel: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch('/api/monitor/status');
      const data = await response.json();
      
      if (data.success) {
        setSystemStatus(data.system_status);
        setPerformanceAlerts(data.performance_alerts);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  };

  const startMonitoring = async () => {
    try {
      const response = await fetch('/api/monitor/start', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setIsMonitoring(true);
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
    }
  };

  const stopMonitoring = async () => {
    try {
      const response = await fetch('/api/monitor/stop', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setIsMonitoring(false);
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <CheckCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (!systemStatus) {
    return (
      <div className="text-center p-4">
        <Activity className="w-8 h-8 mx-auto mb-2 text-cyan-400 animate-pulse" />
        <p className="text-cyan-200">Loading monitoring data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-cyan-300">System Monitor</h3>
        </div>
        <button
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isMonitoring 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isMonitoring ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* CPU */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">CPU</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">
              {systemStatus.cpu.usage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${systemStatus.cpu.usage}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {systemStatus.cpu.cores} cores | {systemStatus.cpu.temperature.toFixed(1)}°C
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Memory</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">
              {systemStatus.memory.usage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${systemStatus.memory.usage}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {systemStatus.memory.available}GB free
            </div>
          </div>
        </div>

        {/* Disk */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Disk</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">
              {systemStatus.disk.usage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
              <div 
                className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${systemStatus.disk.usage}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {systemStatus.disk.free}GB free
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Wifi className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">Network</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-400">
              {systemStatus.network.latency.toFixed(1)}ms
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Latency
            </div>
          </div>
        </div>
      </div>

      {/* Performance Alerts */}
      {performanceAlerts.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-cyan-200">Alerts</span>
            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
              {performanceAlerts.length}
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {performanceAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-700/50 rounded text-xs">
                <div className={getSeverityColor(alert.severity)}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <span className="text-gray-300 flex-1">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Applications */}
      {systemStatus.applications.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-cyan-200">Active Apps</span>
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
              {systemStatus.applications.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
            {systemStatus.applications.slice(0, 6).map((app, index) => (
              <div key={index} className="bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-300 truncate">
                {app}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-center text-xs text-gray-400">
        Last update: {systemStatus.last_update ? new Date(systemStatus.last_update).toLocaleTimeString() : 'Never'}
      </div>
    </motion.div>
  );
};

export default MonitoringPanel; 