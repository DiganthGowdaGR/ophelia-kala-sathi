import { useState } from 'react';
import { Leaf, Scale, Package, Recycle, Award, TrendingDown, Shield } from 'lucide-react';
import Navigation from '@/components/shared/Navigation';
import { supabase } from '@/lib/supabase';

export default function SustainabilityPage() {
  const [activeTab, setActiveTab] = useState('carbon-footprint');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCarbonCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('carbon-footprint-calculator', {
        body: {
          productId: parseInt(formData.get('productId') as string),
          materials: [
            { type: formData.get('materialType'), weight: parseFloat(formData.get('materialWeight') as string) }
          ],
          production: { energyUsed: parseFloat(formData.get('energyUsed') as string) },
          shipping: { 
            distance: parseFloat(formData.get('shippingDistance') as string),
            weight: parseFloat(formData.get('shippingWeight') as string)
          }
        }
      });
      
      if (error) throw error;
      setResults(result);
    } catch (error: any) {
      setResults({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleEnvironmentalScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('environmental-scorer', {
        body: {
          entityType: 'product',
          entityId: parseInt(formData.get('entityId') as string),
          carbonFootprint: { total: parseFloat(formData.get('carbonTotal') as string) },
          wasteData: { recycledPercentage: parseFloat(formData.get('recycledPercentage') as string) },
          sustainabilityPractices: (formData.get('practices') as string).split(',').filter(p => p.trim())
        }
      });
      
      if (error) throw error;
      setResults(result);
    } catch (error: any) {
      setResults({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const tabs = [
    { id: 'carbon-footprint', label: 'Carbon Calculator', icon: TrendingDown },
    { id: 'eco-score', label: 'Eco Score', icon: Leaf },
    { id: 'certifications', label: 'Certifications', icon: Shield },
    { id: 'circular-economy', label: 'Circular Economy', icon: Recycle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Sustainability & Eco-Tracking
              </h1>
              <p className="text-lg text-gray-600 mt-1">Track, verify, and showcase your environmental impact</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Carbon Saved</span>
              <TrendingDown className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">1,247 kg</p>
            <p className="text-xs text-green-600 mt-1">↓ 18% this month</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Eco Score</span>
              <Award className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">A Grade</p>
            <p className="text-xs text-green-600 mt-1">Top 10% artisans</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Recycled Materials</span>
              <Recycle className="w-5 h-5 text-teal-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">73%</p>
            <p className="text-xs text-green-600 mt-1">Above industry avg</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Certifications</span>
              <Shield className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">5 Active</p>
            <p className="text-xs text-gray-500 mt-1">All verified</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Carbon Footprint Tab */}
        {activeTab === 'carbon-footprint' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingDown className="w-6 h-6 text-emerald-500" />
              <h3 className="text-2xl font-bold text-gray-900">Carbon Footprint Calculator</h3>
            </div>
            
            <form onSubmit={handleCarbonCalculation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
                <input
                  type="number"
                  name="productId"
                  placeholder="Enter product ID"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
                <select
                  name="materialType"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="wood">Wood</option>
                  <option value="metal">Metal</option>
                  <option value="fabric">Fabric</option>
                  <option value="plastic">Plastic (recycled)</option>
                  <option value="glass">Glass</option>
                  <option value="leather">Leather</option>
                  <option value="paper">Paper</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  name="materialWeight"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energy Used (kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  name="energyUsed"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  name="shippingDistance"
                  placeholder="0.0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  name="shippingWeight"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Calculating...' : 'Calculate Carbon Footprint'}
                </button>
              </div>
            </form>

            {results?.data?.breakdown && (
              <div className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-lg text-gray-900 mb-4">Carbon Footprint Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Materials</p>
                    <p className="text-2xl font-bold text-emerald-600">{results.data.breakdown.materials} kg</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Production</p>
                    <p className="text-2xl font-bold text-green-600">{results.data.breakdown.production} kg</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Shipping</p>
                    <p className="text-2xl font-bold text-teal-600">{results.data.breakdown.shipping} kg</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Total CO₂</p>
                    <p className="text-2xl font-bold text-gray-900">{results.data.breakdown.total} kg</p>
                  </div>
                </div>
                <p className="mt-4 text-center text-gray-700 font-medium">{results.data.recommendation}</p>
              </div>
            )}
          </div>
        )}

        {/* Eco Score Tab */}
        {activeTab === 'eco-score' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center space-x-3 mb-6">
              <Leaf className="w-6 h-6 text-green-500" />
              <h3 className="text-2xl font-bold text-gray-900">Environmental Impact Score</h3>
            </div>
            
            <form onSubmit={handleEnvironmentalScore} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID (Product/Shop)</label>
                <input
                  type="number"
                  name="entityId"
                  placeholder="Enter ID"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Carbon Footprint (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  name="carbonTotal"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recycled Materials (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="recycledPercentage"
                  placeholder="0.0"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sustainability Practices (comma-separated)</label>
                <input
                  type="text"
                  name="practices"
                  placeholder="e.g., solar power, water recycling, local sourcing"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Calculating...' : 'Calculate Environmental Score'}
                </button>
              </div>
            </form>

            {results?.data?.grade && (
              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="text-center mb-6">
                  <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
                    <p className="text-5xl font-bold text-green-600">{results.data.grade}</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Environmental Grade</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Carbon Score</p>
                    <p className="text-xl font-bold text-emerald-600">{results.data.breakdown.carbon}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Waste Score</p>
                    <p className="text-xl font-bold text-green-600">{results.data.breakdown.waste}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Sustainability</p>
                    <p className="text-xl font-bold text-teal-600">{results.data.breakdown.sustainability}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Overall</p>
                    <p className="text-xl font-bold text-gray-900">{results.data.breakdown.overall}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {results.data.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'B Corp Certified', level: 'Gold', color: 'from-yellow-500 to-orange-500' },
              { name: 'Carbon Neutral', level: 'Verified', color: 'from-green-500 to-emerald-500' },
              { name: 'Fair Trade', level: 'Certified', color: 'from-blue-500 to-cyan-500' },
              { name: 'Organic Materials', level: 'Level 3', color: 'from-emerald-500 to-teal-500' },
              { name: 'Zero Waste', level: 'Silver', color: 'from-gray-400 to-gray-600' },
              { name: 'Renewable Energy', level: '100%', color: 'from-yellow-400 to-yellow-600' },
            ].map((cert, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${cert.color} rounded-2xl shadow-lg p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <Shield className="w-8 h-8" />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">{cert.level}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{cert.name}</h3>
                <p className="text-white/80 text-sm">Valid until Dec 2025</p>
              </div>
            ))}
          </div>
        )}

        {/* Circular Economy Tab */}
        {activeTab === 'circular-economy' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
            <div className="flex items-center space-x-3 mb-6">
              <Recycle className="w-6 h-6 text-teal-500" />
              <h3 className="text-2xl font-bold text-gray-900">Circular Economy Programs</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                <Package className="w-10 h-10 text-teal-600 mb-4" />
                <h4 className="font-semibold text-lg text-gray-900 mb-2">Product Take-Back Program</h4>
                <p className="text-gray-600 mb-4">Customers can return old products for recycling or upcycling</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Recovery Rate</span>
                  <span className="font-bold text-teal-600">78%</span>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <Scale className="w-10 h-10 text-emerald-600 mb-4" />
                <h4 className="font-semibold text-lg text-gray-900 mb-2">Material Recovery</h4>
                <p className="text-gray-600 mb-4">Scrap materials processed and reused in new creations</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Materials Reused</span>
                  <span className="font-bold text-emerald-600">92%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && !results.data?.breakdown && !results.data?.grade && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw Response</h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
