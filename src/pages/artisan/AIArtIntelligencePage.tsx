// AI Art Intelligence Suite - All art-related AI features
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Palette, CheckCircle2, TrendingUp, Megaphone, DollarSign, ArrowLeft, Sparkles } from 'lucide-react';

export default function AIArtIntelligencePage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const features = [
    {
      id: 'style-analysis',
      name: 'AI Style Analysis',
      icon: Palette,
      description: 'Analyze art styles, color palettes, and cultural influences',
      endpoint: 'ai-art-style-analysis',
      inputs: [
        { name: 'product_id', label: 'Product ID', type: 'text', placeholder: 'prod_123' },
        { name: 'image_url', label: 'Image URL', type: 'text', placeholder: 'https://...' }
      ]
    },
    {
      id: 'quality-control',
      name: 'Quality Control',
      icon: CheckCircle2,
      description: 'AI-powered quality assessment with defect detection',
      endpoint: 'ai-quality-control',
      inputs: [
        { name: 'product_id', label: 'Product ID', type: 'text', placeholder: 'prod_123' },
        { name: 'image_urls', label: 'Image URLs (JSON array)', type: 'textarea', placeholder: '["url1", "url2"]' }
      ]
    },
    {
      id: 'market-research',
      name: 'Market Research',
      icon: TrendingUp,
      description: 'Automated competitor analysis and market intelligence',
      endpoint: 'ai-market-research',
      inputs: [
        { name: 'artisan_id', label: 'Artisan ID', type: 'text', placeholder: 'uuid' },
        { name: 'product_category', label: 'Category', type: 'text', placeholder: 'ceramics' }
      ]
    },
    {
      id: 'marketing-generator',
      name: 'Campaign Generator',
      icon: Megaphone,
      description: 'AI-powered marketing campaign creation',
      endpoint: 'ai-marketing-generator',
      inputs: [
        { name: 'artisan_id', label: 'Artisan ID', type: 'text', placeholder: 'uuid' },
        { name: 'campaign_name', label: 'Campaign Name', type: 'text', placeholder: 'Spring Collection 2025' }
      ]
    },
    {
      id: 'pricing-optimizer',
      name: 'Pricing Optimizer',
      icon: DollarSign,
      description: 'Intelligent pricing strategy recommendations',
      endpoint: 'ai-pricing-optimizer',
      inputs: [
        { name: 'product_id', label: 'Product ID', type: 'text', placeholder: 'prod_123' },
        { name: 'current_price', label: 'Current Price', type: 'number', placeholder: '50' }
      ]
    }
  ];

  const handleRunAI = async (feature: any, formData: any) => {
    setProcessing(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke(feature.endpoint, {
        body: formData
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      setResult({ error: { message: error.message } });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/ai')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AI Control Center
          </button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Art Intelligence Suite
          </h1>
          <p className="text-slate-600 mt-2">Advanced AI analysis for artistic excellence</p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg ${
                  activeFeature === feature.id ? 'border-purple-500' : 'border-slate-200'
                }`}
              >
                <Icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.name}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Active Feature Interface */}
        {activeFeature && (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            {(() => {
              const feature = features.find(f => f.id === activeFeature)!;
              return (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">{feature.name}</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData: any = {};
                      const formElement = e.target as HTMLFormElement;
                      feature.inputs.forEach((input) => {
                        const value = (formElement.elements.namedItem(input.name) as HTMLInputElement).value;
                        formData[input.name] = input.type === 'number' ? parseFloat(value) : 
                          input.name === 'image_urls' ? JSON.parse(value || '[]') : value;
                      });
                      handleRunAI(feature, formData);
                    }}
                    className="space-y-4"
                  >
                    {feature.inputs.map((input) => (
                      <div key={input.name}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {input.label}
                        </label>
                        {input.type === 'textarea' ? (
                          <textarea
                            name={input.name}
                            placeholder={input.placeholder}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows={3}
                          />
                        ) : (
                          <input
                            type={input.type}
                            name={input.name}
                            placeholder={input.placeholder}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {processing ? 'Processing AI Analysis...' : 'Run AI Analysis'}
                    </button>
                  </form>

                  {/* Results Display */}
                  {result && (
                    <div className="mt-8 p-6 bg-slate-50 rounded-lg">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">AI Analysis Results</h3>
                      <pre className="text-sm text-slate-700 overflow-auto max-h-96 bg-white p-4 rounded border border-slate-200">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
