import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Star,
  Eye,
  Award,
  Settings,
  Camera,
  Briefcase,
  Mail,
  Globe2,
  Phone,
  Plus,
  Trash2,
  Share2,
  Edit,
  X
} from 'lucide-react';
import Navigation from '@/components/shared/Navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ArtisanProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [processing, setProcessing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [postingToMarket, setPostingToMarket] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: '' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
    loadProducts();
    
    if (user?.id) {
      const subscription = supabase
        .channel(`artisan_products_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'artisan_products',
            filter: `artisan_id=eq.${user.id}`
          },
          () => {
            loadProducts();
          }
        )
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase.functions.invoke('profile-manager', {
        body: { action: 'getProfile', userId: user?.id }
      });
      
      if (!error && result?.data) {
        setProfileData(result.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadProducts = async () => {
    try {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('artisan_products')
        .select('*')
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.functions.invoke('profile-manager', {
        body: { 
          action: 'updateProfile',
          userId: user?.id,
          profile: Object.fromEntries(formData)
        }
      });
      
      if (error) throw error;
      await loadProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('artisan_products')
        .insert([
          {
            artisan_id: user.id,
            name: newProduct.name,
            description: newProduct.description,
            price: parseFloat(newProduct.price),
            category: newProduct.category,
            is_active: true,
            stock_quantity: 0
          }
        ]);
      
      if (error) throw error;
      setNewProduct({ name: '', description: '', price: '', category: '' });
      setShowAddProduct(false);
      await loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setDeletingProduct(productId);
    try {
      const { error } = await supabase
        .from('artisan_products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeletingProduct(null);
    }
  };

  const handlePostToMarket = async (product: any) => {
    setPostingToMarket(product.id);
    try {
      const { error } = await supabase
        .from('artisan_products')
        .update({ is_active: true, posted_to_market: true, posted_at: new Date() })
        .eq('id', product.id);
      
      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error posting to market:', error);
    } finally {
      setPostingToMarket(null);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Profile Overview', icon: User },
    { id: 'products', label: 'Products', icon: Briefcase },
    { id: 'skills', label: 'Skills & Hobbies', icon: Award },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      
      <div className="w-full pt-16">
        {/* Instagram-style Profile Header */}
        <div className="bg-primary border-b border-border sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-8">
              {/* Profile Image & Info */}
              <div className="flex items-start gap-4 sm:gap-6 flex-1 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center border border-border">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary truncate">
                    {profileData?.profile?.display_name || 'Your Name'}
                  </h1>
                  
                  {profileData?.profile?.location && (
                    <p className="text-text-secondary text-sm sm:text-base flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{profileData.profile.location}</span>
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex gap-6 sm:gap-8 mt-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary text-base">{products.length}</span>
                      <span className="text-text-secondary text-xs">products</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary text-base flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        {profileData?.rating || 4.9}
                      </span>
                      <span className="text-text-secondary text-xs">rating</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Edit Button */}
              <button className="px-4 py-2 bg-text-primary text-primary rounded-lg hover:bg-opacity-90 transition flex items-center gap-2 text-sm font-medium border border-text-primary flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start">
                <Settings className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
            
            {/* Bio */}
            {profileData?.profile?.bio && (
              <p className="text-text-secondary leading-relaxed text-sm mt-4 max-w-2xl">
                {profileData.profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigation - Sticky */}
        <div className="bg-primary border-b border-border sticky top-20 sm:top-28 md:top-32 z-30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex overflow-x-auto gap-1 -mx-4 px-4 sm:gap-2 sm:mx-0 sm:px-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-accent text-text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'products' && (
            <div className="px-4 py-8">
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-4 py-2 bg-accent text-text-primary rounded-lg hover:opacity-90 transition flex items-center gap-2 text-sm font-medium border border-accent"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16 bg-secondary rounded-lg border border-border">
                  <Briefcase className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
                  <p className="text-text-secondary mb-4">No products yet</p>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="px-4 py-2 bg-text-primary text-primary rounded-lg hover:opacity-90 transition text-sm font-medium border border-text-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                  {products.map((product: any) => (
                    <div key={product.id} className="bg-primary rounded-lg border border-border overflow-hidden group hover:border-accent transition">
                      <div className="aspect-square relative bg-secondary overflow-hidden">
                        {product.primary_image_url ? (
                          <img 
                            src={product.primary_image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Briefcase className="w-8 h-8 text-text-tertiary opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-text-primary/0 group-hover:bg-text-primary/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handlePostToMarket(product)}
                            disabled={postingToMarket === product.id || product.posted_to_market}
                            className="p-2 bg-accent text-text-primary rounded-lg hover:opacity-90 transition disabled:opacity-50"
                            title={product.posted_to_market ? 'Posted to market' : 'Post to market'}
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingProduct === product.id}
                            className="p-2 bg-red-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        {product.posted_to_market && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-accent text-text-primary rounded text-xs font-semibold">
                            Posted
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-text-primary text-sm truncate">{product.name}</h3>
                        <p className="text-accent font-bold text-sm mt-1">${product.price.toFixed(2)}</p>
                        <p className="text-text-tertiary text-xs mt-2">{product.category}</p>
                        <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
                          <span>{product.stock_quantity} in stock</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {product.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="px-4 py-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-accent flex-shrink-0" />
                <h3 className="text-2xl font-bold text-text-primary">Skills & Hobbies</h3>
              </div>
              
              <div className="space-y-6 bg-secondary rounded-lg border border-border p-6">
                <div>
                  <h4 className="font-semibold text-text-primary mb-3">Craft Skills</h4>
                  {(profileData?.skills || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(profileData?.skills || []).map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-primary text-accent rounded-full text-sm font-medium border border-border">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-tertiary text-sm">No skills added yet</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-text-primary mb-3">Hobbies & Interests</h4>
                  {(profileData?.hobbies || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(profileData?.hobbies || []).map((hobby: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-primary text-accent rounded-full text-sm font-medium border border-border">
                          {hobby}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-tertiary text-sm">No hobbies added yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="px-4 py-8">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-accent flex-shrink-0" />
                <h3 className="text-2xl font-bold text-text-primary">Reviews & Ratings</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {(profileData?.reviews || [
                  { name: 'James K.', rating: 5, text: 'Fast shipping and excellent quality. Will definitely order again!', date: '1 week ago' },
                  { name: 'Emily R.', rating: 4, text: 'Great product, exactly as described. Very happy with my purchase.', date: '2 weeks ago' },
                ]).map((review: any, idx: number) => (
                  <div key={idx} className="p-6 bg-secondary rounded-lg border border-border">
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-text-primary font-semibold flex-shrink-0">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{review.name}</p>
                          <p className="text-sm text-text-tertiary">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="text-text-secondary text-sm mt-3">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="px-4 py-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-accent flex-shrink-0" />
                <h3 className="text-2xl font-bold text-text-primary">Profile Overview</h3>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6 bg-secondary rounded-lg border border-border p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Display Name</label>
                    <input
                      type="text"
                      name="display_name"
                      defaultValue={profileData?.profile?.display_name}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-primary focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary placeholder-text-tertiary"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={profileData?.profile?.location}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-primary focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary placeholder-text-tertiary"
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">Bio</label>
                    <textarea
                      name="bio"
                      rows={4}
                      defaultValue={profileData?.profile?.bio}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-primary focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-text-primary placeholder-text-tertiary"
                      placeholder="Tell us about yourself and your craft..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2 bg-text-primary text-primary rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 border border-text-primary"
                  >
                    {processing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-text-primary/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary rounded-lg border border-border max-w-md w-full p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Add Product</h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="p-1 hover:bg-secondary rounded transition"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg bg-secondary focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary text-sm placeholder-text-tertiary"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-secondary focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary text-sm resize-none placeholder-text-tertiary"
                    placeholder="Describe your product"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg bg-secondary focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary text-sm"
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
                  <label className="block text-sm font-medium text-text-primary mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg bg-secondary focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary text-sm placeholder-text-tertiary"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-secondary transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-accent text-text-primary rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium text-sm border border-accent"
                  >
                    {processing ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}