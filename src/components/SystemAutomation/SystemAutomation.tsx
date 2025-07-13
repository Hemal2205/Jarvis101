import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Cpu, HardDrive, Activity, Zap, Cloud, Code, Globe, Monitor } from 'lucide-react';

interface SystemAutomationProps {
  isActive: boolean;
}

interface TaskResult {
  task_id?: string;
  status: string;
  message: string;
  result?: any;
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

const SystemAutomation: React.FC<SystemAutomationProps> = ({ isActive }) => {
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [enhancedMode, setEnhancedMode] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isActive) {
      fetchSystemStatus();
      const interval = setInterval(fetchSystemStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [results]);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setSystemStatus(data.system_info);
      setEnhancedMode(data.enhanced_mode);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  };

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

  if (!isActive) return null;

  return (
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
              onClick={() => useExampleCommand(cmd)}
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
                {result.result && (
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
  );
};

export default SystemAutomation;