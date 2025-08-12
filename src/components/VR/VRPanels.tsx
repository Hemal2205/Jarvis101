import React, { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';

// MemoryVaultPanel fetches from /api/vr/memories
export const MemoryVaultPanel = ({ position }: { position: [number, number, number] }) => {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vr/memories')
      .then(res => res.json())
      .then(data => setMemories(data.memories || []))
      .catch(() => setMemories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <group position={position}>
      <Html center style={{ pointerEvents: 'auto' }}>
        <div style={{
          background: 'rgba(20,40,60,0.85)',
          border: '2px solid #00eaff',
          borderRadius: '18px',
          boxShadow: '0 0 24px #00eaff55',
          color: '#eaffff',
          padding: '1.2rem',
          minWidth: 320,
          minHeight: 220,
          fontFamily: 'Orbitron, monospace',
          animation: 'jarvisFadeIn 1s cubic-bezier(.4,2,.6,1)'
        }}>
          <h3 style={{ color: '#00eaff', fontSize: '1.2rem', marginBottom: 8, letterSpacing: '0.08em' }}>Memory Vault</h3>
          {loading ? <div style={{ color: '#00eaff' }}>Loading...</div> : (
            <ul style={{ maxHeight: 120, overflowY: 'auto', padding: 0, margin: 0 }}>
              {memories.length === 0 && <li style={{ color: '#aaa' }}>No memories found.</li>}
              {memories.map((m, i) => (
                <li key={m.id || i} style={{ marginBottom: 6, color: '#eaffffcc', fontSize: '0.98rem' }}>
                  <span style={{ color: '#00eaff' }}>{m.title || m.type || 'Memory'}:</span> {m.content || m.summary || '...'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Html>
    </group>
  );
};

// TaskBoardPanel fetches from /api/vr/taskboard
export const TaskBoardPanel = ({ position }: { position: [number, number, number] }) => {
  const [taskBoard, setTaskBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vr/taskboard')
      .then(res => res.json())
      .then(data => setTaskBoard(data.task_board || null))
      .catch(() => setTaskBoard(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <group position={position}>
      <Html center style={{ pointerEvents: 'auto' }}>
        <div style={{
          background: 'rgba(20,40,60,0.85)',
          border: '2px solid #00eaff',
          borderRadius: '18px',
          boxShadow: '0 0 24px #00eaff55',
          color: '#eaffff',
          padding: '1.2rem',
          minWidth: 320,
          minHeight: 220,
          fontFamily: 'Orbitron, monospace',
          animation: 'jarvisFadeIn 1s cubic-bezier(.4,2,.6,1)'
        }}>
          <h3 style={{ color: '#00eaff', fontSize: '1.2rem', marginBottom: 8, letterSpacing: '0.08em' }}>Task Board</h3>
          {loading ? <div style={{ color: '#00eaff' }}>Loading...</div> : (
            <ul style={{ maxHeight: 120, overflowY: 'auto', padding: 0, margin: 0 }}>
              {!taskBoard && <li style={{ color: '#aaa' }}>No tasks found.</li>}
              {taskBoard && taskBoard.tasks && taskBoard.tasks.map((t: any, i: number) => (
                <li key={t.id || i} style={{ marginBottom: 6, color: '#eaffffcc', fontSize: '0.98rem' }}>
                  <span style={{ color: '#00eaff' }}>{t.title || 'Task'}:</span> {t.description || '...'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Html>
    </group>
  );
};

// LearningDashboardPanel can remain mock/placeholder
export const LearningDashboardPanel = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <Html center style={{ pointerEvents: 'auto' }}>
        <div style={{
          background: 'rgba(20,40,60,0.85)',
          border: '2px solid #00eaff',
          borderRadius: '18px',
          boxShadow: '0 0 24px #00eaff55',
          color: '#eaffff',
          padding: '1.2rem',
          minWidth: 320,
          minHeight: 220,
          fontFamily: 'Orbitron, monospace',
          animation: 'jarvisFadeIn 1s cubic-bezier(.4,2,.6,1)'
        }}>
          <h3 style={{ color: '#00eaff', fontSize: '1.2rem', marginBottom: 8, letterSpacing: '0.08em' }}>Learning Dashboard</h3>
          <div style={{ color: '#eaffffcc', fontSize: '0.98rem' }}>
            <div>AI-powered learning analytics and progress will appear here.</div>
            <div style={{ color: '#00eaff99', marginTop: 8 }}>Coming soon...</div>
          </div>
        </div>
      </Html>
    </group>
  );
};

// JARVIS HUD style animation
// Add this to your global CSS if not present:
// @keyframes jarvisFadeIn { from { opacity: 0; transform: scale(0.98) translateY(24px); } to { opacity: 1; transform: scale(1) translateY(0); } } 