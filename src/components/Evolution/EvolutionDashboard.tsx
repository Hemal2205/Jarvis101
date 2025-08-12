import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';

interface AssignedAgent {
  id: number;
  name: string;
  avatar_url?: string;
  role?: string;
}
interface Suggestion {
  id: number;
  agent_id: number | null;
  type: string;
  description: string;
  status: string;
  created_at: string;
  assigned_agent?: AssignedAgent | null;
}

interface HistoryItem {
  id: number;
  suggestion_id: number;
  action: string;
  timestamp: string;
  details: string;
}

interface Collaboration {
  id: number;
  suggestion_id: number;
  agent_id: number;
  action: string;
  comment: string | null;
  timestamp: string;
}

interface Message {
  id: number;
  suggestion_id: number;
  agent_id: number;
  content: string;
  parent_id: number | null;
  timestamp: string;
  replies: Message[];
}

const EvolutionDashboard: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ [id: number]: string }>({});
  const { notify } = useNotification();
  const [lastSuggestionIds, setLastSuggestionIds] = useState<number[]>([]);
  const [collaborations, setCollaborations] = useState<{ [suggestionId: number]: Collaboration[] }>({});
  const [collabAction, setCollabAction] = useState<{ [suggestionId: number]: string }>({});
  const [collabComment, setCollabComment] = useState<{ [suggestionId: number]: string }>({});
  const [votes, setVotes] = useState<{ [suggestionId: number]: { upvotes: number; downvotes: number } }>({});
  const [consensus, setConsensus] = useState<{ [suggestionId: number]: string }>({});
  const [messages, setMessages] = useState<{ [suggestionId: number]: Message[] }>({});
  const [newMessage, setNewMessage] = useState<{ [suggestionId: number]: string }>({});
  const [replyMessage, setReplyMessage] = useState<{ [parentId: number]: string }>({});
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/evolution/suggestions');
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch {
      setError('Failed to fetch suggestions');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/evolution/history');
      const data = await res.json();
      setHistory(data.history);
    } catch {
      setError('Failed to fetch history');
    }
  };

  const fetchCollaborations = async (suggestionId: number) => {
    const res = await fetch(`/api/evolution/collaborations/${suggestionId}`);
    const data = await res.json();
    setCollaborations(c => ({ ...c, [suggestionId]: data.collaborations }));
  };

  const fetchVotes = async (suggestionId: number) => {
    const res = await fetch(`/api/evolution/votes/${suggestionId}`);
    const data = await res.json();
    setVotes(v => ({ ...v, [suggestionId]: data }));
  };
  const fetchConsensus = async (suggestionId: number) => {
    const res = await fetch(`/api/evolution/consensus/${suggestionId}`);
    const data = await res.json();
    setConsensus(c => ({ ...c, [suggestionId]: data.consensus }));
  };

  const fetchMessages = async (suggestionId: number) => {
    const res = await fetch(`/api/evolution/messages/${suggestionId}`);
    const data = await res.json();
    setMessages(m => ({ ...m, [suggestionId]: data.messages }));
  };

  const fetchNotifications = async () => {
    const res = await fetch('/api/evolution/notifications?user_id=1');
    const data = await res.json();
    if (data.notifications && data.notifications.length > 0) {
      data.notifications.forEach((n: any) => {
        if (!n.is_read && n.id !== lastNotificationId) {
          notify(n.message, 'info');
          setLastNotificationId(n.id);
          fetch(`/api/evolution/notifications/read/${n.id}`, { method: 'POST' });
        }
      });
    }
  };

  useEffect(() => {
    fetchSuggestions();
    fetchHistory();
    const interval = setInterval(() => {
      fetchSuggestions();
      fetchHistory();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    suggestions.forEach(s => {
      fetchVotes(s.id);
      fetchConsensus(s.id);
      fetchMessages(s.id);
    });
  }, [suggestions, collaborations]);

  // Toast notification for new suggestions
  useEffect(() => {
    const currentIds = suggestions.map(s => s.id);
    const newIds = currentIds.filter(id => !lastSuggestionIds.includes(id));
    if (newIds.length > 0) {
      newIds.forEach(id => {
        const s = suggestions.find(sug => sug.id === id);
        if (s) notify(`New Evolution Suggestion: ${s.description}`, 'info');
      });
      setLastSuggestionIds(currentIds);
    }
  }, [suggestions]);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await fetch('/api/evolution/analyze', { method: 'POST' });
      fetchSuggestions();
    } catch {
      setError('Failed to analyze');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = async (id: number) => {
    setLoading(true);
    try {
      await fetch(`/api/evolution/apply/${id}`, { method: 'POST' });
      fetchSuggestions();
      fetchHistory();
      notify('Improvement applied!', 'success');
    } catch {
      setError('Failed to apply suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    setLoading(true);
    try {
      await fetch(`/api/evolution/reject/${id}`, { method: 'POST' });
      fetchSuggestions();
      fetchHistory();
      notify('Improvement rejected.', 'error');
    } catch {
      setError('Failed to reject suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (id: number) => {
    // For demo: just show a toast
    notify(`Feedback submitted: ${feedback[id] || ''}`, 'info');
    setFeedback(f => ({ ...f, [id]: '' }));
  };

  const handleCollabSubmit = async (suggestionId: number) => {
    const action = collabAction[suggestionId] || 'endorse';
    const comment = collabComment[suggestionId] || '';
    await fetch(`/api/evolution/collaborate/${suggestionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: 1, action, comment })
    });
    setCollabAction(a => ({ ...a, [suggestionId]: '' }));
    setCollabComment(c => ({ ...c, [suggestionId]: '' }));
    fetchCollaborations(suggestionId);
    notify('Collaboration submitted!', 'success');
  };

  const handleVote = async (suggestionId: number, type: 'upvote' | 'downvote') => {
    await fetch(`/api/evolution/collaborate/${suggestionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: 1, action: type })
    });
    fetchVotes(suggestionId);
    fetchConsensus(suggestionId);
    fetchCollaborations(suggestionId);
    notify(`You ${type === 'upvote' ? 'upvoted' : 'downvoted'} this suggestion.`, 'success');
  };

  const handlePostMessage = async (suggestionId: number) => {
    if (!newMessage[suggestionId]?.trim()) return;
    await fetch(`/api/evolution/message/${suggestionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: 1, content: newMessage[suggestionId] })
    });
    setNewMessage(m => ({ ...m, [suggestionId]: '' }));
    fetchMessages(suggestionId);
  };
  const handleReply = async (suggestionId: number, parentId: number) => {
    if (!replyMessage[parentId]?.trim()) return;
    await fetch(`/api/evolution/message/${suggestionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: 1, content: replyMessage[parentId], parent_id: parentId })
    });
    setReplyMessage(r => ({ ...r, [parentId]: '' }));
    fetchMessages(suggestionId);
  };
  function renderMessages(msgs: Message[], suggestionId: number, level = 0) {
    return msgs.map(msg => (
      <div key={msg.id} style={{ marginLeft: level * 20 }} className="mb-2">
        <div className="text-xs"><span className="font-bold">Agent {msg.agent_id}</span>: {msg.content} <span className="text-gray-400">({new Date(msg.timestamp).toLocaleString()})</span></div>
        <div className="flex items-center space-x-2 mt-1">
          <input className="border px-2 py-1 rounded text-xs" placeholder="Reply..." value={replyMessage[msg.id] || ''} onChange={e => setReplyMessage(r => ({ ...r, [msg.id]: e.target.value }))} />
          <button className="bg-blue-400 text-white px-2 py-1 rounded text-xs" onClick={() => handleReply(suggestionId, msg.id)}>Reply</button>
        </div>
        {msg.replies && msg.replies.length > 0 && renderMessages(msg.replies, suggestionId, level + 1)}
      </div>
    ));
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-purple-700">Evolution Dashboard</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-4 flex items-center space-x-4">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing...' : 'Analyze & Suggest Improvements'}
        </button>
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Suggestions</h3>
        {suggestions.length === 0 ? (
          <div className="text-gray-400">No suggestions yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {suggestions.map(s => (
              <li key={s.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium text-gray-800">{s.description}</div>
                  <div className="text-xs text-gray-400">Type: {s.type} | Status: <span className={s.status === 'pending' ? 'text-yellow-600' : s.status === 'applied' ? 'text-green-600' : 'text-red-600'}>{s.status}</span></div>
                  <div className="text-xs text-gray-400">Created: {new Date(s.created_at).toLocaleString()}</div>
                  {s.assigned_agent && (
                    <div className="flex items-center space-x-2 mt-1">
                      {s.assigned_agent.avatar_url && <img src={s.assigned_agent.avatar_url} alt="avatar" className="w-6 h-6 rounded-full border" />}
                      <span className="text-xs font-semibold text-blue-700">Assigned to: {s.assigned_agent.name}</span>
                      {s.assigned_agent.role && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded ml-1">{s.assigned_agent.role}</span>}
                    </div>
                  )}
                  {/* Voting section */}
                  <div className="flex items-center space-x-2 mt-1">
                    <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs" onClick={() => handleVote(s.id, 'upvote')}>▲ Upvote</button>
                    <span className="text-xs">{votes[s.id]?.upvotes || 0}</span>
                    <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs" onClick={() => handleVote(s.id, 'downvote')}>▼ Downvote</button>
                    <span className="text-xs">{votes[s.id]?.downvotes || 0}</span>
                    <span className={`ml-2 text-xs font-semibold ${consensus[s.id] === 'positive' ? 'text-green-600' : consensus[s.id] === 'negative' ? 'text-red-600' : 'text-gray-400'}`}>Consensus: {consensus[s.id] || 'none'}</span>
                  </div>
                  {/* Collaboration section */}
                  <div className="mt-2">
                    <div className="text-xs font-semibold text-purple-700">Agent Collaboration</div>
                    <ul className="text-xs text-gray-600 mb-1">
                      {(collaborations[s.id] || []).map(c => (
                        <li key={c.id} className="mb-1">
                          <span className="font-bold">Agent {c.agent_id}</span>: <span className="italic">{c.action}</span>{c.comment ? ` - "${c.comment}"` : ''} <span className="text-gray-400">({new Date(c.timestamp).toLocaleString()})</span>
                        </li>
                      ))}
                      {(collaborations[s.id] || []).length === 0 && <li className="text-gray-400">No collaboration yet.</li>}
                    </ul>
                    <div className="flex space-x-2 items-center">
                      <select className="border px-1 py-1 rounded text-xs" value={collabAction[s.id] || ''} onChange={e => setCollabAction(a => ({ ...a, [s.id]: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="endorse">Endorse</option>
                        <option value="comment">Comment</option>
                        <option value="vote">Vote</option>
                        <option value="reject">Reject</option>
                        <option value="apply">Apply</option>
                      </select>
                      <input className="border px-2 py-1 rounded text-xs" placeholder="Comment (optional)" value={collabComment[s.id] || ''} onChange={e => setCollabComment(c => ({ ...c, [s.id]: e.target.value }))} />
                      <button className="bg-purple-500 text-white px-2 py-1 rounded text-xs" onClick={() => handleCollabSubmit(s.id)}>Submit</button>
                    </div>
                  </div>
                  {/* Show feedback input for applied suggestions */}
                  {s.status === 'applied' && (
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        className="border px-2 py-1 rounded text-xs"
                        placeholder="Feedback (optional)"
                        value={feedback[s.id] || ''}
                        onChange={e => setFeedback(f => ({ ...f, [s.id]: e.target.value }))}
                      />
                      <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs" onClick={() => handleFeedback(s.id)}>Submit</button>
                    </div>
                  )}
                  {/* Threaded discussion section */}
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-blue-700 mb-1">Agent Discussion</div>
                    <div className="mb-2">
                      {renderMessages(messages[s.id] || [], s.id)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input className="border px-2 py-1 rounded text-xs w-full" placeholder="Add a comment..." value={newMessage[s.id] || ''} onChange={e => setNewMessage(m => ({ ...m, [s.id]: e.target.value }))} />
                      <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs" onClick={() => handlePostMessage(s.id)}>Post</button>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  {s.status === 'pending' && (
                    <>
                      <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onClick={() => handleApply(s.id)} disabled={loading}>Apply</button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => handleReject(s.id)} disabled={loading}>Reject</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Evolution History</h3>
        {history.length === 0 ? (
          <div className="text-gray-400">No history yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {history.map(h => (
              <li key={h.id} className="py-2">
                <div className="text-sm text-gray-700">{h.details}</div>
                <div className="text-xs text-gray-400">Action: <span className={h.action === 'applied' ? 'text-green-600' : 'text-red-600'}>{h.action}</span> | {new Date(h.timestamp).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EvolutionDashboard; 