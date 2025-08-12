import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  FileText, 
  Image, 
  Video, 
  Mic, 
  Share2, 
  Settings, 
  Download, 
  Eye, 
  Edit3,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  X,
  Save,
  Play,
  Pause,
  Volume2,
  Type,
  Hash,
  Globe,
  Users,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

// Content Types
type ContentType = 'blog' | 'social' | 'email' | 'report' | 'presentation' | 'video' | 'infographic';

// Content Interface
interface ContentPiece {
  id: string;
  title: string;
  content: string;
  type: ContentType;
  status: 'draft' | 'review' | 'published' | 'scheduled';
  brand_voice: string;
  seo_keywords: string[];
  target_audience: string;
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'creative';
  word_count: number;
  reading_time: number;
  seo_score: number;
  engagement_score: number;
  created_at: string;
  updated_at: string;
  scheduled_for?: string;
  published_at?: string;
  analytics?: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    click_through_rate: number;
  };
}

// Brand Voice Profile
interface BrandVoice {
  id: string;
  name: string;
  description: string;
  tone_guidelines: string[];
  vocabulary_preferences: string[];
  style_examples: string[];
  target_audience: string;
  industry: string;
}

// SEO Analysis
interface SEOAnalysis {
  score: number;
  keyword_density: { [keyword: string]: number };
  readability_score: number;
  title_optimization: number;
  meta_description_score: number;
  suggestions: string[];
  competitor_analysis: {
    top_keywords: string[];
    content_gaps: string[];
    opportunities: string[];
  };
}

// Content Calendar
interface ContentCalendar {
  id: string;
  title: string;
  content_type: ContentType;
  status: 'planned' | 'in_progress' | 'review' | 'scheduled' | 'published';
  scheduled_date: string;
  platform: string;
  target_audience: string;
  campaign?: string;
}

interface AIContentSuiteProps {
  isActive: boolean;
  onClose?: () => void;
}

