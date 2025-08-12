import React, { useEffect, useState } from 'react';

interface Agent {
  id: string;
  name: string;
  status: string;
  created_at: string;
  last_active?: string;
  current_task?: string;
  task_history: string[];
  avatar_url?: string;
  role?: string;
}

interface AgentTask {
  id: string;
  agent_id: string;
  description: string;
  status: string;
  assigned_at: string;
  completed_at?: string;
  result?: string;
}

const AutonomousAgentsDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentAvatar, setNewAgentAvatar] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchTasks, setBatchTasks] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editRole, setEditRole] = useState('');

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/');
      const data = await res.json();
      setAgents(data);
    } catch (e) {
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentStatus = async (agentId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/status`);
      const data = await res.json();
      setAgentStatus(data);
    } catch (e) {
      setError('Failed to fetch agent status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      setEditAvatar(selectedAgent.avatar_url || '');
      setEditRole(selectedAgent.role || '');
    }
  }, [selectedAgent]);

  // Poll agent status every 2 seconds when selectedAgent changes
  useEffect(() => {
    if (!selectedAgent) return;
    fetchAgentStatus(selectedAgent.id);
    const interval = setInterval(() => fetchAgentStatus(selectedAgent.id), 2000);
    return () => clearInterval(interval);
  }, [selectedAgent]);

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/agents/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAgentName, avatar_url: newAgentAvatar, role: newAgentRole })
      });
      const agent = await res.json();
      setAgents(prev => [...prev, agent]);
      setNewAgentName('');
      setNewAgentAvatar('');
      setNewAgentRole('');
    } catch (e) {
      setError('Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAgent = async (agentId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/agents/${agentId}/start`, { method: 'POST' });
      fetchAgents();
    } catch (e) {
      setError('Failed to start agent');
    } finally {
      setLoading(false);
    }
  };

  const handleStopAgent = async (agentId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/agents/${agentId}/stop`, { method: 'POST' });
      fetchAgents();
    } catch (e) {
      setError('Failed to stop agent');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      setAgents(prev => prev.filter(a => a.id !== agentId));
      setSelectedAgent(null);
      setAgentStatus(null);
    } catch (e) {
      setError('Failed to delete agent');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedAgent || !taskDescription.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/agents/${selectedAgent.id}/assign-task?description=${encodeURIComponent(taskDescription)}`, {
        method: 'POST'
      });
      setTaskDescription('');
      fetchAgentStatus(selectedAgent.id);
    } catch (e) {
      setError('Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAssign = async () => {
    if (!selectedAgent || !batchTasks.trim()) return;
    setLoading(true);
    try {
      const descriptions = batchTasks.split('\n').map(t => t.trim()).filter(Boolean);
      await fetch(`/api/agents/${selectedAgent.id}/assign-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptions })
      });
      setBatchTasks('');
      fetchAgentStatus(selectedAgent.id);
    } catch (e) {
      setError('Failed to assign batch tasks');
    } finally {
      setLoading(false);
    }
  };
  const handleBroadcast = async () => {
    if (!batchTasks.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/agents/broadcast-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: batchTasks })
      });
      setBatchTasks('');
      fetchAgents();
    } catch (e) {
      setError('Failed to broadcast task');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedAgent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${selectedAgent.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: editAvatar, role: editRole })
      });
      const updated = await res.json();
      setAgents(prev => prev.map(a => a.id === updated.id ? { ...a, avatar_url: updated.avatar_url, role: updated.role } : a));
      setSelectedAgent(a => a ? { ...a, avatar_url: updated.avatar_url, role: updated.role } : a);
    } catch (e) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">Autonomous Agents</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex space-x-8">
        {/* Agent List */}
        <div className="w-1/2">
          <div className="mb-2 font-semibold">Agents</div>
          <ul className="divide-y divide-gray-200">
            {agents.map(agent => (
              <li key={agent.id} className={`py-2 px-2 rounded cursor-pointer hover:bg-cyan-50 ${selectedAgent?.id === agent.id ? 'bg-cyan-100' : ''}`}
                  onClick={() => { setSelectedAgent(agent); fetchAgentStatus(agent.id); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {agent.avatar_url && <img src={agent.avatar_url} alt="avatar" className="w-7 h-7 rounded-full border" />}
                    <span className="font-medium">{agent.name}</span>
                    {agent.role && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded ml-2">{agent.role}</span>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${agent.status === 'running' ? 'bg-green-100 text-green-700' : agent.status === 'idle' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>{agent.status}</span>
                </div>
                <div className="text-xs text-gray-400">Created: {new Date(agent.created_at).toLocaleString()}</div>
                <div className="flex space-x-2 mt-1">
                  <button className="text-xs text-green-600 hover:underline" onClick={e => { e.stopPropagation(); handleStartAgent(agent.id); }}>Start</button>
                  <button className="text-xs text-yellow-600 hover:underline" onClick={e => { e.stopPropagation(); handleStopAgent(agent.id); }}>Stop</button>
                  <button className="text-xs text-red-600 hover:underline" onClick={e => { e.stopPropagation(); handleDeleteAgent(agent.id); }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex space-x-2">
            <input
              className="border px-2 py-1 rounded w-full"
              placeholder="New agent name"
              value={newAgentName}
              onChange={e => setNewAgentName(e.target.value)}
              disabled={loading}
            />
            <input
              className="border px-2 py-1 rounded w-full"
              placeholder="Avatar URL (optional)"
              value={newAgentAvatar}
              onChange={e => setNewAgentAvatar(e.target.value)}
            />
            <select
              className="border px-2 py-1 rounded w-full"
              value={newAgentRole}
              onChange={e => setNewAgentRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Collaborator">Collaborator</option>
              <option value="Reviewer">Reviewer</option>
            </select>
            <button className="bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700" onClick={handleCreateAgent} disabled={loading}>Create</button>
          </div>
        </div>
        {/* Agent Details & Task Assignment */}
        <div className="w-1/2">
          {selectedAgent && (
            <div>
              <div className="font-semibold mb-2">Agent: {selectedAgent.name}</div>
              <div>Status: <span className={`font-bold ${selectedAgent.status === 'running' ? 'text-green-600' : selectedAgent.status === 'idle' ? 'text-gray-600' : 'text-red-600'}`}>{selectedAgent.status}</span></div>
              <div>Last Active: {selectedAgent.last_active ? new Date(selectedAgent.last_active).toLocaleString() : 'N/A'}</div>
              <div className="mt-2 flex items-center space-x-2">
                <img src={editAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedAgent.name)} alt="avatar" className="w-10 h-10 rounded-full border" />
                <input
                  className="border px-2 py-1 rounded"
                  placeholder="Avatar URL"
                  value={editAvatar}
                  onChange={e => setEditAvatar(e.target.value)}
                />
                <select
                  className="border px-2 py-1 rounded"
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Collaborator">Collaborator</option>
                  <option value="Reviewer">Reviewer</option>
                </select>
                <button className="bg-cyan-600 text-white px-3 py-1 rounded" onClick={handleSaveProfile} disabled={loading}>Save</button>
              </div>
              <div className="mt-2">
                <div className="font-medium mb-1">Assign Task</div>
                <div className="flex space-x-2">
                  <input
                    className="border px-2 py-1 rounded w-full"
                    placeholder="Task description"
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                    disabled={loading || selectedAgent.status !== 'running'}
                  />
                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={handleAssignTask} disabled={loading || selectedAgent.status !== 'running'}>Assign</button>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-medium mb-1">Batch Assign Tasks</div>
                <textarea
                  className="border px-2 py-1 rounded w-full mb-2"
                  placeholder="Enter one task per line"
                  value={batchTasks}
                  onChange={e => setBatchTasks(e.target.value)}
                  rows={3}
                  disabled={loading || (selectedAgent && selectedAgent.status !== 'running')}
                />
                <div className="flex space-x-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={handleBatchAssign} disabled={loading || !selectedAgent || selectedAgent.status !== 'running'}>Assign Batch</button>
                  <button className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600" onClick={handleBroadcast} disabled={loading}>Broadcast to All Agents</button>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-medium mb-1">Task History</div>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {selectedAgent.task_history.length === 0 ? (
                    <li className="text-gray-400">No tasks yet.</li>
                  ) : (
                    selectedAgent.task_history.map((task, idx) => <li key={idx}>{task}</li>)
                  )}
                </ul>
              </div>
              {agentStatus && (
                <div className="mt-4">
                  <div className="font-medium mb-1">Current Tasks</div>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {agentStatus.tasks.length === 0 ? (
                      <li className="text-gray-400">No current tasks.</li>
                    ) : (
                      agentStatus.tasks.map((task: AgentTask) => (
                        <li key={task.id}>
                          <span className="font-semibold">{task.description}</span> - <span className="text-xs">{task.status}</span>
                          {task.result && (
                            <div className="text-xs text-gray-500">Result: {task.result}</div>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutonomousAgentsDashboard; 