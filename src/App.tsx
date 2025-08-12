import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { JarvisProvider } from './context/JarvisContext';
import { NotificationProvider } from './components/NotificationContext';
import { HUD } from './components/HUD/HUD';
import HoloCore from './components/HoloCore';
import Sidebar from './components/Sidebar';
import { SkillsDashboard } from './components/SkillsDashboard';
import MonitoringDashboard from './components/Monitoring/MonitoringDashboard';
import AnalyticsDashboard from './components/HUD/AnalyticsDashboard';
import SystemAutomation from './components/SystemAutomation/SystemAutomation';
import { EvolutionPanel } from './components/Evolution/EvolutionPanel';
import ComprehensiveDashboard from './components/Dashboard/ComprehensiveDashboard';
import { JarvisSystem } from './components/JarvisSystem';
import VRWorkspace from './components/VRWorkspace/VRWorkspace';
import { MemoryVault } from './components/MemoryVault/MemoryVault';
import { CopyEngine } from './components/CopyEngine/CopyEngine';
import { SystemStatus } from './components/SystemStatus/SystemStatus';
import { Notifications } from './components/Notifications/Notifications';
import { AdvancedStealth } from './components/Stealth/AdvancedStealth';
import { AdvancedLearning } from './components/Learning/AdvancedLearning';
import { RealTimeCollaboration } from './components/Collaboration/RealTimeCollaboration';
import { Settings } from './components/Settings/Settings';
import { VoiceRecognition } from './components/Voice/VoiceRecognition';
import { FaceRecognition } from './components/Face/FaceRecognition';
import { TextToSpeech } from './components/TTS/TextToSpeech';
import { ModelAPIKeys } from './components/Models/ModelAPIKeys';
import { SmartHome } from './components/SmartHome/SmartHome';
import Telepresence from './components/Telepresence/Telepresence';
import PredictiveTasks from './components/PredictiveTasks/PredictiveTasks';
import EnvironmentalHealth from './components/EnvironmentalHealth/EnvironmentalHealth';
import AutonomousAgents from './components/AutonomousAgents/AutonomousAgents';
import { AuthenticationScreen } from './components/Authentication/AuthenticationScreen';
import { StatusBar } from './components/StatusBar/StatusBar';
import './styles/JarvisPanels.css';

function App() {
  const [currentView, setCurrentView] = useState('hud');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check for user in localStorage (matches JarvisContext)
    return !!localStorage.getItem('jarvis_user');
  });

  // Handler to set authentication after login/registration
  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    // Set session token for persistence
    localStorage.setItem('jarvis_session_token', 'authenticated');
  };

  // Handler to handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    // Clear all authentication data
    localStorage.removeItem('jarvis_user');
    localStorage.removeItem('jarvis_avatar');
    localStorage.removeItem('jarvis_session_token');
  };

  const renderView = () => {
    switch (currentView) {
      case 'hud':
        return <HUD
          onOpenMemoryVault={() => setCurrentView('memory')}
          onOpenCopyEngine={() => setCurrentView('copy')}
          onOpenEvolution={() => setCurrentView('evolution')}
          onOpenSystemAutomation={() => setCurrentView('automation')}
          onOpenPredictiveTasks={() => setCurrentView('predictive')}
          onOpenAIContent={() => setCurrentView('chat')}
          onOpenAdvancedStealth={() => setCurrentView('stealth')}
          onOpenAdvancedLearning={() => setCurrentView('learning')}
          onOpenEnvironmentalHealth={() => setCurrentView('envhealth')}
          onOpenCollaboration={() => setCurrentView('collaboration')}
          onOpenAutomation={() => setCurrentView('automation')}
          onOpenVRWorkspace={() => setCurrentView('vr')}
          onOpenPredictiveHealth={() => setCurrentView('predictive')}
          onOpenSmartHome={() => setCurrentView('smarthome')}
          onOpenTelepresence={() => setCurrentView('telepresence')}
          onOpenAutonomousAgents={() => setCurrentView('agents')}
          onOpenAnalytics={() => setCurrentView('analytics')}
        />;
      case 'dashboard':
        return <ComprehensiveDashboard />;
      case 'chat':
        return <JarvisSystem />;
      case 'skills':
        return <SkillsDashboard />;
      case 'monitoring':
        return <MonitoringDashboard />;
      case 'analytics':
        return <AnalyticsDashboard onClose={() => setCurrentView('hud')} />;
      case 'automation':
        return <SystemAutomation isActive={true} />;
      case 'evolution':
        return <EvolutionPanel onClose={() => setCurrentView('hud')} />;
      case 'vr':
        return <VRWorkspace />;
      case 'memory':
        return <MemoryVault />;
      case 'copy':
        return <CopyEngine />;
      case 'system':
        return <SystemStatus />;
      case 'notifications':
        return <Notifications />;
      case 'stealth':
        return <AdvancedStealth />;
      case 'learning':
        return <AdvancedLearning />;
      case 'collaboration':
        return <RealTimeCollaboration />;
      case 'settings':
        return <Settings />;
      case 'voice':
        return <VoiceRecognition />;
      case 'face':
        return <FaceRecognition />;
      case 'tts':
        return <TextToSpeech />;
      case 'model':
        return <ModelAPIKeys />;
      case 'smarthome':
        return <SmartHome />;
      case 'telepresence':
        return <Telepresence />;
      case 'predictive':
        return <PredictiveTasks />;
      case 'envhealth':
        return <EnvironmentalHealth />;
      case 'agents':
        return <AutonomousAgents />;
      // Placeholders for features not yet implemented
      default:
        return <div className="text-cyan-400 text-2xl font-bold p-12 text-center">{currentView.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Panel Coming Soon...</div>;
    }
  };

  return (
    <NotificationProvider>
      <JarvisProvider>
        <Router>
          <div className="App w-full h-screen overflow-hidden bg-black">
            {/* HoloCore - Futuristic animated background */}
            <HoloCore />
            {isAuthenticated ? (
              <>
                {/* Status Bar */}
                <StatusBar />
                {/* Sidebar Navigation */}
                <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
                {/* Main Content */}
                <div className="app-content relative z-10 ml-64 pt-12">
                  {renderView()}
                </div>
              </>
            ) : (
              <AuthenticationScreen onAuthenticated={handleAuthenticated} />
            )}
          </div>
        </Router>
      </JarvisProvider>
    </NotificationProvider>
  );
}

export default App;