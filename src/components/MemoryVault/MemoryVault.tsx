import React, { useEffect, useState } from 'react';

interface Memory {
  id: string;
  content: string;
  type: string;
  user: string;
  timestamp: string;
  emotion?: string;
  importance?: number;
  tags?: string[];
}

export const MemoryVault: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMemory, setNewMemory] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/memories');
      const data = await res.json();
      setMemories(data.memories || []);
    } catch (e) {
      setError('Failed to load memories');
    }
    setLoading(false);
  };

  const addMemory = async () => {
    if (!newMemory.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMemory })
      });
      if (res.ok) {
        setNewMemory('');
        fetchMemories();
      }
    } catch (e) {
      setError('Failed to add memory');
    }
    setAdding(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-cyan-300 mb-6">Memory Vault</h2>
      <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 mb-8 shadow-xl">
        <h3 className="text-lg font-semibold text-cyan-200 mb-2">Add New Memory</h3>
        <textarea
          className="w-full p-3 rounded-lg bg-gray-800 text-cyan-100 border border-cyan-500/20 mb-2 focus:outline-none focus:border-cyan-400 transition"
          rows={3}
          value={newMemory}
          onChange={e => setNewMemory(e.target.value)}
          placeholder="What's on your mind?"
        />
        <button
          onClick={addMemory}
          disabled={adding || !newMemory.trim()}
          className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition disabled:bg-gray-700 disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add Memory'}
        </button>
      </div>
      <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-cyan-200 mb-4">Your Memories</h3>
        {loading ? (
          <div className="text-cyan-200">Loading memories...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {memories.map(memory => (
              <li key={memory.id} className="bg-gray-800/80 rounded-lg p-4 border border-cyan-500/10 hover:border-cyan-400/40 transition">
                <div className="text-cyan-100 text-base mb-1">{memory.content}</div>
                <div className="text-xs text-cyan-400 flex space-x-4">
                  <span>{new Date(memory.timestamp).toLocaleString()}</span>
                  {memory.type && <span>Type: {memory.type}</span>}
                  {memory.emotion && <span>Emotion: {memory.emotion}</span>}
                  {memory.tags && memory.tags.length > 0 && <span>Tags: {memory.tags.join(', ')}</span>}
                </div>
              </li>
            ))}
            {memories.length === 0 && <li className="text-cyan-400">No memories yet.</li>}
          </ul>
        )}
      </div>
    </div>
  );
};