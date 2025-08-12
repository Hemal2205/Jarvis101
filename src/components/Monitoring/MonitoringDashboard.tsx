import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Monitor,
  Users,
  TrendingUp,
  Settings,
  RefreshCw,
  Database
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

interface UserActivity {
  last_mouse_move: string | null;
  last_keyboard_input: string | null;
  active_applications: string[];
  session_duration: number;
}

interface PerformanceSummary {
  average_cpu: number;
  average_memory: number;
  average_disk: number;
  average_latency: number;
  active_alerts: number;
  session_duration: number;
  active_applications: number;
}

const MonitoringDashboard: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitoringData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/monitor/status');
      const data = await response.json();
      // Patch: backend returns { success: True, system_status: { ...all metrics... } }
      // so metrics = data.system_status
      let metrics = data.system_status;
      // If metrics is nested (i.e., metrics.system_status exists), use that
      if (metrics && metrics.system_status) {
        metrics = metrics.system_status;
      }
      setSystemStatus(metrics);
      setPerformanceAlerts(metrics.performance_alerts || []);
      setUserActivity(metrics.user_activity || null);
      setPerformanceSummary(metrics.performance_summary || null);
    } catch (error) {
      setError('Failed to fetch monitoring data');
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchMonitoringData();
  }, []);

  const startMonitoring = async () => {
    try {
      const response = await fetch('/api/monitor/start', { method: 'POST' });
      const data: { success: boolean } = await response.json();
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
      const data: { success: boolean } = await response.json();
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

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  if (!systemStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">No system data available.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl border border-cyan-500 border-opacity-30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cyan-400 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          System Monitoring
        </h2>
        <button
          onClick={fetchMonitoringData}
          disabled={loading}
          className="flex items-center px-3 py-1 rounded bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-medium transition disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Monitor className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">System Monitoring</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isMonitoring 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
          <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Cpu className="w-6 h-6 text-blue-400" />
            <span className="text-sm text-gray-400">CPU</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Usage</span>
              <span className="font-bold text-2xl">{systemStatus.cpu?.usage !== undefined ? systemStatus.cpu.usage.toFixed(1) : '--'}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStatus.cpu?.usage ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{systemStatus.cpu?.cores ?? '--'} cores</span>
              <span>{systemStatus.cpu?.temperature !== undefined ? systemStatus.cpu.temperature.toFixed(1) : '--'}°C</span>
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-6 h-6 text-green-400" />
            <span className="text-sm text-gray-400">Memory</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Usage</span>
              <span className="font-bold text-2xl">{systemStatus.memory?.usage !== undefined ? systemStatus.memory.usage.toFixed(1) : '--'}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStatus.memory?.usage ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{systemStatus.memory?.available ?? '--'}GB free</span>
              <span>{systemStatus.memory?.total ?? '--'}GB total</span>
            </div>
          </div>
        </div>

        {/* Disk */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-6 h-6 text-purple-400" />
            <span className="text-sm text-gray-400">Disk</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Usage</span>
              <span className="font-bold text-2xl">{systemStatus.disk?.usage !== undefined ? systemStatus.disk.usage.toFixed(1) : '--'}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStatus.disk?.usage ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{systemStatus.disk?.free ?? '--'}GB free</span>
              <span>{systemStatus.disk?.total ?? '--'}GB total</span>
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Wifi className="w-6 h-6 text-orange-400" />
            <span className="text-sm text-gray-400">Network</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Latency</span>
              <span className="font-bold text-2xl">{systemStatus.network?.latency !== undefined ? systemStatus.network.latency.toFixed(1) : '--'}ms</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Bandwidth</span>
              <span>{systemStatus.network?.bandwidth !== undefined ? systemStatus.network.bandwidth : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Alerts */}
      {Array.isArray(performanceAlerts) && performanceAlerts.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-semibold">Performance Alerts</h3>
            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-sm">
              {Array.isArray(performanceAlerts) ? performanceAlerts.length : 0}
            </span>
          </div>
          <div className="space-y-3">
            {performanceAlerts.slice(0, 5).map((alert, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className={getSeverityColor(alert.severity)}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  {alert.value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Activity & Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold">User Activity</h3>
          </div>
          {userActivity && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Session Duration</span>
                <span className="font-medium">{formatDuration(userActivity.session_duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Applications</span>
                <span className="font-medium">{Array.isArray(userActivity?.active_applications) ? userActivity.active_applications.length : '--'}</span>
              </div>
              <div className="space-y-2">
                <span className="text-gray-400 text-sm">Recent Applications:</span>
                <div className="space-y-1">
                  {Array.isArray(userActivity?.active_applications)
                    ? userActivity.active_applications.slice(0, 5).map((app, index) => (
                        <div key={index} className="text-sm bg-gray-700 px-3 py-1 rounded">
                          {app}
                        </div>
                      ))
                    : <div className="text-gray-500 text-sm">No recent applications</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold">Performance Summary</h3>
          </div>
          {performanceSummary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {performanceSummary.average_cpu !== undefined ? performanceSummary.average_cpu.toFixed(1) : '--'}%
                  </div>
                  <div className="text-sm text-gray-400">Avg CPU</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {performanceSummary.average_memory !== undefined ? performanceSummary.average_memory.toFixed(1) : '--'}%
                  </div>
                  <div className="text-sm text-gray-400">Avg Memory</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {performanceSummary.average_disk !== undefined ? performanceSummary.average_disk.toFixed(1) : '--'}%
                  </div>
                  <div className="text-sm text-gray-400">Avg Disk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {performanceSummary.average_latency !== undefined ? performanceSummary.average_latency.toFixed(1) : '--'}ms
                  </div>
                  <div className="text-sm text-gray-400">Avg Latency</div>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-700">
                <span className="text-gray-400">Active Alerts</span>
                <span className="font-medium">{performanceSummary.active_alerts !== undefined ? performanceSummary.active_alerts : '--'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Applications */}
      {Array.isArray(systemStatus.applications) && systemStatus.applications.length > 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-semibold">Active Applications</h3>
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
              {Array.isArray(systemStatus.applications) ? systemStatus.applications.length : '--'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {systemStatus.applications.slice(0, 9).map((app, idx) => (
              <div key={idx} className="bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-300 truncate">
                {app}
              </div>
            ))}
          </div>
          {Array.isArray(systemStatus.applications) && systemStatus.applications.length > 9 && (
            <div className="text-xs text-gray-400 mt-2">+{systemStatus.applications.length - 9} more applications</div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-gray-400 text-center">
          <Monitor className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <div>No application data available.</div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-center text-sm text-gray-400">
        Last updated: {systemStatus.last_update ? new Date(systemStatus.last_update).toLocaleString() : 'Never'}
      </div>
    </div>
  );
};

export default MonitoringDashboard; 