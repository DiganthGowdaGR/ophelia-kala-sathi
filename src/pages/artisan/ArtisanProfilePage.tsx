import { useState, useEffect } from 'react';
import { User, Briefcase, Award, Star, Calendar, MessageSquare, Settings, Camera, MapPin, Clock, Sparkles } from 'lucide-react';
import Navigation from '@/components/shared/Navigation';
import { supabase } from '@/lib/supabase';
import AIProfileOptimizer from '@/components/artisan/AIProfileOptimizer';

export default function ArtisanProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [aiGeneratedBio, setAiGeneratedBio] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, []);

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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase.functions.invoke('profile-manager', {
        body: {
          action: 'updateProfile',
          userId: user?.id,
          profileData: {
            displayName: formData.get('displayName'),
            bio: formData.get('bio'),
            location: formData.get('location'),
            timezone: formData.get('timezone'),
            yearsExperience: parseInt(formData.get('yearsExperience') as string)
          }
        }
      });
      
      if (error) throw error;
      setResults(result);
      loadProfile();
    } catch (error: any) {
      setResults({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase.functions.invoke('profile-manager', {
        body: {
          action: 'addSkill',
          userId: user?.id,
          skillData: {
            name: formData.get('skillName'),
            level: formData.get('skillLevel'),
            years: parseInt(formData.get('skillYears') as string),
            isPrimary: formData.get('isPrimary') === 'on'
          }
        }
      });
      
      if (error) throw error;
      setResults(result);
      loadProfile();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      setResults({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase.functions.invoke('workshop-scheduler', {
        body: {
          action: 'createWorkshop',
          artisanId: user?.id,
          workshopData: {
            title: formData.get('workshopTitle'),
            description: formData.get('workshopDescription'),
            duration: parseInt(formData.get('duration') as string),
            maxParticipants: parseInt(formData.get('maxParticipants') as string),
            price: parseFloat(formData.get('price') as string),
            skillLevel: formData.get('skillLevel'),
            materialsIncluded: formData.get('materialsIncluded') === 'on'
          }
        }
      });
      
      if (error) throw error;
      setResults(result);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      setResults({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Profile Overview', icon: User },
    { id: 'ai-optimizer', label: 'AI Optimizer', icon: Sparkles },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'skills', label: 'Skills & Certs', icon: Award },
    { id: 'workshops', label: 'Workshops', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <button className="absolute bottom-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span className="text-sm">Change Cover</span>
            </button>
          </div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="flex items-end space-x-4">
                <div className="w-32 h-32 rounded-2xl bg-white shadow-xl border-4 border-white overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{profileData?.profile?.display_name || 'Your Name'}</h1>
                  <p className="text-gray-600 flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData?.profile?.location || 'Location not set'}</span>
                  </p>
                </div>
              </div>
              
              <button className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{profileData?.portfolio?.length || 0}</p>
                <p className="text-sm text-gray-600">Portfolio Items</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{profileData?.skills?.length || 0}</p>
                <p className="text-sm text-gray-600">Skills</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{profileData?.achievements?.length || 0}</p>
                <p className="text-sm text-gray-600">Achievements</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">4.9</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {profileData?.profile?.bio || 'Add a bio to tell customers about your craft and passion...'}
            </p>
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
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Profile Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-indigo-500" />
                <h3 className="text-2xl font-bold text-gray-900">Update Profile</h3>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    defaultValue={profileData?.profile?.display_name}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    rows={4}
                    defaultValue={profileData?.profile?.bio}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Tell your story..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={profileData?.profile?.location}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      name="timezone"
                      defaultValue={profileData?.profile?.timezone}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years Experience</label>
                    <input
                      type="number"
                      name="yearsExperience"
                      defaultValue={profileData?.profile?.years_experience}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Availability Status */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-6 h-6 text-purple-500" />
                <h3 className="text-2xl font-bold text-gray-900">Availability Status</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Available</p>
                      <p className="text-sm text-gray-600">Currently taking orders</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition">
                    Active
                  </button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Working Hours</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="font-medium text-gray-900">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="font-medium text-gray-900">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="font-medium text-gray-900">Closed</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Auto-Reply Message</h4>
                  <p className="text-sm text-gray-600 mb-3">Send automatic replies when you're offline</p>
                  <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition">
                    Configure Auto-Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Optimizer Tab */}
        {activeTab === 'ai-optimizer' && (
          <div className="max-w-4xl mx-auto">
            <AIProfileOptimizer
              bio={profileData?.profile?.bio || ''}
              skills={profileData?.skills?.map((s: any) => s.skill_name) || []}
              yearsExperience={profileData?.profile?.years_experience || 0}
              portfolioCount={profileData?.portfolio?.length || 0}
              onBioGenerated={(bio) => {
                setAiGeneratedBio(bio);
                // Optionally auto-fill the bio field
                const bioTextarea = document.querySelector('textarea[name="bio"]') as HTMLTextAreaElement;
                if (bioTextarea) {
                  bioTextarea.value = bio;
                }
              }}
            />
            
            {aiGeneratedBio && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>AI-Generated Bio</span>
                </h3>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{aiGeneratedBio}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Switch to "Profile Overview" tab to update your bio</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiGeneratedBio);
                      alert('Bio copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                  >
                    Copy Bio
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-6 h-6 text-indigo-500" />
                <h3 className="text-2xl font-bold text-gray-900">Professional Portfolio</h3>
              </div>
              <button className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                Add Portfolio Item
              </button>
            </div>
            
            {profileData?.portfolio && profileData.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profileData.portfolio.map((item: any, idx: number) => (
                  <div key={idx} className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                    <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100"></div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      <div className="mt-2">
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No portfolio items yet</p>
                <button className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                  Add Your First Project
                </button>
              </div>
            )}
          </div>
        )}

        {/* Skills & Certifications Tab */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Skill Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-6 h-6 text-purple-500" />
                <h3 className="text-2xl font-bold text-gray-900">Add New Skill</h3>
              </div>
              
              <form onSubmit={handleAddSkill} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                  <input
                    type="text"
                    name="skillName"
                    placeholder="e.g., Pottery, Woodworking, Weaving"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proficiency Level</label>
                  <select
                    name="skillLevel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                    <option value="Master">Master</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years Practiced</label>
                  <input
                    type="number"
                    name="skillYears"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPrimary"
                    id="isPrimary"
                    className="w-4 h-4 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                    Mark as primary skill
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Adding...' : 'Add Skill'}
                </button>
              </form>
            </div>

            {/* Skills List */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Skills</h3>
              
              {profileData?.skills && profileData.skills.length > 0 ? (
                <div className="space-y-3">
                  {profileData.skills.map((skill: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{skill.skill_name}</h4>
                        {skill.is_primary && (
                          <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{skill.proficiency_level}</span>
                        <span>{skill.years_practiced} years</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No skills added yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workshops Tab */}
        {activeTab === 'workshops' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Workshop Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-6 h-6 text-indigo-500" />
                <h3 className="text-2xl font-bold text-gray-900">Create Workshop</h3>
              </div>
              
              <form onSubmit={handleCreateWorkshop} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workshop Title</label>
                  <input
                    type="text"
                    name="workshopTitle"
                    placeholder="e.g., Introduction to Pottery"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="workshopDescription"
                    rows={3}
                    placeholder="What will participants learn?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      name="duration"
                      min="15"
                      step="15"
                      placeholder="120"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                    <input
                      type="number"
                      name="maxParticipants"
                      min="1"
                      placeholder="10"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                    <select
                      name="skillLevel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="materialsIncluded"
                    id="materialsIncluded"
                    className="w-4 h-4 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <label htmlFor="materialsIncluded" className="ml-2 text-sm text-gray-700">
                    Materials included in price
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Creating...' : 'Create Workshop'}
                </button>
              </form>
            </div>

            {/* Workshop Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Workshop Benefits</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Share Your Expertise</h4>
                    <p className="text-sm text-gray-600">Teach others your craft and build your reputation</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Additional Revenue</h4>
                    <p className="text-sm text-gray-600">Generate income through interactive experiences</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-pink-50 rounded-xl">
                  <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Build Community</h4>
                    <p className="text-sm text-gray-600">Connect with enthusiasts and potential customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
            </div>
            
            {/* Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  <span className="text-4xl font-bold text-gray-900">4.9</span>
                </div>
                <p className="text-gray-600">Average Rating</p>
                <p className="text-sm text-gray-500 mt-1">Based on 247 reviews</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-4xl font-bold text-gray-900 mb-2">96%</p>
                <p className="text-gray-600">Positive Reviews</p>
                <p className="text-sm text-gray-500 mt-1">4.0+ star ratings</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <p className="text-4xl font-bold text-gray-900 mb-2">24h</p>
                <p className="text-gray-600">Response Time</p>
                <p className="text-sm text-gray-500 mt-1">Average reply time</p>
              </div>
            </div>
            
            {/* Recent Reviews */}
            <div className="space-y-4">
              {[
                { name: 'Sarah M.', rating: 5, text: 'Absolutely beautiful craftsmanship! The attention to detail is incredible.', date: '2 days ago' },
                { name: 'James K.', rating: 5, text: 'Fast shipping and excellent quality. Will definitely order again!', date: '1 week ago' },
                { name: 'Emily R.', rating: 4, text: 'Great product, exactly as described. Very happy with my purchase.', date: '2 weeks ago' },
              ].map((review, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Response</h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
