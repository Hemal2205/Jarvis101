import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  List,
  Plus,
  Edit3,
  Trash2,
  Play,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Settings,
  Activity,
  FileText,
  Bell,
  Users,
  Calendar,
  MessageCircle,
  ClipboardList
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

// Types
export type TriggerType = 'manual' | 'time' | 'event';
export type ActionType = 'notify' | 'create_task' | 'update_doc' | 'send_message' | 'custom';

export interface AutomationStep {
  id: string;
  type: ActionType;
  params: Record<string, any>;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: TriggerType;
    config: Record<string, any>;
  };
  steps: AutomationStep[];
  enabled: boolean;
  last_run?: string;
  logs: AutomationLog[];
}

export interface AutomationLog {
  id: string;
  automation_id: string;
  status: 'success' | 'error' | 'running';
  started_at: string;
  finished_at?: string;
  message: string;
}

interface EnhancedAutomationSuiteProps {
  isActive: boolean;
  onClose?: () => void;
}

export const EnhancedAutomationSuite: React.FC<EnhancedAutomationSuiteProps> = ({ isActive, onClose }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'builder' | 'logs'>('list');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newAutomation, setNewAutomation] = useState<Partial<Automation>>({
    name: '',
    description: '',
    trigger: { type: 'manual', config: {} },
    steps: [],
    enabled: true,
    logs: []
  });
  const { notify } = useNotification();

  // Mock data loading
  useEffect(() => {
    if (isActive) {
      fetch('/api/automation/')
        .then(res => res.json())
        .then(data => setAutomations(data.automations || []));
    }
  }, [isActive]);

  // Handlers (mock)
  const handleCreateAutomation = async () => {
    if (!newAutomation.name) return notify('Name required', 'error');
    try {
      const response = await fetch('/api/automation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAutomation, id: `auto${automations.length + 1}`, steps: newAutomation.steps || [], logs: [] })
      });
      const data = await response.json();
      if (data.success) {
        setAutomations([...automations, data.automation]);
        setShowModal(false);
        setNewAutomation({ name: '', description: '', trigger: { type: 'manual', config: {} }, steps: [], enabled: true, logs: [] });
        notify('Automation created', 'success');
      } else {
        notify('Failed to create automation', 'error');
      }
    } catch (error) {
      notify('Failed to create automation', 'error');
    }
  };
  const handleRunAutomation = async (automation: Automation) => {
    try {
      const response = await fetch(`/api/automation/${automation.id}/run`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setAutomations((autos) => autos.map(a => a.id === automation.id ? {
          ...a,
          logs: [...a.logs, data.log],
          last_run: data.log.started_at
        } : a));
        notify(`Automation ${automation.name} ran successfully`, 'success');
      } else {
        notify('Failed to run automation', 'error');
      }
    } catch (error) {
      notify('Failed to run automation', 'error');
    }
  };
  const handleDeleteAutomation = async (id: string) => {
    try {
      const response = await fetch(`/api/automation/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setAutomations(automations.filter(a => a.id !== id));
        notify('Automation deleted', 'success');
      } else {
        notify('Failed to delete automation', 'error');
      }
    } catch (error) {
      notify('Failed to delete automation', 'error');
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border border-yellow-500/30 rounded-2xl w-full max-w-5xl h-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-yellow-500/30">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">Enhanced Automation Suite</h1>
              <p className="text-gray-400 text-sm">Build, run, and manage automations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-4 bg-gray-800/50">
          {[
            { id: 'list', label: 'Automations', icon: List },
            { id: 'builder', label: 'Builder', icon: Settings },
            { id: 'logs', label: 'Logs', icon: Activity }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
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
              {/* Automation List Tab */}
              {activeTab === 'list' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-yellow-400">Automations</h3>
                    <button
                      onClick={() => setShowModal(true)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Automation</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {automations.map((auto) => (
                      <div key={auto.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-white">{auto.name}</div>
                          <div className="flex space-x-2">
                            <button onClick={() => handleRunAutomation(auto)} className="text-xs text-green-400 hover:underline flex items-center"><Play className="w-4 h-4 mr-1" />Run</button>
                            <button onClick={() => { setSelectedAutomation(auto); setShowModal(true); }} className="text-xs text-yellow-400 hover:underline flex items-center"><Edit3 className="w-4 h-4 mr-1" />Edit</button>
                            <button onClick={() => handleDeleteAutomation(auto.id)} className="text-xs text-red-400 hover:underline flex items-center"><Trash2 className="w-4 h-4 mr-1" />Delete</button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{auto.description}</div>
                        <div className="flex space-x-2 mt-2">
                          <span className="text-xs text-gray-300 bg-gray-700 rounded px-2 py-1">Trigger: {auto.trigger.type}</span>
                          <span className="text-xs text-gray-300 bg-gray-700 rounded px-2 py-1">Steps: {auto.steps.length}</span>
                          <span className={`text-xs rounded px-2 py-1 ${auto.enabled ? 'bg-green-700 text-green-300' : 'bg-gray-700 text-gray-400'}`}>{auto.enabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Last run: {auto.last_run ? new Date(auto.last_run).toLocaleString() : 'Never'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Builder Tab (simple modular UI for now) */}
              {activeTab === 'builder' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-yellow-400">Workflow Builder</h3>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        value={newAutomation.name}
                        onChange={e => setNewAutomation({ ...newAutomation, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-1">Description</label>
                      <textarea
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        value={newAutomation.description}
                        onChange={e => setNewAutomation({ ...newAutomation, description: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-1">Trigger Type</label>
                      <select
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        value={newAutomation.trigger?.type || 'manual'}
                        onChange={e => setNewAutomation({ ...newAutomation, trigger: { ...newAutomation.trigger, type: e.target.value as TriggerType, config: {} } })}
                      >
                        <option value="manual">Manual</option>
                        <option value="time">Time</option>
                        <option value="event">Event</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-1">Steps</label>
                      <div className="space-y-2">
                        {(newAutomation.steps || []).map((step, idx) => (
                          <div key={step.id} className="flex items-center space-x-2">
                            <span className="text-xs text-gray-300 bg-gray-700 rounded px-2 py-1">{step.type}</span>
                            <button onClick={() => setNewAutomation({ ...newAutomation, steps: (newAutomation.steps || []).filter((_, i) => i !== idx) })} className="text-xs text-red-400 hover:underline"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => setNewAutomation({ ...newAutomation, steps: [...(newAutomation.steps || []), { id: `s${(newAutomation.steps?.length || 0) + 1}`, type: 'notify', params: { message: 'Hello!' } }] })}
                          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs mt-2"
                        >
                          <Plus className="w-4 h-4 inline-block mr-1" />Add Step
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleCreateAutomation}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                      Save Automation
                    </button>
                  </div>
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'logs' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-yellow-400">Execution Logs</h3>
                  <div className="space-y-3">
                    {automations.flatMap(a => a.logs).map((log) => (
                      <div key={log.id} className="flex items-center space-x-3 bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <Activity className="w-5 h-5 text-yellow-400" />
                        <div>
                          <span className="font-medium text-white mr-2">{log.automation_id}</span>
                          <span className={`text-xs rounded px-2 py-1 ${log.status === 'success' ? 'bg-green-700 text-green-300' : log.status === 'error' ? 'bg-red-700 text-red-300' : 'bg-yellow-700 text-yellow-300'}`}>{log.status}</span>
                          <span className="text-gray-300 ml-2">{log.message}</span>
                          <span className="text-xs text-gray-500 ml-2">{new Date(log.started_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Create/Edit Modal (reuse builder UI) */}
        <AnimatePresence>
          {showModal && (
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
                className="bg-gray-900 border border-yellow-500/30 rounded-lg p-6 w-full max-w-2xl"
              >
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">{selectedAutomation ? 'Edit' : 'New'} Automation</h3>
                {/* Reuse builder UI here */}
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    value={newAutomation.name}
                    onChange={e => setNewAutomation({ ...newAutomation, name: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1">Description</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    value={newAutomation.description}
                    onChange={e => setNewAutomation({ ...newAutomation, description: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1">Trigger Type</label>
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    value={newAutomation.trigger?.type || 'manual'}
                    onChange={e => setNewAutomation({ ...newAutomation, trigger: { ...newAutomation.trigger, type: e.target.value as TriggerType, config: {} } })}
                  >
                    <option value="manual">Manual</option>
                    <option value="time">Time</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1">Steps</label>
                  <div className="space-y-2">
                    {(newAutomation.steps || []).map((step, idx) => (
                      <div key={step.id} className="flex items-center space-x-2">
                        <span className="text-xs text-gray-300 bg-gray-700 rounded px-2 py-1">{step.type}</span>
                        <button onClick={() => setNewAutomation({ ...newAutomation, steps: (newAutomation.steps || []).filter((_, i) => i !== idx) })} className="text-xs text-red-400 hover:underline"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button
                      onClick={() => setNewAutomation({ ...newAutomation, steps: [...(newAutomation.steps || []), { id: `s${(newAutomation.steps?.length || 0) + 1}`, type: 'notify', params: { message: 'Hello!' } }] })}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs mt-2"
                    >
                      <Plus className="w-4 h-4 inline-block mr-1" />Add Step
                    </button>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAutomation}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 