import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';
import { 
  Upload, Mail, Phone, MapPin, Globe, Verified, Star, Award, Shield, 
  Eye, EyeOff, Save, X, ChevronRight, Copy, Check 
} from 'lucide-react';

interface UserProfile {
  id?: string;
  full_name: string;
  bio: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  profile_image_url?: string;
  social_links?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  preferences?: {
    notifications: boolean;
    privacy: string;
    language?: string;
  };
  verification?: {
    email_verified: boolean;
    phone_verified: boolean;
    identity_verified: boolean;
  };
  business_info?: {
    business_name?: string;
    business_type?: string;
    years_in_business?: number;
    total_sales?: number;
    rating?: number;
    reviews_count?: number;
  };
}

export default function ProfilePage() {
  const { user, profile: authProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'business' | 'social' | 'security' | 'preferences'>('personal');
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    bio: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Error saving profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      setProfile({ ...profile, profile_image_url: data.publicUrl });
      setMessage({ type: 'success', text: 'Profile image uploaded!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploadingImage(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(text);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section with Profile Image */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              {/* Profile Image */}
              <div className="relative z-10">
                <div className="w-32 h-32 rounded-xl border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                  {profile.profile_image_url ? (
                    <img 
                      src={profile.profile_image_url} 
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600">
                      <span className="text-4xl font-bold text-white">
                        {profile.full_name?.charAt(0).toUpperCase() || '👤'}
                      </span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-yellow-700 transition shadow-lg">
                  <Upload className="w-5 h-5" />
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name || 'Your Profile'}</h1>
                <p className="text-gray-600 flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                
                {authProfile?.role === 'artisan' && profile.business_info && (
                  <div className="flex gap-4 mt-3 flex-wrap">
                    {profile.business_info.rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        <span className="font-semibold text-yellow-900">
                          {profile.business_info.rating} ({profile.business_info.reviews_count} reviews)
                        </span>
                      </div>
                    )}
                    {profile.verification?.identity_verified && (
                      <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                        <Verified className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-900">Verified</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-8 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'personal', label: '👤 Personal Info', icon: '👤' },
              { id: 'business', label: '💼 Business', icon: '💼' },
              { id: 'social', label: '🔗 Social Links', icon: '🔗' },
              { id: 'security', label: '🔒 Security', icon: '🔒' },
              { id: 'preferences', label: '⚙️ Preferences', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-yellow-600 border-b-2 border-yellow-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{profile.bio?.length || 0}/500 characters</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Country
                    </label>
                    <input
                      type="text"
                      value={profile.country}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="India"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={profile.postal_code}
                      onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="PIN code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Business Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                {authProfile?.role === 'artisan' ? (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Business Statistics
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white rounded p-3">
                          <p className="text-xs text-gray-600">Total Sales</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            ${profile.business_info?.total_sales || 0}
                          </p>
                        </div>
                        <div className="bg-white rounded p-3">
                          <p className="text-xs text-gray-600">Years Active</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {profile.business_info?.years_in_business || 0}
                          </p>
                        </div>
                        <div className="bg-white rounded p-3">
                          <p className="text-xs text-gray-600">Rating</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {profile.business_info?.rating || '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={profile.business_info?.business_name || ''}
                        onChange={(e) => setProfile({
                          ...profile,
                          business_info: { ...profile.business_info, business_name: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Your business name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type</label>
                      <select
                        value={profile.business_info?.business_type || ''}
                        onChange={(e) => setProfile({
                          ...profile,
                          business_info: { ...profile.business_info, business_type: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="">Select business type</option>
                        <option value="handicraft">Handicraft</option>
                        <option value="textile">Textile</option>
                        <option value="jewelry">Jewelry</option>
                        <option value="pottery">Pottery</option>
                        <option value="woodwork">Woodwork</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Business information is available for artisan profiles.</p>
                  </div>
                )}
              </div>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                {['twitter', 'instagram', 'facebook', 'linkedin'].map(platform => (
                  <div key={platform}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                      {platform} Profile
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={profile.social_links?.[platform as keyof typeof profile.social_links] || ''}
                        onChange={(e) => setProfile({
                          ...profile,
                          social_links: {
                            ...profile.social_links,
                            [platform]: e.target.value
                          }
                        })}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder={`https://${platform}.com/yourprofile`}
                      />
                      {profile.social_links?.[platform as keyof typeof profile.social_links] && (
                        <button
                          onClick={() => copyToClipboard(profile.social_links?.[platform as keyof typeof profile.social_links] || '')}
                          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          {copySuccess === profile.social_links?.[platform as keyof typeof profile.social_links] ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Verification Status
                  </h3>
                  <div className="space-y-2">
                    {[
                      { key: 'email_verified', label: 'Email Verified', icon: Mail },
                      { key: 'phone_verified', label: 'Phone Verified', icon: Phone },
                      { key: 'identity_verified', label: 'Identity Verified', icon: Verified }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded border border-blue-200">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-700">{item.label}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          profile.verification?.[item.key as keyof typeof profile.verification]
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {profile.verification?.[item.key as keyof typeof profile.verification] ? '✓ Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Change Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Password must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={profile.preferences?.notifications ?? true}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, notifications: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="font-medium text-gray-700">Email Notifications</span>
                  </label>
                  <p className="text-sm text-gray-600 ml-7">Receive updates about orders, messages, and promotions</p>
                </div>

                <div className="border-t pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Privacy Level</label>
                  <div className="space-y-2">
                    {['public', 'friends', 'private'].map(level => (
                      <label key={level} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value={level}
                          checked={profile.preferences?.privacy === level}
                          onChange={(e) => setProfile({
                            ...profile,
                            preferences: { ...profile.preferences, privacy: e.target.value }
                          })}
                          className="w-4 h-4 border-gray-300"
                        />
                        <span className="font-medium text-gray-700 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => loadProfile()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
