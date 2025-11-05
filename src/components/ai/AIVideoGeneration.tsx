// AI Video Generation Component - Gemini 2.5 + Veo 2.0
import { useState } from 'react';
import { Video, Play, Download, Sparkles, Clock, Camera, Film } from 'lucide-react';
import { generateVideo } from '@/services/geminiService';

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  duration: number;
  timestamp: Date;
}

export default function AIVideoGeneration() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const durationOptions = [
    { value: 3, label: '3 seconds', description: 'Quick showcase' },
    { value: 5, label: '5 seconds', description: 'Standard length' },
    { value: 10, label: '10 seconds', description: 'Detailed demo' },
    { value: 15, label: '15 seconds', description: 'Extended showcase' }
  ];

  const samplePrompts = [
    'Artisan hands crafting pottery on a spinning wheel in a traditional studio',
    'Handwoven textile being created on an ancient loom with natural lighting',
    'Wooden jewelry box being carved with intricate details by skilled craftsman',
    'Metal jewelry being forged with traditional techniques in workshop setting',
    'Ceramic tiles being painted with traditional patterns by experienced artist'
  ];

  async function generateVideoAI(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const videoUrl = await generateVideo(prompt, duration);
      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        url: videoUrl,
        prompt: prompt,
        duration: duration,
        timestamp: new Date()
      };
      setGeneratedVideos(prev => [newVideo, ...prev]);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadVideo(videoUrl: string, prompt: string) {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `ai-generated-video-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function useSamplePrompt(samplePrompt: string) {
    setPrompt(samplePrompt);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Video Generation</h2>
          <p className="text-sm text-slate-600">Powered by Gemini 2.5 + Veo 2.0</p>
        </div>
      </div>

      {/* Video Generation Form */}
      <form onSubmit={generateVideoAI} className="mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Describe the video you want to generate
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Artisan hands crafting pottery on spinning wheel, detailed work process, warm studio lighting, professional cinematography..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
            <div className="text-xs text-slate-500 mt-1">
              {prompt.length}/500 characters
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Video Duration
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDuration(option.value)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    duration === option.value
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <div className="text-xs opacity-75">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Video...' : 'Generate Video'}</span>
          </button>
        </div>
      </form>

      {/* Sample Prompts */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Film className="w-4 h-4" />
          Sample Video Prompts
        </h3>
        <div className="space-y-2">
          {samplePrompts.map((samplePrompt, index) => (
            <button
              key={index}
              onClick={() => useSamplePrompt(samplePrompt)}
              className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-sm text-slate-700"
            >
              {samplePrompt}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            Video generation requires Gemini 2.5 Pro API access
          </p>
        </div>
      )}

      {/* Generated Videos Gallery */}
      {generatedVideos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Generated Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedVideos.map((video) => (
              <div key={video.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="aspect-video bg-black rounded-lg mb-3 overflow-hidden">
                  <video
                    src={video.url}
                    controls
                    className="w-full h-full object-cover"
                    onPlay={() => setPlayingVideo(video.id)}
                    onPause={() => setPlayingVideo(null)}
                    onEnded={() => setPlayingVideo(null)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <p className="text-sm text-slate-700 mb-3 line-clamp-2">{video.prompt}</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{video.duration} seconds</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {video.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <button
                  onClick={() => downloadVideo(video.url, video.prompt)}
                  className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download Video
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatedVideos.length === 0 && !isGenerating && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-2">No videos generated yet</p>
          <p className="text-sm text-slate-500">Describe a video and let AI create it for you</p>
        </div>
      )}
    </div>
  );
}