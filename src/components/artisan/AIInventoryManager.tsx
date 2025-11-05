// AI-Powered Inventory Management Component
import { useState } from 'react';
import { Package, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { predictInventoryNeeds } from '@/services/geminiService';

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  category: string;
}

interface InventoryPrediction {
  productId: string;
  recommendation: string;
  suggestedReorder: number;
  reasoning: string;
}

export default function AIInventoryManager({ products }: { products: Product[] }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState<InventoryPrediction[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function analyzeInventory() {
    setAnalyzing(true);
    setError(null);
    
    try {
      const results: InventoryPrediction[] = [];
      
      // Analyze each product's inventory
      for (const product of products) {
        // Simulate sales history (in production, fetch from database)
        const mockSalesHistory = [
          { date: '2025-10-25', quantity: 3 },
          { date: '2025-10-28', quantity: 5 },
          { date: '2025-11-01', quantity: 2 }
        ];
        
        try {
          const prediction = await predictInventoryNeeds({
            productName: product.name,
            currentStock: product.stock_quantity,
            salesHistory: mockSalesHistory,
            seasonality: 'holiday season approaching'
          });
          
          results.push({
            productId: product.id,
            ...prediction
          });
        } catch (err) {
          console.error(`Failed to analyze ${product.name}:`, err);
        }
      }
      
      setPredictions(results);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze inventory');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Inventory Manager</h3>
            <p className="text-sm text-gray-600">Gemini-powered stock predictions</p>
          </div>
        </div>
        
        <button
          onClick={analyzeInventory}
          disabled={analyzing || products.length === 0}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Analyzing...' : 'Analyze Inventory'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            Make sure VITE_GEMINI_API_KEY is configured in your environment
          </p>
        </div>
      )}

      {predictions.length === 0 && !analyzing && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No analysis yet</p>
          <p className="text-sm text-gray-500">Click "Analyze Inventory" to get AI-powered recommendations</p>
        </div>
      )}

      {predictions.length > 0 && (
        <div className="space-y-3">
          {predictions.map((pred) => {
            const product = products.find(p => p.id === pred.productId);
            if (!product) return null;
            
            const isUrgent = pred.recommendation === 'YES';
            const isWarning = pred.recommendation === 'WAIT' && product.stock_quantity < 10;
            
            return (
              <div
                key={pred.productId}
                className={`p-4 rounded-lg border-2 ${
                  isUrgent
                    ? 'bg-red-50 border-red-300'
                    : isWarning
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-green-50 border-green-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Current Stock: <span className="font-semibold">{product.stock_quantity}</span> units
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isUrgent ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isUrgent
                        ? 'bg-red-600 text-white'
                        : isWarning
                        ? 'bg-yellow-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}>
                      {pred.recommendation}
                    </span>
                  </div>
                </div>
                
                {pred.suggestedReorder > 0 && (
                  <div className="mb-2 p-2 bg-white rounded border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      Suggested Reorder: <span className="text-indigo-600">{pred.suggestedReorder}</span> units
                    </p>
                  </div>
                )}
                
                <p className="text-sm text-gray-700 italic">{pred.reasoning}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
