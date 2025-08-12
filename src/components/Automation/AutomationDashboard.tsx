import React, { useEffect, useState } from 'react';

interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  last_run: string;
  logs: Array<{ id: string; status: string; message: string; started_at: string; finished_at: string }>;
}

export const AutomationDashboard: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newAutomation, setNewAutomation] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/automation/');
      const data = await res.json();
      setAutomations(data.automations || []);
    } catch (e) {
      setError('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newAutomation.name.trim()) return;
    try {
      await fetch('/api/automation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAutomation),
      });
      setShowCreate(false);
      setNewAutomation({ name: '', description: '' });
      fetchAutomations();
    } catch {
      setError('Failed to create automation');
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
        <span style={{ filter: 'drop-shadow(0 0 8px #00eaff)' }}>AUTOMATION CONTROL</span>
      </h2>
      {loading ? (
        <div className="jarvis-loader">Loading automations...</div>
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
            {showCreate ? 'Cancel' : 'Create New Automation'}
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
                placeholder="Automation Name"
                value={newAutomation.name}
                onChange={e => setNewAutomation({ ...newAutomation, name: e.target.value })}
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
                placeholder="Description"
                value={newAutomation.description}
                onChange={e => setNewAutomation({ ...newAutomation, description: e.target.value })}
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
            {automations.map(auto => (
              <div key={auto.id} style={{
                background: 'rgba(0,238,255,0.07)',
                border: '1.5px solid #00eaff55',
                borderRadius: '16px',
                padding: '1.2rem',
                boxShadow: '0 0 16px #00eaff33',
                position: 'relative',
                transition: 'transform 0.2s',
                overflow: 'hidden',
              }}>
                <h3 style={{ color: '#00eaff', fontSize: '1.3rem', marginBottom: '0.3rem', letterSpacing: '0.08em' }}>{auto.name}</h3>
                <div style={{ color: '#eaffffcc', fontSize: '1rem', marginBottom: '0.7rem' }}>{auto.description}</div>
                <div style={{ fontSize: '0.95rem', color: auto.enabled ? '#00ffb3' : '#ff4b6b', marginBottom: '0.5rem' }}>
                  {auto.enabled ? 'ENABLED' : 'DISABLED'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#00eaff99', marginBottom: '0.5rem' }}>
                  Last Run: {auto.last_run ? new Date(auto.last_run).toLocaleString() : 'Never'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#eaffff99', marginBottom: '0.5rem' }}>
                  Logs:
                  <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                    {auto.logs.map(log => (
                      <li key={log.id} style={{ color: log.status === 'success' ? '#00ffb3' : '#ff4b6b' }}>
                        {log.status.toUpperCase()}: {log.message} <span style={{ color: '#00eaff77' }}>({new Date(log.started_at).toLocaleTimeString()} - {new Date(log.finished_at).toLocaleTimeString()})</span>
                      </li>
                    ))}
                  </ul>
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