import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Droplets, 
  Sun, 
  Moon, 
  Thermometer, 
  Volume2, 
  Eye,
  Clock,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Edit3,
  Trash2,
  Users,
  Globe,
  Smartphone,
  Watch,
  Headphones,
  Zap,
  Coffee,
  Utensils,
  Bed,
  Walk,
  Dumbbell,
  Brain,
  Target,
  Calendar,
  MapPin,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

// Health Metrics
type HealthMetric = 'heart_rate' | 'steps' | 'sleep' | 'hydration' | 'calories' | 'stress' | 'mood';

// Environmental Metrics
type EnvironmentalMetric = 'air_quality' | 'temperature' | 'humidity' | 'noise_level' | 'light_level' | 'co2_level';

// Device Types
type DeviceType = 'smartwatch' | 'fitness_tracker' | 'smart_scale' | 'air_monitor' | 'smart_light' | 'noise_monitor';

// Health Status
type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

// Reminder Types
type ReminderType = 'hydration' | 'posture' | 'break' | 'medication' | 'exercise' | 'sleep' | 'meal';

// Health Data Interface
interface HealthData {
  id: string;
  metric: HealthMetric;
  value: number;
  unit: string;
  timestamp: string;
  status: HealthStatus;
  target_range: { min: number; max: number };
  trend: 'up' | 'down' | 'stable';
  notes?: string;
}

// Environmental Data Interface
interface EnvironmentalData {
  id: string;
  metric: EnvironmentalMetric;
  value: number;
  unit: string;
  timestamp: string;
  status: HealthStatus;
  target_range: { min: number; max: number };
  location: string;
  recommendations: string[];
}

// Health Reminder
interface HealthReminder {
  id: string;
  type: ReminderType;
  title: string;
  description: string;
  frequency: 'daily' | 'hourly' | 'custom';
  time: string;
  enabled: boolean;
  last_triggered?: string;
  next_trigger?: string;
  completed_today: boolean;
}

// Wearable Device
interface WearableDevice {
  id: string;
  name: string;
  type: DeviceType;
  brand: string;
  model: string;
  connected: boolean;
  battery_level: number;
  last_sync: string;
  capabilities: string[];
  data_sources: HealthMetric[];
}

// Wellness Analytics
interface WellnessAnalytics {
  overall_health_score: number;
  daily_goals: {
    steps: { target: number; current: number; percentage: number };
    hydration: { target: number; current: number; percentage: number };
    sleep: { target: number; current: number; percentage: number };
    exercise: { target: number; current: number; percentage: number };
  };
  weekly_trends: {
    heart_rate: number[];
    sleep_quality: number[];
    stress_level: number[];
    activity_level: number[];
  };
  environmental_impact: {
    air_quality_score: number;
    noise_exposure: number;
    light_exposure: number;
    recommendations: string[];
  };
  health_insights: {
    sleep_pattern: string;
    stress_triggers: string[];
    productivity_correlation: number;
    recommendations: string[];
  };
}

interface EnvironmentalHealthSuiteProps {
  isActive: boolean;
  onClose?: () => void;
}

