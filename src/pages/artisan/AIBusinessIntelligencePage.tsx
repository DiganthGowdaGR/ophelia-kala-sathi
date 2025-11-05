// AI Business Intelligence Center - All business AI features
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Package, AlertTriangle, Users, TrendingUp, ArrowLeft, BarChart3 } from 'lucide-react';

export default function AIBusinessIntelligencePage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const features = [
    {
      id: 'supply-chain',
      name: 'Supply Chain Optimizer',
      icon: Package,
      description: 'Optimize supply chain with cost reduction analysis',
      endpoint: 'ai-supply-chain-optimizer',
      inputs: [
        { name: 'artisan_id', label: 'Artisan ID', type: 'text', placeholder: 'uuid' }
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory Manager',
      icon: Package,
      description: 'Smart inventory prediction and management',
      endpoint: 'ai-inventory-manager',
      inputs: [
        { name: 'product_id', label: 'Product ID', type: 'text', placeholder: 'prod_123' },
        { name: 'current_stock', label: 'Current Stock', type: 'number', placeholder: '50' }
      ]
    },
    {
      id: 'risk',
      name: 'Risk Assessor',
      icon: AlertTriangle,
      description: 'ML-based order risk and fraud detection',
      endpoint: 'ai-risk-assessor',
      inputs: [
        { name: 'order_id', label: 'Order ID', type: 'text', placeholder: '12345' },
        { name: 'order_amount', label: 'Order Amount', type: 'number', placeholder: '250' }
      ]
    },
    {
      id: 'customer-behavior',
      name: 'Customer Behavior',
      icon: Users,
      description: 'Predictive customer analytics',
      endpoint: 'ai-customer-behavior',
      inputs: [
        { name: 'customer_id', label: 'Customer ID', type: 'text', placeholder: 'uuid' }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard/ai')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />Back to AI Control Center
          </button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            AI Business Intelligence Center
          </h1>
          <p className="text-slate-600 mt-2">Data-driven insights for business optimization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} onClick={() => setActiveFeature(feature.id)}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg ${
                  activeFeature === feature.id ? 'border-blue-500' : 'border-slate-200'
                }`}>
                <Icon className="w-10 h-10 text-blue-600 mb-4" />
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
                      const value = (formElement.elements.namedItem(input.name) as HTMLInputElement).value;
                      formData[input.name] = input.type === 'number' ? parseFloat(value) : value;
                    });
                    handleRunAI(feature, formData);
                  }} className="space-y-4">
                    {feature.inputs.map((input) => (
                      <div key={input.name}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{input.label}</label>
                        <input type={input.type} name={input.name} placeholder={input.placeholder}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                    ))}
                    <button type="submit" disabled={processing}
                      className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all">
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
