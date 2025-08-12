import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Wand2, FileText, Target, Sparkles, Download } from 'lucide-react';

interface CopyTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export const CopyEngine: React.FC = () => {
  const [templates, setTemplates] = useState<CopyTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CopyTemplate | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyHistory, setCopyHistory] = useState<string[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const res = await fetch('/api/copy/templates');
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || []);
        } else {
          setTemplatesError('Failed to fetch templates');
        }
      } catch {
        setTemplatesError('Failed to fetch templates');
      }
      setTemplatesLoading(false);
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const res = await fetch('/api/copy/history');
        if (res.ok) {
          const data = await res.json();
          setCopyHistory(data.history || []);
        } else {
          setHistoryError('Failed to fetch copy history');
        }
      } catch {
        setHistoryError('Failed to fetch copy history');
      }
      setHistoryLoading(false);
    };
    fetchHistory();
  }, []);

  const generateCopy = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/copy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          template_id: selectedTemplate?.id || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedCopy(data.copy || '');
        // Optionally update history
        setCopyHistory(prev => [data.copy || '', ...prev.slice(0, 4)]);
      } else {
        setGenerateError('Failed to generate copy');
      }
    } catch {
      setGenerateError('Failed to generate copy');
    }
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCopy = (text: string, filename: string = 'generated-copy.txt') => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const useTemplate = (template: CopyTemplate) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-cyan-300 mb-2 flex items-center justify-center">
            <Copy className="w-8 h-8 mr-3" />
            Copy Engine
          </h2>
          <p className="text-cyan-200 text-lg">AI-powered copywriting assistant</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            {/* Templates */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Copy Templates
              </h3>
              {templatesLoading ? (
                <div className="text-cyan-200">Loading templates...</div>
              ) : templatesError ? (
                <div className="text-red-400">{templatesError}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map(template => (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => useTemplate(template)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-cyan-400 bg-cyan-900/20'
                          : 'border-cyan-500/20 bg-gray-800/50 hover:border-cyan-400/40'
                      }`}
                    >
                      <div className="text-cyan-100 font-medium text-sm">{template.name}</div>
                      <div className="text-cyan-400 text-xs mt-1">{template.description}</div>
                    </motion.button>
                  ))}
                  {templates.length === 0 && <div className="text-cyan-400 col-span-2">No templates found.</div>}
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Copy Brief
              </h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what kind of copy you need... (e.g., 'Write a compelling product description for a smart home assistant')"
                className="w-full p-4 rounded-lg bg-gray-800 text-cyan-100 border border-cyan-500/20 mb-4 focus:outline-none focus:border-cyan-400 transition resize-none"
                rows={6}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateCopy}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Copy
                  </>
                )}
              </motion.button>
              {generateError && <div className="text-red-400 mt-2">{generateError}</div>}
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            {/* Generated Copy */}
            {generatedCopy && (
              <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-200 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generated Copy
                  </h3>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(generatedCopy)}
                      className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadCopy(generatedCopy)}
                      className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                      title="Download copy"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/10">
                  <pre className="text-cyan-100 whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedCopy}
                  </pre>
                </div>
              </div>
            )}

            {/* Copy History */}
            <div className="bg-gray-900/70 rounded-2xl border border-cyan-500/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-cyan-200 mb-4">Recent Copies</h3>
              {historyLoading ? (
                <div className="text-cyan-200">Loading history...</div>
              ) : historyError ? (
                <div className="text-red-400">{historyError}</div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {copyHistory.map((copy, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-800/50 rounded-lg p-3 border border-cyan-500/10 hover:border-cyan-400/30 transition"
                    >
                      <div className="text-cyan-100 text-sm line-clamp-2 mb-2">
                        {copy.substring(0, 100)}...
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-400 text-xs">
                          {new Date().toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => copyToClipboard(copy)}
                          className="text-cyan-400 hover:text-cyan-300 text-xs"
                        >
                          Copy
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {copyHistory.length === 0 && <div className="text-cyan-400">No copies yet.</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};