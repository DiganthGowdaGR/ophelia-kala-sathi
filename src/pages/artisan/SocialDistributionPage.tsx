import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Instagram, Facebook, Twitter, MessageCircle, Send, CheckCircle, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Campaign {
  id: string;
  campaign_name: string;
  platforms: string[];
  content: any;
  schedule_time: string;
  status: string;
  metrics: any;
  created_at: string;
}

interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
}

const platforms: Platform[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500', enabled: true },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', enabled: true },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500', enabled: true },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: MessageCircle, color: 'bg-green-500', enabled: true },
];

export default function SocialDistributionPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'facebook']);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduleTime, setScheduleTime] = useState('now');
  const [customTime, setCustomTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('distribution_campaigns')
        .select('*')
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleDistribute = async () => {
    if (!title || !description || selectedPlatforms.length === 0) {
      alert('Please fill in title, description, and select at least one platform');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const hashtagArray = hashtags.split(',').map(h => h.trim()).filter(h => h);
      
      const contentData = {
        title,
        description,
        hashtags: hashtagArray,
        imageUrl: imageUrl || null
      };

      const scheduledTime = scheduleTime === 'now' 
        ? new Date().toISOString()
        : new Date(customTime).toISOString();

      // Call social distribution edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'social-distribution',
        {
          body: {
            platforms: selectedPlatforms,
            content: contentData,
            scheduleTime: scheduledTime,
            artisanId: user.id
          }
        }
      );

      if (functionError) throw functionError;

      // Save campaign to database
      const { error: insertError } = await supabase
        .from('distribution_campaigns')
        .insert({
          artisan_id: user.id,
          campaign_name: title,
          platforms: selectedPlatforms,
          content: contentData,
          schedule_time: scheduledTime,
          status: scheduleTime === 'now' ? 'completed' : 'scheduled',
          metrics: functionData?.results || {}
        });

      if (insertError) throw insertError;

      alert('Content distributed successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setHashtags('');
      setImageUrl('');
      setScheduleTime('now');
      
      await loadCampaigns();
    } catch (error) {
      console.error('Error distributing content:', error);
      alert('Failed to distribute content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Posted</span>;
      case 'scheduled':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Scheduled</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/artisan/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Social Media Distribution</h1>
          <p className="text-gray-600 mt-2">Post to multiple platforms with one click</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Distribution Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Post</h2>

              <div className="space-y-6">
                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Platforms
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatforms.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          onClick={() => togglePlatform(platform.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? `${platform.color} bg-opacity-10 border-current text-gray-900`
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-6 w-6 mx-auto mb-2" />
                          <div className="text-xs font-medium">{platform.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., New Ceramic Collection Launch"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share your story, product details, or announcement..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {description.length} / 280 characters
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="Handmade, ArtisanCraft, Pottery (comma-separated)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="now"
                          checked={scheduleTime === 'now'}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Post Now</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="later"
                          checked={scheduleTime === 'later'}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Schedule for Later</span>
                      </label>
                    </div>
                    {scheduleTime === 'later' && (
                      <input
                        type="datetime-local"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleDistribute}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {scheduleTime === 'now' ? 'Post Now' : 'Schedule Post'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Campaign History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h3>
              <div className="space-y-3">
                {campaigns.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">No campaigns yet</p>
                ) : (
                  campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{campaign.campaign_name}</h4>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        {campaign.platforms.map((platform) => {
                          const p = platforms.find(pl => pl.id === platform);
                          if (!p) return null;
                          const Icon = p.icon;
                          return (
                            <div key={platform} className={`${p.color} bg-opacity-10 p-1 rounded`}>
                              <Icon className="h-3 w-3" />
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                      {campaign.metrics && Object.keys(campaign.metrics).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          {Object.entries(campaign.metrics).map(([platform, metrics]: [string, any]) => (
                            <div key={platform} className="text-xs text-gray-600">
                              {platform}: {metrics.reach || 0} reach, {metrics.engagement || 0} engagements
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
