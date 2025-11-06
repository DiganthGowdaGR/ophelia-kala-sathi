// AI Image Generation Component - Google Imagen 3.0
import { useState } from 'react';
import { Image, Sparkles, Download, Copy, CheckCircle2, Palette, Camera, Wand2 } from 'lucide-react';
import { generateImage } from '@/services/geminiService';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  imageType: string;
  style: string;
  timestamp: Date;
}

export default function AIImageGeneration() {
  const [prompt, setPrompt] = useState('');
  const [imageType, setImageType] = useState('product_poster');
  const [style, setStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imageTypeOptions = [
    { value: 'product_poster', label: 'Product Poster', description: '1:1 Square' },
    { value: 'social_ad', label: 'Social Media Ad', description: '1:1 Square' },
    { value: 'hero_banner', label: 'Hero Banner', description: '16:9 Widescreen' },
    { value: 'lifestyle_shot', label: 'Lifestyle Shot', description: '4:3 Natural' }
  ];

  const styleOptions = [
    { value: 'realistic', label: 'Realistic', icon: Camera },
    { value: 'artistic', label: 'Artistic', icon: Palette },
    { value: 'minimalist', label: 'Minimalist', icon: Wand2 },
    { value: 'vintage', label: 'Vintage', icon: Image }
  ];

  async function generateImageAI(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateImage(prompt, imageType, style);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt,
        imageType,
        style,
        timestamp: new Date()
      };
      setGeneratedImages(prev => [newImage, ...prev]);
      setSelectedImageUrl(imageUrl);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadImage(imageUrl: string, prompt: string) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function copyToClipboard(text: string, imageId: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(imageId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Image className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Image Generation</h2>
          <p className="text-sm text-slate-600">Powered by Google Imagen 3.0</p>
        </div>
      </div>

      {/* Image Generation Form */}
      <form onSubmit={generateImageAI} className="mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Image Type
            </label>
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={isGenerating}
            >
              {imageTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.description})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Art Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {styleOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStyle(option.value)}
                    className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                      style === option.value
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                    disabled={isGenerating}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Describe the image you want to generate
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A handcrafted wooden jewelry box with intricate carvings, warm lighting, professional product photography..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
            <div className="text-xs text-slate-500 mt-1">
              {prompt.length}/500 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Image...' : 'Generate with Imagen 3.0'}</span>
          </button>
        </div>
      </form>



      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            Check your Imagen API key configuration in your environment
          </p>
        </div>
      )}

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Generated Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedImages.map((image) => (
              <div key={image.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="aspect-square bg-white rounded-lg mb-3 overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedImageUrl(image.url)}
                  />
                </div>
                <div className="mb-3 space-y-1">
                  <p className="text-sm text-slate-700 line-clamp-2">{image.prompt}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {image.imageType}
                    </span>
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {image.style}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadImage(image.url, image.prompt)}
                    className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                  <button
                    onClick={() => copyToClipboard(image.prompt, image.id)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium flex items-center justify-center"
                  >
                    {copiedId === image.id ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {image.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatedImages.length === 0 && !isGenerating && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <Image className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-2">No images generated yet</p>
          <p className="text-sm text-slate-500">Describe an image and let AI create it for you</p>
        </div>
      )}
    </div>
  );
}