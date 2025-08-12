import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Monitor, 
  Volume2, 
  Palette, 
  Database,
  Network,
  Bell,
  Eye,
  Lock,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SettingCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface SettingItem {
  id: string;
  name: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'slider' | 'button';
  value: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

const settingCategories: SettingCategory[] = [
  {
    id: 'general',
    name: 'General',
    icon: <SettingsIcon className="w-5 h-5" />,
    description: 'Basic system preferences'
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: <Palette className="w-5 h-5" />,
    description: 'Visual customization'
  },
  {
    id: 'privacy',
    name: 'Privacy & Security',
    icon: <Shield className="w-5 h-5" />,
    description: 'Privacy and security settings'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    description: 'Notification preferences'
  },
  {
    id: 'audio',
    name: 'Audio & Voice',
    icon: <Volume2 className="w-5 h-5" />,
    description: 'Audio and voice settings'
  },
  {
    id: 'system',
    name: 'System',
    icon: <Monitor className="w-5 h-5" />,
    description: 'System configuration'
  },
  {
    id: 'data',
    name: 'Data Management',
    icon: <Database className="w-5 h-5" />,
    description: 'Data backup and management'
  },
  {
    id: 'network',
    name: 'Network',
    icon: <Network className="w-5 h-5" />,
    description: 'Network and connectivity'
  }
];

const mockSettings: Record<string, SettingItem[]> = {
  general: [
    {
      id: 'auto_start',
      name: 'Auto-start JARVIS',
      description: 'Start JARVIS automatically when system boots',
      type: 'toggle',
      value: true
    },
    {
      id: 'language',
      name: 'Language',
      description: 'System language preference',
      type: 'select',
      value: 'English',
      options: ['English', 'Spanish', 'French', 'German', 'Chinese']
    },
    {
      id: 'timezone',
      name: 'Timezone',
      description: 'System timezone',
      type: 'select',
      value: 'UTC-5',
      options: ['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1', 'UTC+5:30', 'UTC+8']
    }
  ],
  appearance: [
    {
      id: 'theme',
      name: 'Theme',
      description: 'Visual theme preference',
      type: 'select',
      value: 'JARVIS Dark',
      options: ['JARVIS Dark', 'JARVIS Light', 'Classic Dark', 'Classic Light']
    },
    {
      id: 'opacity',
      name: 'Interface Opacity',
      description: 'Transparency level of interface elements',
      type: 'slider',
      value: 85,
      min: 50,
      max: 100,
      step: 5
    },
    {
      id: 'animations',
      name: 'Enable Animations',
      description: 'Show interface animations and transitions',
      type: 'toggle',
      value: true
    },
    {
      id: 'hud_style',
      name: 'HUD Style',
      description: 'Heads-up display visual style',
      type: 'select',
      value: 'Iron Man',
      options: ['Iron Man', 'Minimal', 'Futuristic', 'Classic']
    }
  ],
  privacy: [
    {
      id: 'data_collection',
      name: 'Data Collection',
      description: 'Allow JARVIS to collect usage data for improvement',
      type: 'toggle',
      value: false
    },
    {
      id: 'voice_logging',
      name: 'Voice Logging',
      description: 'Store voice interactions for learning',
      type: 'toggle',
      value: true
    },
    {
      id: 'camera_access',
      name: 'Camera Access',
      description: 'Allow JARVIS to access camera for face recognition',
      type: 'toggle',
      value: true
    },
    {
      id: 'encryption',
      name: 'Data Encryption',
      description: 'Encrypt all stored data',
      type: 'toggle',
      value: true
    }
  ],
  notifications: [
    {
      id: 'system_notifications',
      name: 'System Notifications',
      description: 'Show system status notifications',
      type: 'toggle',
      value: true
    },
    {
      id: 'voice_notifications',
      name: 'Voice Notifications',
      description: 'Play voice alerts for important events',
      type: 'toggle',
      value: true
    },
    {
      id: 'notification_sound',
      name: 'Notification Sound',
      description: 'Sound for notifications',
      type: 'select',
      value: 'JARVIS Beep',
      options: ['JARVIS Beep', 'Classic', 'Modern', 'Silent']
    },
    {
      id: 'notification_volume',
      name: 'Notification Volume',
      description: 'Volume level for notifications',
      type: 'slider',
      value: 70,
      min: 0,
      max: 100,
      step: 10
    }
  ],
  audio: [
    {
      id: 'voice_enabled',
      name: 'Voice Recognition',
      description: 'Enable voice command recognition',
      type: 'toggle',
      value: true
    },
    {
      id: 'tts_enabled',
      name: 'Text-to-Speech',
      description: 'Enable voice responses',
      type: 'toggle',
      value: true
    },
    {
      id: 'voice_speed',
      name: 'Voice Speed',
      description: 'Speed of voice responses',
      type: 'slider',
      value: 1.0,
      min: 0.5,
      max: 2.0,
      step: 0.1
    },
    {
      id: 'voice_model',
      name: 'Voice Model',
      description: 'AI voice model for responses',
      type: 'select',
      value: 'JARVIS Voice',
      options: ['JARVIS Voice', 'Natural', 'Robotic', 'Custom']
    }
  ],
  system: [
    {
      id: 'performance_mode',
      name: 'Performance Mode',
      description: 'Optimize for performance over battery life',
      type: 'toggle',
      value: false
    },
    {
      id: 'auto_update',
      name: 'Auto Updates',
      description: 'Automatically install system updates',
      type: 'toggle',
      value: true
    },
    {
      id: 'resource_limit',
      name: 'Resource Limit',
      description: 'Maximum CPU usage for AI processing',
      type: 'slider',
      value: 80,
      min: 20,
      max: 100,
      step: 10
    },
    {
      id: 'debug_mode',
      name: 'Debug Mode',
      description: 'Enable debug logging and diagnostics',
      type: 'toggle',
      value: false
    }
  ],
  data: [
    {
      id: 'auto_backup',
      name: 'Auto Backup',
      description: 'Automatically backup data to cloud',
      type: 'toggle',
      value: true
    },
    {
      id: 'backup_frequency',
      name: 'Backup Frequency',
      description: 'How often to perform backups',
      type: 'select',
      value: 'Daily',
      options: ['Hourly', 'Daily', 'Weekly', 'Monthly']
    },
    {
      id: 'export_data',
      name: 'Export Data',
      description: 'Export all JARVIS data',
      type: 'button',
      value: 'Export'
    },
    {
      id: 'clear_data',
      name: 'Clear All Data',
      description: 'Permanently delete all stored data',
      type: 'button',
      value: 'Clear'
    }
  ],
  network: [
    {
      id: 'offline_mode',
      name: 'Offline Mode',
      description: 'Work without internet connection',
      type: 'toggle',
      value: false
    },
    {
      id: 'proxy_enabled',
      name: 'Use Proxy',
      description: 'Use proxy server for connections',
      type: 'toggle',
      value: false
    },
    {
      id: 'connection_timeout',
      name: 'Connection Timeout',
      description: 'Network connection timeout (seconds)',
      type: 'slider',
      value: 30,
      min: 10,
      max: 120,
      step: 5
    }
  ]
};

export const Settings: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useState(mockSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const updateSetting = (categoryId: string, settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map(setting =>
        setting.id === settingId ? { ...setting, value } : setting
      )
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Simulate saving settings
    setTimeout(() => {
      setHasChanges(false);
    }, 1000);
  };

  const resetSettings = () => {
    setSettings(mockSettings);
    setHasChanges(false);
    setShowResetConfirm(false);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jarvis-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderSettingControl = (setting: SettingItem, categoryId: string) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => updateSetting(categoryId, setting.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(categoryId, setting.id, e.target.value)}
            className="bg-gray-800 text-cyan-100 border border-cyan-500/20 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400 transition"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'input':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(categoryId, setting.id, e.target.value)}
            className="bg-gray-800 text-cyan-100 border border-cyan-500/20 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400 transition"
          />
        );
      
      case 'slider':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={setting.value}
              onChange={(e) => updateSetting(categoryId, setting.id, parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-cyan-200 min-w-[3rem] text-right">{setting.value}</span>
          </div>
        );
      
      case 'button':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (setting.id === 'export_data') {
                exportSettings();
              } else if (setting.id === 'clear_data') {
                setShowResetConfirm(true);
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              setting.id === 'clear_data' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            }`}
          >
            {setting.value}
          </motion.button>
        );
      
      default:
        return null;
    }
  };

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
            <SettingsIcon className="w-8 h-8 mr-3" />
            Settings
          </h2>
          <p className="text-cyan-200 text-lg">Configure JARVIS system preferences</p>
        </div>

        {/* Settings Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2 text-yellow-400"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Unsaved changes</span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveSettings}
              disabled={!hasChanges}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4">Categories</h3>
              <div className="space-y-2">
                {settingCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      activeCategory === category.id
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-800/50 text-cyan-200 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {category.icon}
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs opacity-70">{category.description}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                {settingCategories.find(c => c.id === activeCategory)?.icon}
                <div>
                  <h3 className="text-xl font-semibold text-cyan-200">
                    {settingCategories.find(c => c.id === activeCategory)?.name}
                  </h3>
                  <p className="text-cyan-400 text-sm">
                    {settingCategories.find(c => c.id === activeCategory)?.description}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {settings[activeCategory]?.map((setting) => (
                  <motion.div
                    key={setting.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-cyan-100">{setting.name}</h4>
                        {setting.type === 'button' && setting.id === 'clear_data' && (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <p className="text-sm text-cyan-400">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingControl(setting, activeCategory)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-cyan-200">Reset Settings</h3>
              </div>
              <p className="text-cyan-300 mb-6">
                Are you sure you want to reset all settings to their default values? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetSettings}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Reset All
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}; 