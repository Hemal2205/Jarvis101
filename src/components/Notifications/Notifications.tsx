import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Trash2, 
  Settings,
  Filter,
  Search,
  Clock,
  Star
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'System Update Complete',
    message: 'JARVIS core system has been successfully updated to version 2.1.0',
    type: 'success',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    priority: 'medium',
    category: 'System'
  },
  {
    id: '2',
    title: 'Voice Recognition Warning',
    message: 'Voice recognition service is experiencing high latency (120ms)',
    type: 'warning',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    priority: 'high',
    category: 'AI Services'
  },
  {
    id: '3',
    title: 'Memory Vault Backup',
    message: 'Daily backup of memory vault completed successfully',
    type: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    priority: 'low',
    category: 'Backup'
  },
  {
    id: '4',
    title: 'Face Recognition Offline',
    message: 'Face recognition service is currently unavailable',
    type: 'error',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    priority: 'high',
    category: 'AI Services'
  },
  {
    id: '5',
    title: 'New Copy Generated',
    message: 'Copy engine has generated new content for your marketing campaign',
    type: 'success',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    read: true,
    priority: 'medium',
    category: 'Content'
  },
  {
    id: '6',
    title: 'Network Optimization',
    message: 'Network performance has been optimized for better response times',
    type: 'info',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: true,
    priority: 'low',
    category: 'Network'
  }
];

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) || 
      (filter === 'read' && notification.read);
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesType && matchesSearch;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-4xl font-bold text-cyan-300 flex items-center">
              <Bell className="w-8 h-8 mr-3" />
              Notifications
            </h2>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-red-500 text-white rounded-full px-3 py-1 text-sm font-bold"
              >
                {unreadCount}
              </motion.div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllAsRead}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition"
            >
              Mark All Read
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-cyan-100 border border-cyan-500/20 rounded-lg focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 text-cyan-100 border border-cyan-500/20 rounded-lg focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 text-cyan-100 border border-cyan-500/20 rounded-lg focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="all">All Types</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="info">Info</option>
            </select>

            {/* Clear All */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Clear All
            </motion.button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-cyan-400"
                >
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications found</p>
                </motion.div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border transition-all ${
                      notification.read 
                        ? 'bg-gray-800/50 border-cyan-500/10' 
                        : 'bg-cyan-900/20 border-cyan-400/30'
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-semibold ${notification.read ? 'text-cyan-200' : 'text-cyan-100'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-cyan-300 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-cyan-400">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <span className="bg-cyan-500/20 px-2 py-1 rounded">
                              {notification.category}
                            </span>
                            <span className={`px-2 py-1 rounded ${
                              notification.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-cyan-400 hover:text-cyan-300 transition"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-cyan-200 mb-4">Notification Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-cyan-300 font-medium mb-3">Notification Types</h4>
                  <div className="space-y-2">
                    {['success', 'warning', 'error', 'info'].map(type => (
                      <label key={type} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="text-cyan-500" />
                        <span className="text-cyan-200 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-cyan-300 font-medium mb-3">Priority Levels</h4>
                  <div className="space-y-2">
                    {['high', 'medium', 'low'].map(priority => (
                      <label key={priority} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="text-cyan-500" />
                        <span className="text-cyan-200 capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 