export const EnvironmentalHealthSuite: React.FC<EnvironmentalHealthSuiteProps> = ({ 
  isActive, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'environment' | 'devices' | 'reminders' | 'analytics'>('overview');
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData[]>([]);
  const [reminders, setReminders] = useState<HealthReminder[]>([]);
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [analytics, setAnalytics] = useState<WellnessAnalytics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<HealthReminder | null>(null);
  const { notify } = useNotification();

  // New reminder form
  const [newReminder, setNewReminder] = useState({
    type: 'hydration' as ReminderType,
    title: '',
    description: '',
    frequency: 'daily' as const,
    time: '09:00',
    enabled: true
  });

  useEffect(() => {
    if (isActive) {
      loadHealthData();
      loadEnvironmentalData();
      loadReminders();
      loadDevices();
      loadAnalytics();
      startMonitoring();
    }
  }, [isActive]);

  const loadHealthData = async () => {
    try {
      const response = await fetch('/api/health/data');
      const data = await response.json();
      if (data.success) {
        setHealthData(data.health_data || []);
      }
    } catch (error) {
      console.error('Failed to load health data:', error);
    }
  };

  const loadEnvironmentalData = async () => {
    try {
      const response = await fetch('/api/health/environmental');
      const data = await response.json();
      if (data.success) {
        setEnvironmentalData(data.environmental_data || []);
      }
    } catch (error) {
      console.error('Failed to load environmental data:', error);
    }
  };

  const loadReminders = async () => {
    try {
      const response = await fetch('/api/health/reminders');
      const data = await response.json();
      if (data.success) {
        setReminders(data.reminders || []);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const loadDevices = async () => {
    try {
      const response = await fetch('/api/health/devices');
      const data = await response.json();
      if (data.success) {
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/health/analytics');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const startMonitoring = async () => {
    try {
      const response = await fetch('/api/health/monitoring/start', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setIsMonitoring(true);
        notify('Health monitoring started', 'success');
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const stopMonitoring = async () => {
    try {
      const response = await fetch('/api/health/monitoring/stop', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setIsMonitoring(false);
        notify('Health monitoring stopped', 'info');
      }
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const createReminder = async () => {
    if (!newReminder.title.trim()) return;

    try {
      const response = await fetch('/api/health/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReminder)
      });

      const data = await response.json();
      if (data.success) {
        notify('Reminder created successfully!', 'success');
        setNewReminder({
          type: 'hydration',
          title: '',
          description: '',
          frequency: 'daily',
          time: '09:00',
          enabled: true
        });
        await loadReminders();
      }
    } catch (error) {
      console.error('Failed to create reminder:', error);
      notify('Failed to create reminder', 'error');
    }
  };

  const toggleReminder = async (reminderId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/health/reminders/${reminderId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      const data = await response.json();
      if (data.success) {
        notify(`Reminder ${enabled ? 'enabled' : 'disabled'}`, 'success');
        await loadReminders();
      }
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
      notify('Failed to toggle reminder', 'error');
    }
  };

  const completeReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/health/reminders/${reminderId}/complete`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        notify('Reminder completed!', 'success');
        await loadReminders();
        await loadAnalytics();
      }
    } catch (error) {
      console.error('Failed to complete reminder:', error);
      notify('Failed to complete reminder', 'error');
    }
  };

  const getMetricIcon = (metric: HealthMetric | EnvironmentalMetric) => {
    switch (metric) {
      case 'heart_rate': return Heart;
      case 'steps': return Walk;
      case 'sleep': return Bed;
      case 'hydration': return Droplets;
      case 'calories': return Activity;
      case 'stress': return Brain;
      case 'mood': return Target;
      case 'air_quality': return Globe;
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'noise_level': return Volume2;
      case 'light_level': return Sun;
      case 'co2_level': return AlertTriangle;
      default: return Activity;
    }
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-500/10';
      case 'good': return 'text-blue-400 bg-blue-500/10';
      case 'fair': return 'text-yellow-400 bg-yellow-500/10';
      case 'poor': return 'text-orange-400 bg-orange-500/10';
      case 'critical': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getReminderIcon = (type: ReminderType) => {
    switch (type) {
      case 'hydration': return Droplets;
      case 'posture': return Users;
      case 'break': return Coffee;
      case 'medication': return Activity;
      case 'exercise': return Dumbbell;
      case 'sleep': return Bed;
      case 'meal': return Utensils;
      default: return Bell;
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'smartwatch': return Watch;
      case 'fitness_tracker': return Activity;
      case 'smart_scale': return Target;
      case 'air_monitor': return Globe;
      case 'smart_light': return Sun;
      case 'noise_monitor': return Volume2;
      default: return Smartphone;
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border border-cyan-500/30 rounded-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Environmental & Health Suite</h1>
              <p className="text-gray-400 text-sm">Real-time health monitoring and environmental awareness</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-4 bg-gray-800/50">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'health', label: 'Health', icon: Heart },
            { id: 'environment', label: 'Environment', icon: Globe },
            { id: 'devices', label: 'Devices', icon: Smartphone },
            { id: 'reminders', label: 'Reminders', icon: Bell },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-6"
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Health Score */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Overall Health Score</h3>
                    <div className="text-center">
                      <div className="text-6xl font-bold text-white mb-2">
                        {analytics?.overall_health_score || 85}
                      </div>
                      <div className="text-gray-400">Excellent Health</div>
                    </div>
                  </div>

                  {/* Daily Goals */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Walk className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400">Steps</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {analytics?.daily_goals.steps.current || 0}
                      </div>
                      <div className="text-sm text-gray-400">
                        {analytics?.daily_goals.steps.percentage || 0}% of goal
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-400">Hydration</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {analytics?.daily_goals.hydration.current || 0}L
                      </div>
                      <div className="text-sm text-gray-400">
                        {analytics?.daily_goals.hydration.percentage || 0}% of goal
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Bed className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-400">Sleep</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {analytics?.daily_goals.sleep.current || 0}h
                      </div>
                      <div className="text-sm text-gray-400">
                        {analytics?.daily_goals.sleep.percentage || 0}% of goal
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Dumbbell className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-400">Exercise</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {analytics?.daily_goals.exercise.current || 0}min
                      </div>
                      <div className="text-sm text-gray-400">
                        {analytics?.daily_goals.exercise.percentage || 0}% of goal
                      </div>
                    </div>
                  </div>

                  {/* Environmental Impact */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Environmental Impact</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {analytics?.environmental_impact.air_quality_score || 85}
                        </div>
                        <div className="text-sm text-gray-400">Air Quality</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {analytics?.environmental_impact.noise_exposure || 45}dB
                        </div>
                        <div className="text-sm text-gray-400">Noise Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {analytics?.environmental_impact.light_exposure || 500}lux
                        </div>
                        <div className="text-sm text-gray-400">Light Level</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'health' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Health Metrics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {healthData.map((metric) => {
                      const Icon = getMetricIcon(metric.metric);
                      return (
                        <div key={metric.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Icon className="w-6 h-6 text-cyan-400" />
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(metric.status)}`}>
                              {metric.status}
                            </span>
                          </div>
                          <h4 className="font-medium text-white mb-2 capitalize">
                            {metric.metric.replace('_', ' ')}
                          </h4>
                          <div className="text-2xl font-bold text-white mb-2">
                            {metric.value} {metric.unit}
                          </div>
                          <div className="text-sm text-gray-400">
                            Target: {metric.target_range.min}-{metric.target_range.max} {metric.unit}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-sm text-gray-400">Trend:</span>
                            <span className={`text-sm ${
                              metric.trend === 'up' ? 'text-green-400' :
                              metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'environment' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Environmental Monitoring</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {environmentalData.map((metric) => {
                      const Icon = getMetricIcon(metric.metric);
                      return (
                        <div key={metric.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Icon className="w-6 h-6 text-cyan-400" />
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(metric.status)}`}>
                              {metric.status}
                            </span>
                          </div>
                          <h4 className="font-medium text-white mb-2 capitalize">
                            {metric.metric.replace('_', ' ')}
                          </h4>
                          <div className="text-2xl font-bold text-white mb-2">
                            {metric.value} {metric.unit}
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            Location: {metric.location}
                          </div>
                          <div className="text-sm text-gray-400">
                            Target: {metric.target_range.min}-{metric.target_range.max} {metric.unit}
                          </div>
                          {metric.recommendations.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm text-cyan-400 mb-1">Recommendations:</div>
                              <ul className="text-xs text-gray-400 space-y-1">
                                {metric.recommendations.slice(0, 2).map((rec, index) => (
                                  <li key={index}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'devices' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Connected Devices</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {devices.map((device) => {
                      const Icon = getDeviceIcon(device.type);
                      return (
                        <div key={device.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Icon className="w-6 h-6 text-cyan-400" />
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${device.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                              <span className="text-xs text-gray-400">
                                {device.connected ? 'Connected' : 'Disconnected'}
                              </span>
                            </div>
                          </div>
                          <h4 className="font-medium text-white mb-1">{device.name}</h4>
                          <div className="text-sm text-gray-400 mb-3">{device.brand} {device.model}</div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Battery:</span>
                              <span className="text-white">{device.battery_level}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Last Sync:</span>
                              <span className="text-white">
                                {new Date(device.last_sync).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="text-xs text-gray-400 mb-1">Capabilities:</div>
                            <div className="flex flex-wrap gap-1">
                              {device.capabilities.slice(0, 3).map((cap, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                                  {cap}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'reminders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-cyan-400">Health Reminders</h3>
                    <button
                      onClick={() => setSelectedReminder({} as HealthReminder)}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Reminder</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {reminders.map((reminder) => {
                      const Icon = getReminderIcon(reminder.type);
                      return (
                        <div key={reminder.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5 text-cyan-400" />
                              <div>
                                <h4 className="font-medium text-white">{reminder.title}</h4>
                                <p className="text-sm text-gray-400">{reminder.description}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                  {reminder.frequency} at {reminder.time}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleReminder(reminder.id, !reminder.enabled)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                  reminder.enabled
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                              >
                                {reminder.enabled ? 'Enabled' : 'Disabled'}
                              </button>
                              {!reminder.completed_today && reminder.enabled && (
                                <button
                                  onClick={() => completeReminder(reminder.id)}
                                  className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Wellness Analytics</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Weekly Trends</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Heart Rate</span>
                            <span className="text-white">72 BPM avg</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Sleep Quality</span>
                            <span className="text-white">85% avg</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Stress Level</span>
                            <span className="text-white">Low</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Health Insights</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-cyan-400 mb-1">Sleep Pattern</div>
                          <div className="text-xs text-gray-300">{analytics?.health_insights.sleep_pattern || 'Consistent 7-8 hours'}</div>
                        </div>
                        <div className="p-3 bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-cyan-400 mb-1">Productivity Correlation</div>
                          <div className="text-xs text-gray-300">
                            {analytics?.health_insights.productivity_correlation || 0.85} correlation with health score
                          </div>
                        </div>
                        <div className="p-3 bg-gray-700/50 rounded-lg">
                          <div className="text-sm text-cyan-400 mb-1">Recommendations</div>
                          <ul className="text-xs text-gray-300 space-y-1">
                            {analytics?.health_insights.recommendations?.slice(0, 2).map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Reminder Creation Modal */}
        <AnimatePresence>
          {selectedReminder && !selectedReminder.id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Add Health Reminder</h3>
                <div className="space-y-4">
                  <select
                    value={newReminder.type}
                    onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as ReminderType })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="hydration">Hydration</option>
                    <option value="posture">Posture</option>
                    <option value="break">Break</option>
                    <option value="medication">Medication</option>
                    <option value="exercise">Exercise</option>
                    <option value="sleep">Sleep</option>
                    <option value="meal">Meal</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Reminder title"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <textarea
                    placeholder="Description"
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-20"
                  />
                  <select
                    value={newReminder.frequency}
                    onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="hourly">Hourly</option>
                    <option value="custom">Custom</option>
                  </select>
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={createReminder}
                      className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                    >
                      Create Reminder
                    </button>
                    <button
                      onClick={() => setSelectedReminder(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 