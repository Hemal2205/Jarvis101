import React, { useState, useEffect } from 'react';

interface Model {
  id: string;
  label: string;
}

interface LocalModel {
  name: string;
  path: string;
}

export const LLMSettingsPanel: React.FC = () => {
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [openaiKeyError, setOpenaiKeyError] = useState('');
  const [geminiKeyError, setGeminiKeyError] = useState('');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('llm_model_preference') || 'gpt-4');
  const [localModels, setLocalModels] = useState<LocalModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelFetchError, setModelFetchError] = useState<string | null>(null);

  const availableModels: Model[] = [
    { id: 'gpt-4', label: 'OpenAI GPT-4' },
    { id: 'gemini-pro', label: 'Gemini Pro' },
    { id: 'meta-llama-3-8b-instruct', label: 'Llama 3 (8B)' },
    { id: 'mistral-7b-instruct-v0.1', label: 'Mistral (7B)' },
    { id: 'dolphin-2_6-phi-2', label: 'Dolphin Phi-2' },
    { id: 'qwen2.5-coder-7b-instruct', label: 'Qwen Coder' },
  ];

  useEffect(() => {
    const fetchLocalModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('/api/llm/models');
        const data = await response.json();
        setLocalModels(data.local_models);
      } catch (error) {
        setModelFetchError('Failed to load local models');
        console.error('Failed to fetch local models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchLocalModels();
  }, []);

  useEffect(() => {
    localStorage.setItem('openai_api_key', openaiKey);
  }, [openaiKey]);

  useEffect(() => {
    localStorage.setItem('gemini_api_key', geminiKey);
  }, [geminiKey]);

  useEffect(() => {
    localStorage.setItem('llm_model_preference', selectedModel);
  }, [selectedModel]);

  const allModels: Model[] = [
    ...availableModels,
    ...localModels.map((m: LocalModel) => ({
      id: m.name,
      label: `Local: ${m.name.replace('.gguf', '')}`
    }))
  ];

  return (
    <div style={{
      background: 'rgba(20,40,60,0.85)',
      border: '2px solid #00eaff',
      borderRadius: '24px',
      boxShadow: '0 0 32px #00eaff55',
      color: '#eaffff',
      padding: '2rem',
      fontFamily: 'Orbitron, monospace',
      minWidth: 400,
      maxWidth: 480,
      margin: '2rem auto',
      animation: 'jarvisFadeIn 1s cubic-bezier(.4,2,.6,1)'
    }}>
      <h2 style={{
        fontSize: '2rem',
        letterSpacing: '0.12em',
        color: '#00eaff',
        textShadow: '0 0 8px #00eaff, 0 0 32px #00eaff55',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #00eaff33',
        paddingBottom: '0.5rem',
      }}>
        <span style={{ filter: 'drop-shadow(0 0 8px #00eaff)' }}>LLM API Keys & Model</span>
      </h2>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ color: '#00eaff', fontWeight: 700 }}>OpenAI API Key</label>
        <input
          type="password"
          value={openaiKey}
          onChange={e => {
            const value = e.target.value;
            setOpenaiKey(value);
            if (value && !value.startsWith('sk-')) {
              setOpenaiKeyError('OpenAI keys start with "sk-"');
            } else {
              setOpenaiKeyError('');
            }
          }}
          placeholder="sk-..."
          pattern="sk-[a-zA-Z0-9]+"
          style={{
            width: '100%',
            marginTop: 6,
            marginBottom: 12,
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #00eaff55',
            background: 'rgba(0,0,0,0.3)',
            color: '#eaffff',
            fontFamily: 'inherit',
            fontSize: '1rem',
          }}
        />
        {geminiKeyError && (
          <div style={{
            color: '#ff4b6b',
            fontSize: '0.8rem',
            marginTop: '-0.5rem',
            marginBottom: '1rem'
          }}>{geminiKeyError}</div>
        )}
        <div style={{
          fontSize: '0.8rem',
          color: '#eaffffaa',
          marginTop: '-0.5rem',
          marginBottom: '1rem'
        }}>
          Get Gemini keys: <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{color: '#00eaff'}}
          >aistudio.google.com/app/apikey</a>
        </div>
        {openaiKeyError && (
          <div style={{
            color: '#ff4b6b',
            fontSize: '0.8rem',
            marginTop: '-0.5rem',
            marginBottom: '1rem'
          }}>{openaiKeyError}</div>
        )}
        <div style={{
          fontSize: '0.8rem',
          color: '#eaffffaa',
          marginTop: '-0.5rem',
          marginBottom: '1rem'
        }}>
          Get OpenAI keys: <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{color: '#00eaff'}}
          >platform.openai.com/api-keys</a>
        </div>
        <label style={{ color: '#00eaff', fontWeight: 700 }}>Gemini API Key</label>
        <input
          type="password"
          value={geminiKey}
          onChange={e => {
            const value = e.target.value;
            setGeminiKey(value);
            if (value && value.length < 20) {
              setGeminiKeyError('Gemini keys should be at least 20 characters');
            } else {
              setGeminiKeyError('');
            }
          }}
          placeholder="..."
          minLength={20}
          style={{
            width: '100%',
            marginTop: 6,
            marginBottom: 12,
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #00eaff55',
            background: 'rgba(0,0,0,0.3)',
            color: '#eaffff',
            fontFamily: 'inherit',
            fontSize: '1rem',
          }}
        />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ color: '#00eaff', fontWeight: 700 }}>Active LLM Model</label>
        <select
          value={selectedModel}
          onChange={async (e) => {
            setIsModelLoading(true);
            setSelectedModel(e.target.value);
            // Simulate model loading time
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsModelLoading(false);
          }}
          style={{
            width: '100%',
            marginTop: 6,
            marginBottom: 12,
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #00eaff55',
            background: 'rgba(0,0,0,0.3)',
            color: '#eaffff',
            fontFamily: 'inherit',
            fontSize: '1rem',
          }}
          disabled={isLoadingModels || isModelLoading}
        >
          {isLoadingModels || isModelLoading ? (
            <option>Loading models...</option>
          ) : (
            <>
              {allModels.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </>
          )}
        </select>
      </div>
      <div style={{ color: '#00eaff', fontWeight: 700, marginBottom: 8 }}>Current Model Status</div>
      <div style={{
        background: 'rgba(0,238,255,0.08)',
        border: '1px solid #00eaff55',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 0 16px #00eaff33',
        color: '#eaffffcc',
        fontSize: '1rem',
      }}>
        <div>Selected Model: <span style={{ color: '#00eaff' }}>
          {allModels.find(m => m.id === selectedModel)?.label}
        </span></div>
        {isModelLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0.5rem 0',
            color: '#00eaff'
          }}>
            <div style={{
              width: '1rem',
              height: '1rem',
              border: '2px solid #00eaff',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Loading model...</span>
          </div>
        )}
        <div>OpenAI Key: <span style={{ color: openaiKey ? '#00ffb3' : '#ff4b6b' }}>
          {openaiKey ? 'Set' : 'Not Set'}
        </span></div>
        <div>Gemini Key: <span style={{ color: geminiKey ? '#00ffb3' : '#ff4b6b' }}>
          {geminiKey ? 'Set' : 'Not Set'}
        </span></div>
        {modelFetchError && (
          <div style={{
            color: '#ff4b6b',
            marginTop: '1rem',
            padding: '0.5rem',
            background: 'rgba(255,75,107,0.1)',
            borderRadius: '4px',
            borderLeft: '3px solid #ff4b6b'
          }}>
            <strong>Model Error:</strong> {modelFetchError}
          </div>
        )}
        {selectedModel.startsWith('gpt-') && !openaiKey && (
          <div style={{
            color: '#ff9e4b',
            marginTop: '1rem',
            padding: '0.5rem',
            background: 'rgba(255,158,75,0.1)',
            borderRadius: '4px',
            borderLeft: '3px solid #ff9e4b'
          }}>
            <strong>Warning:</strong> OpenAI API key required for this model
          </div>
        )}
        {selectedModel.startsWith('gemini') && !geminiKey && (
          <div style={{
            color: '#ff9e4b',
            marginTop: '1rem',
            padding: '0.5rem',
            background: 'rgba(255,158,75,0.1)',
            borderRadius: '4px',
            borderLeft: '3px solid #ff9e4b'
          }}>
            <strong>Warning:</strong> Gemini API key required for this model
          </div>
        )}
      </div>
      <style>{`
        @keyframes jarvisFadeIn {
          from { opacity: 0; transform: scale(0.98) translateY(24px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};