import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Database, 
  Settings, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  RotateCcw,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Brain,
  Lock,
  Unlock,
  Shield,
  Activity
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  provider: string;
  key: string;
  isVisible: boolean;
  status: 'active' | 'inactive' | 'expired' | 'quota_exceeded';
  createdAt: Date;
  lastUsed: Date;
  usage: {
    requests: number;
    tokens: number;
    cost: number;
  };
  quota: {
    requests: number;
    tokens: number;
    cost: number;
  };
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'image' | 'audio' | 'multimodal';
  status: 'available' | 'loading' | 'error' | 'offline';
  performance: number;
  cost: number;
  lastUpdated: string;
  description: string;
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'OpenAI GPT-4',
    provider: 'OpenAI',
    key: 'sk-1234567890abcdef1234567890abcdef1234567890abcdef',
    isVisible: false,
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastUsed: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    usage: {
      requests: 1250,
      tokens: 45000,
      cost: 12.50
    },
    quota: {
      requests: 10000,
      tokens: 100000,
      cost: 100.00
    }
  },
  {
    id: '2',
    name: 'Google Gemini',
    provider: 'Google',
    key: 'AIzaSyC1234567890abcdef1234567890abcdef123456',
    isVisible: false,
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    lastUsed: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    usage: {
      requests: 850,
      tokens: 32000,
      cost: 8.75
    },
    quota: {
      requests: 5000,
      tokens: 50000,
      cost: 50.00
    }
  },
  {
    id: '3',
    name: 'Anthropic Claude',
    provider: 'Anthropic',
    key: 'sk-ant-1234567890abcdef1234567890abcdef1234567890abcdef',
    isVisible: false,
    status: 'quota_exceeded',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    usage: {
      requests: 2000,
      tokens: 75000,
      cost: 25.00
    },
    quota: {
      requests: 2000,
      tokens: 75000,
      cost: 25.00
    }
  }
];

const mockModels: AIModel[] = [
  {
    id: '1',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    type: 'text',
    status: 'available',
    performance: 95,
    cost: 0.03,
    lastUpdated: '2 hours ago',
    description: 'Advanced language model for text generation and analysis'
  },
  {
    id: '2',
    name: 'Gemini Pro',
    provider: 'Google',
    type: 'multimodal',
    status: 'available',
    performance: 92,
    cost: 0.025,
    lastUpdated: '1 hour ago',
    description: 'Multimodal AI model supporting text, image, and video'
  },
  {
    id: '3',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    type: 'text',
    status: 'loading',
    performance: 98,
    cost: 0.045,
    lastUpdated: '30 minutes ago',
    description: 'High-performance language model for complex reasoning'
  },
  {
    id: '4',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    type: 'image',
    status: 'available',
    performance: 89,
    cost: 0.04,
    lastUpdated: '3 hours ago',
    description: 'Advanced image generation model'
  },
  {
    id: '5',
    name: 'Whisper',
    provider: 'OpenAI',
    type: 'audio',
    status: 'offline',
    performance: 87,
    cost: 0.006,
    lastUpdated: '1 day ago',
    description: 'Speech recognition and transcription model'
  }
];

