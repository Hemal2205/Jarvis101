import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  CameraOff, 
  User, 
  UserCheck, 
  UserX, 
  Users, 
  Settings, 
  History, 
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Shield,
  Zap,
  Brain,
  Lock,
  Unlock
} from 'lucide-react';

interface FaceProfile {
  id: string;
  name: string;
  confidence: number;
  lastSeen: Date;
  status: 'recognized' | 'unknown' | 'blocked';
  accessLevel: 'admin' | 'user' | 'guest' | 'blocked';
  imageUrl?: string;
}

interface RecognitionEvent {
  id: string;
  profile: string;
  timestamp: Date;
  confidence: number;
  action: 'login' | 'access_denied' | 'detected' | 'registered';
  location: string;
}

const mockProfiles: FaceProfile[] = [
  {
    id: '1',
    name: 'Hemal Patel',
    confidence: 98.5,
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    status: 'recognized',
    accessLevel: 'admin',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwOEE2RjYiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo='
  },
  {
    id: '2',
    name: 'Sarah Chen',
    confidence: 94.2,
    lastSeen: new Date(Date.now() - 15 * 60 * 1000),
    status: 'recognized',
    accessLevel: 'user',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiVFQzU5Q0Y5QjIiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo='
  },
  {
    id: '3',
    name: 'Unknown Person',
    confidence: 67.8,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    status: 'unknown',
    accessLevel: 'blocked',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGNTU1NTUiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo='
  }
];

const mockEvents: RecognitionEvent[] = [
  {
    id: '1',
    profile: 'Hemal Patel',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    confidence: 98.5,
    action: 'login',
    location: 'Main Entrance'
  },
  {
    id: '2',
    profile: 'Sarah Chen',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    confidence: 94.2,
    action: 'detected',
    location: 'Office Area'
  },
  {
    id: '3',
    profile: 'Unknown Person',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    confidence: 67.8,
    action: 'access_denied',
    location: 'Secure Zone'
  },
  {
    id: '4',
    profile: 'Hemal Patel',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    confidence: 96.1,
    action: 'login',
    location: 'System Access'
  }
];

