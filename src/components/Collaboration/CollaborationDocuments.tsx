import React, { useEffect, useState } from 'react';

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  owner: string;
}

export const CollaborationDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collab/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newDoc.title.trim()) return;
    try {
      await fetch('/api/collab/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });
      setShowCreate(false);
      setNewDoc({ title: '', content: '' });
      fetchDocuments();
    } catch {
      setError('Failed to create document');
    }
  };

  return (
    <div className="jarvis-hud-panel" style={{
      background: 'rgba(20,40,60,0.85)',
      border: '2px solid #00eaff',
      borderRadius: '24px',
      boxShadow: '0 0 32px #00eaff55',
      color: '#eaffff',
      padding: '2rem',
      fontFamily: 'Orbitron, monospace',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '60vh',
      animation: 'jarvisFadeIn 1s cubic-bezier(.4,2,.6,1)'
    }}>
      <h2 style={{
        fontSize: '2.2rem',
        letterSpacing: '0.15em',
        color: '#00eaff',
        textShadow: '0 0 8px #00eaff, 0 0 32px #00eaff55',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #00eaff33',
        paddingBottom: '0.5rem',
      }}>
        <span style={{ filter: 'drop-shadow(0 0 8px #00eaff)' }}>COLLABORATION DOCUMENTS</span>
      </h2>
      {loading ? (
        <div className="jarvis-loader">Loading documents...</div>
      ) : error ? (
        <div style={{ color: '#ff4b6b' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              background: 'linear-gradient(90deg, #00eaff 0%, #0055ff 100%)',
              color: '#0a1a2a',
              border: 'none',
              borderRadius: '12px',
              padding: '0.7rem 1.5rem',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 0 12px #00eaff99',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'background 0.2s',
            }}
          >
            {showCreate ? 'Cancel' : 'Create New Document'}
          </button>
          {showCreate && (
            <div style={{
              background: 'rgba(0,238,255,0.08)',
              border: '1px solid #00eaff55',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
              boxShadow: '0 0 16px #00eaff33',
              animation: 'jarvisFadeIn 0.5s',
            }}>
              <input
                type="text"
                placeholder="Document Title"
                value={newDoc.title}
                onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                style={{
                  width: '100%',
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #00eaff55',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#eaffff',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                }}
              />
              <textarea
                placeholder="Content"
                value={newDoc.content}
                onChange={e => setNewDoc({ ...newDoc, content: e.target.value })}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #00eaff55',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#eaffff',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                }}
              />
              <button
                onClick={handleCreate}
                style={{
                  background: 'linear-gradient(90deg, #00eaff 0%, #0055ff 100%)',
                  color: '#0a1a2a',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.2rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 0 8px #00eaff99',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  transition: 'background 0.2s',
                }}
              >
                Create
              </button>
            </div>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {documents.map(doc => (
              <div key={doc.id} style={{
                background: 'rgba(0,238,255,0.07)',
                border: '1.5px solid #00eaff55',
                borderRadius: '16px',
                padding: '1.2rem',
                boxShadow: '0 0 16px #00eaff33',
                position: 'relative',
                transition: 'transform 0.2s',
                overflow: 'hidden',
              }}>
                <h3 style={{ color: '#00eaff', fontSize: '1.3rem', marginBottom: '0.3rem', letterSpacing: '0.08em' }}>{doc.title}</h3>
                <div style={{ color: '#eaffffcc', fontSize: '1rem', marginBottom: '0.7rem', whiteSpace: 'pre-line' }}>{doc.content}</div>
                <div style={{ fontSize: '0.85rem', color: '#00eaff99', marginBottom: '0.5rem' }}>
                  Owner: {doc.owner}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#eaffff99', marginBottom: '0.5rem' }}>
                  Created: {new Date(doc.created_at).toLocaleString()}<br />
                  Updated: {new Date(doc.updated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes jarvisFadeIn {
          from { opacity: 0; transform: scale(0.98) translateY(24px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .jarvis-loader {
          color: #00eaff;
          font-size: 1.2rem;
          text-align: center;
          margin: 2rem 0;
          letter-spacing: 0.1em;
          text-shadow: 0 0 8px #00eaff, 0 0 32px #00eaff55;
        }
      `}</style>
    </div>
  );
}; 