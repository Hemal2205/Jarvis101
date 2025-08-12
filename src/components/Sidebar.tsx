import React, { useState } from 'react';
import {
  Home, MessageSquare, Brain, BookOpen, Database, Copy, BarChart3, Bell, Settings, Shield, Zap, Activity, Users, Video, Eye, Mic, Volume2, Key, Star, TrendingUp, Clock, UserCheck, Target, PenTool, Box, Heart, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { useJarvis } from '../context/JarvisContext';

const features = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'chat', label: 'Chat Interface', icon: MessageSquare },
  { key: 'skills', label: 'Skills', icon: BookOpen },
  { key: 'memory', label: 'Memory Vault', icon: Database },
  { key: 'copy', label: 'Copy Engine', icon: Copy },
  { key: 'system', label: 'System Status', icon: Brain },
  { key: 'monitoring', label: 'Monitoring', icon: Activity },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'automation', label: 'System Automation', icon: Zap },
  { key: 'evolution', label: 'Evolution', icon: Star },
  { key: 'stealth', label: 'Advanced Stealth', icon: Shield },
  { key: 'learning', label: 'Advanced Learning', icon: PenTool },
  { key: 'collaboration', label: 'Collaboration', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'voice', label: 'Voice Recognition', icon: Mic },
  { key: 'face', label: 'Face Recognition', icon: Eye },
  { key: 'tts', label: 'TTS', icon: Volume2 },
  { key: 'model', label: 'Model/API Keys', icon: Key },
  { key: 'smarthome', label: 'Smart Home', icon: Home },
  { key: 'vr', label: 'VR Workspace', icon: Box },
  { key: 'telepresence', label: 'Telepresence', icon: Video },
  { key: 'predictive', label: 'Predictive Tasks', icon: Target },
  { key: 'envhealth', label: 'Environmental Health', icon: Heart },
  { key: 'agents', label: 'Autonomous Agents', icon: UserCheck },
];

export default function Sidebar({ currentView, setCurrentView }: { currentView: string, setCurrentView: (v: string) => void }) {
  const [open, setOpen] = useState(true);
  const { logout, state } = useJarvis();

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to logout from J.A.R.V.I.S?');
    if (confirmed) {
      logout();
      // Clear session token
      localStorage.removeItem('jarvis_session_token');
      // Reload the page to return to login screen
      window.location.reload();
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full ${open ? 'w-64' : 'w-16'} bg-gradient-to-br from-cyan-900/60 to-blue-900/60 backdrop-blur-xl border-r border-cyan-400/20 shadow-2xl z-50 flex flex-col py-8 px-2 glass-neon transition-all duration-300`}
      style={{ overflowY: 'auto' }}
    >
      <div className="mb-8 text-center flex items-center justify-between px-2">
        {open && (
          <div>
            <div className="text-3xl font-extrabold text-cyan-300 tracking-widest drop-shadow-lg">J.A.R.V.I.S</div>
            <div className="text-xs text-cyan-100/70 mt-1">AI Assistant</div>
            {state.currentUser && (
              <div className="text-xs text-cyan-200/80 mt-2">
                Logged in as: {state.currentUser}
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-auto p-1 rounded hover:bg-cyan-800/30 transition-colors"
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {open ? <ChevronLeft className="w-5 h-5 text-cyan-300" /> : <ChevronRight className="w-5 h-5 text-cyan-300" />}
        </button>
      </div>
      <nav className="flex-1 space-y-2">
        {features.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key)}
            className={`w-full flex items-center space-x-3 px-2 py-3 rounded-lg transition-all font-medium text-left border border-transparent hover:border-cyan-400/40 hover:bg-cyan-800/20 hover:text-cyan-200 ${currentView === key ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-100 shadow-lg' : 'text-cyan-300'}`}
            title={label}
          >
            <Icon className="w-5 h-5" />
            {open && <span>{label}</span>}
          </button>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="mt-4 mb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-2 py-3 rounded-lg transition-all font-medium text-left border border-red-500/30 hover:border-red-400/60 hover:bg-red-800/20 hover:text-red-200 text-red-300"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          {open && <span>Logout</span>}
        </button>
      </div>
      
      <div className="mt-4 text-xs text-cyan-200/60 text-center">
        {open && <>&copy; {new Date().getFullYear()} JARVIS AI</>}
      </div>
    </div>
  );
} 