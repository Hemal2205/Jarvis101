import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Thermometer, 
  Droplets, 
  Sun, 
  Wind, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Clock,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Users,
  Globe,
  Database,
  Network,
  Cpu,
  Battery,
  Wifi,
  Signal,
  Volume2,
  VolumeX,
  Lightbulb,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  ThermometerSun,
  ThermometerSnowflake,
  Gauge,
  Target,
  AlertTriangle,
  Info,
  RefreshCw,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface EnvironmentalMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  optimal: { min: number; max: number };
  status: 'optimal' | 'warning' | 'critical' | 'offline';
  trend: 'up' | 'down' | 'stable';
  lastUpdate: string;
  icon: any;
}

interface HealthRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'air' | 'temperature' | 'humidity' | 'lighting' | 'noise' | 'general';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'implemented' | 'dismissed';
  impact: string;
  createdAt: string;
}

interface EnvironmentalZone {
  id: string;
  name: string;
  type: 'office' | 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'outdoor';
  status: 'active' | 'inactive' | 'maintenance';
  metrics: string[];
  lastCheck: string;
  healthScore: number;
}

const EnvironmentalHealth: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alertLevel, setAlertLevel] = useState<'all' | 'warning' | 'critical'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const environmentalMetrics: EnvironmentalMetric[] = [
    { 
      id: '1', 
      name: 'Temperature', 
      value: 22.5, 
      unit: '°C', 
      min: 15, 
      max: 35, 
      optimal: { min: 20, max: 25 }, 
      status: 'optimal', 
      trend: 'stable', 
      lastUpdate: '2 min ago',
      icon: Thermometer
    },
    { 
      id: '2', 
      name: 'Humidity', 
      value: 45, 
      unit: '%', 
      min: 20, 
      max: 80, 
      optimal: { min: 40, max: 60 }, 
      status: 'optimal', 
      trend: 'up', 
      lastUpdate: '1 min ago',
      icon: Droplets
    },
    { 
      id: '3', 
      name: 'Air Quality', 
      value: 85, 
      unit: 'AQI', 
      min: 0, 
      max: 500, 
      optimal: { min: 0, max: 50 }, 
      status: 'warning', 
      trend: 'down', 
      lastUpdate: '30 sec ago',
      icon: Wind
    },
    { 
      id: '4', 
      name: 'Lighting', 
      value: 750, 
      unit: 'lux', 
      min: 0, 
      max: 2000, 
      optimal: { min: 500, max: 1000 }, 
      status: 'optimal', 
      trend: 'stable', 
      lastUpdate: '1 min ago',
      icon: Sun
    },
    { 
      id: '5', 
      name: 'Noise Level', 
      value: 45, 
      unit: 'dB', 
      min: 0, 
      max: 120, 
      optimal: { min: 30, max: 60 }, 
      status: 'optimal', 
      trend: 'down', 
      lastUpdate: '45 sec ago',
      icon: Volume2
    },
    { 
      id: '6', 
      name: 'CO2 Level', 
      value: 650, 
      unit: 'ppm', 
      min: 300, 
      max: 2000, 
      optimal: { min: 400, max: 800 }, 
      status: 'optimal', 
      trend: 'up', 
      lastUpdate: '2 min ago',
      icon: Activity
    }
  ];

  const healthRecommendations: HealthRecommendation[] = [
    { 
      id: '1', 
      title: 'Improve Air Circulation', 
      description: 'Air quality is slightly elevated. Consider opening windows or activating air purifier.', 
      category: 'air', 
      priority: 'medium', 
      status: 'active', 
      impact: 'Reduce AQI by 15-20 points', 
      createdAt: '10 min ago' 
    },
    { 
      id: '2', 
      title: 'Adjust Temperature', 
      description: 'Temperature is optimal but trending up. Consider slight cooling adjustment.', 
      category: 'temperature', 
      priority: 'low', 
      status: 'active', 
      impact: 'Maintain comfort levels', 
      createdAt: '15 min ago' 
    },
    { 
      id: '3', 
      title: 'Increase Humidity', 
      description: 'Humidity is below optimal range. Consider using a humidifier.', 
      category: 'humidity', 
      priority: 'medium', 
      status: 'implemented', 
      impact: 'Improve respiratory comfort', 
      createdAt: '1 hour ago' 
    },
    { 
      id: '4', 
      title: 'Optimize Lighting', 
      description: 'Lighting levels are good but could be adjusted for better productivity.', 
      category: 'lighting', 
      priority: 'low', 
      status: 'dismissed', 
      impact: 'Enhance focus and mood', 
      createdAt: '2 hours ago' 
    }
  ];

  const environmentalZones: EnvironmentalZone[] = [
    { 
      id: '1', 
      name: 'Main Office', 
      type: 'office', 
      status: 'active', 
      metrics: ['temperature', 'humidity', 'air-quality', 'lighting', 'noise', 'co2'], 
      lastCheck: '1 min ago', 
      healthScore: 92 
    },
    { 
      id: '2', 
      name: 'Living Room', 
      type: 'living', 
      status: 'active', 
      metrics: ['temperature', 'humidity', 'air-quality', 'lighting'], 
      lastCheck: '2 min ago', 
      healthScore: 88 
    },
    { 
      id: '3', 
      name: 'Bedroom', 
      type: 'bedroom', 
      status: 'active', 
      metrics: ['temperature', 'humidity', 'air-quality', 'noise'], 
      lastCheck: '3 min ago', 
      healthScore: 95 
    },
    { 
      id: '4', 
      name: 'Kitchen', 
      type: 'kitchen', 
      status: 'active', 
      metrics: ['temperature', 'humidity', 'air-quality'], 
      lastCheck: '1 min ago', 
      healthScore: 85 
    },
    { 
      id: '5', 
      name: 'Outdoor Area', 
      type: 'outdoor', 
      status: 'active', 
      metrics: ['temperature', 'humidity', 'air-quality', 'lighting'], 
      lastCheck: '5 min ago', 
      healthScore: 78 
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'offline': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-400" />;
      case 'stable': return <div className="w-4 h-4 border-t-2 border-cyan-400"></div>;
      default: return <div className="w-4 h-4"></div>;
    }
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'office': return <Cpu className="w-4 h-4" />;
      case 'bedroom': return <Moon className="w-4 h-4" />;
      case 'living': return <Users className="w-4 h-4" />;
      case 'kitchen': return <Activity className="w-4 h-4" />;
      case 'bathroom': return <Droplets className="w-4 h-4" />;
      case 'outdoor': return <Globe className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const filteredRecommendations = healthRecommendations.filter(rec => {
    if (alertLevel === 'all') return true;
    return rec.priority === alertLevel;
  });

  return (
    <div className="h-full bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Heart className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Environmental Health</h2>
            <p className="text-cyan-400/60 text-sm">Environmental Monitoring & Health Optimization</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMonitoring}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isMonitoring 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4 inline mr-2" />
                Monitoring Active
              </>
            ) : (
              <>
                <Play className="w-4 h-4 inline mr-2" />
                Start Monitoring
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Overall Health</span>
            <Heart className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">87%</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Active Zones</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{environmentalZones.filter(z => z.status === 'active').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Alerts</span>
            <AlertCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{healthRecommendations.filter(r => r.status === 'active').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Sensors</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{environmentalMetrics.filter(m => m.status !== 'offline').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={alertLevel}
            onChange={(e) => setAlertLevel(e.target.value as any)}
            className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Alerts</option>
            <option value="warning">Warnings</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'zones', label: 'Zones', icon: Globe },
          { id: 'recommendations', label: 'Recommendations', icon: AlertCircle },
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
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Current Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {environmentalMetrics.map((metric) => (
                  <div key={metric.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <metric.icon className="w-5 h-5 text-cyan-400" />
                        <span className="text-white font-medium">{metric.name}</span>
                      </div>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-white">{metric.value}{metric.unit}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-cyan-400/60">
                        <span>Min: {metric.min}{metric.unit}</span>
                        <span>Max: {metric.max}{metric.unit}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            metric.status === 'optimal' ? 'bg-green-400' :
                            metric.status === 'warning' ? 'bg-yellow-400' :
                            metric.status === 'critical' ? 'bg-red-400' :
                            'bg-gray-400'
                          }`}
                          style={{ 
                            width: `${((metric.value - metric.min) / (metric.max - metric.min)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-cyan-400/60">
                        <span>Optimal: {metric.optimal.min}-{metric.optimal.max}{metric.unit}</span>
                        <span>{metric.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30"
                  >
                    <Wind className="w-5 h-5 mx-auto mb-2" />
                    <span className="text-sm">Air Purifier</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30"
                  >
                    <Thermometer className="w-5 h-5 mx-auto mb-2" />
                    <span className="text-sm">Climate Control</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30"
                  >
                    <Lightbulb className="w-5 h-5 mx-auto mb-2" />
                    <span className="text-sm">Lighting</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30"
                  >
                    <Volume2 className="w-5 h-5 mx-auto mb-2" />
                    <span className="text-sm">Sound Control</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'zones' && (
            <motion.div
              key="zones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {environmentalZones.map((zone) => (
                  <motion.div
                    key={zone.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedZone === zone.id
                        ? 'bg-cyan-500/10 border-cyan-500/50'
                        : 'bg-black/30 border-cyan-500/20 hover:border-cyan-500/40'
                    }`}
                    onClick={() => setSelectedZone(zone.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getZoneIcon(zone.type)}
                        <h3 className="text-white font-medium">{zone.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          zone.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          zone.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {zone.status}
                        </span>
                        <span className={`font-bold ${getHealthScoreColor(zone.healthScore)}`}>
                          {zone.healthScore}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm capitalize">Type: {zone.type}</p>
                      <p className="text-cyan-400/60 text-sm">Metrics: {zone.metrics.length} active</p>
                      <p className="text-cyan-400/60 text-sm">Last check: {zone.lastCheck}</p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          zone.healthScore >= 90 ? 'bg-green-400' :
                          zone.healthScore >= 80 ? 'bg-yellow-400' :
                          zone.healthScore >= 70 ? 'bg-orange-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${zone.healthScore}%` }}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                {filteredRecommendations.map((recommendation) => (
                  <div key={recommendation.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{recommendation.title}</h3>
                        <p className="text-cyan-400/60 text-sm mt-1">{recommendation.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          recommendation.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          recommendation.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {recommendation.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          recommendation.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                          recommendation.status === 'implemented' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {recommendation.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm">Category: {recommendation.category}</p>
                      <p className="text-cyan-400/60 text-sm">Impact: {recommendation.impact}</p>
                      <p className="text-cyan-400/60 text-sm">Created: {recommendation.createdAt}</p>
                    </div>
                    {recommendation.status === 'active' && (
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30"
                        >
                          Implement
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30"
                        >
                          Dismiss
                        </motion.button>
                      </div>
                    )}
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
                    <Heart className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Health Score</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">87%</p>
                  <p className="text-cyan-400/60 text-sm">+5% this week</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Optimizations</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">12</p>
                  <p className="text-cyan-400/60 text-sm">This month</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Efficiency</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">94%</p>
                  <p className="text-cyan-400/60 text-sm">System efficiency</p>
                </div>
              </div>
              
              <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">Zone Health Distribution</h3>
                <div className="space-y-3">
                  {environmentalZones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between">
                      <span className="text-cyan-400/60">{zone.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              zone.healthScore >= 90 ? 'bg-green-400' :
                              zone.healthScore >= 80 ? 'bg-yellow-400' :
                              zone.healthScore >= 70 ? 'bg-orange-400' :
                              'bg-red-400'
                            }`}
                            style={{ width: `${zone.healthScore}%` }}
                          ></div>
                        </div>
                        <span className={`font-medium ${getHealthScoreColor(zone.healthScore)}`}>
                          {zone.healthScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnvironmentalHealth; 