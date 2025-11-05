import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';
import { 
  Search, MapPin, Filter, Star, User, Phone, Mail, 
  ShoppingBag, StarHalf, ChevronDown, X, ArrowUp, 
  PhoneCall, MessageCircle, Navigation2, Clock, Eye
} from 'lucide-react';

interface Artisan {
  id: string;
  user_id: string;
  full_name: string;
  business_name: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  bio?: string;
  profile_image_url?: string;
  rating?: number;
  review_count?: number;
  response_time?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface SearchFilters {
  category: string;
  location: string;
  radius: number;
  sortBy: 'distance' | 'rating' | 'reviews' | 'newest';
}

export default function FindArtisansPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    location: '',
    radius: 50, // km
    sortBy: 'rating'
  });

  const [categories] = useState([
    'All Categories',
    'Textiles',
    'Pottery', 
    'Jewelry',
    'Woodwork',
    'Metalwork',
    'Sculpture',
    'Painting',
    'Ceramics',
    'Glasswork',
    'Leatherwork',
    'Other'
  ]);

  // Load artisans data
  const loadArtisans = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('artisan_profiles')
        .select('*')
        .eq('is_active', true);

      if (filters.category && filters.category !== 'All Categories') {
        query = query.eq('category', filters.category);
      }

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,business_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setArtisans(data || []);
    } catch (error) {
      console.error('Error loading artisans:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Use a default location (e.g., New York City)
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  }, []);

  // Load artisans on mount and filter/search changes
  useEffect(() => {
    loadArtisans();
  }, [loadArtisans]);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter and sort artisans
  const filteredArtisans = artisans
    .filter(artisan => {
      if (!userLocation || !artisan.latitude || !artisan.longitude) return true;
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        artisan.latitude,
        artisan.longitude
      );
      
      return distance <= filters.radius;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.review_count || 0) - (a.review_count || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'distance': {
          if (!userLocation || !a.latitude || !b.latitude || !userLocation.lng || !a.longitude || !b.longitude) return 0;
          const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
          const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
          return distA - distB;
        }
        default:
          return 0;
      }
    });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  const handleSearch = () => {
    loadArtisans();
  };

  const getDistance = (artisan: Artisan) => {
    if (!userLocation || !artisan.latitude || !artisan.longitude) return null;
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      artisan.latitude,
      artisan.longitude
    );
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const ArtisanProfileModal = ({ artisan, onClose }: { artisan: Artisan; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {artisan.profile_image_url ? (
                <img 
                  src={artisan.profile_image_url} 
                  alt={artisan.full_name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{artisan.full_name}</h2>
              {artisan.business_name && (
                <p className="text-lg text-indigo-600 font-semibold">{artisan.business_name}</p>
              )}
              <p className="text-gray-600">{artisan.category}</p>
              <div className="flex items-center space-x-2 mt-1">
                {renderStars(artisan.rating || 0)}
                <span className="text-sm text-gray-600">
                  {artisan.rating?.toFixed(1)} ({artisan.review_count} reviews)
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-gray-700">{artisan.description || artisan.bio || 'No description available.'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{artisan.location}</span>
              {getDistance(artisan) && (
                <span className="text-sm text-green-600 font-semibold">• {getDistance(artisan)} away</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
            <div className="space-y-2">
              {artisan.phone && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{artisan.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{artisan.email}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Send Message</span>
            </button>
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2">
              <PhoneCall className="w-4 h-4" />
              <span>Call</span>
            </button>
            {userLocation && artisan.latitude && artisan.longitude && (
              <button 
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${artisan.latitude},${artisan.longitude}`;
                  window.open(url, '_blank');
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
              >
                <Navigation2 className="w-4 h-4" />
                <span>Directions</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Find Artisans
          </h1>
          <p className="text-gray-600">Discover talented artisans near you and around the world</p>
          
          {/* Location Status */}
          {userLocation && (
            <div className="mt-4 flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>Location detected - showing artisans within {filters.radius}km radius</span>
            </div>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search artisans, skills, or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Search
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category === 'All Categories' ? '' : category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="newest">Newest</option>
                    <option value="distance">Nearest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radius: {filters.radius}km
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={filters.radius}
                    onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ category: '', location: '', radius: 50, sortBy: 'rating' })}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Found {filteredArtisans.length} artisan{filteredArtisans.length !== 1 ? 's' : ''}
            {userLocation && ' near you'}
          </p>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {userLocation && (
              <>
                <Navigation2 className="w-4 h-4" />
                <span>Location-based results</span>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading artisans...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredArtisans.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No artisans found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or location filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ category: '', location: '', radius: 50, sortBy: 'rating' });
                loadArtisans();
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Artisan Grid */}
        {!loading && filteredArtisans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtisans.map((artisan) => (
              <div
                key={artisan.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => {
                  setSelectedArtisan(artisan);
                  setShowProfileModal(true);
                }}
              >
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    {artisan.profile_image_url ? (
                      <img
                        src={artisan.profile_image_url}
                        alt={artisan.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <User className="w-16 h-16 text-indigo-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{artisan.full_name}</p>
                      </div>
                    )}
                  </div>
                  
                  {artisan.rating && artisan.rating > 0 && (
                    <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold">{artisan.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}

                  {getDistance(artisan) && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white rounded-full px-2 py-1 shadow-sm">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{getDistance(artisan)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                        {artisan.full_name}
                      </h3>
                      {artisan.business_name && (
                        <p className="text-sm text-indigo-600 font-medium">{artisan.business_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      {artisan.category}
                    </span>
                    {artisan.response_time && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{artisan.response_time}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {artisan.description || artisan.bio || 'Experienced artisan specializing in traditional crafts...'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{artisan.location}</span>
                    </div>
                    
                    {artisan.review_count && artisan.review_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{artisan.review_count} reviews</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && filteredArtisans.length >= 20 && (
          <div className="text-center mt-8">
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition">
              Load More Artisans
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedArtisan && (
        <ArtisanProfileModal
          artisan={selectedArtisan}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedArtisan(null);
          }}
        />
      )}
    </div>
  );
}
