// AI-Powered Market Analysis Component
import { useState } from 'react';
import { TrendingUp, Target, Lightbulb, Sparkles, BarChart3 } from 'lucide-react';
import { analyzeMarketTrends } from '@/services/geminiService';

interface MarketAnalysis {
  trends: string[];
  opportunities: string[];
  recommendations: string[];
}

export default function AIMarketAnalyzer({ 
  category = 'Handmade Crafts',
  recentSales = 0,
  competitorCount = 0
}: { 
  category?: string;
  recentSales?: number;
  competitorCount?: number;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function performAnalysis() {
    setAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeMarketTrends({
        category,
        recentSales,
        competitorCount,
        priceRange: { min: 25, max: 150 }
      });
      
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze market trends');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Market Analysis</h3>
            <p className="text-sm text-gray-600">Gemini-powered market insights</p>
          </div>
        </div>
        
        <button
          onClick={performAnalysis}
          disabled={analyzing}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-50"
        >
          <Sparkles className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Analyzing...' : 'Analyze Market'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            Make sure VITE_GEMINI_API_KEY is configured
          </p>
        </div>
      )}

      {!analysis && !analyzing && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No market analysis yet</p>
          <p className="text-sm text-gray-500">Get AI-powered insights about your market position</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Market Trends */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-gray-900">Current Market Trends</h4>
            </div>
            <ul className="space-y-2">
              {analysis.trends.map((trend, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700">{trend}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-gray-900">Growth Opportunities</h4>
            </div>
            <ul className="space-y-2">
              {analysis.opportunities.map((opp, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700">{opp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-gray-900">AI Recommendations</h4>
            </div>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
