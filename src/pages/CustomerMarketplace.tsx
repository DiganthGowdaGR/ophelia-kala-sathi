import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';
import FilterSidebar from '@/components/marketplace/FilterSidebar';
import ProductCard from '@/components/marketplace/ProductCard';
import RecommendationsSection from '@/components/marketplace/RecommendationsSection';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import type { Product, ArtisanProfile } from '@/types';

export default function CustomerMarketplace() {
  const { user } = useAuth();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // UI state
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [artisanProfiles, setArtisanProfiles] = useState<Map<string, ArtisanProfile>>(new Map());

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('artisan_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user-specific data
  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      // Load wishlist
      const wishlistData = await supabase.functions.invoke('wishlist-manager', {
        body: { action: 'get', userId: user.id }
      });
      
      if (wishlistData.data?.success && wishlistData.data.wishlist) {
        const productIds = wishlistData.data.wishlist.map((item: any) => item.product_id);
        setWishlist(new Set(productIds));
      }

      // Load recommendations
      const recommendationsData = await supabase.functions.invoke('product-recommendations', {
        body: { userId: user.id, type: 'personalized', limit: 6 }
      });
      
      if (recommendationsData.data?.success && recommendationsData.data.recommendations) {
        setRecommendations(recommendationsData.data.recommendations);
      }

      // Load recently viewed
      const recentlyViewedData = await supabase.functions.invoke('product-view-tracker', {
        body: { action: 'recent', userId: user.id }
      });
      
      if (recentlyViewedData.data?.success && recentlyViewedData.data.products) {
        setRecentlyViewed(recentlyViewedData.data.products.slice(0, 6));
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }, [user]);

  // Load artisan profiles
  const loadArtisanProfiles = useCallback(async (artisanIds: string[]) => {
    if (artisanIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('artisan_profiles')
        .select('*')
        .in('user_id', artisanIds);

      if (error) throw error;
      
      const profilesMap = new Map();
      data?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
      setArtisanProfiles(profilesMap);
    } catch (err) {
      console.error('Error loading artisan profiles:', err);
    }
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback(async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Please login to use wishlist');
      return;
    }

    const isInWishlist = wishlist.has(productId);
    const action = isInWishlist ? 'remove' : 'add';

    try {
      const { data } = await supabase.functions.invoke('wishlist-manager', {
        body: { action, userId: user.id, productId }
      });

      if (data?.success) {
        setWishlist(prev => {
          const next = new Set(prev);
          if (isInWishlist) {
            next.delete(productId);
          } else {
            next.add(productId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      alert('Failed to update wishlist');
    }
  }, [user, wishlist]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 1000]);
    setMinRating(0);
    setSortBy('newest');
  }, []);

  // Load data on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Load artisan profiles when products change
  useEffect(() => {
    if (products.length > 0) {
      const artisanIds = [...new Set(products.map(p => p.artisan_id).filter(Boolean))];
      loadArtisanProfiles(artisanIds);
    }
  }, [products, loadArtisanProfiles]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['all', ...uniqueCategories];
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesRating = (product.average_rating || 0) >= minRating;
        return matchesSearch && matchesCategory && matchesPrice && matchesRating;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'rating':
            return (b.average_rating || 0) - (a.average_rating || 0);
          case 'popular':
            return (b.view_count || 0) - (a.view_count || 0);
          case 'newest':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [products, searchTerm, selectedCategory, priceRange, minRating, sortBy]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadProducts();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>
              Showing {filteredAndSortedProducts.length} of {products.length} products
            </span>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live Collection</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onClearFilters={clearFilters}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Recommendations and Recently Viewed */}
            <RecommendationsSection
              recommendations={recommendations}
              recentlyViewed={recentlyViewed}
            />

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col justify-center items-center py-32 bg-white rounded-lg border border-gray-200">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-700 font-medium">Loading products...</p>
                <p className="text-gray-500 text-sm">This may take a moment</p>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              /* No Products Found */
              <div className="text-center py-32 bg-white rounded-lg border border-gray-200">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Products Grid/List */
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredAndSortedProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                    isInWishlist={wishlist.has(product.id)}
                    onToggleWishlist={toggleWishlist}
                    artisanProfile={artisanProfiles.get(product.artisan_id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