export const AIContentSuite: React.FC<AIContentSuiteProps> = ({ 
  isActive, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'calendar' | 'analytics' | 'brand' | 'seo'>('create');
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentPiece | null>(null);
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const [contentCalendar, setContentCalendar] = useState<ContentCalendar[]>([]);
  const { notify } = useNotification();

  // Content creation form
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    keywords: '',
    target_audience: '',
    tone: 'professional' as const,
    brand_voice: '',
    word_count: 500,
    platform: 'website'
  });

  // Generated content
  const [generatedContent, setGeneratedContent] = useState({
    title: '',
    content: '',
    seo_meta_description: '',
    social_media_posts: [] as string[],
    hashtags: [] as string[]
  });

  useEffect(() => {
    if (isActive) {
      loadBrandVoices();
      loadContentCalendar();
    }
  }, [isActive]);

  const loadBrandVoices = async () => {
    try {
      const response = await fetch('/api/content/brand-voices');
      const data = await response.json();
      if (data.success) {
        setBrandVoices(data.brand_voices || []);
      }
    } catch (error) {
      console.error('Failed to load brand voices:', error);
    }
  };

  const loadContentCalendar = async () => {
    try {
      const response = await fetch('/api/content/calendar');
      const data = await response.json();
      if (data.success) {
        setContentCalendar(data.calendar || []);
      }
    } catch (error) {
      console.error('Failed to load content calendar:', error);
    }
  };

  const generateContent = async () => {
    if (!contentForm.title.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentForm,
          content_type: contentType
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedContent(data.content);
        notify('Content generated successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      notify('Failed to generate content', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeSEO = async (content: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/content/seo-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, keywords: contentForm.keywords })
      });

      const data = await response.json();
      if (data.success) {
        setSeoAnalysis(data.analysis);
        notify('SEO analysis completed!', 'success');
      }
    } catch (error) {
      console.error('Failed to analyze SEO:', error);
      notify('Failed to analyze SEO', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveContent = async () => {
    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...generatedContent,
          ...contentForm,
          content_type: contentType
        })
      });

      const data = await response.json();
      if (data.success) {
        notify('Content saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      notify('Failed to save content', 'error');
    }
  };

  const scheduleContent = async (scheduledDate: string) => {
    try {
      const response = await fetch('/api/content/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...generatedContent,
          ...contentForm,
          content_type: contentType,
          scheduled_date: scheduledDate
        })
      });

      const data = await response.json();
      if (data.success) {
        notify('Content scheduled successfully!', 'success');
        await loadContentCalendar();
      }
    } catch (error) {
      console.error('Failed to schedule content:', error);
      notify('Failed to schedule content', 'error');
    }
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'blog': return FileText;
      case 'social': return Share2;
      case 'email': return Type;
      case 'report': return BarChart3;
      case 'presentation': return Target;
      case 'video': return Video;
      case 'infographic': return Image;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-500 bg-green-500/10';
      case 'scheduled': return 'text-blue-500 bg-blue-500/10';
      case 'review': return 'text-yellow-500 bg-yellow-500/10';
      case 'draft': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border border-cyan-500/30 rounded-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <PenTool className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">AI Content Creation Suite</h1>
              <p className="text-gray-400 text-sm">Multi-format content generation with AI assistance</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-4 bg-gray-800/50">
          {[
            { id: 'create', label: 'Create', icon: PenTool },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'brand', label: 'Brand Voice', icon: Users },
            { id: 'seo', label: 'SEO Tools', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-6"
            >
              {activeTab === 'create' && (
                <div className="grid grid-cols-2 gap-6">
                  {/* Content Creation Form */}
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Content Creation</h3>
                      
                      {/* Content Type Selection */}
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm mb-2">Content Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['blog', 'social', 'email', 'report', 'presentation', 'video'] as ContentType[]).map((type) => {
                            const Icon = getContentTypeIcon(type);
                            return (
                              <button
                                key={type}
                                onClick={() => setContentType(type)}
                                className={`p-3 rounded-lg border transition-colors flex flex-col items-center space-y-2 ${
                                  contentType === type
                                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs capitalize">{type}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Content title or topic"
                          value={contentForm.title}
                          onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                        <textarea
                          placeholder="Brief description or requirements"
                          value={contentForm.description}
                          onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-20"
                        />
                        <input
                          type="text"
                          placeholder="Target keywords (comma-separated)"
                          value={contentForm.keywords}
                          onChange={(e) => setContentForm({ ...contentForm, keywords: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Target audience"
                          value={contentForm.target_audience}
                          onChange={(e) => setContentForm({ ...contentForm, target_audience: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                        <select
                          value={contentForm.tone}
                          onChange={(e) => setContentForm({ ...contentForm, tone: e.target.value as any })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        >
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="friendly">Friendly</option>
                          <option value="authoritative">Authoritative</option>
                          <option value="creative">Creative</option>
                        </select>
                        <select
                          value={contentForm.brand_voice}
                          onChange={(e) => setContentForm({ ...contentForm, brand_voice: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        >
                          <option value="">Select Brand Voice</option>
                          {brandVoices.map((voice) => (
                            <option key={voice.id} value={voice.id}>{voice.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Target word count"
                          value={contentForm.word_count}
                          onChange={(e) => setContentForm({ ...contentForm, word_count: parseInt(e.target.value) })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                      </div>

                      <button
                        onClick={generateContent}
                        disabled={isGenerating || !contentForm.title.trim()}
                        className="w-full mt-4 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Generated Content Preview */}
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Generated Content</h3>
                      
                      {generatedContent.title ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-white mb-2">Title</h4>
                            <div className="bg-gray-800 border border-gray-700 rounded p-3 text-white">
                              {generatedContent.title}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-white mb-2">Content</h4>
                            <div className="bg-gray-800 border border-gray-700 rounded p-3 text-white max-h-60 overflow-y-auto">
                              {generatedContent.content}
                            </div>
                          </div>

                          {generatedContent.seo_meta_description && (
                            <div>
                              <h4 className="font-medium text-white mb-2">SEO Meta Description</h4>
                              <div className="bg-gray-800 border border-gray-700 rounded p-3 text-white">
                                {generatedContent.seo_meta_description}
                              </div>
                            </div>
                          )}

                          {generatedContent.social_media_posts.length > 0 && (
                            <div>
                              <h4 className="font-medium text-white mb-2">Social Media Posts</h4>
                              <div className="space-y-2">
                                {generatedContent.social_media_posts.map((post, index) => (
                                  <div key={index} className="bg-gray-800 border border-gray-700 rounded p-3 text-white">
                                    {post}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {generatedContent.hashtags.length > 0 && (
                            <div>
                              <h4 className="font-medium text-white mb-2">Suggested Hashtags</h4>
                              <div className="flex flex-wrap gap-2">
                                {generatedContent.hashtags.map((hashtag, index) => (
                                  <span key={index} className="px-2 py-1 bg-cyan-600 text-white rounded text-sm">
                                    {hashtag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <button
                              onClick={saveContent}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              <Save className="w-4 h-4 inline mr-2" />
                              Save
                            </button>
                            <button
                              onClick={() => analyzeSEO(generatedContent.content)}
                              disabled={isAnalyzing}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
                            >
                              <TrendingUp className="w-4 h-4 inline mr-2" />
                              {isAnalyzing ? 'Analyzing...' : 'SEO Analysis'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Fill out the form and click "Generate Content" to create AI-powered content</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-cyan-400">Content Calendar</h3>
                    <button className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Schedule Content
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contentCalendar.map((item) => {
                      const Icon = getContentTypeIcon(item.content_type);
                      return (
                        <div key={item.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Icon className="w-5 h-5 text-cyan-400" />
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <h4 className="font-medium text-white mb-2">{item.title}</h4>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>Platform: {item.platform}</div>
                            <div>Audience: {item.target_audience}</div>
                            <div>Scheduled: {new Date(item.scheduled_date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Content Analytics</h3>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-400">Total Views</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">12,847</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-400">Engagement Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">8.4%</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Share2 className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400">Shares</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">1,234</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-400">CTR</span>
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">3.2%</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'brand' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Brand Voice Management</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {brandVoices.map((voice) => (
                      <div key={voice.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-white">{voice.name}</h4>
                          <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">{voice.description}</p>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-500">Industry:</span>
                            <span className="text-white ml-2">{voice.industry}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Target Audience:</span>
                            <span className="text-white ml-2">{voice.target_audience}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">SEO Analysis</h3>
                  
                  {seoAnalysis ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-white">{seoAnalysis.score}/100</div>
                          <div className="text-sm text-gray-400">SEO Score</div>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-white">{seoAnalysis.readability_score}/100</div>
                          <div className="text-sm text-gray-400">Readability</div>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-white">{seoAnalysis.title_optimization}/100</div>
                          <div className="text-sm text-gray-400">Title Optimization</div>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-white">{seoAnalysis.meta_description_score}/100</div>
                          <div className="text-sm text-gray-400">Meta Description</div>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                        <h4 className="font-medium text-white mb-4">SEO Suggestions</h4>
                        <ul className="space-y-2">
                          {seoAnalysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Generate content first, then analyze its SEO performance</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}; 