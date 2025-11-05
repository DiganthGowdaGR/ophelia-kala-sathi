import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Lightbulb, TrendingUp, Target, Award, Play, Pause } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VoiceInteraction {
  id: string;
  transcript: string;
  response: string;
  audio_url: string;
  interaction_type: string;
  language: string;
  created_at: string;
}

export default function VoiceMentorPage() {
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  
  // Form state
  const [textQuery, setTextQuery] = useState('');
  const [category, setCategory] = useState('general');

  useEffect(() => {
    loadInteractions();
  }, []);

  const loadInteractions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('voice_interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  };

  const handleAskMentor = async () => {
    if (!textQuery.trim()) {
      alert('Please enter your question');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call voice mentor edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'mentor-voice',
        {
          body: {
            query: textQuery,
            category,
            artisanId: user.id,
            voiceEnabled: true
          }
        }
      );

      if (functionError) throw functionError;

      // Save interaction to database
      const { error: insertError } = await supabase
        .from('voice_interactions')
        .insert({
          user_id: user.id,
          transcript: textQuery,
          response: functionData?.data?.response || functionData?.response || 'No response',
          audio_url: functionData?.data?.audioUrl || functionData?.audioUrl || null,
          interaction_type: category,
          language: 'en'
        });

      if (insertError) throw insertError;

      alert('Mentor response received!');
      setTextQuery('');
      await loadInteractions();
    } catch (error) {
      console.error('Error asking mentor:', error);
      alert('Failed to get mentor response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayAudio = (audioUrl: string) => {
    if (playing === audioUrl) {
      setPlaying(null);
      // In a real implementation, stop the audio playback
    } else {
      setPlaying(audioUrl);
      // In a real implementation, start audio playback
      setTimeout(() => setPlaying(null), 3000); // Simulate audio completion
    }
  };

  const quickQuestions = [
    { text: "How can I increase my sales?", category: "business_growth" },
    { text: "What pricing strategy should I use?", category: "pricing" },
    { text: "How do I market my products effectively?", category: "marketing" },
    { text: "Should I expand to new product lines?", category: "product_strategy" }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">AI Business Mentor</h1>
          <p className="text-gray-600 mt-2">Get personalized business guidance with voice responses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ask Mentor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Query Interface */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ask Your Mentor</h2>

              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General Business Advice</option>
                    <option value="business_growth">Business Growth</option>
                    <option value="pricing">Pricing Strategy</option>
                    <option value="marketing">Marketing & Sales</option>
                    <option value="product_strategy">Product Strategy</option>
                    <option value="operations">Operations & Workflow</option>
                  </select>
                </div>

                {/* Text Query */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    placeholder="Ask about growing your business, pricing strategies, marketing tips, or any business challenge you're facing..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleAskMentor}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Lightbulb className="h-5 w-5 mr-2" />
                      Ask Mentor
                    </>
                  )}
                </button>

                {/* Quick Questions */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Questions</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {quickQuestions.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setTextQuery(q.text);
                          setCategory(q.category);
                        }}
                        className="text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                      >
                        {q.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Interactions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Sessions</h3>
              <div className="space-y-4">
                {interactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No mentor sessions yet. Ask your first question above!</p>
                ) : (
                  interactions.map((interaction) => (
                    <div key={interaction.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{interaction.transcript}</div>
                          <div className="text-sm text-gray-700 mb-2">{interaction.response}</div>
                          <div className="flex items-center space-x-4">
                            <div className="text-xs text-gray-500">
                              {new Date(interaction.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {interaction.interaction_type}
                            </div>
                          </div>
                        </div>
                        {interaction.audio_url && (
                          <button
                            onClick={() => togglePlayAudio(interaction.audio_url)}
                            className="ml-4 p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition"
                          >
                            {playing === interaction.audio_url ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Mentor Insights Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mentor Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Sessions Completed</div>
                    <div className="text-2xl font-bold text-gray-900">{interactions.length}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Topics Covered</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {new Set(interactions.map(i => i.interaction_type)).size || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Categories</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {new Set(interactions.map(i => i.interaction_type)).size || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">Mentor Tips</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Ask specific questions for better guidance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Include context about your business</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Voice responses help you multitask</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Review past sessions for insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
