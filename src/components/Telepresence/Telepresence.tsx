import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  Minimize,
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Share2,
  Download,
  Upload,
  Globe,
  Clock,
  User,
  Shield,
  Zap,
  BarChart3,
  Wifi,
  Signal,
  Battery,
  Eye,
  EyeOff
} from 'lucide-react';

interface TelepresenceSession {
  id: string;
  name: string;
  type: 'hologram' | 'video' | 'audio' | 'mixed';
  status: 'active' | 'connecting' | 'disconnected' | 'paused';
  participants: number;
  location: string;
  duration: string;
  quality: 'high' | 'medium' | 'low';
  encryption: boolean;
}

interface RemoteLocation {
  id: string;
  name: string;
  coordinates: string;
  timezone: string;
  status: 'available' | 'busy' | 'offline';
  lastContact: string;
  connectionType: 'satellite' | 'fiber' | 'wireless';
  bandwidth: string;
}

interface CommunicationChannel {
  id: string;
  name: string;
  type: 'voice' | 'video' | 'hologram' | 'text';
  status: 'open' | 'closed' | 'muted';
  participants: string[];
  lastActivity: string;
  encryption: boolean;
}

const Telepresence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const sessions: TelepresenceSession[] = [
    { id: '1', name: 'Stark Industries Board Meeting', type: 'hologram', status: 'active', participants: 8, location: 'New York HQ', duration: '45m', quality: 'high', encryption: true },
    { id: '2', name: 'Avengers Briefing', type: 'video', status: 'connecting', participants: 6, location: 'Avengers Tower', duration: '12m', quality: 'high', encryption: true },
    { id: '3', name: 'Research Collaboration', type: 'mixed', status: 'active', participants: 3, location: 'MIT Lab', duration: '1h 23m', quality: 'medium', encryption: false },
    { id: '4', name: 'Emergency Response', type: 'audio', status: 'disconnected', participants: 12, location: 'S.H.I.E.L.D HQ', duration: '5m', quality: 'low', encryption: true }
  ];

  const remoteLocations: RemoteLocation[] = [
    { id: '1', name: 'Stark Industries - New York', coordinates: '40.7128°N, 74.0060°W', timezone: 'EST', status: 'available', lastContact: '2 min ago', connectionType: 'fiber', bandwidth: '1 Gbps' },
    { id: '2', name: 'Avengers Tower', coordinates: '40.7589°N, 73.9851°W', timezone: 'EST', status: 'busy', lastContact: '15 min ago', connectionType: 'satellite', bandwidth: '500 Mbps' },
    { id: '3', name: 'S.H.I.E.L.D Headquarters', coordinates: '38.9072°N, 77.0369°W', timezone: 'EST', status: 'available', lastContact: '1 min ago', connectionType: 'fiber', bandwidth: '2 Gbps' },
    { id: '4', name: 'Wakanda Embassy', coordinates: '40.7505°N, 73.9934°W', timezone: 'EST', status: 'offline', lastContact: '2 hours ago', connectionType: 'satellite', bandwidth: '750 Mbps' },
    { id: '5', name: 'Asgard Embassy', coordinates: '40.7589°N, 73.9851°W', timezone: 'EST', status: 'available', lastContact: '5 min ago', connectionType: 'wireless', bandwidth: '300 Mbps' }
  ];

  const communicationChannels: CommunicationChannel[] = [
    { id: '1', name: 'Avengers Command', type: 'hologram', status: 'open', participants: ['Tony Stark', 'Steve Rogers', 'Natasha Romanoff'], lastActivity: '1 min ago', encryption: true },
    { id: '2', name: 'Research Team', type: 'video', status: 'open', participants: ['Bruce Banner', 'Jane Foster'], lastActivity: '5 min ago', encryption: false },
    { id: '3', name: 'Security Briefing', type: 'voice', status: 'muted', participants: ['Nick Fury', 'Maria Hill'], lastActivity: '10 min ago', encryption: true },
    { id: '4', name: 'Tech Support', type: 'text', status: 'closed', participants: ['JARVIS', 'FRIDAY'], lastActivity: '1 hour ago', encryption: true }
  ];

  const toggleConnection = () => {
    setIsConnected(!isConnected);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const joinSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    setIsConnected(true);
  };

  const connectToLocation = (locationId: string) => {
    setSelectedLocation(locationId);
    setIsConnected(true);
  };

  return (
    <div className="h-full bg-black/20 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Video className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Telepresence</h2>
            <p className="text-cyan-400/60 text-sm">Remote Presence & Communication</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleConnection}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isConnected 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {isConnected ? (
              <>
                <Pause className="w-4 h-4 inline mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Play className="w-4 h-4 inline mr-2" />
                Connect
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Connection</span>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
          </div>
          <p className="text-white font-medium">{isConnected ? 'Active' : 'Inactive'}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Quality</span>
            <Signal className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium capitalize">{connectionQuality}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Sessions</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{sessions.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400/60 text-sm">Locations</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-white font-medium">{remoteLocations.filter(l => l.status === 'available').length}</p>
        </div>
      </div>

      {/* Control Panel */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 border border-cyan-500/20 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Connection Controls</h3>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400/60 text-sm">Quality: {connectionQuality}</span>
              <div className="flex space-x-1">
                <div className={`w-2 h-2 rounded-full ${connectionQuality === 'high' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <div className={`w-2 h-2 rounded-full ${connectionQuality === 'medium' ? 'bg-yellow-400' : 'bg-gray-500'}`}></div>
                <div className={`w-2 h-2 rounded-full ${connectionQuality === 'low' ? 'bg-red-400' : 'bg-gray-500'}`}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className={`p-3 rounded-full ${
                isMuted ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                !isVideoEnabled ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {isVideoEnabled ? <Camera className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-cyan-500/20 text-cyan-400"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-cyan-500/20 text-cyan-400"
            >
              <Maximize className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'sessions', label: 'Sessions', icon: Video },
          { id: 'locations', label: 'Locations', icon: MapPin },
          { id: 'channels', label: 'Channels', icon: MessageSquare },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-black/20 text-gray-400 border border-gray-600/20 hover:border-cyan-500/30'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      currentSession === session.id
                        ? 'bg-cyan-500/10 border-cyan-500/50'
                        : 'bg-black/30 border-cyan-500/20 hover:border-cyan-500/40'
                    }`}
                    onClick={() => setCurrentSession(session.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{session.name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          session.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          session.status === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                          session.status === 'paused' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {session.status}
                        </div>
                        {session.encryption && <Shield className="w-3 h-3 text-green-400" />}
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm">Type: {session.type}</p>
                      <p className="text-cyan-400/60 text-sm">Location: {session.location}</p>
                      <p className="text-cyan-400/60 text-sm">Quality: {session.quality}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-400/60">
                        <Users className="w-3 h-3 inline mr-1" />
                        {session.participants} participants
                      </span>
                      <span className="text-gray-400">{session.duration}</span>
                    </div>
                    {currentSession === session.id && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => joinSession(session.id)}
                        className="w-full mt-3 px-3 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all"
                      >
                        Join Session
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'locations' && (
            <motion.div
              key="locations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {remoteLocations.map((location) => (
                  <motion.div
                    key={location.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedLocation === location.id
                        ? 'bg-cyan-500/10 border-cyan-500/50'
                        : 'bg-black/30 border-cyan-500/20 hover:border-cyan-500/40'
                    }`}
                    onClick={() => setSelectedLocation(location.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{location.name}</h3>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        location.status === 'available' ? 'bg-green-500/20 text-green-400' :
                        location.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {location.status}
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm">{location.coordinates}</p>
                      <p className="text-cyan-400/60 text-sm">Timezone: {location.timezone}</p>
                      <p className="text-cyan-400/60 text-sm">Connection: {location.connectionType}</p>
                      <p className="text-cyan-400/60 text-sm">Bandwidth: {location.bandwidth}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Last: {location.lastContact}</span>
                      <span className="text-cyan-400/60">{location.connectionType}</span>
                    </div>
                    {selectedLocation === location.id && location.status === 'available' && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => connectToLocation(location.id)}
                        className="w-full mt-3 px-3 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all"
                      >
                        Connect to Location
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'channels' && (
            <motion.div
              key="channels"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communicationChannels.map((channel) => (
                  <div key={channel.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{channel.name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          channel.status === 'open' ? 'bg-green-500/20 text-green-400' :
                          channel.status === 'muted' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {channel.status}
                        </div>
                        {channel.encryption && <Shield className="w-3 h-3 text-green-400" />}
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-cyan-400/60 text-sm">Type: {channel.type}</p>
                      <p className="text-cyan-400/60 text-sm">Participants: {channel.participants.join(', ')}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Last: {channel.lastActivity}</span>
                      <span className="text-cyan-400/60">{channel.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Total Time</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">3h 45m</p>
                  <p className="text-cyan-400/60 text-sm">Today's sessions</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Connections</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">24</p>
                  <p className="text-cyan-400/60 text-sm">This week</p>
                </div>
                <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Locations</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">5</p>
                  <p className="text-cyan-400/60 text-sm">Active</p>
                </div>
              </div>
              
              <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">Connection Quality</h3>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between">
                      <span className="text-cyan-400/60">{session.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              session.quality === 'high' ? 'bg-green-400' :
                              session.quality === 'medium' ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`}
                            style={{ width: `${session.quality === 'high' ? 100 : session.quality === 'medium' ? 66 : 33}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm capitalize">{session.quality}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Telepresence; 