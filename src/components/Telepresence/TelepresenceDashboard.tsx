import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, Users, ScreenShare, UserCheck, AlertTriangle, X, Plus, MessageCircle, Calendar, CheckCircle, MicOff, VideoOff, Copy, Hand, LogOut, UserMinus } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: 'video' | 'audio';
  participants: string[];
  active: boolean;
}

interface PresenceUser {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'in_call';
}

interface MeetingSummary {
  id: string;
  room: string;
  date: string;
  summary: string;
  action_items: string[];
  highlights: string[];
}

interface ActivityEvent {
  id: string;
  type: 'join' | 'leave' | 'message' | 'call_start' | 'call_end';
  user: string;
  description: string;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface TelepresenceDashboardProps {
  isActive: boolean;
  onClose?: () => void;
}

export const TelepresenceDashboard: React.FC<TelepresenceDashboardProps> = ({ isActive, onClose }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [summaries, setSummaries] = useState<MeetingSummary[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [inCallRoom, setInCallRoom] = useState<Room | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  useEffect(() => {
    if (isActive) {
      fetch('/api/telepresence/rooms')
        .then(res => res.json())
        .then(data => setRooms(data.rooms || []));
      fetch('/api/telepresence/users')
        .then(res => res.json())
        .then(data => setUsers(data.users || []));
      fetch('/api/telepresence/summaries')
        .then(res => res.json())
        .then(data => setSummaries(data.summaries || []));
      fetch('/api/telepresence/activity')
        .then(res => res.json())
        .then(data => setActivity(data.activity || []));
      fetch('/api/telepresence/alerts')
        .then(res => res.json())
        .then(data => setAlerts(data.alerts || []));
    }
  }, [isActive]);

  // Fetch live chat for in-call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchChat = async () => {
      if (inCallRoom) {
        try {
          const res = await fetch(`/api/telepresence/chat?room=${inCallRoom.id}`);
          const data = await res.json();
          setChat(data.messages || []);
        } catch {
          setChat([]);
        }
      }
    };
    if (inCallRoom) {
      fetchChat();
      interval = setInterval(fetchChat, 3000);
    }
    return () => clearInterval(interval);
  }, [inCallRoom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !inCallRoom) return;
    try {
      const res = await fetch(`/api/telepresence/chat?room=${inCallRoom.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      });
      const data = await res.json();
      if (data.message) {
        setChat(prev => [...prev, data.message]);
      }
      setNewMessage('');
    } catch {
      setNewMessage('');
    }
  };

  // Join/leave call handlers
  const handleJoinCall = (room: Room) => {
    setInCallRoom(room);
    setShowJoinModal(false);
  };
  const handleLeaveCall = () => {
    setInCallRoom(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setHandRaised(false);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-blue-500/30 rounded-2xl w-full max-w-5xl h-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-500/30">
          <div className="flex items-center space-x-3">
            <Video className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-blue-400">Telepresence Dashboard</h1>
              <p className="text-gray-400 text-sm">Video/audio rooms, presence, and AI meeting summaries</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="p-4 bg-blue-900/60 text-blue-200 text-sm flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            <div>
              {alerts.map((a, i) => <div key={i}>{a}</div>)}
            </div>
          </div>
        )}
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* In-Call View */}
          {inCallRoom ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Video className="w-6 h-6 text-blue-400" />
                  <span className="font-bold text-white text-lg">{inCallRoom.name}</span>
                  <span className="text-xs text-green-400 ml-2">In Call</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={handleLeaveCall} className="px-3 py-1 bg-red-600 text-white rounded flex items-center space-x-1 text-xs"><LogOut className="w-4 h-4" /> <span>Leave</span></button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded flex items-center space-x-1 text-xs"><UserMinus className="w-4 h-4" /> <span>End Call</span></button>
                  <button className="px-3 py-1 bg-gray-700 text-white rounded flex items-center space-x-1 text-xs"><Copy className="w-4 h-4" /> <span>Invite</span></button>
                </div>
              </div>
              {/* Video/Audio Preview (placeholder) */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-black rounded-lg border border-gray-700 flex flex-col items-center justify-center p-4 min-h-[220px]">
                  {isVideoOff ? (
                    <VideoOff className="w-16 h-16 text-gray-600 mb-2" />
                  ) : (
                    <Video className="w-16 h-16 text-blue-400 mb-2" />
                  )}
                  <div className="text-white font-bold mb-2">Your Video</div>
                  <div className="flex space-x-2">
                    <button onClick={() => setIsMuted(m => !m)} className={`px-3 py-1 rounded text-xs font-bold ${isMuted ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'}`}>{isMuted ? <MicOff className="w-4 h-4 inline" /> : <Mic className="w-4 h-4 inline" />} {isMuted ? 'Unmute' : 'Mute'}</button>
                    <button onClick={() => setIsVideoOff(v => !v)} className={`px-3 py-1 rounded text-xs font-bold ${isVideoOff ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'}`}>{isVideoOff ? 'Start Video' : 'Stop Video'}</button>
                  </div>
                </div>
                {/* Participants */}
                <div className="flex-1 bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <div className="font-bold text-blue-300 mb-2">Participants</div>
                  <ul className="space-y-2">
                    {users.filter(u => inCallRoom.participants.includes(u.name)).map(u => (
                      <li key={u.id} className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{u.name}</span>
                        <span className={`text-xs font-bold ${u.status === 'in_call' ? 'text-blue-400' : 'text-gray-400'}`}>{u.status}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex space-x-2">
                    <button onClick={() => setHandRaised(h => !h)} className={`px-3 py-1 rounded text-xs font-bold ${handRaised ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-yellow-300'}`}><Hand className="w-4 h-4 inline" /> {handRaised ? 'Lower Hand' : 'Raise Hand'}</button>
                    <button onClick={() => setIsScreenSharing(s => !s)} className={`px-3 py-1 rounded text-xs font-bold ${isScreenSharing ? 'bg-green-600 text-white' : 'bg-gray-700 text-green-300'}`}><ScreenShare className="w-4 h-4 inline" /> {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</button>
                  </div>
                  {isScreenSharing && <div className="mt-2 text-xs text-green-400">You are sharing your screen (placeholder)</div>}
                </div>
                {/* In-room Chat */}
                <div className="flex-1 bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex flex-col">
                  <div className="font-bold text-blue-300 mb-2">Chat</div>
                  <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                    {chat.map(msg => (
                      <div key={msg.id} className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-white mr-1">{msg.sender}:</span>
                        <span className="text-gray-200">{msg.content}</span>
                        <span className="text-xs text-gray-500 ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <input
                      type="text"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Rooms */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Rooms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((r) => (
                    <div key={r.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        {r.type === 'video' ? <Video className="w-5 h-5 text-blue-400" /> : <Mic className="w-5 h-5 text-green-400" />}
                        <span className="font-bold text-white">{r.name}</span>
                        {r.active && <span className="text-xs text-green-400 ml-2">Active</span>}
                      </div>
                      <div className="text-xs text-gray-400">Participants: {r.participants.join(', ')}</div>
                      <button onClick={() => { setShowJoinModal(true); setInCallRoom(r); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs mt-2">{r.active ? 'Join' : 'Start Call'}</button>
                    </div>
                  ))}
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Room</span>
                </button>
              </div>
              {/* Presence */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Presence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((u) => (
                    <div key={u.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center space-x-3">
                      <UserCheck className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className={`text-xs font-bold ${u.status === 'online' ? 'text-green-400' : u.status === 'in_call' ? 'text-blue-400' : 'text-gray-400'}`}>{u.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Meeting Summaries */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">AI Meeting Summaries</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summaries.map((s) => (
                    <div key={s.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="font-bold text-white mb-1">{s.room} ({s.date})</div>
                      <div className="text-xs text-gray-400 mb-2">{s.summary}</div>
                      <div className="text-xs text-blue-200 mb-1">Action Items:</div>
                      <ul className="text-xs text-blue-300 mb-2">
                        {s.action_items.map((a, i) => <li key={i}>• {a}</li>)}
                      </ul>
                      <div className="text-xs text-blue-200 mb-1">Highlights:</div>
                      <ul className="text-xs text-blue-300">
                        {s.highlights.map((h, i) => <li key={i}>• {h}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              {/* Activity Feed */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Activity Feed</h3>
                <div className="space-y-3">
                  {activity.map((a) => (
                    <div key={a.id} className="flex items-center space-x-3 bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <MessageCircle className="w-5 h-5 text-blue-400" />
                      <div>
                        <span className="font-medium text-white mr-2">{a.user}</span>
                        <span className="text-gray-300">{a.description}</span>
                        <span className="text-xs text-gray-500 ml-2">{new Date(a.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Join Call Modal */}
        <AnimatePresence>
          {showJoinModal && inCallRoom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-blue-500/30 rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold text-blue-400 mb-4">Join Call: {inCallRoom.name}</h3>
                <div className="flex flex-col items-center">
                  <Video className="w-16 h-16 text-blue-400 mb-2" />
                  <div className="text-white font-bold mb-2">Video/Audio Preview (placeholder)</div>
                  <div className="flex space-x-2 mb-4">
                    <button onClick={() => setIsMuted(m => !m)} className={`px-3 py-1 rounded text-xs font-bold ${isMuted ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'}`}>{isMuted ? <MicOff className="w-4 h-4 inline" /> : <Mic className="w-4 h-4 inline" />} {isMuted ? 'Unmute' : 'Mute'}</button>
                    <button onClick={() => setIsVideoOff(v => !v)} className={`px-3 py-1 rounded text-xs font-bold ${isVideoOff ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'}`}>{isVideoOff ? 'Start Video' : 'Stop Video'}</button>
                  </div>
                  <button
                    onClick={() => handleJoinCall(inCallRoom)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Join Call
                  </button>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 