import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Zap, MessageSquare, CheckCircle2, TrendingUp, LineChart, Lightbulb, ArrowLeft } from 'lucide-react';

export default function AIAutomationPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const features = [
    { id: 'workflow', name: 'Workflow Optimizer', icon: Zap, description: 'Optimize workshop processes', endpoint: 'ai-workflow-optimizer',
      inputs: [{ name: 'artisan_id', label: 'Artisan ID', type: 'text', placeholder: 'uuid' }, { name: 'process_name', label: 'Process Name', type: 'text', placeholder: 'Product Creation' }] },
    { id: 'chatbot', name: 'Customer Service', icon: MessageSquare, description: 'Intelligent customer support', endpoint: 'ai-customer-service',
      inputs: [{ name: 'message', label: 'Customer Message', type: 'text', placeholder: 'Where is my order?' }] },
    { id: 'compliance', name: 'Compliance Checker', icon: CheckCircle2, description: 'Automated compliance verification', endpoint: 'ai-compliance-checker',
      inputs: [{ name: 'product_id', label: 'Product ID', type: 'text', placeholder: 'prod_123' }] },
    { id: 'market', name: 'Market Intelligence', icon: TrendingUp, description: 'Real-time market monitoring', endpoint: 'ai-market-intelligence',
      inputs: [{ name: 'market_category', label: 'Category', type: 'text', placeholder: 'handcrafted' }] },
    { id: 'analytics', name: 'Performance Analytics', icon: LineChart, description: 'Business performance insights', endpoint: 'ai-performance-analytics',
      inputs: [{ name: 'artisan_id', label: 'Artisan ID', type: 'text', placeholder: 'uuid' }] },
    { id: 'strategy', name: 'Strategic Planner', icon: Lightbulb, description: 'AI-driven strategic planning', endpoint: 'ai-strategic-planner',
      inputs: [{ name: 'artisan_id', label: 'Artisan ID', type: 'text', placeholder: 'uuid' }] },
  ];

  const handleRunAI = async (feature: any, formData: any) => {
    setProcessing(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(feature.endpoint, { body: formData });
      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      setResult({ error: { message: error.message } });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard/ai')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />Back to AI Control Center
          </button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-green-600" />
            AI Intelligent Automation
          </h1>
          <p className="text-slate-600 mt-2">Automate and optimize your business operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} onClick={() => setActiveFeature(feature.id)}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg ${activeFeature === feature.id ? 'border-green-500' : 'border-slate-200'}`}>
                <Icon className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.name}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {activeFeature && (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            {(() => {
              const feature = features.find(f => f.id === activeFeature)!;
              return (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">{feature.name}</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData: any = {};
                    const formElement = e.target as HTMLFormElement;
                    feature.inputs.forEach((input) => {
                      formData[input.name] = (formElement.elements.namedItem(input.name) as HTMLInputElement).value;
                    });
                    handleRunAI(feature, formData);
                  }} className="space-y-4">
                    {feature.inputs.map((input) => (
                      <div key={input.name}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{input.label}</label>
                        <input type={input.type} name={input.name} placeholder={input.placeholder}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                      </div>
                    ))}
                    <button type="submit" disabled={processing}
                      className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all">
                      {processing ? 'Processing...' : 'Run AI Analysis'}
                    </button>
                  </form>
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
