import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';
import AIInventoryManager from '@/components/artisan/AIInventoryManager';
import AIMarketAnalyzer from '@/components/artisan/AIMarketAnalyzer';
import AICustomerInsights from '@/components/artisan/AICustomerInsights';
import AIBusinessAdvisor from '@/components/artisan/AIBusinessAdvisor';
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
    id: 'inventory',
    title: 'AI Inventory Manager',
    description: 'Optimize stock levels with AI predictions',
    icon: Package,
    color: 'bg-blue-100',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'market',
    title: 'Market Analysis',
    description: 'Analyze market trends and find opportunities',
    icon: TrendingUp,
    color: 'bg-green-100',
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 'insights',
    title: 'Customer Insights',
    description: 'Understand your customers with AI insights',
    icon: Users,
    color: 'bg-orange-100',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 'advisor',
    title: 'Business Advisor',
    description: 'Get AI-powered business recommendations',
    icon: Brain,
    color: 'bg-cyan-100',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'content',
    title: 'AI Content Generator',
    description: 'Create product descriptions & marketing copy instantly',
    icon: FileText,
    color: 'bg-rose-100',
    gradient: 'from-rose-500 to-rose-600'
  },
  {
    id: 'intelligence',
    title: 'Business Intelligence',
    description: 'Get AI insights on market trends and opportunities',
    icon: BarChart3,
    color: 'bg-amber-100',
    gradient: 'from-amber-500 to-amber-600'
  },
  {
    id: 'simulation',
    title: 'Market Simulation',
    description: 'Predict trends and optimize pricing strategies',
    icon: Trending,
    color: 'bg-teal-100',
    gradient: 'from-teal-500 to-teal-600'
  },
  {
    id: 'social',
    title: 'Social Distribution',
    description: 'Post to multiple platforms instantly',
    icon: Share2,
    color: 'bg-sky-100',
    gradient: 'from-sky-500 to-sky-600'
  },
  {
    id: 'voice',
    title: 'Voice Business Mentor',
    description: 'Get personalized coaching via voice AI',
    icon: Mic,
    color: 'bg-violet-100',
    gradient: 'from-violet-500 to-violet-600'
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
      case 'inventory':
        return <AIInventoryManager products={products} />;
      case 'market':
        return <AIMarketAnalyzer />;
      case 'insights':
        return <AICustomerInsights />;
      case 'advisor':
        return <AIBusinessAdvisor />;
      case 'content':
        return <AIContentGenerator />;
      case 'intelligence':
        return <BusinessIntelligence />;
      case 'simulation':
        return <MarketSimulation />;
      case 'social':
        return <SocialDistribution />;
      case 'voice':
        return <VoiceBusinessMentor />;
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
      const { data, error } = await supabase.functions.invoke('creative-studio-veo', {
        body: {
          prompt: veoForm.prompt,
          videoType: veoForm.videoType,
          productInfo: { name: veoForm.productName },
          artisanId: user?.id
        }
      });

      if (error) throw error;
      setResult(data.data);
    } catch (error: any) {
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
          <h3 className="text-xl font-bold text-gray-900 mb-6">Generated Video</h3>
          <div className="space-y-4">
            <div className="aspect-video bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
              <Video className="w-16 h-16 text-gray-400" />
            </div>
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
      const { data, error } = await supabase.functions.invoke('creative-studio-imagen', {
        body: {
          prompt: imagenForm.prompt,
          imageType: imagenForm.imageType,
          style: imagenForm.style,
          artisanId: user?.id
        }
      });

      if (error) throw error;
      setResult(data.data);
    } catch (error: any) {
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
          <h3 className="text-xl font-bold text-gray-900 mb-6">Generated Image</h3>
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
              <Image className="w-16 h-16 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="font-semibold text-gray-900">Width:</span>
                <p className="text-gray-600">{result.image?.dimensions.width}px</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="font-semibold text-gray-900">Height:</span>
                <p className="text-gray-600">{result.image?.dimensions.height}px</p>
              </div>
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
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          productName: contentForm.productName,
          productType: contentForm.productType,
          tone: contentForm.tone,
          contentType: contentForm.contentType,
          artisanId: user?.id
        }
      });

      if (error) throw error;
      setResult(data.data);
    } catch (error: any) {
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

// Business Intelligence Component
function BusinessIntelligence() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();

  async function analyzeMarket() {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('business-intelligence', {
        body: { artisanId: user?.id }
      });

      if (error) throw error;
      setResult(data.data);
    } catch (error: any) {
      alert('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-amber-600" />
          <span>Business Intelligence</span>
        </h2>
        <p className="text-gray-600">Get AI insights on market trends and business opportunities</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <p className="text-gray-700">Analyze your market performance and get actionable insights powered by AI.</p>
        
        <button
          onClick={analyzeMarket}
          disabled={analyzing}
          className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <BarChart3 className="w-5 h-5" />
          <span>{analyzing ? 'Analyzing...' : 'Analyze Market Trends'}</span>
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-4">Market Insights</h3>
            <div className="space-y-3">
              {result.insights?.map((insight: string, idx: number) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-amber-900">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Market Simulation Component
function MarketSimulation() {
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();

  const [simForm, setSimForm] = useState({
    basePrice: '',
    marketCondition: 'stable'
  });

  async function simulateMarket() {
    setSimulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-simulation', {
        body: {
          basePrice: parseFloat(simForm.basePrice),
          marketCondition: simForm.marketCondition,
          artisanId: user?.id
        }
      });

      if (error) throw error;
      setResult(data.data);
    } catch (error: any) {
      alert('Simulation failed: ' + error.message);
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Trending className="w-6 h-6 text-teal-600" />
          <span>Market Simulation</span>
        </h2>
        <p className="text-gray-600">Predict market trends and optimize your pricing strategy</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Base Price ($)</label>
            <input
              type="number"
              value={simForm.basePrice}
              onChange={(e) => setSimForm({ ...simForm, basePrice: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="100.00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Market Condition</label>
            <select
              value={simForm.marketCondition}
              onChange={(e) => setSimForm({ ...simForm, marketCondition: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
            >
              <option value="stable">Stable</option>
              <option value="growing">Growing</option>
              <option value="declining">Declining</option>
              <option value="volatile">Volatile</option>
            </select>
          </div>
        </div>

        <button
          onClick={simulateMarket}
          disabled={simulating || !simForm.basePrice}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{simulating ? 'Simulating...' : 'Run Market Simulation'}</span>
        </button>
      </div>

      {result && (
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-teal-900 mb-4">Simulation Results</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-teal-200">
              <p className="text-sm text-teal-600 font-semibold">Optimal Price</p>
              <p className="text-2xl font-bold text-teal-900">${result.optimalPrice?.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-teal-200">
              <p className="text-sm text-teal-600 font-semibold">Expected Revenue</p>
              <p className="text-2xl font-bold text-teal-900">${result.expectedRevenue?.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-teal-200">
              <p className="text-sm text-teal-600 font-semibold">Margin Impact</p>
              <p className="text-2xl font-bold text-teal-900">{result.marginImpact?.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Social Distribution Component
function SocialDistribution() {
  const [distributing, setDistributing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();

  const [platforms, setPlatforms] = useState({
    instagram: false,
    facebook: false,
    twitter: false,
    tiktok: false,
    linkedin: false
  });

  const [content, setContent] = useState('');

  async function distributeContent() {
    setDistributing(true);
    try {
      const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p as keyof typeof platforms]);
      
      const { data, error } = await supabase.functions.invoke('social-distribution', {
        body: {
          content,
          platforms: selectedPlatforms,
          artisanId: user?.id
        }
      });

      if (error) throw error;
      setResult(data.data);
    } catch (error: any) {
      alert('Distribution failed: ' + error.message);
    } finally {
      setDistributing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Share2 className="w-6 h-6 text-sky-600" />
          <span>Social Distribution</span>
        </h2>
        <p className="text-gray-600">Post your content to multiple social platforms instantly</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">Select Platforms</label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(platforms).map(([platform, checked]) => (
              <label key={platform} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setPlatforms({ ...platforms, [platform]: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-sky-600"
                />
                <span className="text-gray-700 capitalize font-medium">{platform}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition resize-none"
            placeholder="Enter the content you want to share across platforms..."
          />
        </div>

        <button
          onClick={distributeContent}
          disabled={distributing || !content}
          className="w-full bg-gradient-to-r from-sky-600 to-sky-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-sky-700 hover:to-sky-800 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Share2 className="w-5 h-5" />
          <span>{distributing ? 'Distributing...' : 'Distribute Now'}</span>
        </button>
      </div>

      {result && (
        <div className="bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-sky-900 mb-4">Distribution Status</h3>
          <div className="space-y-3">
            {result.platforms?.map((platform: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-sky-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-900 capitalize font-medium">{platform.name}</span>
                <span className="ml-auto text-sm text-gray-600">✓ Posted</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Voice Business Mentor Component
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
    } finally {
      setMentoring(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Mic className="w-6 h-6 text-violet-600" />
          <span>Voice Business Mentor</span>
        </h2>
        <p className="text-gray-600">Get personalized business coaching via AI-powered voice mentor</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Your Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
            placeholder="Ask your business mentor anything about growing your artisan business..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={getMentorAdvice}
            disabled={mentoring || !question}
            className="flex-1 bg-gradient-to-r from-violet-600 to-violet-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-violet-700 hover:to-violet-800 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{mentoring ? 'Getting Advice...' : 'Get Mentor Advice'}</span>
          </button>
          <button
            onClick={() => setIsListening(!isListening)}
            className="bg-violet-100 text-violet-600 px-6 py-4 rounded-lg font-semibold hover:bg-violet-200 transition flex items-center justify-center space-x-2 border border-violet-300"
          >
            <Mic className="w-5 h-5" />
            <span>{isListening ? 'Stop' : 'Voice'}</span>
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-xl p-8">
          <h3 className="text-lg font-bold text-violet-900 mb-4">Mentor Advice</h3>
          <div className="bg-white rounded-lg p-6 border border-violet-200">
            <p className="text-gray-700 leading-relaxed">{result.advice}</p>
          </div>
          {result.audioUrl && (
            <div className="mt-6">
              <p className="text-sm text-violet-900 font-semibold mb-3">Listen to Audio Response</p>
              <audio controls className="w-full border border-violet-300 rounded-lg">
                <source src={result.audioUrl} type="audio/mp3" />
              </audio>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