export const FaceRecognition: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [profiles, setProfiles] = useState<FaceProfile[]>(mockProfiles);
  const [events, setEvents] = useState<RecognitionEvent[]>(mockEvents);
  const [currentDetection, setCurrentDetection] = useState<FaceProfile | null>(null);
  const [scanConfidence, setScanConfidence] = useState(0);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [showSettings, setShowSettings] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && isScanning) {
      // Simulate face detection
      const interval = setInterval(() => {
        const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
        const confidence = Math.random() * 30 + 70; // 70-100%
        
        setCurrentDetection(randomProfile);
        setScanConfidence(confidence);
        
        // Add detection event
        const newEvent: RecognitionEvent = {
          id: Date.now().toString(),
          profile: randomProfile.name,
          timestamp: new Date(),
          confidence,
          action: confidence > 90 ? 'detected' : 'access_denied',
          location: 'Camera 1'
        };
        
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        
        setTimeout(() => {
          setCurrentDetection(null);
          setScanConfidence(0);
        }, 3000);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isActive, isScanning, profiles]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setCameraPermission('granted');
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission('denied');
    }
  };

  const toggleCamera = () => {
    if (isActive) {
      setIsActive(false);
      setIsScanning(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    } else {
      initializeCamera();
    }
  };

  const addProfile = () => {
    const newProfile: FaceProfile = {
      id: Date.now().toString(),
      name: 'New User',
      confidence: 0,
      lastSeen: new Date(),
      status: 'recognized',
      accessLevel: 'user',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2QjcyODAiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo='
    };
    setProfiles(prev => [newProfile, ...prev]);
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(profile => profile.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recognized': return 'text-green-400';
      case 'unknown': return 'text-yellow-400';
      case 'blocked': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recognized': return <UserCheck className="w-4 h-4" />;
      case 'unknown': return <UserX className="w-4 h-4" />;
      case 'blocked': return <UserX className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'text-red-400';
      case 'user': return 'text-blue-400';
      case 'guest': return 'text-yellow-400';
      case 'blocked': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login': return 'text-green-400';
      case 'detected': return 'text-blue-400';
      case 'access_denied': return 'text-red-400';
      case 'registered': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const recognizedProfiles = profiles.filter(p => p.status === 'recognized').length;
  const totalEvents = events.length;

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
            <Camera className="w-8 h-8 mr-3" />
            Face Recognition
          </h2>
          <p className="text-cyan-200 text-lg">Biometric authentication and identity management</p>
        </div>

        {/* Camera Feed */}
        <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Live Camera Feed
            </h3>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCamera}
                className={`p-2 rounded-lg transition ${
                  isActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isActive ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-cyan-400 rounded-lg transition"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="relative">
            {cameraPermission === 'granted' ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                
                {/* Detection Overlay */}
                {currentDetection && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-cyan-400">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{currentDetection.name}</div>
                          <div className="text-cyan-300 text-sm">{scanConfidence.toFixed(1)}% confidence</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Scanning Indicator */}
                {isScanning && !currentDetection && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm">Scanning...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <CameraOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {cameraPermission === 'denied' 
                      ? 'Camera access denied. Please enable camera permissions.' 
                      : 'Initializing camera...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{recognizedProfiles}</div>
            <div className="text-sm text-cyan-400">Recognized Profiles</div>
            <UserCheck className="w-6 h-6 text-green-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{totalEvents}</div>
            <div className="text-sm text-cyan-400">Detection Events</div>
            <Eye className="w-6 h-6 text-blue-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {isActive ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-cyan-400">System Status</div>
            <Shield className="w-6 h-6 text-purple-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {scanConfidence.toFixed(1)}%
            </div>
            <div className="text-sm text-cyan-400">Current Confidence</div>
            <Brain className="w-6 h-6 text-cyan-400 mx-auto mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Face Profiles */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Face Profiles
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addProfile}
                  className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                >
                  <User className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {profiles.map((profile) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="relative">
                      <img 
                        src={profile.imageUrl} 
                        alt={profile.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                        profile.status === 'recognized' ? 'bg-green-400' :
                        profile.status === 'unknown' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-cyan-100">{profile.name}</h4>
                        <div className={getStatusColor(profile.status)}>
                          {getStatusIcon(profile.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`${getAccessLevelColor(profile.accessLevel)}`}>
                          {profile.accessLevel}
                        </span>
                        <span className="text-cyan-400">{profile.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-cyan-500">
                        Last seen: {formatTimeAgo(profile.lastSeen)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteProfile(profile.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition"
                        title="Delete profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recognition Events */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <History className="w-5 h-5 mr-2" />
                Recent Events
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={getActionColor(event.action)}>
                          {event.action === 'login' ? <Unlock className="w-4 h-4" /> :
                           event.action === 'access_denied' ? <Lock className="w-4 h-4" /> :
                           event.action === 'detected' ? <Eye className="w-4 h-4" /> :
                           <User className="w-4 h-4" />}
                        </div>
                        <h4 className="font-medium text-cyan-100">{event.profile}</h4>
                      </div>
                      <span className="text-sm text-cyan-400">{event.confidence.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-400">{event.location}</span>
                      <span className="text-cyan-500">{formatTimeAgo(event.timestamp)}</span>
                    </div>
                    
                    <div className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                      event.action === 'login' ? 'bg-green-500/20 text-green-400' :
                      event.action === 'access_denied' ? 'bg-red-500/20 text-red-400' :
                      event.action === 'detected' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {event.action.replace('_', ' ')}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">System Status</span>
                  <span className="text-green-400 font-medium">Secure</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Encryption</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Last Security Scan</span>
                  <span className="text-cyan-200">2 minutes ago</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Threat Level</span>
                  <span className="text-green-400 font-medium">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 