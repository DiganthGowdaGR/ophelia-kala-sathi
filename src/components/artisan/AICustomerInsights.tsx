// AI-Powered Customer Insights Component
import { useState } from 'react';
import { Users, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import { analyzeCustomerBehavior } from '@/services/geminiService';

interface CustomerInsights {
  insights: string[];
  suggestions: string[];
}

export default function AICustomerInsights({
  totalCustomers = 0,
  repeatCustomerRate = 0,
  averageOrderValue = 0
}: {
  totalCustomers?: number;
  repeatCustomerRate?: number;
  averageOrderValue?: number;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyzeCustomers() {
    setAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeCustomerBehavior({
        totalCustomers,
        repeatCustomerRate,
        averageOrderValue,
        topCategories: ['Textiles', 'Pottery', 'Jewelry']
      });
      
      setInsights(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze customer behavior');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Customer Insights</h3>
            <p className="text-sm text-gray-600">AI-powered behavior analysis</p>
          </div>
        </div>
        
        <button
          onClick={analyzeCustomers}
          disabled={analyzing}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50"
        >
          <Sparkles className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Analyzing...' : 'Analyze Customers'}</span>
        </button>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
          <p className="text-xs text-gray-600">Total Customers</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
          <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{repeatCustomerRate}%</p>
          <p className="text-xs text-gray-600">Repeat Rate</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
          <ShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">${averageOrderValue}</p>
          <p className="text-xs text-gray-600">Avg Order</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!insights && !analyzing && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Click "Analyze Customers" for AI insights</p>
        </div>
      )}

      {insights && (
        <div className="space-y-4">
          {/* Behavioral Insights */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Behavioral Insights</span>
            </h4>
            <ul className="space-y-2">
              {insights.insights.map((insight, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Suggestions */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-green-600" />
              <span>Retention Strategies</span>
            </h4>
            <ul className="space-y-2">
              {insights.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
