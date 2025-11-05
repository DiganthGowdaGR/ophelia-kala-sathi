import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';
import AIInventoryManager from '@/components/artisan/AIInventoryManager';
import AIMarketAnalyzer from '@/components/artisan/AIMarketAnalyzer';
import AICustomerInsights from '@/components/artisan/AICustomerInsights';
import AIBusinessAdvisor from '@/components/artisan/AIBusinessAdvisor';
import AIProductDescriptionGenerator from '@/components/artisan/AIProductDescriptionGenerator';
import { 
  Plus, Package, TrendingUp, DollarSign, Eye, Sparkles, Upload, Video, 
  Brain, BarChart3, Share2, Mic, Users, Leaf, Globe, User, RefreshCw,
  ShoppingBag, Star, AlertTriangle, TrendingDown, Calendar, Clock,
  MapPin, ArrowUp, ArrowDown, Activity, Bell, Settings, Download
} from 'lucide-react';
import type { Product, Analytics } from '@/types';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  totalProducts: number;
  avgOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'review' | 'view' | 'stock';
  message: string;
  timestamp: Date;
  icon: any;
  color: string;
}

export default function ArtisanDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalViews: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    orderGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showAIContent, setShowAIContent] = useState(false);
  const [showAITab, setShowAITab] = useState<string | null>(null); // 'inventory' | 'market' | 'customers' | 'business' | 'description'
  const [selectedTimeRange, setSelectedTimeRange] = useState('30'); // days
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [productsRes, analyticsRes, ordersRes] = await Promise.all([
        supabase
          .from('artisan_products')
          .select('*')
          .eq('artisan_id', user?.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('analytics')
          .select('*')
          .eq('artisan_id', user?.id)
          .order('date', { ascending: false })
          .limit(parseInt(selectedTimeRange)),
        
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('artisan_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const productsData = productsRes.data || [];
      const analyticsData = analyticsRes.data || [];
      const ordersData = ordersRes.data || [];

      setProducts(productsData);
      setAnalytics(analyticsData);

      // Calculate comprehensive stats
      const totalRevenue = analyticsData.reduce((sum, a) => sum + parseFloat(a.revenue?.toString() || '0'), 0);
      const totalOrders = analyticsData.reduce((sum, a) => sum + (a.orders_count || 0), 0);
      const totalViews = analyticsData.reduce((sum, a) => sum + (a.views || 0), 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

      // Calculate growth rates (comparing first half vs second half of period)
      const midPoint = Math.floor(analyticsData.length / 2);
      const recentRevenue = analyticsData.slice(0, midPoint).reduce((sum, a) => sum + parseFloat(a.revenue?.toString() || '0'), 0);
      const olderRevenue = analyticsData.slice(midPoint).reduce((sum, a) => sum + parseFloat(a.revenue?.toString() || '0'), 0);
      const revenueGrowth = olderRevenue > 0 ? ((recentRevenue - olderRevenue) / olderRevenue) * 100 : 0;

      const recentOrders = analyticsData.slice(0, midPoint).reduce((sum, a) => sum + (a.orders_count || 0), 0);
      const olderOrders = analyticsData.slice(midPoint).reduce((sum, a) => sum + (a.orders_count || 0), 0);
      const orderGrowth = olderOrders > 0 ? ((recentOrders - olderOrders) / olderOrders) * 100 : 0;

      setStats({
        totalRevenue,
        totalOrders,
        totalViews,
        totalProducts: productsData.length,
        avgOrderValue,
        conversionRate,
        revenueGrowth,
        orderGrowth
      });

      // Generate recent activities
      const activities: RecentActivity[] = [];
      
      // Add recent orders
      ordersData.slice(0, 5).forEach(order => {
        activities.push({
          id: order.id,
          type: 'order',
          message: `New order #${order.id.slice(0, 8)} - $${order.total_amount}`,
          timestamp: new Date(order.created_at),
          icon: ShoppingBag,
          color: 'text-green-500'
        });
      });

      // Add low stock alerts
      productsData.filter(p => p.stock_quantity < 5 && p.stock_quantity > 0).forEach(product => {
        activities.push({
          id: product.id,
          type: 'stock',
          message: `Low stock alert: ${product.name} (${product.stock_quantity} left)`,
          timestamp: new Date(product.updated_at || product.created_at),
          icon: AlertTriangle,
          color: 'text-orange-500'
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecentActivities(activities.slice(0, 10));

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTimeRange, user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock_quantity < 5 && p.stock_quantity > 0);
  const topProducts = products.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-h1 font-bold text-accent mb-2">
              Artisan Dashboard
            </h1>
            <p className="text-text-secondary">Welcome back! Here's your business overview</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-background text-text-secondary px-4 py-2 rounded-lg hover:bg-secondary transition border border-border"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            
            <button
              onClick={() => setShowProductForm(true)}
              className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition border border-primary hover:border-accent"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            change={stats.revenueGrowth}
            trend={stats.revenueGrowth >= 0 ? 'up' : 'down'}
            gradient="from-green-500 to-emerald-600"
          />
          <MetricCard
            icon={<ShoppingBag className="w-6 h-6" />}
            title="Total Orders"
            value={stats.totalOrders.toString()}
            change={stats.orderGrowth}
            trend={stats.orderGrowth >= 0 ? 'up' : 'down'}
            gradient="from-blue-500 to-indigo-600"
          />
          <MetricCard
            icon={<Eye className="w-6 h-6" />}
            title="Product Views"
            value={stats.totalViews.toString()}
            subtitle={`${stats.conversionRate.toFixed(1)}% conversion`}
            gradient="from-purple-500 to-pink-600"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Avg Order Value"
            value={`$${stats.avgOrderValue.toFixed(2)}`}
            subtitle={`${stats.totalProducts} products`}
            gradient="from-orange-500 to-red-600"
          />
        </div>

        {/* Alerts & Notifications */}
        {lowStockProducts.length > 0 && (
          <div className="bg-secondary border-l-4 border-orange-500 border border-orange-200 p-4 mb-8 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">Low Stock Alert</h3>
                <p className="text-sm text-text-secondary">
                  {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on inventory
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lowStockProducts.map(p => (
                    <span key={p.id} className="bg-background px-3 py-1 rounded-full text-sm text-orange-700 border border-orange-200">
                      {p.name}: {p.stock_quantity} left
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-background rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-h3 font-bold text-text-primary">Revenue Trends</h2>
              <button className="text-accent hover:text-accent text-sm font-semibold flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {analytics.slice(0, 10).reverse().map((item, index) => {
                const maxRevenue = Math.max(...analytics.map(a => parseFloat(a.revenue?.toString() || '0')));
                const width = maxRevenue > 0 ? (parseFloat(item.revenue?.toString() || '0') / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-text-secondary">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm font-semibold text-text-primary">
                        ${parseFloat(item.revenue?.toString() || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-background rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-h3 font-bold text-text-primary">Recent Activity</h2>
              <Bell className="w-5 h-5 text-text-tertiary" />
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-text-tertiary" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary transition">
                    <activity.icon className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">{activity.message}</p>
                      <p className="text-xs text-text-tertiary mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI-Powered Features Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h2 font-bold text-accent">AI-Powered Business Tools</h2>
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Powered by Gemini AI</span>
            </div>
          </div>
          
          {/* AI Tools Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <button
              onClick={() => setShowAITab(showAITab === 'inventory' ? null : 'inventory')}
              className={`p-4 rounded-lg border-2 transition-all ${
                showAITab === 'inventory'
                  ? 'bg-secondary border-accent'
                  : 'bg-background border-border hover:border-accent'
              }`}
            >
              <Package className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs font-semibold text-text-primary">Inventory AI</p>
            </button>
            
            <button
              onClick={() => setShowAITab(showAITab === 'market' ? null : 'market')}
              className={`p-4 rounded-lg border-2 transition-all ${
                showAITab === 'market'
                  ? 'bg-secondary border-accent'
                  : 'bg-background border-border hover:border-accent'
              }`}
            >
              <BarChart3 className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs font-semibold text-text-primary">Market AI</p>
            </button>
            
            <button
              onClick={() => setShowAITab(showAITab === 'customers' ? null : 'customers')}
              className={`p-4 rounded-lg border-2 transition-all ${
                showAITab === 'customers'
                  ? 'bg-secondary border-accent'
                  : 'bg-background border-border hover:border-accent'
              }`}
            >
              <Users className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs font-semibold text-text-primary">Customer AI</p>
            </button>
            
            <button
              onClick={() => setShowAITab(showAITab === 'business' ? null : 'business')}
              className={`p-4 rounded-lg border-2 transition-all ${
                showAITab === 'business'
                  ? 'bg-secondary border-accent'
                  : 'bg-background border-border hover:border-accent'
              }`}
            >
              <TrendingUp className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs font-semibold text-text-primary">Business AI</p>
            </button>
            
            <button
              onClick={() => setShowAITab(showAITab === 'description' ? null : 'description')}
              className={`p-4 rounded-lg border-2 transition-all ${
                showAITab === 'description'
                  ? 'bg-secondary border-accent'
                  : 'bg-background border-border hover:border-accent'
              }`}
            >
              <Sparkles className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs font-semibold text-text-primary">Description AI</p>
            </button>
          </div>
          
          {/* AI Tool Display */}
          {showAITab === 'inventory' && <AIInventoryManager products={products} />}
          {showAITab === 'market' && (
            <AIMarketAnalyzer 
              category="Handmade Crafts"
              recentSales={stats.totalOrders}
              competitorCount={5}
            />
          )}
          {showAITab === 'customers' && (
            <AICustomerInsights
              totalCustomers={Math.floor(stats.totalOrders * 0.7)}
              repeatCustomerRate={35}
              averageOrderValue={stats.avgOrderValue}
            />
          )}
          {showAITab === 'business' && (
            <AIBusinessAdvisor
              monthlyRevenue={stats.totalRevenue}
              productCount={stats.totalProducts}
              orderCount={stats.totalOrders}
              conversionRate={stats.conversionRate}
            />
          )}
          {showAITab === 'description' && <AIProductDescriptionGenerator />}
        </div>

        {/* Top Products & AI Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Products</h2>
            
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No products yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition group border border-transparent hover:border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {product.primary_image_url ? (
                        <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.views || 0} views</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{product.stock_quantity} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI-Powered Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">AI-Powered Tools</h2>
            
            <div className="space-y-3">
              <QuickActionCard
                icon={<Sparkles className="w-5 h-5" />}
                title="AI Content Generator"
                description="Create product descriptions & marketing copy"
                onClick={() => setShowAIContent(true)}
                gradient="from-purple-500 to-pink-600"
              />
              
              <QuickActionCard
                icon={<Brain className="w-5 h-5" />}
                title="Business Intelligence"
                description="Get AI insights on market trends"
                onClick={() => navigate('/dashboard/ai')}
                gradient="from-indigo-500 to-blue-600"
              />
              
              <QuickActionCard
                icon={<BarChart3 className="w-5 h-5" />}
                title="Market Simulation"
                description="Predict trends & optimize pricing"
                onClick={() => navigate('/artisan/market-simulation')}
                gradient="from-blue-500 to-cyan-600"
              />
              
              <QuickActionCard
                icon={<Share2 className="w-5 h-5" />}
                title="Social Distribution"
                description="Post to multiple platforms instantly"
                onClick={() => navigate('/artisan/social-distribution')}
                gradient="from-green-500 to-emerald-600"
              />
              
              <QuickActionCard
                icon={<Mic className="w-5 h-5" />}
                title="Voice Business Mentor"
                description="Get personalized coaching via voice"
                onClick={() => navigate('/artisan/voice-mentor')}
                gradient="from-orange-500 to-red-600"
              />
            </div>
          </div>
        </div>

        {/* Advanced Features Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Feature Suite</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-indigo-600" />}
              title="AI Control Center"
              description="35+ AI features"
              onClick={() => navigate('/dashboard/ai')}
              gradient="from-indigo-50 to-indigo-100"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-violet-600" />}
              title="Social Commerce"
              description="Community tools"
              onClick={() => navigate('/artisan/social-commerce')}
              gradient="from-violet-50 to-fuchsia-100"
            />
            <FeatureCard
              icon={<Leaf className="w-6 h-6 text-emerald-600" />}
              title="Sustainability"
              description="Eco-tracking"
              onClick={() => navigate('/artisan/sustainability')}
              gradient="from-emerald-50 to-green-100"
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-blue-600" />}
              title="Cross-Border"
              description="Global commerce"
              onClick={() => navigate('/artisan/cross-border')}
              gradient="from-blue-50 to-indigo-100"
            />
          </div>
        </div>

        {/* Products Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
            <div className="flex space-x-3">
              <button className="text-gray-600 hover:text-gray-900 text-sm font-semibold flex items-center space-x-1">
                <Settings className="w-4 h-4" />
                <span>Bulk Edit</span>
              </button>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No products yet</p>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition border border-indigo-600 hover:border-indigo-700"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {products.map(product => (
                <ProductRow key={product.id} product={product} onUpdate={loadDashboardData} />
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {showProductForm && (
          <ProductFormModal onClose={() => setShowProductForm(false)} onSuccess={loadDashboardData} />
        )}
        {showAIContent && (
          <AIContentModal onClose={() => setShowAIContent(false)} />
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, change, trend, subtitle, gradient }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
      
      {change !== undefined && (
        <div className={`flex items-center space-x-1 text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span className="font-semibold">{Math.abs(change).toFixed(1)}%</span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
      
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

function QuickActionCard({ icon, title, description, onClick, gradient }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-4 p-4 rounded-lg bg-white hover:border-gray-300 transition-all group border border-gray-100"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </button>
  );
}

function FeatureCard({ icon, title, description, onClick, gradient }: any) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-lg p-5 text-left hover:ring-2 hover:ring-offset-1 transition-all cursor-pointer group border border-transparent`}
    >
      <div className="mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </button>
  );
}

function ProductRow({ product, onUpdate }: { product: Product; onUpdate: () => void }) {
  const [toggling, setToggling] = useState(false);

  async function toggleActive() {
    setToggling(true);
    try {
      const { error } = await supabase
        .from('artisan_products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error toggling product:', error);
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition group">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-indigo-300 transition">
          {product.primary_image_url ? (
            <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-6 h-6" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-sm text-gray-600">${product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className={`text-sm ${product.stock_quantity < 5 ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
              {product.stock_quantity} in stock
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600 flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>{product.views || 0}</span>
        </div>
        <button
          onClick={toggleActive}
          disabled={toggling}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            product.is_active
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {product.is_active ? 'Active' : 'Inactive'}
        </button>
      </div>
    </div>
  );
}

function ProductFormModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock_quantity: '0',
    currency: 'USD'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);

    try {
      if (!imageFile) {
        alert('Please select an image');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const { data, error } = await supabase.functions.invoke('product-upload', {
          body: {
            imageData: base64Data,
            fileName: imageFile.name,
            productData: {
              ...formData,
              price: formData.price,
              stock_quantity: formData.stock_quantity
            }
          }
        });

        if (error) throw error;

        alert('Product added successfully!');
        onSuccess();
        onClose();
      };

      reader.readAsDataURL(imageFile);
    } catch (error: any) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="Textiles">Textiles</option>
                <option value="Pottery">Pottery</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Woodwork">Woodwork</option>
                <option value="Metalwork">Metalwork</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AIContentModal({ onClose }: any) {
  const [contentType, setContentType] = useState('product_description');
  const [input, setInput] = useState({ productName: '', category: '' });
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);

  async function generateContent() {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: {
          contentType,
          input
        }
      });

      if (error) throw error;
      setGeneratedContent(data.data.content);
    } catch (error: any) {
      console.error('Error generating content:', error);
      alert('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Content Generator</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            >
              <option value="product_description">Product Description</option>
              <option value="social_post">Social Media Post</option>
              <option value="marketing_copy">Marketing Copy</option>
              <option value="brand_story">Brand Story</option>
              <option value="pricing_suggestion">Pricing Suggestion</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              value={input.productName}
              onChange={(e) => setInput({ ...input, productName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={input.category}
              onChange={(e) => setInput({ ...input, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <button
            onClick={generateContent}
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{generating ? 'Generating...' : 'Generate with AI'}</span>
          </button>

          {generatedContent && (
            <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-3">Generated Content</h3>
              <div className="bg-white p-4 rounded-lg whitespace-pre-wrap text-gray-700">
                {generatedContent}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(generatedContent)}
                className="mt-3 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
