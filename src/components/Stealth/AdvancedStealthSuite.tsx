import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  Unlock, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor,
  MonitorOff,
  Key,
  Database,
  Settings,
  AlertTriangle,
  CheckCircle,
  X,
  Zap,
  User,
  Users,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  Camera,
  CameraOff,
  HardDrive,
  Cloud,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  MapPin,
  ShieldCheck,
  Fingerprint,
  Plus
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

// Stealth Modes
type StealthMode = 'invisible' | 'minimal' | 'privacy' | 'secure' | 'offline';

// Privacy Levels
type PrivacyLevel = 'public' | 'private' | 'confidential' | 'secret' | 'ultra-secret';

// Device Types
type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'phone' | 'watch';

// Security Status
interface SecurityStatus {
  encryption_enabled: boolean;
  vpn_active: boolean;
  firewall_enabled: boolean;
  biometric_locked: boolean;
  privacy_mode: PrivacyLevel;
  stealth_mode: StealthMode;
  last_security_scan: string;
  threats_detected: number;
  data_breach_risk: 'low' | 'medium' | 'high';
}

// Privacy Settings
interface PrivacySettings {
  screen_recording: {
    enabled: boolean;
    blur_sensitive_content: boolean;
    auto_hide_notifications: boolean;
    record_audio: boolean;
  };
  voice_commands: {
    enabled: boolean;
    encryption_level: 'basic' | 'advanced' | 'military';
    local_processing: boolean;
    voice_biometrics: boolean;
  };
  context_awareness: {
    enabled: boolean;
    auto_hide_sensitive_windows: boolean;
    detect_people_nearby: boolean;
    location_based_privacy: boolean;
  };
  data_vault: {
    enabled: boolean;
    encryption_type: 'AES-256' | 'ChaCha20' | 'Twofish';
    auto_backup: boolean;
    cloud_sync: boolean;
  };
  device_control: {
    camera_control: boolean;
    microphone_control: boolean;
    screen_control: boolean;
    network_control: boolean;
  };
}

// Privacy Event
interface PrivacyEvent {
  id: string;
  type: 'screenshot' | 'voice_command' | 'data_access' | 'location_detected' | 'person_detected';
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action_taken: string;
  device: DeviceType;
  location?: string;
}

// Secure Data Item
interface SecureDataItem {
  id: string;
  name: string;
  type: 'password' | 'document' | 'image' | 'video' | 'audio' | 'note';
  size: number;
  encrypted: boolean;
  access_level: PrivacyLevel;
  created_at: string;
  last_accessed: string;
  tags: string[];
  description: string;
}

interface AdvancedStealthSuiteProps {
  isActive: boolean;
  onClose?: () => void;
}

