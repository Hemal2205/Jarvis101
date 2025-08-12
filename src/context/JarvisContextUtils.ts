import { createContext, useContext } from 'react';

export type JarvisMode = 'full' | 'stealth-interview' | 'stealth-exam' | 'passive-copilot';

interface JarvisState {
  mode: JarvisMode;
  isActive: boolean;
  isAuthenticated: boolean;
  currentUser: string;
  avatarUrl: string;
  systemStatus: {
    brain: boolean;
    security: boolean;
    memory: boolean;
    copyEngine: boolean;
  };
  memories: unknown[];
  copies: unknown[];
}

interface JarvisContextType {
  state: JarvisState;
  setMode: (mode: JarvisMode) => void;
  authenticate: (method: 'face' | 'voice') => Promise<boolean>;
  recordMemory: (content: string, type: 'voice' | 'text' | 'image') => void;
  playMemory: (id: string) => void;
  createCopy: (name: string) => Promise<string>;
  killSwitch: () => void;
  setCurrentUser: (username: string) => void;
  login: (username: string) => Promise<void>;
  logout: () => void;
  avatarUrl: string;
}

export const JarvisContext = createContext<JarvisContextType | undefined>(undefined);

export const useJarvis = () => {
  const context = useContext(JarvisContext);
  if (!context) {
    throw new Error('useJarvis must be used within a JarvisProvider');
  }
  return context;
}; 