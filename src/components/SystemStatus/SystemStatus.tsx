import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  Network, 
  Wifi, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Zap
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    upload: number;
    download: number;
    connections: number;
  };
  system: {
    uptime: string;
    load: number;
    processes: number;
  };
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  responseTime: number;
  lastCheck: string;
}

export const SystemStatus: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [serviceError, setServiceError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemMetrics();
    fetchServiceStatus();
    const interval = setInterval(() => {
      fetchSystemMetrics();
      fetchServiceStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('/api/monitor/status');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceStatus = async () => {
    try {
      setServiceError(null);
      const response = await fetch('/api/services/status');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        setServices([]);
        setServiceError('Failed to fetch service status');
      }
    } catch (error) {
      setServices([]);
      setServiceError('Failed to fetch service status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'offline': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-400';
    if (percentage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-cyan-200 mt-4">Loading system status...</p>
        </div>
      </div>
    );
  }

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
            <Activity className="w-8 h-8 mr-3" />
            System Status
          </h2>
          <p className="text-cyan-200 text-lg">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Metrics */}
            <div className="space-y-6">
              {/* CPU */}
              <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                    <Cpu className="w-5 h-5 mr-2" />
                    CPU Usage
                  </h3>
                  <span className={`text-lg font-bold ${getUsageColor(metrics.cpu.usage)}`}>
                    {metrics.cpu.usage}%
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Temperature</span>
                    <span className="text-cyan-200 flex items-center">
                      <Thermometer className="w-4 h-4 mr-1" />
                      {metrics.cpu.temperature}°C
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Cores</span>
                    <span className="text-cyan-200">{metrics.cpu.cores}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.cpu.usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Memory */}
              <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Memory Usage
                  </h3>
                  <span className={`text-lg font-bold ${getUsageColor(metrics.memory.percentage)}`}>
                    {metrics.memory.percentage}%
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Used</span>
                    <span className="text-cyan-200">{metrics.memory.used} GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Total</span>
                    <span className="text-cyan-200">{metrics.memory.total} GB</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.memory.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Disk */}
              <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                    <HardDrive className="w-5 h-5 mr-2" />
                    Disk Usage
                  </h3>
                  <span className={`text-lg font-bold ${getUsageColor(metrics.disk.percentage)}`}>
                    {metrics.disk.percentage}%
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Used</span>
                    <span className="text-cyan-200">{formatBytes(metrics.disk.used * 1024 * 1024 * 1024)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Total</span>
                    <span className="text-cyan-200">{formatBytes(metrics.disk.total * 1024 * 1024 * 1024)}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.disk.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Network & Services */}
            <div className="space-y-6">
              {/* Network */}
              <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                  <Network className="w-5 h-5 mr-2" />
                  Network Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Upload</span>
                    <span className="text-cyan-200 flex items-center">
                      <Wifi className="w-4 h-4 mr-1" />
                      {metrics.network.upload} MB/s
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Download</span>
                    <span className="text-cyan-200 flex items-center">
                      <Wifi className="w-4 h-4 mr-1" />
                      {metrics.network.download} MB/s
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Connections</span>
                    <span className="text-cyan-200">{metrics.network.connections}</span>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  System Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Uptime</span>
                    <span className="text-cyan-200">{metrics.system.uptime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Load Average</span>
                    <span className="text-cyan-200">{metrics.system.load}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Processes</span>
                    <span className="text-cyan-200">{metrics.system.processes}</span>
                  </div>
                </div>
              </div>

              {/* Service Status */}
              <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Service Status
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {serviceError && (
                    <div className="text-red-400 text-sm">{serviceError}</div>
                  )}
                  {services.length === 0 && !serviceError && (
                    <div className="text-gray-400 text-sm">No services found.</div>
                  )}
                  {services.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={getStatusColor(service.status)}>
                          {getStatusIcon(service.status)}
                        </div>
                        <div>
                          <div className="text-cyan-100 text-sm font-medium">{service.name}</div>
                          <div className="text-cyan-400 text-xs">{service.lastCheck}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStatusColor(service.status)}`}>{service.status}</div>
                        {service.responseTime > 0 && (
                          <div className="text-cyan-400 text-xs">{service.responseTime}ms</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}; 