export const AdvancedStealthSuite: React.FC<AdvancedStealthSuiteProps> = ({ 
  isActive, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'privacy' | 'stealth' | 'vault' | 'devices' | 'events'>('overview');
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [privacyEvents, setPrivacyEvents] = useState<PrivacyEvent[]>([]);
  const [secureData, setSecureData] = useState<SecureDataItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [currentStealthMode, setCurrentStealthMode] = useState<StealthMode>('minimal');
  const [currentPrivacyLevel, setCurrentPrivacyLevel] = useState<PrivacyLevel>('private');
  const [isScanning, setIsScanning] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { notify } = useNotification();

  // Refs for media streams
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      loadSecurityStatus();
      loadPrivacySettings();
      loadPrivacyEvents();
      loadSecureData();
    }
  }, [isActive]);

  const loadSecurityStatus = async () => {
    try {
      const response = await fetch('/api/stealth/security-status');
      const data = await response.json();
      if (data.success) {
        setSecurityStatus(data.status);
        setCurrentStealthMode(data.status.stealth_mode);
        setCurrentPrivacyLevel(data.status.privacy_mode);
      }
    } catch (error) {
      console.error('Failed to load security status:', error);
    }
  };

  const loadPrivacySettings = async () => {
    try {
      const response = await fetch('/api/stealth/privacy-settings');
      const data = await response.json();
      if (data.success) {
        setPrivacySettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  const loadPrivacyEvents = async () => {
    try {
      const response = await fetch('/api/stealth/privacy-events');
      const data = await response.json();
      if (data.success) {
        setPrivacyEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to load privacy events:', error);
    }
  };

  const loadSecureData = async () => {
    try {
      const response = await fetch('/api/stealth/secure-data');
      const data = await response.json();
      if (data.success) {
        setSecureData(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load secure data:', error);
    }
  };

  const toggleStealthMode = async (mode: StealthMode) => {
    try {
      const response = await fetch('/api/stealth/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentStealthMode(mode);
        notify(`Stealth mode changed to ${mode}`, 'success');
        await loadSecurityStatus();
      }
    } catch (error) {
      console.error('Failed to change stealth mode:', error);
      notify('Failed to change stealth mode', 'error');
    }
  };

  const togglePrivacyLevel = async (level: PrivacyLevel) => {
    try {
      const response = await fetch('/api/stealth/privacy-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentPrivacyLevel(level);
        notify(`Privacy level changed to ${level}`, 'success');
        await loadSecurityStatus();
      }
    } catch (error) {
      console.error('Failed to change privacy level:', error);
      notify('Failed to change privacy level', 'error');
    }
  };

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: privacySettings?.screen_recording.record_audio || false
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        if (videoRef.current) {
          videoRef.current.src = url;
        }
        // Auto-encrypt the recording
        encryptRecording(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      notify('Screen recording started (invisible mode)', 'success');
    } catch (error) {
      console.error('Failed to start screen recording:', error);
      notify('Failed to start screen recording', 'error');
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      notify('Screen recording stopped and encrypted', 'success');
    }
  };

  const encryptRecording = async (blob: Blob) => {
    setIsEncrypting(true);
    try {
      const formData = new FormData();
      formData.append('recording', blob);
      formData.append('encryption_level', privacySettings?.data_vault.encryption_type || 'AES-256');

      const response = await fetch('/api/stealth/encrypt-recording', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        notify('Recording encrypted and stored securely', 'success');
      }
    } catch (error) {
      console.error('Failed to encrypt recording:', error);
      notify('Failed to encrypt recording', 'error');
    } finally {
      setIsEncrypting(false);
    }
  };

  const toggleVoiceCommands = async () => {
    try {
      const response = await fetch('/api/stealth/voice-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enabled: !isVoiceActive,
          encryption_level: privacySettings?.voice_commands.encryption_level || 'advanced'
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsVoiceActive(!isVoiceActive);
        notify(`Voice commands ${!isVoiceActive ? 'enabled' : 'disabled'} with encryption`, 'success');
      }
    } catch (error) {
      console.error('Failed to toggle voice commands:', error);
      notify('Failed to toggle voice commands', 'error');
    }
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/stealth/security-scan', {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        notify(`Security scan completed. ${data.threats_detected} threats found.`, 'success');
        await loadSecurityStatus();
      }
    } catch (error) {
      console.error('Failed to run security scan:', error);
      notify('Failed to run security scan', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const getStealthModeColor = (mode: StealthMode) => {
    switch (mode) {
      case 'invisible': return 'text-purple-400 bg-purple-500/10';
      case 'minimal': return 'text-green-400 bg-green-500/10';
      case 'privacy': return 'text-blue-400 bg-blue-500/10';
      case 'secure': return 'text-orange-400 bg-orange-500/10';
      case 'offline': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getPrivacyLevelColor = (level: PrivacyLevel) => {
    switch (level) {
      case 'public': return 'text-red-400 bg-red-500/10';
      case 'private': return 'text-orange-400 bg-orange-500/10';
      case 'confidential': return 'text-yellow-400 bg-yellow-500/10';
      case 'secret': return 'text-blue-400 bg-blue-500/10';
      case 'ultra-secret': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border border-cyan-500/30 rounded-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Advanced Stealth Suite</h1>
              <p className="text-gray-400 text-sm">Invisible protection with military-grade privacy</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={runSecurityScan}
              disabled={isScanning}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isScanning ? 'Scanning...' : 'Security Scan'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-4 bg-gray-800/50">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'privacy', label: 'Privacy', icon: Lock },
            { id: 'stealth', label: 'Stealth', icon: Eye },
            { id: 'vault', label: 'Secure Vault', icon: Database },
            { id: 'devices', label: 'Devices', icon: Smartphone },
            { id: 'events', label: 'Events', icon: AlertTriangle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
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
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Security Status */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-400">Security Status</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {securityStatus?.threats_detected === 0 ? 'Secure' : 'At Risk'}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400">Encryption</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {securityStatus?.encryption_enabled ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-400">VPN</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {securityStatus?.vpn_active ? 'Connected' : 'Disconnected'}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Fingerprint className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-400">Biometric</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {securityStatus?.biometric_locked ? 'Locked' : 'Unlocked'}
                      </div>
                    </div>
                  </div>

                  {/* Current Modes */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Stealth Mode</h3>
                      <div className="space-y-3">
                        {(['invisible', 'minimal', 'privacy', 'secure', 'offline'] as StealthMode[]).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => toggleStealthMode(mode)}
                            className={`w-full p-3 rounded-lg border transition-colors flex items-center justify-between ${
                              currentStealthMode === mode
                                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                            }`}
                          >
                            <span className="capitalize">{mode}</span>
                            {currentStealthMode === mode && <CheckCircle className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Privacy Level</h3>
                      <div className="space-y-3">
                        {(['public', 'private', 'confidential', 'secret', 'ultra-secret'] as PrivacyLevel[]).map((level) => (
                          <button
                            key={level}
                            onClick={() => togglePrivacyLevel(level)}
                            className={`w-full p-3 rounded-lg border transition-colors flex items-center justify-between ${
                              currentPrivacyLevel === level
                                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                            }`}
                          >
                            <span className="capitalize">{level.replace('-', ' ')}</span>
                            {currentPrivacyLevel === level && <CheckCircle className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={isRecording ? stopScreenRecording : startScreenRecording}
                        className={`p-4 rounded-lg border transition-colors flex flex-col items-center space-y-2 ${
                          isRecording
                            ? 'border-red-500 bg-red-500/20 text-red-400'
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {isRecording ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        <span className="text-sm">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                      </button>

                      <button
                        onClick={toggleVoiceCommands}
                        className={`p-4 rounded-lg border transition-colors flex flex-col items-center space-y-2 ${
                          isVoiceActive
                            ? 'border-green-500 bg-green-500/20 text-green-400'
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {isVoiceActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        <span className="text-sm">{isVoiceActive ? 'Voice Active' : 'Voice Inactive'}</span>
                      </button>

                      <button
                        className="p-4 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 transition-colors flex flex-col items-center space-y-2"
                      >
                        <Database className="w-6 h-6" />
                        <span className="text-sm">Secure Vault</span>
                      </button>
                    </div>
                  </div>

                  {/* Hidden Video Element for Recording */}
                  <video
                    ref={videoRef}
                    className="hidden"
                    controls
                    autoPlay
                    muted
                  />
                  <audio
                    ref={audioRef}
                    className="hidden"
                    controls
                    autoPlay
                    muted
                  />
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Privacy Controls</h3>
                  
                  {privacySettings && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                        <h4 className="font-medium text-white mb-4">Screen Recording</h4>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={privacySettings.screen_recording.enabled}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                screen_recording: {
                                  ...privacySettings.screen_recording,
                                  enabled: e.target.checked
                                }
                              })}
                              className="rounded border-gray-600 bg-gray-700 text-cyan-400"
                            />
                            <span className="text-gray-300">Enable Recording</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={privacySettings.screen_recording.blur_sensitive_content}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                screen_recording: {
                                  ...privacySettings.screen_recording,
                                  blur_sensitive_content: e.target.checked
                                }
                              })}
                              className="rounded border-gray-600 bg-gray-700 text-cyan-400"
                            />
                            <span className="text-gray-300">Blur Sensitive Content</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={privacySettings.screen_recording.auto_hide_notifications}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                screen_recording: {
                                  ...privacySettings.screen_recording,
                                  auto_hide_notifications: e.target.checked
                                }
                              })}
                              className="rounded border-gray-600 bg-gray-700 text-cyan-400"
                            />
                            <span className="text-gray-300">Auto-hide Notifications</span>
                          </label>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                        <h4 className="font-medium text-white mb-4">Voice Commands</h4>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={privacySettings.voice_commands.enabled}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                voice_commands: {
                                  ...privacySettings.voice_commands,
                                  enabled: e.target.checked
                                }
                              })}
                              className="rounded border-gray-600 bg-gray-700 text-cyan-400"
                            />
                            <span className="text-gray-300">Enable Voice Commands</span>
                          </label>
                          <select
                            value={privacySettings.voice_commands.encryption_level}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              voice_commands: {
                                ...privacySettings.voice_commands,
                                encryption_level: e.target.value as any
                              }
                            })}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                          >
                            <option value="basic">Basic Encryption</option>
                            <option value="advanced">Advanced Encryption</option>
                            <option value="military">Military Grade</option>
                          </select>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={privacySettings.voice_commands.local_processing}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                voice_commands: {
                                  ...privacySettings.voice_commands,
                                  local_processing: e.target.checked
                                }
                              })}
                              className="rounded border-gray-600 bg-gray-700 text-cyan-400"
                            />
                            <span className="text-gray-300">Local Processing Only</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stealth' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Stealth Features</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Invisible Mode</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Complete invisibility with undetectable assistance
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">No visible UI elements</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Silent operation</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Background processing</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Context Awareness</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Smart privacy controls based on environment
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Auto-hide sensitive content</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Person detection</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Location-based privacy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vault' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-cyan-400">Secure Data Vault</h3>
                    <button className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add Data
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {secureData.map((item) => (
                      <div key={item.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Database className="w-5 h-5 text-cyan-400" />
                            <span className={`px-2 py-1 rounded text-xs ${getPrivacyLevelColor(item.access_level)}`}>
                              {item.access_level}
                            </span>
                          </div>
                          {item.encrypted && <Lock className="w-4 h-4 text-green-400" />}
                        </div>
                        <h4 className="font-medium text-white mb-2">{item.name}</h4>
                        <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Size: {(item.size / 1024).toFixed(1)} KB</div>
                          <div>Type: {item.type}</div>
                          <div>Last accessed: {new Date(item.last_accessed).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'devices' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Device Control</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Camera Control</h4>
                      <div className="space-y-3">
                        <button className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                          <CameraOff className="w-4 h-4" />
                          <span>Disable All Cameras</span>
                        </button>
                        <button className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                          <Camera className="w-4 h-4" />
                          <span>Enable Cameras</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Microphone Control</h4>
                      <div className="space-y-3">
                        <button className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                          <MicOff className="w-4 h-4" />
                          <span>Disable All Mics</span>
                        </button>
                        <button className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                          <Mic className="w-4 h-4" />
                          <span>Enable Microphones</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Privacy Events</h3>
                  
                  <div className="space-y-3">
                    {privacyEvents.map((event) => (
                      <div key={event.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className={`w-4 h-4 ${getSeverityColor(event.severity)}`} />
                            <span className="font-medium text-white">{event.type.replace('_', ' ')}</span>
                            <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(event.severity)}`}>
                              {event.severity}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Action: {event.action_taken}</span>
                          <span>Device: {event.device}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}; 