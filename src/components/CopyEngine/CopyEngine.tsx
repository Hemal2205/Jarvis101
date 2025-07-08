import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { X, Copy, Download, Settings, Shield, Users, Zap } from 'lucide-react';

interface CopyEngineProps {
  onClose: () => void;
}

export const CopyEngine: React.FC<CopyEngineProps> = ({ onClose }) => {
  const { state, createCopy } = useJarvis();
  const [copyName, setCopyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleCreateCopy = async () => {
    if (!copyName.trim()) return;
    
    setIsCreating(true);
    try {
      const url = await createCopy(copyName);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Failed to create copy:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'disabled': return 'text-red-400';
      case 'updating': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-3xl border border-cyan-500 border-opacity-30 p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
          <Copy className="w-6 h-6 mr-2" />
          Copy Engine
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Create New Copy */}
      <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Create New Copy
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Copy Name
            </label>
            <input
              type="text"
              value={copyName}
              onChange={(e) => setCopyName(e.target.value)}
              placeholder="Enter unique name for the copy"
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleCreateCopy}
              disabled={!copyName.trim() || isCreating}
              className="w-full p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Copy'}
            </button>
          </div>
        </div>

        {downloadUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-900 bg-opacity-50 rounded-lg border border-green-500 border-opacity-30"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Download className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Copy Ready for Download</span>
            </div>
            <a
              href={downloadUrl}
              download
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Download {copyName}.jarvis
            </a>
          </motion.div>
        )}

        <div className="mt-4 p-4 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-500 border-opacity-30">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium text-sm">Security Notice</p>
              <p className="text-gray-300 text-sm">
                All copies are stripped of personal data, biometrics, and memories. 
                They inherit only the AI improvements and cannot self-replicate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Copies */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Active Copies ({state.copies.length})
        </h3>
        
        {state.copies.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No copies created yet. Your first copy will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {state.copies.map((copy) => (
              <motion.div
                key={copy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-cyan-200">{copy.name}</h4>
                      <span className={`text-sm font-medium ${getStatusColor(copy.status)}`}>
                        {copy.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Owner: {copy.owner}</p>
                      <p>Created: {formatDate(copy.created)}</p>
                      <p>ID: {copy.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Master Controls */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Master J.A.R.V.I.S can monitor and control all copies
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
              Update All Copies
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
              Emergency Shutdown
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};