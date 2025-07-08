import React, { createContext, useContext, useState, useEffect } from 'react';

export type JarvisMode = 'full' | 'stealth-interview' | 'stealth-exam' | 'passive-copilot';

interface JarvisState {
  mode: JarvisMode;
  isActive: boolean;
  isAuthenticated: boolean;
  currentUser: string;
  systemStatus: {
    brain: boolean;
    security: boolean;
    memory: boolean;
    copyEngine: boolean;
  };
  memories: Array<{
    id: string;
    date: string;
    content: string;
    type: 'voice' | 'text' | 'image';
    emotion: string;
  }>;
  copies: Array<{
    id: string;
    name: string;
    created: string;
    status: 'active' | 'disabled';
    owner: string;
  }>;
}

interface JarvisContextType {
  state: JarvisState;
  setMode: (mode: JarvisMode) => void;
  authenticate: (method: 'face' | 'voice') => Promise<boolean>;
  recordMemory: (content: string, type: 'voice' | 'text' | 'image') => void;
  playMemory: (id: string) => void;
  createCopy: (name: string) => Promise<string>;
  killSwitch: () => void;
}

const JarvisContext = createContext<JarvisContextType | undefined>(undefined);

export const useJarvis = () => {
  const context = useContext(JarvisContext);
  if (!context) {
    throw new Error('useJarvis must be used within a JarvisProvider');
  }
  return context;
};

export const JarvisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<JarvisState>({
    mode: 'full',
    isActive: false,
    isAuthenticated: false,
    currentUser: 'Hemal',
    systemStatus: {
      brain: true,
      security: true,
      memory: true,
      copyEngine: true,
    },
    memories: [],
    copies: [],
  });

  useEffect(() => {
    // Load initial data when component mounts
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Check if backend is available
      const response = await fetch('http://localhost:8000/api/status');
      if (response.ok) {
        const status = await response.json();
        setState(prev => ({
          ...prev,
          systemStatus: {
            brain: status.brain?.active || false,
            security: status.security?.authenticated_users >= 0,
            memory: status.memory?.total_memories >= 0,
            copyEngine: status.evolution?.total_copies >= 0,
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Continue with default state if backend is not available
    }
  };

  const setMode = async (mode: JarvisMode) => {
    try {
      setState(prev => ({ ...prev, mode }));
      
      // Send mode change to backend if available
      await fetch('http://localhost:8000/api/stealth/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode, user: state.currentUser }),
      });
    } catch (error) {
      console.error('Failed to set mode:', error);
      // Mode change still works locally even if backend is unavailable
    }
  };

  const authenticate = async (method: 'face' | 'voice'): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method, user: state.currentUser }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({ ...prev, isAuthenticated: true, isActive: true }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication failed:', error);
      // For demo purposes, allow authentication to succeed even if backend is down
      setState(prev => ({ ...prev, isAuthenticated: true, isActive: true }));
      return true;
    }
  };

  const recordMemory = async (content: string, type: 'voice' | 'text' | 'image') => {
    const memory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content,
      type,
      emotion: 'neutral',
    };
    
    try {
      const response = await fetch('http://localhost:8000/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, type, user: state.currentUser }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.memory) {
          setState(prev => ({
            ...prev,
            memories: [...prev.memories, {
              id: result.memory.id,
              date: result.memory.timestamp,
              content: result.memory.content,
              type: result.memory.type,
              emotion: result.memory.emotion
            }]
          }));
        }
      }
    } catch (error) {
      console.error('Failed to record memory:', error);
      // Add memory locally even if backend is unavailable
      setState(prev => ({
        ...prev,
        memories: [...prev.memories, memory]
      }));
    }
  };

  const playMemory = (id: string) => {
    const memory = state.memories.find(m => m.id === id);
    if (memory) {
      // Text-to-speech for memory playback
      const utterance = new SpeechSynthesisUtterance(memory.content);
      speechSynthesis.speak(utterance);
    }
  };

  const createCopy = async (name: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:8000/api/copy/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, creator: state.currentUser, type: 'standard' }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const newCopy = {
          id: result.copy_id,
          name: result.name,
          created: new Date().toISOString(),
          status: 'active' as const,
          owner: state.currentUser
        };
        
        setState(prev => ({
          ...prev,
          copies: [...prev.copies, newCopy]
        }));
        
        return result.download_url;
      }
      
      throw new Error(result.error || 'Failed to create copy');
    } catch (error) {
      console.error('Copy creation failed:', error);
      throw error;
    }
  };

  const killSwitch = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isAuthenticated: false,
      memories: [],
    }));
  };

  const value: JarvisContextType = {
    state,
    setMode,
    authenticate,
    recordMemory,
    playMemory,
    createCopy,
    killSwitch,
  };

  return (
    <JarvisContext.Provider value={value}>
      {children}
    </JarvisContext.Provider>
  );
};