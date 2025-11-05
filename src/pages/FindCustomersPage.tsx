// Find Customers Page - For artisans to discover potential customers
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';

export default function FindCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ interests: '', category: '' });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('discovery-manager', {
        body: { action: 'find_customers', filters }
      });

      if (error) throw error;
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Customers</h1>
          <p className="text-lg text-gray-600">Connect with potential buyers interested in your craft</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Interests</label>
              <select
                value={filters.interests}
                onChange={(e) => setFilters({ ...filters, interests: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">All Interests</option>
                <option value="handmade">Handmade Goods</option>
                <option value="sustainable">Sustainable Products</option>
                <option value="luxury">Luxury Crafts</option>
                <option value="custom">Custom Orders</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">All Categories</option>
                <option value="pottery">Pottery</option>
                <option value="jewelry">Jewelry</option>
                <option value="textiles">Textiles</option>
                <option value="woodworking">Woodworking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found. Try different filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full"></div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {customer.profile?.full_name || 'Customer'}
                    </h3>
                    <p className="text-sm text-gray-500">{customer.profile?.city || 'Location'}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {(customer.interests || []).map((interest, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preferred Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {(customer.preferred_categories || []).map((category, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
