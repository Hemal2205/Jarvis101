import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Phone, 
  Share2, 
  FileText, 
  Calendar,
  Clock,
  User,
  UserCheck,
  UserX,
  Send,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Settings,
  Plus,
  MoreHorizontal,
  Star,
  AlertCircle
} from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: string;
  lastSeen: string;
  isTyping: boolean;
  isSpeaking: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  isOwn: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  collaborators: number;
  lastActivity: string;
  status: 'active' | 'paused' | 'completed';
}

export const RealTimeCollaboration: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'projects' | 'team'>('chat');
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket for real-time chat
  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:8000/ws/collaboration/chat');
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Poll for collaborators and projects (if needed)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [collabRes, projRes] = await Promise.all([
          fetch('/api/collaboration/collaborators'),
          fetch('/api/collaboration/projects'),
        ]);
        const [collabData, projData] = await Promise.all([
          collabRes.json(), projRes.json()
        ]);
        setCollaborators(collabData.collaborators || []);
        setProjects(projData.projects || []);
      } catch {
        setCollaborators([]);
        setProjects([]);
      }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current) return;
    const msg = {
      sender: 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      isOwn: true,
      id: Date.now().toString(),
    };
    wsRef.current.send(JSON.stringify(msg));
    setNewMessage('');
  };

  const toggleVoiceCall = () => {
    setIsVoiceCall(!isVoiceCall);
    if (isVideoCall) setIsVideoCall(false);
  };

  const toggleVideoCall = () => {
    setIsVideoCall(!isVideoCall);
    if (isVoiceCall) setIsVoiceCall(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'away': return 'text-yellow-400';
      case 'busy': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <UserCheck className="w-4 h-4" />;
      case 'away': return <Clock className="w-4 h-4" />;
      case 'busy': return <AlertCircle className="w-4 h-4" />;
      case 'offline': return <UserX className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const onlineCollaborators = collaborators.filter(c => c.status === 'online').length;

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
            <Users className="w-8 h-8 mr-3" />
            Real-Time Collaboration
          </h2>
          <p className="text-cyan-200 text-lg">Team communication and project management</p>
        </div>

        {/* Team Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{onlineCollaborators}</div>
            <div className="text-sm text-cyan-400">Online Now</div>
            <Users className="w-6 h-6 text-green-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{projects.length}</div>
            <div className="text-sm text-cyan-400">Active Projects</div>
            <FileText className="w-6 h-6 text-blue-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{messages.length}</div>
            <div className="text-sm text-cyan-400">Messages Today</div>
            <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mt-2" />
          </div>
          
          <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {isVoiceCall || isVideoCall ? 'Active' : 'None'}
            </div>
            <div className="text-sm text-cyan-400">Current Call</div>
            {isVoiceCall ? (
              <Phone className="w-6 h-6 text-cyan-400 mx-auto mt-2" />
            ) : isVideoCall ? (
              <Video className="w-6 h-6 text-cyan-400 mx-auto mt-2" />
            ) : (
              <Phone className="w-6 h-6 text-gray-600 mx-auto mt-2" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4">Team Members</h3>
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <motion.div
                    key={collaborator.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-cyan-500/10 hover:border-cyan-400/30 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-medium">
                          {collaborator.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                          collaborator.status === 'online' ? 'bg-green-400' :
                          collaborator.status === 'away' ? 'bg-yellow-400' :
                          collaborator.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-cyan-100">{collaborator.name}</h4>
                          {collaborator.isTyping && (
                            <span className="text-xs text-cyan-400 animate-pulse">typing...</span>
                          )}
                        </div>
                        <div className="text-sm text-cyan-400">{collaborator.role}</div>
                        <div className="text-xs text-cyan-500">{collaborator.lastSeen}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={getStatusColor(collaborator.status)}>
                        {getStatusIcon(collaborator.status)}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-cyan-400 hover:text-cyan-300 transition"
                        title="Start voice call"
                      >
                        <Phone className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-cyan-400 hover:text-cyan-300 transition"
                        title="Start video call"
                      >
                        <Video className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Call Controls */}
            {(isVoiceCall || isVideoCall) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl"
              >
                <h3 className="text-lg font-semibold text-cyan-200 mb-4">
                  {isVideoCall ? 'Video Call' : 'Voice Call'}
                </h3>
                <div className="flex items-center justify-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full ${
                      isMuted ? 'bg-red-600' : 'bg-gray-700'
                    } text-white transition`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </motion.button>
                  
                  {isVideoCall && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsCameraOff(!isCameraOff)}
                      className={`p-3 rounded-full ${
                        isCameraOff ? 'bg-red-600' : 'bg-gray-700'
                      } text-white transition`}
                    >
                      {isCameraOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={isVoiceCall ? toggleVoiceCall : toggleVideoCall}
                    className="p-3 rounded-full bg-red-600 text-white transition"
                  >
                    <Phone className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Chat */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200">Team Chat</h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleVoiceCall}
                    className={`p-2 rounded-lg transition ${
                      isVoiceCall ? 'bg-green-600 text-white' : 'bg-gray-700 text-cyan-400 hover:bg-gray-600'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleVideoCall}
                    className={`p-2 rounded-lg transition ${
                      isVideoCall ? 'bg-green-600 text-white' : 'bg-gray-700 text-cyan-400 hover:bg-gray-600'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs p-3 rounded-lg ${
                      message.isOwn 
                        ? 'bg-cyan-600 text-white' 
                        : message.type === 'system'
                        ? 'bg-gray-700 text-gray-300 text-xs'
                        : 'bg-gray-800 text-cyan-100'
                    }`}>
                      {message.type !== 'system' && (
                        <div className="text-xs text-cyan-300 mb-1">{message.sender}</div>
                      )}
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 bg-gray-800 text-cyan-100 border border-cyan-500/20 rounded-lg focus:outline-none focus:border-cyan-400 transition"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200">Active Projects</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="space-y-3">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-cyan-500/10 hover:border-cyan-400/30 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-cyan-100">{project.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${getProjectStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-cyan-400 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between text-xs text-cyan-500">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {project.collaborators} members
                      </span>
                      <span>{project.lastActivity}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition text-center"
                >
                  <Share2 className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <div className="text-sm text-cyan-200">Share Files</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition text-center"
                >
                  <Calendar className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <div className="text-sm text-cyan-200">Schedule Meeting</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition text-center"
                >
                  <FileText className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <div className="text-sm text-cyan-200">Create Task</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition text-center"
                >
                  <Settings className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <div className="text-sm text-cyan-200">Team Settings</div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 