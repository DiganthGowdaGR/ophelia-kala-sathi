// AI Image Generation Component - Gemini 2.5 + Imagen 3.0
import { useState } from 'react';
import { Image, Sparkles, Download, Copy, CheckCircle2, Palette, Camera, Wand2 } from 'lucide-react';
import { generateImage, enhanceProductImage } from '@/services/geminiService';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export default function AIImageGeneration() {
  const [prompt, setPrompt] = useState('');
  const [enhancementType, setEnhancementType] = useState('background');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enhancementOptions = [
    { value: 'background', label: 'Background Removal', icon: Camera, description: 'Clean professional background' },
    { value: 'lighting', label: 'Lighting Enhancement', icon: Palette, description: 'Improve lighting and colors' },
    { value: 'detail', label: 'Detail Enhancement', icon: Wand2, description: 'Sharpen and enhance details' },
    { value: 'lifestyle', label: 'Lifestyle Context', icon: Image, description: 'Add lifestyle context' }
  ];

  async function generateImageAI(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateImage(prompt);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt,
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

  async function enhanceImage() {
    if (!selectedImageUrl) return;

    setIsEnhancing(true);
    setError(null);

    try {
      const enhancedUrl = await enhanceProductImage(selectedImageUrl, enhancementType);
      const enhancedImage: GeneratedImage = {
        id: (Date.now() + 1).toString(),
        url: enhancedUrl,
        prompt: `Enhanced: ${enhancementType} - ${generatedImages.find(img => img.url === selectedImageUrl)?.prompt}`,
        timestamp: new Date()
      };
      setGeneratedImages(prev => [enhancedImage, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance image');
    } finally {
      setIsEnhancing(false);
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
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Image className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Image Generation</h2>
          <p className="text-sm text-slate-600">Powered by Gemini 2.5 + Imagen 3.0</p>
        </div>
      </div>

      {/* Image Generation Form */}
      <form onSubmit={generateImageAI} className="mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Describe the image you want to generate
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A handcrafted wooden jewelry box with intricate carvings, warm lighting, professional product photography..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
            <div className="text-xs text-slate-500 mt-1">
              {prompt.length}/500 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Image...' : 'Generate Image'}</span>
          </button>
        </div>
      </form>

      {/* Enhancement Section */}
      {selectedImageUrl && (
        <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">AI Image Enhancement</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {enhancementOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setEnhancementType(option.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    enhancementType === option.value
                      ? 'bg-purple-50 border-purple-300 text-purple-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={enhanceImage}
            disabled={isEnhancing}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Wand2 className={`w-4 h-4 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'Enhancing...' : 'Enhance Selected Image'}</span>
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            Check your Gemini API key configuration
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
                <p className="text-sm text-slate-700 mb-3 line-clamp-2">{image.prompt}</p>
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
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium flex items-center justify-center"
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