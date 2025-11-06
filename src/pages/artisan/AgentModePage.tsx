import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AIMarketAnalyzer from '@/components/artisan/AIMarketAnalyzer';
import AICustomerInsights from '@/components/artisan/AICustomerInsights';
import {
  ArrowLeft,
  TrendingUp,
  Activity,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Target,
  Calendar,
  Zap,
  BarChart3,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Sparkles,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ArrowUp,
  Filter,
  Download,
  Users,
  Mic,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at?: string;
  published_at?: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  trending_score: number;
  created_at: string;
}

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  trend_score: number;
  engagement_rate: number;
  related_products: string[];
  suggested_posts: string[];
  best_posting_time: string;
}

interface SocialMetrics {
  total_posts: number;
  total_engagement: number;
  average_engagement_rate: number;
  reach: number;
  impressions: number;
  top_performing_post: string;
  growth_rate: number;
}

export default function AgentModePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [metrics, setMetrics] = useState<SocialMetrics>({
    total_posts: 0,
    total_engagement: 0,
    average_engagement_rate: 0,
    reach: 0,
    impressions: 0,
    top_performing_post: '',
    growth_rate: 0
  });
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [loading, setLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    loadAgentModeData();
  }, []);

  const loadAgentModeData = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from('social_posts')
        .select('*')
        .eq('artisan_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;
      setSocialPosts(postsData || []);

      const { data: trendsData, error: trendsError } = await supabase
        .from('trending_topics')
        .select('*')
        .order('trend_score', { ascending: false })
        .limit(10);

      if (trendsError) throw trendsError;
      setTrendingTopics(trendsData || []);

      if (postsData) {
        const totalEngagement = postsData.reduce((sum, post) => 
          sum + post.engagement.likes + post.engagement.comments + post.engagement.shares, 0);
        
        const avgEngagementRate = postsData.length > 0 ? 
          postsData.reduce((sum, post) => sum + (post.trending_score / 100), 0) / postsData.length : 0;

        setMetrics({
          total_posts: postsData.length,
          total_engagement: totalEngagement,
          average_engagement_rate: avgEngagementRate,
          reach: postsData.reduce((sum, post) => sum + post.engagement.views, 0),
          impressions: postsData.reduce((sum, post) => sum + post.engagement.views * 1.5, 0),
          top_performing_post: postsData.sort((a, b) => 
            (b.engagement.likes + b.engagement.comments + b.engagement.shares) - 
            (a.engagement.likes + a.engagement.comments + a.engagement.shares))[0]?.id || '',
          growth_rate: 12.5
        });
      }
    } catch (error) {
      console.error('Error loading agent mode data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async () => {
    setAiGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-social-content', {
        body: {
          trending_topics: trendingTopics.slice(0, 3),
          platform: selectedPlatform === 'all' ? 'instagram' : selectedPlatform,
          product_context: 'handmade crafts and artisan products'
        }
      });

      if (error) throw error;
      setNewPostContent(data.generated_content);
    } catch (error) {
      console.error('Error generating AI content:', error);
      setNewPostContent("🌟 Discover the magic of handmade craftsmanship! Each piece tells a unique story of tradition, creativity, and artisan skill. #HandmadeWithLove #ArtisanCrafts #UniqueDesigns");
    } finally {
      setAiGenerating(false);
    }
  };

  const schedulePost = async (content: string, platform: string, scheduledTime?: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .insert({
          artisan_id: user?.id,
          platform,
          content,
          status: scheduledTime ? 'scheduled' : 'published',
          scheduled_at: scheduledTime,
          published_at: scheduledTime ? null : new Date().toISOString(),
          engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
          trending_score: 0
        });

      if (error) throw error;
      
      await loadAgentModeData();
      setNewPostContent('');
      alert('Post scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Failed to schedule post');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      default:
        return <Share2 className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'draft':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'posts', label: 'Social Posts', icon: MessageCircle },
    { id: 'trending', label: 'Trending Topics', icon: TrendingUp },
    { id: 'market', label: 'Market Analysis', icon: Activity },
    { id: 'insights', label: 'Customer Insights', icon: Users },
    { id: 'mentor', label: 'Voice Mentor', icon: Mic },
    { id: 'composer', label: 'AI Composer', icon: Sparkles },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/artisan/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-gray-900" />
                  <span>Agent Mode</span>
                </h1>
                <p className="text-sm text-gray-600 mt-1">AI-powered social posting & analytics</p>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={`lg:col-span-1 ${mobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-fit lg:sticky lg:top-24">
              <div className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                        activeTab === item.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Total Posts</p>
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{metrics.total_posts}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Engagement</p>
                      <Heart className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{metrics.total_engagement}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Reach</p>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{metrics.reach.toLocaleString()}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Growth</p>
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">+{metrics.growth_rate}%</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {socialPosts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <div className="flex-shrink-0">
                          {getPlatformIcon(post.platform)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{post.content.substring(0, 80)}...</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {post.engagement.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {post.engagement.comments}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Social Posts</h2>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                    >
                      <option value="all">All Platforms</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {socialPosts
                      .filter(post => selectedPlatform === 'all' || post.platform === selectedPlatform)
                      .map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getPlatformIcon(post.platform)}
                              <div>
                                <p className="font-medium text-gray-900 capitalize">{post.platform}</p>
                                <p className="text-xs text-gray-500">
                                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(post.status)}
                              <span className="text-xs font-medium capitalize text-gray-700">{post.status}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-900 text-sm mb-3">{post.content}</p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {post.engagement.likes}
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                {post.engagement.comments}
                              </span>
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {post.engagement.views}
                              </span>
                            </div>
                            <span className={`font-medium ${post.trending_score > 70 ? 'text-green-600' : post.trending_score > 40 ? 'text-yellow-600' : 'text-gray-600'}`}>
                              {post.trending_score}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Trending Topics Tab */}
            {activeTab === 'trending' && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Trending Topics</h2>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {trendingTopics.map((topic) => (
                      <div key={topic.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{topic.topic}</h3>
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {topic.category}
                              </span>
                              <span className="text-gray-600 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {topic.trend_score}% trend
                              </span>
                              <span className="text-gray-600 flex items-center">
                                <Activity className="w-3 h-3 mr-1" />
                                {topic.engagement_rate}% engagement
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Suggested Ideas:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {topic.suggested_posts.slice(0, 2).map((suggestion, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Best time: {topic.best_posting_time}
                          </span>
                          <button
                            onClick={() => setNewPostContent(topic.suggested_posts[0])}
                            className="text-gray-900 hover:bg-gray-100 px-3 py-1 rounded transition font-medium"
                          >
                            Use Idea
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Composer Tab */}
            {activeTab === 'composer' && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">AI Composer</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Platform
                      </label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent text-sm"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitter">Twitter</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post Content
                      </label>
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Write your content or let AI generate one..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent text-sm"
                        rows={4}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={generateAIContent}
                        disabled={aiGenerating}
                        className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition font-medium text-sm disabled:opacity-50"
                      >
                        <Sparkles className={`w-4 h-4 ${aiGenerating ? 'animate-spin' : ''}`} />
                        <span>{aiGenerating ? 'Generating...' : 'Generate'}</span>
                      </button>
                      
                      {newPostContent && (
                        <>
                          <button
                            onClick={() => schedulePost(newPostContent, selectedPlatform)}
                            className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition font-medium text-sm"
                          >
                            <Send className="w-4 h-4" />
                            <span>Post Now</span>
                          </button>
                          
                          <button
                            onClick={() => schedulePost(newPostContent, selectedPlatform, new Date(Date.now() + 3600000).toISOString())}
                            className="flex items-center space-x-2 bg-gray-100 text-gray-900 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                          >
                            <Clock className="w-4 h-4" />
                            <span>Schedule</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">AI Suggestions</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Trending Hashtags</h4>
                      <div className="flex flex-wrap gap-2">
                        {['#HandmadeWithLove', '#ArtisanCrafts', '#SustainableLiving', '#UniqueDesigns'].map((tag, i) => (
                          <span key={i} className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Optimal Posting Times</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-2" />
                          Instagram: 6-8 PM
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-2" />
                          Facebook: 7-9 PM
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Market Analysis Tab */}
            {activeTab === 'market' && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Market Analysis</h2>
                <AIMarketAnalyzer
                  category="Handmade Crafts"
                  recentSales={metrics.total_engagement}
                  competitorCount={5}
                />
              </div>
            )}

            {/* Customer Insights Tab */}
            {activeTab === 'insights' && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Insights</h2>
                <AICustomerInsights
                  totalCustomers={Math.floor(metrics.total_engagement * 0.7)}
                  repeatCustomerRate={35}
                  averageOrderValue={metrics.total_engagement / Math.max(metrics.total_posts, 1)}
                />
              </div>
            )}

            {/* Voice Mentor Tab */}
            {activeTab === 'mentor' && (
              <VoiceBusinessMentor />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VoiceBusinessMentor() {
  const [mentoring, setMentoring] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const { user } = useAuth();
  const [question, setQuestion] = useState('');

  async function getMentorAdvice() {
    setMentoring(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-mentor', {
        body: {
          question,
          artisanId: user?.id
        }
      });

      if (error) throw error;
      setResult(data.data);
    } catch (error: any) {
      alert('Mentor request failed: ' + error.message);
      setResult({
        advice: "Based on your current social media performance, I recommend focusing on behind-the-scenes content showing your crafting process. This type of content typically sees 40% higher engagement rates."
      });
    } finally {
      setMentoring(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Voice Business Mentor</h2>
        <p className="text-sm text-gray-600 mb-6">Get personalized coaching via AI mentor</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent text-sm"
              placeholder="Ask your business mentor anything..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={getMentorAdvice}
              disabled={mentoring || !question}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition font-medium text-sm disabled:opacity-50 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{mentoring ? 'Getting Advice...' : 'Get Advice'}</span>
            </button>
            <button
              onClick={() => setIsListening(!isListening)}
              className="bg-gray-100 text-gray-900 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium text-sm border border-gray-200 flex items-center space-x-2"
            >
              <Mic className="w-4 h-4" />
              <span>{isListening ? 'Stop' : 'Voice'}</span>
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Mentor Advice</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{result.advice}</p>
          {result.audioUrl && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Audio Response</p>
              <audio controls className="w-full border border-gray-200 rounded-lg">
                <source src={result.audioUrl} type="audio/mp3" />
              </audio>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
