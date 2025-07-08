import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { X, Calendar, Mic, Type, Image, Play, Pause, Trash2, Plus } from 'lucide-react';

interface MemoryVaultProps {
  onClose: () => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({ onClose }) => {
  const { state, recordMemory, playMemory } = useJarvis();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'voice' | 'text' | 'image'>('text');
  const [newMemoryContent, setNewMemoryContent] = useState('');

  const handleRecordMemory = () => {
    if (recordingType === 'text' && newMemoryContent.trim()) {
      recordMemory(newMemoryContent, recordingType);
      setNewMemoryContent('');
    } else if (recordingType === 'voice') {
      // Voice recording logic would go here
      setIsRecording(!isRecording);
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

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'text-green-400';
      case 'sad': return 'text-blue-400';
      case 'excited': return 'text-yellow-400';
      case 'angry': return 'text-red-400';
      case 'peaceful': return 'text-cyan-400';
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
          <Calendar className="w-6 h-6 mr-2" />
          Memory Vault
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Record New Memory */}
      <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-4 mb-6">
        <h3 className="text-lg font-semibold text-cyan-300 mb-4">Record New Memory</h3>
        
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setRecordingType('text')}
            className={`p-2 rounded-lg flex items-center space-x-2 ${
              recordingType === 'text' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text</span>
          </button>
          <button
            onClick={() => setRecordingType('voice')}
            className={`p-2 rounded-lg flex items-center space-x-2 ${
              recordingType === 'voice' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </button>
          <button
            onClick={() => setRecordingType('image')}
            className={`p-2 rounded-lg flex items-center space-x-2 ${
              recordingType === 'image' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Image</span>
          </button>
        </div>

        {recordingType === 'text' && (
          <div className="flex items-center space-x-4">
            <textarea
              value={newMemoryContent}
              onChange={(e) => setNewMemoryContent(e.target.value)}
              placeholder="What's on your mind today, Hemal?"
              className="flex-1 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleRecordMemory}
              disabled={!newMemoryContent.trim()}
              className="p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {recordingType === 'voice' && (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleRecordMemory}
              className={`p-4 rounded-full ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-cyan-600 hover:bg-cyan-700'
              } text-white transition-colors`}
            >
              {isRecording ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
            <span className="text-gray-300">
              {isRecording ? 'Recording...' : 'Click to record'}
            </span>
          </div>
        )}
      </div>

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold text-cyan-300 mb-4">
          Your Memories ({state.memories.length})
        </h3>
        
        {state.memories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No memories recorded yet. Start building your digital legacy!
          </div>
        ) : (
          <div className="space-y-4">
            {state.memories.map((memory) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-2">
                        {memory.type === 'voice' && <Mic className="w-4 h-4 text-purple-400" />}
                        {memory.type === 'text' && <Type className="w-4 h-4 text-cyan-400" />}
                        {memory.type === 'image' && <Image className="w-4 h-4 text-green-400" />}
                        <span className="text-sm text-gray-400">{formatDate(memory.date)}</span>
                      </div>
                      <span className={`text-sm font-medium ${getEmotionColor(memory.emotion)}`}>
                        {memory.emotion}
                      </span>
                    </div>
                    <p className="text-gray-200">{memory.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => playMemory(memory.id)}
                      className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};