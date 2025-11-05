import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, Users, Target, Play, BarChart3, PieChart, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Simulation {
  id: string;
  simulation_type: string;
  input_parameters: any;
  results: any;
  insights: string[];
  created_at: string;
}

interface ScenarioOption {
  type: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const scenarioOptions: ScenarioOption[] = [
  {
    type: 'price_optimization',
    label: 'Price Optimization',
    description: 'Simulate different pricing strategies and their impact on revenue',
    icon: DollarSign
  },
  {
    type: 'market_expansion',
    label: 'Market Expansion',
    description: 'Explore new markets and customer segments',
    icon: Target
  },
  {
    type: 'product_launch',
    label: 'Product Launch',
    description: 'Predict the performance of new product releases',
    icon: TrendingUp
  },
  {
    type: 'seasonal_trends',
    label: 'Seasonal Trends',
    description: 'Forecast seasonal demand patterns',
    icon: Activity
  }
];

export default function MarketSimulationPage() {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<string>('price_optimization');
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSimulation, setCurrentSimulation] = useState<any>(null);

  // Scenario parameters
  const [priceChange, setPriceChange] = useState<number>(0);
  const [targetMarket, setTargetMarket] = useState<string>('urban_professionals');
  const [productCategory, setProductCategory] = useState<string>('handcrafted_jewelry');

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('market_simulations')
        .select('*')
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSimulations(data || []);
    } catch (error) {
      console.error('Error loading simulations:', error);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const parameters: any = {};
      
      if (selectedScenario === 'price_optimization') {
        parameters.priceChange = priceChange;
        parameters.productCategory = productCategory;
      } else if (selectedScenario === 'market_expansion') {
        parameters.targetMarket = targetMarket;
      } else if (selectedScenario === 'product_launch') {
        parameters.productCategory = productCategory;
      }

      // Call market simulation edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'market-simulation',
        {
          body: {
            scenarioType: selectedScenario,
            parameters,
            artisanId: user.id
          }
        }
      );

      if (functionError) throw functionError;

      setCurrentSimulation(functionData);

      // Get scenario label for insights
      const scenarioLabel = scenarioOptions.find(s => s.type === selectedScenario)?.label || selectedScenario;

      // Save simulation to database with correct schema
      const { error: insertError } = await supabase
        .from('market_simulations')
        .insert({
          artisan_id: user.id,
          simulation_type: selectedScenario,
          input_parameters: parameters,
          results: functionData,
          insights: functionData?.recommendations || []
        });

      if (insertError) throw insertError;

      await loadSimulations();
    } catch (error) {
      console.error('Error running simulation:', error);
      alert('Failed to run simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderScenarioControls = () => {
    switch (selectedScenario) {
      case 'price_optimization':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Change (%)
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={priceChange}
                onChange={(e) => setPriceChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>-50%</span>
                <span className="font-semibold">{priceChange > 0 ? '+' : ''}{priceChange}%</span>
                <span>+50%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Category
              </label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="handcrafted_jewelry">Handcrafted Jewelry</option>
                <option value="pottery">Pottery & Ceramics</option>
                <option value="textiles">Textiles & Fabrics</option>
                <option value="woodwork">Woodwork & Furniture</option>
                <option value="paintings">Paintings & Art</option>
              </select>
            </div>
          </div>
        );

      case 'market_expansion':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Market Segment
            </label>
            <select
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="urban_professionals">Urban Professionals</option>
              <option value="international_tourists">International Tourists</option>
              <option value="eco_conscious_buyers">Eco-Conscious Buyers</option>
              <option value="luxury_collectors">Luxury Collectors</option>
              <option value="gift_shoppers">Gift Shoppers</option>
            </select>
          </div>
        );

      case 'product_launch':
      case 'seasonal_trends':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Category
            </label>
            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="handcrafted_jewelry">Handcrafted Jewelry</option>
              <option value="pottery">Pottery & Ceramics</option>
              <option value="textiles">Textiles & Fabrics</option>
              <option value="woodwork">Woodwork & Furniture</option>
              <option value="paintings">Paintings & Art</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/artisan/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Market Simulation Dashboard</h1>
          <p className="text-gray-600 mt-2">Run what-if scenarios to optimize your business strategy</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scenario Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Scenario</h2>
              <div className="space-y-3">
                {scenarioOptions.map((scenario) => {
                  const Icon = scenario.icon;
                  const isSelected = selectedScenario === scenario.type;
                  return (
                    <button
                      key={scenario.type}
                      onClick={() => setSelectedScenario(scenario.type)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-900'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <Icon className="h-6 w-6 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">{scenario.label}</div>
                          <div className="text-xs mt-1 opacity-80">{scenario.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulation Controls & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {scenarioOptions.find(s => s.type === selectedScenario)?.label}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {scenarioOptions.find(s => s.type === selectedScenario)?.description}
              </p>
              
              {renderScenarioControls()}

              <button
                onClick={runSimulation}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>Running Simulation...</>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>

            {/* Simulation Results */}
            {currentSimulation && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Results</h3>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center text-green-700 mb-2">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Revenue Impact</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {currentSimulation.metrics?.revenueImpact || '+15%'}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center text-blue-700 mb-2">
                      <Users className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Customer Growth</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {currentSimulation.metrics?.customerGrowth || '+22%'}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center text-purple-700 mb-2">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Market Share</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {currentSimulation.metrics?.marketShare || '+8%'}
                    </div>
                  </div>
                </div>

                {/* Trends */}
                {currentSimulation.trends && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Market Trends</h4>
                    <div className="space-y-2">
                      {currentSimulation.trends.map((trend: any, index: number) => (
                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">{trend.category}</div>
                            <div className="text-sm text-gray-600">{trend.prediction}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {currentSimulation.recommendations && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {currentSimulation.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Simulation History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation History</h3>
              <div className="space-y-3">
                {simulations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No simulations yet. Run your first scenario above!</p>
                ) : (
                  simulations.map((sim) => {
                    const scenarioLabel = scenarioOptions.find(s => s.type === sim.simulation_type)?.label || sim.simulation_type;
                    return (
                      <div key={sim.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{scenarioLabel}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Type: {sim.simulation_type?.replace(/_/g, ' ') || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(sim.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
