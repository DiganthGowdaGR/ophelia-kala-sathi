import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';
import { 
  ShoppingCart, Star, Shield, ArrowLeft, Heart, MessageCircle, 
  ThumbsUp, Send, Eye, Package, Truck, CheckCircle, MapPin, Mail, Phone, Badge, Award, Users
} from 'lucide-react';
import type { Product, ArtisanProfile } from '@/types';

interface Review {
  id: string;
  rating: number;
  title?: string;
  review_text?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  profiles?: { name: string };
}

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [artisanProfile, setArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [artisanProfileData, setArtisanProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'qa'>('details');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', review_text: '' });
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const loadProductDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('artisan_products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setProduct(data);

      const { data: reviewData } = await supabase.functions.invoke('review-manager', {
        body: { action: 'get', productId: id }
      });

      if (reviewData?.success) {
        setReviews(reviewData.reviews || []);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const trackView = useCallback(async () => {
    try {
      await supabase.functions.invoke('product-view-tracker', {
        body: {
          action: 'track',
          productId: id,
          userId: user?.id || null,
          sessionId: sessionStorage.getItem('sessionId') || `session_${Date.now()}`
        }
      });
    } catch (error) {
      console.error('View tracking error:', error);
    }
  }, [id, user]);

  const loadSimilarProducts = useCallback(async () => {
    try {
      const { data } = await supabase.functions.invoke('product-recommendations', {
        body: { productId: id, type: 'similar', limit: 4 }
      });

      if (data?.success) {
        setSimilarProducts(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error loading similar products:', error);
    }
  }, [id]);

  const checkWishlist = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase.functions.invoke('wishlist-manager', {
        body: { action: 'check', userId: user.id, productId: id }
      });
      
      if (data?.success) {
        setIsInWishlist(data.inWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  }, [id, user]);

  const fetchArtisanProfile = useCallback(async () => {
    if (!product?.artisan_id) return;

    try {
      const { data: artisanData, error: artisanError } = await supabase
        .from('artisan_profiles')
        .select('*')
        .eq('user_id', product.artisan_id)
        .single();

      if (artisanError) throw artisanError;
      setArtisanProfile(artisanData);

      const { data: userProfileData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', product.artisan_id)
        .single();

      if (!userError && userProfileData) {
        setArtisanProfileData(userProfileData);
      }
    } catch (error) {
      console.error('Error loading artisan profile:', error);
    }
  }, [product?.artisan_id]);

  useEffect(() => {
    if (id) {
      loadProductDetails();
      trackView();
      loadSimilarProducts();
      if (user) {
        checkWishlist();
      }
    }
  }, [id, user, loadProductDetails, trackView, loadSimilarProducts, checkWishlist]);

  useEffect(() => {
    if (product?.artisan_id) {
      fetchArtisanProfile();
    }
  }, [product?.artisan_id, fetchArtisanProfile]);

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const action = isInWishlist ? 'remove' : 'add';

    try {
      const { data } = await supabase.functions.invoke('wishlist-manager', {
        body: { action, userId: user.id, productId: id }
      });

      if (data?.success) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const submitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await supabase.functions.invoke('review-manager', {
        body: {
          action: 'add',
          productId: id,
          userId: user.id,
          rating: newReview.rating,
          title: newReview.title,
          reviewText: newReview.review_text
        }
      });

      if (data?.success) {
        setShowReviewForm(false);
        setNewReview({ rating: 5, title: '', review_text: '' });
        loadProductDetails();
        alert('Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (profile?.role !== 'customer') {
      alert('Only customers can add items to cart');
      return;
    }

    try {
      const { error } = await supabase
        .from('shopping_cart')
        .insert([{
          customer_id: user.id,
          product_id: id,
          quantity: quantity
        }]);

      if (error) throw error;
      alert('Added to cart!');
      navigate('/cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex justify-center items-center py-20 pt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="text-center py-20 pt-16">
          <p className="text-gray-600 text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  const averageRating = product.average_rating || 0;
  const reviewCount = product.review_count || reviews.length;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Marketplace</span>
        </button>

        {/* Product Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
              {product.primary_image_url ? (
                <img
                  src={product.primary_image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-20 h-20" />
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border border-gray-200 rounded">
                <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Views</p>
                <p className="font-semibold text-gray-900">{product.view_count || 0}</p>
              </div>
              <div className="text-center p-3 border border-gray-200 rounded">
                <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Rating</p>
                <p className="font-semibold text-gray-900">{averageRating.toFixed(1)}</p>
              </div>
              <div className="text-center p-3 border border-gray-200 rounded">
                <CheckCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Stock</p>
                <p className="font-semibold text-gray-900">{product.stock_quantity || 0}</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="border border-gray-200 rounded-lg p-6">
            {product.category && (
              <div className="inline-block text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium mb-4">
                {product.category}
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 font-medium">
                {averageRating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 text-gray-900 mb-1">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Authenticity Guaranteed</span>
              </div>
              <p className="text-sm text-gray-600">
                100% handcrafted by verified artisans
              </p>
            </div>

            {product.stock_quantity > 0 ? (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max={product.stock_quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">
                      {product.stock_quantity} available
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addToCart}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={toggleWishlist}
                    className={`px-4 py-3 rounded-lg font-semibold transition border ${
                      isInWishlist
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 px-6 py-4 rounded-lg text-center font-semibold border border-red-200">
                Out of Stock
              </div>
            )}

            {/* Shipping Info */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 text-gray-900">
                <Truck className="w-5 h-5" />
                <span className="font-semibold">Free Shipping on orders over $50</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Estimated delivery: 5-7 business days
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-5 h-5" />
              Reviews ({reviewCount})
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'qa'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Q&A
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'No description available.'}
                </p>

                {product.materials && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Materials</h4>
                    <p className="text-gray-600">{product.materials}</p>
                  </div>
                )}

                {product.dimensions && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Dimensions</h4>
                    <p className="text-gray-600">{product.dimensions}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="mb-6 p-6 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Write Your Review</h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setNewReview({ ...newReview, rating })}
                            className="transition"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                rating <= newReview.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={newReview.title}
                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        placeholder="Sum up your experience"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                      <textarea
                        value={newReview.review_text}
                        onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                        placeholder="Share your thoughts about this product"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={submitReview}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Submit Review
                      </button>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-3" />
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.verified_purchase && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            {review.title && (
                              <h5 className="font-semibold text-gray-900">{review.title}</h5>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {review.review_text && (
                          <p className="text-gray-600 mb-3">{review.review_text}</p>
                        )}

                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful ({review.helpful_count})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qa' && (
              <div>
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3" />
                  <p className="mb-4">Have a question about this product?</p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Ask a Question
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Artisan Profile Section */}
        {artisanProfile && (
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 sm:px-8 py-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Artisan Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    {artisanProfileData?.avatar_url ? (
                      <img
                        src={artisanProfileData.avatar_url}
                        alt={artisanProfile.business_name || 'Artisan'}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white">
                        <Users className="w-10 h-10 text-blue-600" />
                      </div>
                    )}
                    {artisanProfile.verification_status === 'verified' && (
                      <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                        <Badge className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Artisan Info */}
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {artisanProfile.business_name || artisanProfileData?.full_name || 'Artisan Shop'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {artisanProfile.verification_status === 'verified' ? '✓ Verified Artisan' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>

                    {/* Artisan Rating */}
                    <div className="text-center sm:text-right">
                      <div className="flex items-center gap-2 justify-center sm:justify-end mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {averageRating.toFixed(1)} rating • {reviewCount} reviews
                      </p>
                    </div>
                  </div>

                  {/* Bio/Story */}
                  {artisanProfile.bio && (
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {artisanProfile.bio}
                    </p>
                  )}

                  {/* Location and Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {artisanProfile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Location</p>
                          <p className="text-sm text-gray-900 font-medium">{artisanProfile.location}</p>
                        </div>
                      </div>
                    )}

                    {artisanProfileData?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Contact</p>
                          <p className="text-sm text-gray-900 font-medium break-all">{artisanProfileData.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills/Experience */}
              {artisanProfile.skills && artisanProfile.skills.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Experience & Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {artisanProfile.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white text-blue-600 rounded-full text-sm font-medium border border-blue-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                  View All Products
                </button>
                <button className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition">
                  Contact Artisan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((similar) => (
                <Link key={similar.id} to={`/product/${similar.id}`} className="group">
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition">
                    <div className="aspect-square bg-gray-50">
                      {similar.primary_image_url ? (
                        <img
                          src={similar.primary_image_url}
                          alt={similar.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition">
                        {similar.name}
                      </h4>
                      <p className="text-lg font-bold text-gray-900">
                        ${similar.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
