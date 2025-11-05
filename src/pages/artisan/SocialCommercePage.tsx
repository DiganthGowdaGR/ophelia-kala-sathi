import { useState } from 'react';
import { Users, MessageCircle, Video, Star, TrendingUp, Share2, Award } from 'lucide-react';
import Navigation from '@/components/shared/Navigation';
import { supabase } from '@/lib/supabase';

export default function SocialCommercePage() {
  const [activeTab, setActiveTab] = useState('social-network');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSocialAction = async (action: string, data: any) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase.functions.invoke('social-network-manager', {
        body: { action, userId: user?.id, ...data }
      });
      
      if (error) throw error;
      setResults(result);
    } catch (error: any) {
      setResults({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleLiveStream = async (action: string, data: any) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase.functions.invoke('live-stream-manager', {
        body: { action, artisanId: user?.id, ...data }
      });
      
      if (error) throw error;
      setResults(result);
    } catch (error: any) {
      setResults({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const tabs = [
    { id: 'social-network', label: 'Social Network', icon: Users },
    { id: 'live-streaming', label: 'Live Commerce', icon: Video },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
    { id: 'influencer', label: 'Influencer Hub', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Social Commerce & Community
              </h1>
              <p className="text-lg text-gray-600 mt-1">Build connections, engage customers, grow your brand</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Social Network Tab */}
        {activeTab === 'social-network' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Post */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-violet-100">
              <div className="flex items-center space-x-3 mb-6">
                <MessageCircle className="w-6 h-6 text-violet-500" />
                <h3 className="text-2xl font-bold text-gray-900">Create Social Post</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSocialAction('createPost', {
                  postData: {
                    content: formData.get('content'),
                    type: 'text'
                  }
                });
              }}>
                <textarea
                  name="content"
                  rows={4}
                  placeholder="Share your latest creation, workshop, or news..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={processing}
                  className="mt-4 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Posting...' : 'Share Post'}
                </button>
              </form>
            </div>

            {/* Get Feed */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-violet-100">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-fuchsia-500" />
                <h3 className="text-2xl font-bold text-gray-900">Social Feed</h3>
              </div>
              <p className="text-gray-600 mb-6">
                View posts from artisans and customers you follow
              </p>
              <button
                onClick={() => handleSocialAction('getFeed', {})}
                disabled={processing}
                className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {processing ? 'Loading...' : 'Load Feed'}
              </button>
              
              {results?.data && Array.isArray(results.data) && (
                <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
                  {results.data.slice(0, 10).map((post: any, idx: number) => (
                    <div key={idx} className="p-4 bg-violet-50 rounded-lg border border-violet-100">
                      <p className="text-gray-800 font-medium">{post.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{post.likes_count} likes</span>
                        <span>{post.comments_count} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Streaming Tab */}
        {activeTab === 'live-streaming' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Stream */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-fuchsia-100">
              <div className="flex items-center space-x-3 mb-6">
                <Video className="w-6 h-6 text-fuchsia-500" />
                <h3 className="text-2xl font-bold text-gray-900">Create Live Stream</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleLiveStream('createStream', {
                  streamData: {
                    title: formData.get('title'),
                    description: formData.get('description')
                  }
                });
              }}>
                <input
                  type="text"
                  name="title"
                  placeholder="Stream title"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-fuchsia-500"
                  required
                />
                <textarea
                  name="description"
                  rows={3}
                  placeholder="What will you showcase in this stream?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={processing}
                  className="mt-4 w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Creating...' : 'Schedule Stream'}
                </button>
              </form>
            </div>

            {/* Active Streams */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
              <div className="flex items-center space-x-3 mb-6">
                <Video className="w-6 h-6 text-pink-500" />
                <h3 className="text-2xl font-bold text-gray-900">Active Streams</h3>
              </div>
              <p className="text-gray-600 mb-6">
                View all live streams happening now
              </p>
              <button
                onClick={() => handleLiveStream('getActiveStreams', {})}
                disabled={processing}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {processing ? 'Loading...' : 'View Live Streams'}
              </button>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-violet-100">
            <div className="flex items-center space-x-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="text-2xl font-bold text-gray-900">Reviews & Social Proof</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Average Rating</span>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">4.8 / 5.0</p>
                <p className="text-sm text-gray-600 mt-1">Based on 247 reviews</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Verified Purchases</span>
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">89%</p>
                <p className="text-sm text-gray-600 mt-1">High authenticity rate</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Response Rate</span>
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">95%</p>
                <p className="text-sm text-gray-600 mt-1">Within 24 hours</p>
              </div>
            </div>
          </div>
        )}

        {/* Influencer Hub Tab */}
        {activeTab === 'influencer' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-fuchsia-100">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-6 h-6 text-fuchsia-500" />
              <h3 className="text-2xl font-bold text-gray-900">Influencer Collaboration Hub</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <h4 className="font-semibold text-lg text-gray-900 mb-4">Find Influencers</h4>
                <p className="text-gray-600 mb-4">Connect with influencers who match your brand aesthetic and values</p>
                <button className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition">
                  Browse Influencers
                </button>
              </div>
              <div className="p-6 bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-xl border border-fuchsia-200">
                <h4 className="font-semibold text-lg text-gray-900 mb-4">Active Collaborations</h4>
                <p className="text-gray-600 mb-4">Manage ongoing partnerships and track campaign performance</p>
                <button className="px-6 py-2 bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 transition">
                  View Campaigns
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Result</h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
