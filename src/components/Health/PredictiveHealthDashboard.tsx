import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, AlertTriangle, Bell, Watch, Droplets, Bed, Sun, Users, X, CheckCircle } from 'lucide-react';

interface HealthPrediction {
  type: 'stress' | 'fatigue' | 'focus' | 'illness' | 'hydration' | 'sleep';
  risk: 'low' | 'moderate' | 'high';
  score: number;
  trend: 'up' | 'down' | 'stable';
  message: string;
}

interface HealthRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'break' | 'hydration' | 'exercise' | 'mindfulness' | 'sleep' | 'nutrition';
  action_label: string;
}

interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  last_sync: string;
}

interface PredictiveHealthDashboardProps {
  isActive: boolean;
  onClose?: () => void;
}

export const PredictiveHealthDashboard: React.FC<PredictiveHealthDashboardProps> = ({ isActive, onClose }) => {
  const [predictions, setPredictions] = useState<HealthPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (isActive) {
      fetch('/api/healthai/predictions')
        .then(res => res.json())
        .then(data => setPredictions(data.predictions || []));
      fetch('/api/healthai/recommendations')
        .then(res => res.json())
        .then(data => setRecommendations(data.recommendations || []));
      fetch('/api/healthai/devices')
        .then(res => res.json())
        .then(data => setDevices(data.devices || []));
      fetch('/api/healthai/alerts')
        .then(res => res.json())
        .then(data => setAlerts(data.alerts || []));
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-pink-500/30 rounded-2xl w-full max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pink-500/30">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-pink-400" />
            <div>
              <h1 className="text-2xl font-bold text-pink-400">Predictive Health Dashboard</h1>
              <p className="text-gray-400 text-sm">AI-powered health trends, predictions, and recommendations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="p-4 bg-pink-900/60 text-pink-200 text-sm flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-pink-400" />
            <div>
              {alerts.map((a, i) => <div key={i}>{a}</div>)}
            </div>
          </div>
        )}
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Predictions */}
          <div>
            <h3 className="text-lg font-semibold text-pink-400 mb-2">AI Health Predictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predictions.map((p) => (
                <div key={p.type} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col items-center">
                  <div className="flex items-center space-x-2 mb-2">
                    {p.type === 'stress' && <Activity className="w-5 h-5 text-yellow-400" />}
                    {p.type === 'fatigue' && <Bed className="w-5 h-5 text-blue-400" />}
                    {p.type === 'hydration' && <Droplets className="w-5 h-5 text-cyan-400" />}
                    {p.type === 'focus' && <Users className="w-5 h-5 text-green-400" />}
                    {p.type === 'illness' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                    {p.type === 'sleep' && <Sun className="w-5 h-5 text-purple-400" />}
                    <span className="font-bold text-white capitalize">{p.type}</span>
                  </div>
                  <div className="text-3xl font-bold text-pink-300 mb-1">{p.score}</div>
                  <div className="text-xs text-gray-400 mb-1">Risk: <span className={`font-bold ${p.risk === 'high' ? 'text-red-400' : p.risk === 'moderate' ? 'text-yellow-400' : 'text-green-400'}`}>{p.risk}</span></div>
                  <div className="text-xs text-gray-400 mb-1">Trend: {p.trend === 'up' ? '↗' : p.trend === 'down' ? '↘' : '→'}</div>
                  <div className="text-xs text-pink-200 text-center">{p.message}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-pink-400 mb-2">Proactive Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((r) => (
                <div key={r.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col items-center">
                  <div className="font-bold text-white mb-1">{r.title}</div>
                  <div className="text-xs text-gray-400 mb-2 text-center">{r.description}</div>
                  <button className="px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 text-xs mt-2">{r.action_label}</button>
                </div>
              ))}
            </div>
          </div>
          {/* Device Integration */}
          <div>
            <h3 className="text-lg font-semibold text-pink-400 mb-2">Device Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((d) => (
                <div key={d.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center space-x-3">
                  <Watch className="w-6 h-6 text-pink-400" />
                  <div>
                    <div className="font-bold text-white">{d.name}</div>
                    <div className="text-xs text-gray-400">{d.type}</div>
                    <div className="text-xs text-gray-400">Last sync: {new Date(d.last_sync).toLocaleString()}</div>
                    <div className={`text-xs font-bold ${d.connected ? 'text-green-400' : 'text-red-400'}`}>{d.connected ? 'Connected' : 'Disconnected'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 