import { useState } from 'react';
import { Globe, DollarSign, FileText, Plane, Scale, Map, CheckCircle } from 'lucide-react';
import Navigation from '@/components/shared/Navigation';
import { supabase } from '@/lib/supabase';

export default function CrossBorderPage() {
  const [activeTab, setActiveTab] = useState('currency');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCurrencyConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('currency-converter', {
        body: {
          amount: parseFloat(formData.get('amount') as string),
          fromCurrency: formData.get('fromCurrency'),
          toCurrency: formData.get('toCurrency'),
          productId: formData.get('productId') ? parseInt(formData.get('productId') as string) : null
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

  const handleTaxCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('tax-calculator', {
        body: {
          orderId: parseInt(formData.get('orderId') as string),
          countryCode: formData.get('countryCode'),
          subtotal: parseFloat(formData.get('subtotal') as string),
          productCategory: formData.get('category')
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
    { id: 'currency', label: 'Multi-Currency', icon: DollarSign },
    { id: 'tax', label: 'Tax & Compliance', icon: Scale },
    { id: 'customs', label: 'Customs Docs', icon: FileText },
    { id: 'shipping', label: 'Global Shipping', icon: Plane },
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'MXN'];
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'IN', name: 'India' },
    { code: 'MX', name: 'Mexico' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Cross-Border Commerce Automation
              </h1>
              <p className="text-lg text-gray-600 mt-1">Expand globally with automated international commerce tools</p>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Markets Active</span>
              <Map className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">23</p>
            <p className="text-xs text-blue-600 mt-1">Across 5 continents</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Currencies</span>
              <DollarSign className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">10</p>
            <p className="text-xs text-gray-500 mt-1">Auto-converted</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Compliance Rate</span>
              <CheckCircle className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">100%</p>
            <p className="text-xs text-green-600 mt-1">Fully automated</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Int'l Orders</span>
              <Plane className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">1,847</p>
            <p className="text-xs text-blue-600 mt-1">↑ 34% this quarter</p>
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
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Multi-Currency Tab */}
        {activeTab === 'currency' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <div className="flex items-center space-x-3 mb-6">
              <DollarSign className="w-6 h-6 text-blue-500" />
              <h3 className="text-2xl font-bold text-gray-900">Real-Time Currency Conversion</h3>
            </div>
            
            <form onSubmit={handleCurrencyConversion} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Currency</label>
                <select
                  name="fromCurrency"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Currency</label>
                <select
                  name="toCurrency"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product ID (optional)</label>
                <input
                  type="number"
                  name="productId"
                  placeholder="Link to product"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Converting...' : 'Convert Currency'}
                </button>
              </div>
            </form>

            {results?.data?.convertedAmount && (
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Original Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {results.data.originalAmount} {results.data.originalCurrency}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Exchange Rate</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {results.data.exchangeRate}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Converted Amount</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {results.data.convertedAmount} {results.data.targetCurrency}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-gray-500">
                  Rates updated: {new Date(results.data.conversionDate).toLocaleString()}
                </p>
              </div>
            )}

            {/* Supported Currencies Display */}
            <div className="mt-8">
              <h4 className="font-semibold text-gray-900 mb-4">Supported Currencies</h4>
              <div className="grid grid-cols-5 gap-3">
                {currencies.map(curr => (
                  <div key={curr} className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                    <span className="font-bold text-blue-600">{curr}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tax & Compliance Tab */}
        {activeTab === 'tax' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
            <div className="flex items-center space-x-3 mb-6">
              <Scale className="w-6 h-6 text-indigo-500" />
              <h3 className="text-2xl font-bold text-gray-900">International Tax Calculator</h3>
            </div>
            
            <form onSubmit={handleTaxCalculation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                <input
                  type="number"
                  name="orderId"
                  placeholder="Enter order ID"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination Country</label>
                <select
                  name="countryCode"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtotal (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  name="subtotal"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                <select
                  name="category"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="handicraft">Handicraft</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="textile">Textile</option>
                  <option value="furniture">Furniture</option>
                  <option value="art">Art</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Calculating...' : 'Calculate Taxes'}
                </button>
              </div>
            </form>

            {results?.data?.summary && (
              <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                <h4 className="font-semibold text-lg text-gray-900 mb-4">Tax Calculation Summary</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-xl font-bold text-gray-900">${results.data.summary.subtotal}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Tax Rate</p>
                    <p className="text-xl font-bold text-indigo-600">{results.data.summary.taxRate}%</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Tax Amount</p>
                    <p className="text-xl font-bold text-purple-600">${results.data.summary.taxAmount}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-gray-900">${results.data.summary.total}</p>
                  </div>
                </div>

                {results.data.summary.breakdown && (
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Tax Breakdown</h5>
                    <div className="space-y-2">
                      {results.data.summary.breakdown.vat.rate > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">VAT ({results.data.summary.breakdown.vat.rate}%)</span>
                          <span className="font-semibold text-gray-900">${results.data.summary.breakdown.vat.amount.toFixed(2)}</span>
                        </div>
                      )}
                      {results.data.summary.breakdown.sales.rate > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Sales Tax ({results.data.summary.breakdown.sales.rate}%)</span>
                          <span className="font-semibold text-gray-900">${results.data.summary.breakdown.sales.amount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">Compliance Notes</h5>
                  <ul className="space-y-1">
                    {results.data.complianceNotes.map((note: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customs Documentation Tab */}
        {activeTab === 'customs' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-purple-500" />
              <h3 className="text-2xl font-bold text-gray-900">Automated Customs Documentation</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <FileText className="w-10 h-10 text-purple-600 mb-4" />
                <h4 className="font-semibold text-lg text-gray-900 mb-2">Commercial Invoice</h4>
                <p className="text-gray-600 mb-4">Auto-generated with all required information</p>
                <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                  Generate Document
                </button>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                <CheckCircle className="w-10 h-10 text-indigo-600 mb-4" />
                <h4 className="font-semibold text-lg text-gray-900 mb-2">Certificate of Origin</h4>
                <p className="text-gray-600 mb-4">Verify product origin for trade agreements</p>
                <button className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                  Create Certificate
                </button>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <Scale className="w-10 h-10 text-blue-600 mb-4" />
                <h4 className="font-semibold text-lg text-gray-900 mb-2">Packing List</h4>
                <p className="text-gray-600 mb-4">Detailed shipment contents and weights</p>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Generate List
                </button>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl border border-cyan-200">
                <FileText className="w-10 h-10 text-cyan-600 mb-4" />
                <h4 className="font-semibold text-lg text-gray-900 mb-2">Harmonized System Codes</h4>
                <p className="text-gray-600 mb-4">Automatic HS code classification</p>
                <button className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition">
                  Find HS Codes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-cyan-100">
            <div className="flex items-center space-x-3 mb-6">
              <Plane className="w-6 h-6 text-cyan-500" />
              <h3 className="text-2xl font-bold text-gray-900">International Shipping Optimization</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { route: 'USA → Europe', carrier: 'DHL Express', days: '3-5', cost: '$45' },
                { route: 'USA → Asia', carrier: 'FedEx Int\'l', days: '5-7', cost: '$52' },
                { route: 'USA → Australia', carrier: 'UPS Worldwide', days: '6-8', cost: '$58' },
                { route: 'Europe → Asia', carrier: 'DHL Economy', days: '7-10', cost: '$38' },
                { route: 'Canada → USA', carrier: 'USPS Priority', days: '2-4', cost: '$28' },
                { route: 'USA → Latin America', carrier: 'FedEx Express', days: '4-6', cost: '$48' },
              ].map((route, idx) => (
                <div key={idx} className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                  <div className="flex items-center justify-between mb-4">
                    <Plane className="w-6 h-6 text-cyan-600" />
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">{route.route}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Carrier:</span>
                      <span className="font-medium text-gray-900">{route.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span className="font-medium text-gray-900">{route.days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Cost:</span>
                      <span className="font-bold text-cyan-600">{route.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && !results.data?.convertedAmount && !results.data?.summary && (
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