export const ModelAPIKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys);
  const [models, setModels] = useState<AIModel[]>(mockModels);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    provider: '',
    key: ''
  });

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(prev => 
      prev.map(key => 
        key.id === id ? { ...key, isVisible: !key.isVisible } : key
      )
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const regenerateKey = (id: string) => {
    const newKeyValue = `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys(prev => 
      prev.map(key => 
        key.id === id ? { ...key, key: newKeyValue } : key
      )
    );
  };

  const deleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
  };

  const addNewKey = () => {
    if (!newKey.name || !newKey.provider || !newKey.key) return;
    
    const key: APIKey = {
      id: Date.now().toString(),
      name: newKey.name,
      provider: newKey.provider,
      key: newKey.key,
      isVisible: false,
      status: 'active',
      createdAt: new Date(),
      lastUsed: new Date(),
      usage: { requests: 0, tokens: 0, cost: 0 },
      quota: { requests: 10000, tokens: 100000, cost: 100.00 }
    };
    
    setApiKeys(prev => [key, ...prev]);
    setNewKey({ name: '', provider: '', key: '' });
    setShowAddKey(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'expired': return 'text-red-400';
      case 'quota_exceeded': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'quota_exceeded': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'loading': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-500/20 text-blue-400';
      case 'image': return 'bg-purple-500/20 text-purple-400';
      case 'audio': return 'bg-green-500/20 text-green-400';
      case 'multimodal': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
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

  const formatUsage = (usage: number, quota: number) => {
    const percentage = (usage / quota) * 100;
    return `${usage.toLocaleString()} / ${quota.toLocaleString()} (${percentage.toFixed(1)}%)`;
  };

  const activeKeys = apiKeys.filter(key => key.status === 'active').length;
  const totalUsage = apiKeys.reduce((acc, key) => acc + key.usage.cost, 0);

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
            <Key className="w-8 h-8 mr-3" />
            Model & API Keys
          </h2>
          <p className="text-cyan-200 text-lg">Manage AI models and API key configurations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{activeKeys}</div>
            <div className="text-sm text-cyan-400">Active Keys</div>
            <Key className="w-6 h-6 text-green-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{models.length}</div>
            <div className="text-sm text-cyan-400">Available Models</div>
            <Brain className="w-6 h-6 text-blue-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">${totalUsage.toFixed(2)}</div>
            <div className="text-sm text-cyan-400">Total Usage</div>
            <Activity className="w-6 h-6 text-purple-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {models.filter(m => m.status === 'available').length}
            </div>
            <div className="text-sm text-cyan-400">Online Models</div>
            <Zap className="w-6 h-6 text-cyan-400 mx-auto mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Keys */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  API Keys
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddKey(!showAddKey)}
                  className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Add New Key Form */}
              {showAddKey && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-cyan-500/20"
                >
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Key Name"
                      value={newKey.name}
                      onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 bg-gray-700 text-cyan-100 border border-cyan-500/20 rounded focus:outline-none focus:border-cyan-400 transition"
                    />
                    <input
                      type="text"
                      placeholder="Provider"
                      value={newKey.provider}
                      onChange={(e) => setNewKey(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full p-2 bg-gray-700 text-cyan-100 border border-cyan-500/20 rounded focus:outline-none focus:border-cyan-400 transition"
                    />
                    <input
                      type="password"
                      placeholder="API Key"
                      value={newKey.key}
                      onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                      className="w-full p-2 bg-gray-700 text-cyan-100 border border-cyan-500/20 rounded focus:outline-none focus:border-cyan-400 transition"
                    />
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addNewKey}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                      >
                        Add Key
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddKey(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {apiKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-cyan-100">{key.name}</h4>
                          <div className={getStatusColor(key.status)}>
                            {getStatusIcon(key.status)}
                          </div>
                        </div>
                        <p className="text-sm text-cyan-400">{key.provider}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-1 text-cyan-400 hover:text-cyan-300 transition"
                          title={key.isVisible ? 'Hide key' : 'Show key'}
                        >
                          {key.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(key.key)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition"
                          title="Copy key"
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => regenerateKey(key.id)}
                          className="p-1 text-yellow-400 hover:text-yellow-300 transition"
                          title="Regenerate key"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteKey(key.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition"
                          title="Delete key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-cyan-400">Key:</span>
                        <code className="text-xs text-cyan-200 bg-gray-700 px-2 py-1 rounded">
                          {key.isVisible ? key.key : '••••••••••••••••••••••••••••••••••••••••'}
                        </code>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-cyan-400">Usage:</span>
                          <div className="text-cyan-200">{formatUsage(key.usage.requests, key.quota.requests)}</div>
                        </div>
                        <div>
                          <span className="text-cyan-400">Cost:</span>
                          <div className="text-cyan-200">${key.usage.cost.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-cyan-500">
                        Last used: {formatTimeAgo(key.lastUsed)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Models */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Models
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {models.map((model) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-cyan-100">{model.name}</h4>
                          <div className={getModelStatusColor(model.status)}>
                            <div className={`w-2 h-2 rounded-full ${
                              model.status === 'available' ? 'bg-green-400' :
                              model.status === 'loading' ? 'bg-yellow-400' :
                              model.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                            }`}></div>
                          </div>
                        </div>
                        <p className="text-sm text-cyan-400">{model.provider}</p>
                        <p className="text-xs text-cyan-500 mt-1">{model.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${getTypeColor(model.type)}`}>
                          {model.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-cyan-400">Performance:</span>
                        <div className="text-cyan-200">{model.performance}%</div>
                      </div>
                      <div>
                        <span className="text-cyan-400">Cost:</span>
                        <div className="text-cyan-200">${model.cost}/1K tokens</div>
                      </div>
                      <div>
                        <span className="text-cyan-400">Status:</span>
                        <div className={`capitalize ${getModelStatusColor(model.status)}`}>
                          {model.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-cyan-500 mt-2">
                      Updated: {model.lastUpdated}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Usage Analytics */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Usage Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Total API Calls</span>
                  <span className="text-cyan-200 font-medium">
                    {apiKeys.reduce((acc, key) => acc + key.usage.requests, 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Total Tokens</span>
                  <span className="text-cyan-200 font-medium">
                    {apiKeys.reduce((acc, key) => acc + key.usage.tokens, 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Monthly Cost</span>
                  <span className="text-cyan-200 font-medium">${totalUsage.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Active Models</span>
                  <span className="text-cyan-200 font-medium">
                    {models.filter(m => m.status === 'available').length}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-200 font-medium">Security Status</span>
                </div>
                <p className="text-sm text-cyan-300">
                  All API keys are encrypted and stored securely. Regular security audits are performed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 