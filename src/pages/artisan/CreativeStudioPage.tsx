import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateProductDescription, generateContent, generateChatResponse } from '@/services/geminiService';
import Navigation from '@/components/shared/Navigation';
import AIProductDescriptionGenerator from '@/components/artisan/AIProductDescriptionGenerator';
import {
  Video, Image, Sparkles, Package, TrendingUp, Users,
  Brain, BookOpen, X, ChevronRight, FileText, BarChart3,
  TrendingUp as Trending, Share2, Mic
} from 'lucide-react';

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'video',
    title: 'VEO Video Generation',
    description: 'Create stunning product videos and social reels with AI',
    icon: Video,
    color: 'bg-purple-100',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'imagen',
    title: 'Imagen 2 Image Creation',
    description: 'Generate beautiful product images and marketing visuals',
    icon: Image,
    color: 'bg-indigo-100',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'description',
    title: 'Product Description Generator',
    description: 'Create compelling product descriptions automatically',
    icon: BookOpen,
    color: 'bg-pink-100',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    id: 'content',
    title: 'AI Content Generator',
    description: 'Create product descriptions & marketing copy instantly',
    icon: FileText,
    color: 'bg-rose-100',
    gradient: 'from-rose-500 to-rose-600'
  }
];

export default function CreativeStudioPage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const { user } = useAuth();

  // Render the active feature content
  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'video':
        return <VEOVideoGenerator />;
      case 'imagen':
        return <ImagenImageGenerator />;
      case 'description':
        return <AIProductDescriptionGenerator />;
      case 'content':
        return <AIContentGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Creative Studio</h1>
          </div>
          <p className="text-lg text-gray-600 ml-13">
            Unlock the power of AI to grow your artisan business
          </p>
        </div>

        {activeFeature ? (
          // Feature Detail View
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setActiveFeature(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition font-medium"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              <span>Back to Features</span>
            </button>

            {/* Feature Content */}
            <div className="border border-gray-200 rounded-2xl p-8 bg-gradient-to-br from-gray-50 to-white">
              {renderFeatureContent()}
            </div>
          </div>
        ) : (
          // Feature Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_FEATURES.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className="group relative border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-300 text-left bg-white hover:shadow-lg"
                >
                  {/* Icon Container */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {feature.description}
                  </p>

                  {/* Hover Arrow */}
                  <div className="flex items-center space-x-2 text-gray-400 group-hover:text-gray-600 transition">
                    <span className="text-xs font-semibold">EXPLORE</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Gradient Border Effect on Hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent group-hover:from-purple-500/5 group-hover:to-indigo-500/5 pointer-events-none transition" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// VEO Video Generator Component
function VEOVideoGenerator() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();

  const [veoForm, setVeoForm] = useState({
    prompt: '',
    videoType: 'product_reel',
    productName: ''
  });

  async function generateVideo() {
    setGenerating(true);
    try {
      // Import the function dynamically to avoid circular imports
      const { generateVideoDescription } = await import('@/services/geminiService');
      
      const videoData = {
        productName: veoForm.productName,
        videoType: veoForm.videoType,
        prompt: veoForm.prompt
      };

      const videoResult = await generateVideoDescription(videoData);
      setResult({
        video: {
          videoUrl: null, // Real video generation not available
          description: videoResult.description,
          shotList: videoResult.shotList,
          duration: videoResult.technicalSpecs.duration,
          resolution: videoResult.technicalSpecs.resolution,
          format: 'Video Description',
          note: 'Generated detailed video production description - perfect for creating professional videos'
        },
        prompt: veoForm.prompt,
        videoType: veoForm.videoType,
        productInfo: { name: veoForm.productName },
        artisanId: user?.id,
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert('Generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Video className="w-6 h-6 text-purple-600" />
          <span>VEO Video Generation</span>
        </h2>
        <p className="text-gray-600">Create professional product videos and social reels with AI</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Video Type
          </label>
          <select
            value={veoForm.videoType}
            onChange={(e) => setVeoForm({ ...veoForm, videoType: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
          >
            <option value="product_reel">Product Reel (15s)</option>
            <option value="process_video">Process Video (30s)</option>
            <option value="story_video">Story Video (60s)</option>
            <option value="social_reel">Social Reel (15s)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Product Name
          </label>
          <input
            type="text"
            value={veoForm.productName}
            onChange={(e) => setVeoForm({ ...veoForm, productName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            placeholder="e.g., Handwoven Silk Scarf"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Video Description
          </label>
          <textarea
            value={veoForm.prompt}
            onChange={(e) => setVeoForm({ ...veoForm, prompt: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
            placeholder="Describe the video you want to create. Include details about the product, mood, setting, and any special effects..."
          />
        </div>

        <button
          onClick={generateVideo}
          disabled={generating}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{generating ? 'Generating Video...' : 'Generate Video with VEO'}</span>
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Generated Video Production Guide</h3>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Video className="w-6 h-6 text-purple-600" />
                <span className="font-semibold text-gray-900">Production Description</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{result.video?.description}</p>
            </div>
            
            {result.video?.shotList && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="font-semibold text-gray-900 mb-3 block">Recommended Shots:</span>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {result.video.shotList.map((shot: string, index: number) => (
                    <li key={index}>{shot}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="font-semibold text-gray-900">Duration:</span>
                <p className="text-gray-600">{result.video?.duration}s</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="font-semibold text-gray-900">Resolution:</span>
                <p className="text-gray-600">{result.video?.resolution}</p>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 text-sm font-medium">💡 Pro Tip: {result.video?.note}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Imagen Image Generator Component
function ImagenImageGenerator() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();

  const [imagenForm, setImagenForm] = useState({
    prompt: '',
    imageType: 'product_poster',
    style: 'realistic'
  });

  async function generateImage() {
    setGenerating(true);
    try {
      // Import the function dynamically to avoid circular imports
      const { generateImageDescription } = await import('@/services/geminiService');
      
      const imageData = {
        productName: 'Custom Product', // Using generic name since prompt contains details
        imageType: imagenForm.imageType,
        style: imagenForm.style,
        prompt: imagenForm.prompt
      };

      const imageResult = await generateImageDescription(imageData);
      setResult({
        image: {
          imageUrl: null, // Real image generation not available via standard API
          description: imageResult.description,
          prompt: imageResult.prompt,
          dimensions: imageResult.technicalSpecs.dimensions,
          format: imageResult.technicalSpecs.format,
          aspectRatio: imageResult.technicalSpecs.aspectRatio,
          note: 'Generated detailed image generation prompt - perfect for creating professional images'
        },
        prompt: imagenForm.prompt,
        imageType: imagenForm.imageType,
        style: imagenForm.style,
        artisanId: user?.id,
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert('Generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Image className="w-6 h-6 text-indigo-600" />
          <span>Imagen 2 Image Generation</span>
        </h2>
        <p className="text-gray-600">Create beautiful product images and marketing visuals with AI</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Image Type
          </label>
          <select
            value={imagenForm.imageType}
            onChange={(e) => setImagenForm({ ...imagenForm, imageType: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
          >
            <option value="product_poster">Product Poster</option>
            <option value="social_ad">Social Media Ad</option>
            <option value="hero_banner">Hero Banner</option>
            <option value="lifestyle_shot">Lifestyle Shot</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Art Style
          </label>
          <select
            value={imagenForm.style}
            onChange={(e) => setImagenForm({ ...imagenForm, style: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
          >
            <option value="realistic">Realistic</option>
            <option value="artistic">Artistic</option>
            <option value="minimalist">Minimalist</option>
            <option value="vintage">Vintage</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Image Description
          </label>
          <textarea
            value={imagenForm.prompt}
            onChange={(e) => setImagenForm({ ...imagenForm, prompt: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
            placeholder="Describe the image you want to create. Include details about the product, composition, lighting, and mood..."
          />
        </div>

        <button
          onClick={generateImage}
          disabled={generating}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{generating ? 'Generating Image...' : 'Generate Image with Imagen 2'}</span>
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Generated Image Creation Guide</h3>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Image className="w-6 h-6 text-indigo-600" />
                <span className="font-semibold text-gray-900">Image Generation Prompt</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm font-mono bg-gray-50 p-3 rounded">{result.image?.prompt}</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Image className="w-6 h-6 text-indigo-600" />
                <span className="font-semibold text-gray-900">Production Guide</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{result.image?.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="font-semibold text-gray-900">Dimensions:</span>
                <p className="text-gray-600">{result.image?.dimensions.width} × {result.image?.dimensions.height}px</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="font-semibold text-gray-900">Aspect Ratio:</span>
                <p className="text-gray-600">{result.image?.aspectRatio}</p>
              </div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-indigo-800 text-sm font-medium">💡 Pro Tip: {result.image?.note}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// AI Content Generator Component
function AIContentGenerator() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();

  const [contentForm, setContentForm] = useState({
    productName: '',
    productType: '',
    tone: 'professional',
    contentType: 'description'
  });

  async function generateContent() {
    setGenerating(true);
    try {
      // Import the function dynamically to avoid circular imports
      const { generateContent } = await import('@/services/geminiService');
      
      const contentData = {
        productName: contentForm.productName,
        productType: contentForm.productType,
        tone: contentForm.tone,
        contentType: contentForm.contentType
      };

      const content = await generateContent(contentData);
      setResult({
        content,
        productName: contentForm.productName,
        productType: contentForm.productType,
        tone: contentForm.tone,
        contentType: contentForm.contentType,
        artisanId: user?.id,
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert('Generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <FileText className="w-6 h-6 text-rose-600" />
          <span>AI Content Generator</span>
        </h2>
        <p className="text-gray-600">Create compelling product descriptions and marketing copy instantly</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Product Name</label>
            <input
              type="text"
              value={contentForm.productName}
              onChange={(e) => setContentForm({ ...contentForm, productName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
              placeholder="e.g., Handwoven Basket"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Product Type</label>
            <select
              value={contentForm.productType}
              onChange={(e) => setContentForm({ ...contentForm, productType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition bg-white"
            >
              <option value="">Select type</option>
              <option value="fashion">Fashion</option>
              <option value="decor">Home Decor</option>
              <option value="jewelry">Jewelry</option>
              <option value="crafts">Crafts</option>
              <option value="food">Food & Beverage</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Content Type</label>
            <select
              value={contentForm.contentType}
              onChange={(e) => setContentForm({ ...contentForm, contentType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition bg-white"
            >
              <option value="description">Product Description</option>
              <option value="social">Social Media Caption</option>
              <option value="email">Email Campaign</option>
              <option value="blog">Blog Post</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Tone</label>
            <select
              value={contentForm.tone}
              onChange={(e) => setContentForm({ ...contentForm, tone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition bg-white"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="luxury">Luxury</option>
              <option value="playful">Playful</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateContent}
          disabled={generating}
          className="w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-rose-700 hover:to-rose-800 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{generating ? 'Generating...' : 'Generate Content'}</span>
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Generated Content</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 whitespace-pre-wrap">{result.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Removed Business Intelligence, Market Simulation, and Social Distribution components
// Removed Voice Business Mentor - moved to Agent Mode
