// NOTE: If you see errors about missing types for 'react' or 'lucide-react', run:
//   npm install --save-dev @types/react @types/lucide-react
import React, { useEffect, useState, useRef } from "react";
import { Send, Terminal, Cpu, HardDrive, Activity, Zap, Cloud, Code, Globe, Monitor } from 'lucide-react';
import { useNotification } from '../NotificationContext';

// Define interfaces for Task, TaskResult, and SystemStatus
interface Task {
  id: number;
  user_id: number;
  description: string;
  status: string;
  result?: unknown;
  created_at: string;
  completed_at?: string;
}

interface SystemAutomationProps {
  isActive: boolean;
}

interface TaskResult {
  task_id?: string;
  status: string;
  message: string;
  result?: unknown;
  execution_time?: number;
  error?: string;
}

interface SystemStatus {
  cpu_percent: number;
  memory_percent: number;
  disk_usage: number;
  running_processes: number;
  status: string;
}

// Add status icon helper
const statusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return "⏳";
    case "running":
      return "🔄";
    case "completed":
      return "✅";
    case "failed":
      return "❌";
    default:
      return "•";
  }
};

const SystemAutomation: React.FC<SystemAutomationProps> = ({ isActive }: SystemAutomationProps) => {
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [enhancedMode, setEnhancedMode] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const taskPollingRef = useRef<number | null>(null);
  // Add state for taskSteps and polling
  const [taskSteps, setTaskSteps] = useState<string[]>([]);
  const stepsPollingRef = useRef<number | null>(null);
  const { notify } = useNotification();
  const shownNotificationIds = useRef<Set<number>>(new Set());

  const exampleCommands = [
    "Create pipeline for solar plants usage in Ontario",
    "Open Chrome and navigate to AWS Console",
    "Deploy a Lambda function for data processing",
    "Generate Python code for weather analysis",
    "Monitor system resources",
    "Create S3 bucket for data storage",
    "Run system diagnostic",
    "Launch VS Code and create new project"
  ];

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setSystemStatus(data.system_info);
      setEnhancedMode(data.enhanced_mode);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      notify('Failed to fetch system status', 'error');
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchSystemStatus();
      const interval = window.setInterval(fetchSystemStatus, 5000);
      return () => window.clearInterval(interval);
    }
  }, [isActive, fetchSystemStatus]);

  // Poll tasks from /api/tasks every 5 seconds
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        notify('Failed to fetch task updates', 'error');
      }
    };
    fetchTasks();
    taskPollingRef.current = window.setInterval(fetchTasks, 5000);
    return () => {
      if (taskPollingRef.current) window.clearInterval(taskPollingRef.current);
    };
  }, [notify]);

  // Add effect to show toast when a task completes or fails
  useEffect(() => {
    tasks.forEach((task) => {
      if ((task.status === 'completed' || task.status === 'failed') && !shownNotificationIds.current.has(task.id)) {
        notify(
          `Task "${task.description}" ${task.status === 'completed' ? 'completed successfully' : 'failed'}.`,
          task.status === 'completed' ? 'success' : 'error'
        );
        shownNotificationIds.current.add(task.id);
      }
    });
  }, [tasks, notify]);

  // Poll backend notifications and show as toasts
  useEffect(() => {
    const seenBackendIds = new Set<number>();
    const pollNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        (data.notifications || []).forEach((n: unknown) => {
          const notification = n as { id: number; message: string; is_read: boolean };
          if (!seenBackendIds.has(notification.id)) {
            notify(notification.message, notification.is_read ? 'info' : 'success');
            seenBackendIds.add(notification.id);
          }
        });
      } catch (error) {
        console.error('Failed to poll notifications:', error);
        // Silently fail for notification polling
      }
    };
    pollNotifications();
    const interval = window.setInterval(pollNotifications, 10000);
    return () => window.clearInterval(interval);
  }, [notify]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [results]);

  useEffect(() => {
    if (selectedTask && selectedTask.status === 'running') {
      const fetchSteps = async () => {
        try {
          const res = await fetch(`/api/tasks/${selectedTask.id}`);
          const data = await res.json();
          setTaskSteps(data.task?.steps || []);
        } catch (error) {
          console.error('Failed to fetch task steps:', error);
          setTaskSteps([]);
        }
      };
      fetchSteps();
      stepsPollingRef.current = window.setInterval(fetchSteps, 2000);
      return () => {
        if (stepsPollingRef.current) window.clearInterval(stepsPollingRef.current);
      };
    } else {
      setTaskSteps([]);
      if (stepsPollingRef.current) window.clearInterval(stepsPollingRef.current);
    }
  }, [selectedTask]);

  const executeCommand = async () => {
    if (!command.trim() || isExecuting) return;

    setIsExecuting(true);
    
    // Add command to results immediately
    const commandResult: TaskResult = {
      status: 'executing',
      message: `> ${command}`,
    };
    setResults(prev => [...prev, commandResult]);

    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: command,
          context: {
            timestamp: new Date().toISOString(),
            enhanced_mode: enhancedMode
          }
        }),
      });

      const result = await response.json();
      
      setResults(prev => [...prev, {
        ...result,
        message: result.message || result.response || 'Command executed successfully'
      }]);

      // If it's a complex task, also try the execute-task endpoint
      if (command.toLowerCase().includes('create') || 
          command.toLowerCase().includes('deploy') || 
          command.toLowerCase().includes('build')) {
        
        const taskResponse = await fetch('/api/execute-task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            description: command
          }),
        });

        const taskResult = await taskResponse.json();
        
        setResults(prev => [...prev, {
          ...taskResult,
          message: `Task Execution: ${taskResult.status}`,
        }]);
      }

    } catch (error) {
      console.error('Command execution failed:', error);
      setResults(prev => [...prev, {
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsExecuting(false);
      setCommand('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  const useExampleCommand = (exampleCommand: string) => {
    setCommand(exampleCommand);
  };

  const clearTerminal = () => {
    setResults([]);
  };

  // Create a handler for example command clicks to avoid hook rule violation
  const handleExampleCommandClick = (cmd: string) => {
    useExampleCommand(cmd);
  };

  if (!isActive) return null;

  return (
    <div className="flex w-full h-full">
      {/* Main automation UI */}
      <div className="flex-1 flex flex-col">
        <div className="h-full bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Terminal className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-cyan-400">System Automation</h2>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                enhancedMode 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {enhancedMode ? 'Enhanced Mode' : 'Placeholder Mode'}
              </div>
            </div>
            <button
              onClick={clearTerminal}
              className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* System Status */}
          {systemStatus && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">CPU</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {systemStatus.cpu_percent?.toFixed(1) || 'N/A'}%
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Memory</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {systemStatus.memory_percent?.toFixed(1) || 'N/A'}%
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Disk</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {systemStatus.disk_usage?.toFixed(1) || 'N/A'}%
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Processes</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {systemStatus.running_processes || 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Capabilities */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Available Capabilities</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center space-x-2 bg-gray-900/30 border border-gray-700 rounded p-2">
                <Cloud className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">AWS Operations</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-900/30 border border-gray-700 rounded p-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Browser Control</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-900/30 border border-gray-700 rounded p-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Desktop Control</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-900/30 border border-gray-700 rounded p-2">
                <Code className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Code Generation</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-900/30 border border-gray-700 rounded p-2">
                <Terminal className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">System Commands</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-900/30 border border-gray-700 rounded p-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-300">Process Automation</span>
              </div>
            </div>
          </div>

          {/* Example Commands */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Example Commands</h3>
            <div className="grid grid-cols-2 gap-2">
              {exampleCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleCommandClick(cmd)}
                  className="text-left text-sm bg-gray-900/30 border border-gray-700 rounded p-2 hover:bg-gray-800/50 hover:border-cyan-500/50 transition-colors text-gray-300"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Output */}
          <div className="mb-4">
            <div
              ref={terminalRef}
              className="bg-black border border-gray-700 rounded h-64 overflow-y-auto p-4 font-mono text-sm"
            >
              {results.length === 0 ? (
                <div className="text-gray-500">
                  Ready for commands. Type a command or click an example above.
                </div>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-2">
                    <div className={`${
                      result.status === 'success' ? 'text-green-400' :
                      result.status === 'error' ? 'text-red-400' :
                      result.status === 'executing' ? 'text-yellow-400' :
                      'text-cyan-400'
                    }`}>
                      {result.message}
                    </div>
                    {result.result !== undefined && result.result !== null && (
                      <div className="text-gray-300 ml-4 mt-1">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.execution_time && (
                      <div className="text-gray-500 text-xs mt-1">
                        Execution time: {result.execution_time}s
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Command Input */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter command (e.g., 'Create pipeline for solar plants usage in Ontario')"
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                disabled={isExecuting}
              />
              {isExecuting && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                </div>
              )}
            </div>
            <button
              onClick={executeCommand}
              disabled={!command.trim() || isExecuting}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Execute</span>
            </button>
          </div>

          {/* Status indicator */}
          <div className="mt-4 text-center">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
              enhancedMode 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                enhancedMode ? 'bg-green-400' : 'bg-yellow-400'
              } ${isExecuting ? 'animate-pulse' : ''}`}></div>
              <span>
                {isExecuting ? 'Executing...' : 
                 enhancedMode ? 'Full System Control Active' : 'Placeholder Mode Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Task History Panel */}
      <div className="w-80 border-l border-gray-300 bg-gray-50 flex flex-col">
        <div className="p-4 font-bold text-lg border-b">Task History</div>
        <div className="flex-1 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="p-4 text-gray-400">No tasks yet.</div>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-200 ${selectedTask && selectedTask.id === task.id ? "bg-gray-200" : ""}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <span className="mr-2">{statusIcon(task.status)}</span>
                  <span className="flex-1 truncate">{task.description}</span>
                  <span className="ml-2 text-xs text-gray-500">{task.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Task Details */}
        {selectedTask && (
          <div className="border-t p-4 bg-white">
            <div className="font-semibold mb-1">Task Details</div>
            <div><b>Description:</b> {selectedTask.description}</div>
            <div><b>Status:</b> {selectedTask.status}</div>
            <div><b>Result:</b> <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">{selectedTask.result ? JSON.stringify(selectedTask.result, null, 2) : "(none)"}</pre></div>
            <div><b>Created:</b> {selectedTask.created_at}</div>
            {selectedTask.completed_at && <div><b>Completed:</b> {selectedTask.completed_at}</div>}
            {/* Add step-by-step execution visualization in Task Details */}
            {selectedTask.status === 'running' && (
              <div className="mt-4">
                <div className="font-semibold mb-1">Steps</div>
                {taskSteps.length > 0 ? (
                  <ol className="list-decimal ml-6">
                    {taskSteps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                ) : (
                  <span className="text-gray-400">No steps available.</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAutomation;