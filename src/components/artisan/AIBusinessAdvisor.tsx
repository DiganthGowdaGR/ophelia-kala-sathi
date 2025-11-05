// AI-Powered Business Recommendations Component
import { useState } from 'react';
import { Sparkles, Zap, Target, TrendingUp } from 'lucide-react';
import { getBusinessRecommendations } from '@/services/geminiService';

interface BusinessRecommendations {
  priorityActions: string[];
  longTermStrategy: string[];
  quickWins: string[];
}

export default function AIBusinessAdvisor({
  monthlyRevenue = 0,
  productCount = 0,
  orderCount = 0,
  conversionRate = 0
}: {
  monthlyRevenue?: number;
  productCount?: number;
  orderCount?: number;
  conversionRate?: number;
}) {
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<BusinessRecommendations | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateRecommendations() {
    setGenerating(true);
    setError(null);
    
    try {
      const result = await getBusinessRecommendations({
        monthlyRevenue,
        productCount,
        orderCount,
        conversionRate
      });
      
      setRecommendations(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 border border-amber-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Business Advisor</h3>
            <p className="text-sm text-gray-600">Gemini-powered growth strategies</p>
          </div>
        </div>
        
        <button
          onClick={generateRecommendations}
          disabled={generating}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-amber-700 hover:to-orange-700 transition disabled:opacity-50"
        >
          <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : 'Get Advice'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!recommendations && !generating && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No recommendations yet</p>
          <p className="text-sm text-gray-500">Get personalized business growth advice from AI</p>
        </div>
      )}

      {recommendations && (
        <div className="space-y-4">
          {/* Priority Actions */}
          <div className="bg-white rounded-lg p-5 border-l-4 border-red-500">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-gray-900">Priority Actions</h4>
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                High Impact
              </span>
            </div>
            <ul className="space-y-2">
              {recommendations.priorityActions.map((action, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                  <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Wins */}
          <div className="bg-white rounded-lg p-5 border-l-4 border-green-500">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-gray-900">Quick Wins</h4>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                Easy Wins
              </span>
            </div>
            <ul className="space-y-2">
              {recommendations.quickWins.map((win, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Long-term Strategy */}
          <div className="bg-white rounded-lg p-5 border-l-4 border-indigo-500">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-gray-900">Long-term Strategy</h4>
              <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                Sustainable Growth
              </span>
            </div>
            <ul className="space-y-2">
              {recommendations.longTermStrategy.map((strategy, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
