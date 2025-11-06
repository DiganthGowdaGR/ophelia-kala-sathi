import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, Star, Clock, TrendingUp, MapPin, Filter, 
  Bookmark, Bell, Users, BarChart3, Settings, ChevronDown,
  Search as SearchIcon
} from 'lucide-react';

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, any>;
}

interface FindArtisansSidebarProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export default function FindArtisansSidebar({ searchTerm = '', onSearchChange }: FindArtisansSidebarProps) {
  const { user, profile } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    { id: '1', name: 'Local Pottery Artisans', filters: { category: 'Pottery', radius: 25 } },
    { id: '2', name: 'Top Rated Jewelry', filters: { category: 'Jewelry', sortBy: 'rating' } }
  ]);
  const [expandedSection, setExpandedSection] = useState<string>('recommendations');
  const [showNotifications, setShowNotifications] = useState(true);

  const isArtisan = profile?.role === 'artisan';
  const isCustomer = profile?.role === 'customer';

  const ToggleSection = ({ title, icon: Icon, id }: { title: string; icon: any; id: string }) => (
    <button
      onClick={() => setExpandedSection(expandedSection === id ? '' : id)}
      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-md transition mb-2"
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">{title}</span>
      </div>
      <ChevronDown 
        className={`w-3 h-3 text-gray-500 transition-transform ${
          expandedSection === id ? 'rotate-180' : ''
        }`}
      />
    </button>
  );

  return (
    <aside className="w-full lg:w-72 bg-white rounded-lg border border-gray-200 p-5 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {isArtisan ? 'Find Customers' : isCustomer ? 'Search Tools' : 'Discover'}
        </h2>
        <p className="text-xs text-gray-500">
          {isArtisan 
            ? 'Connect with potential buyers in your area'
            : isCustomer 
            ? 'Find the perfect artisan for your needs'
            : 'Browse and discover artisans'}
        </p>
      </div>

      {/* Find Artisans Search */}
      <div className="mb-5 pb-4 border-b border-gray-100">
        <label className="text-xs font-medium text-gray-700 block mb-2">Find Artisans</label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, skill..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && onSearchChange?.(searchTerm)}
          />
        </div>
      </div>

      {/* Customer-Only Features */}
      {isCustomer && (
        <>
          {/* Quick Filters */}
          <ToggleSection title="Quick Filters" icon={Filter} id="filters" />
          {expandedSection === 'filters' && (
            <div className="ml-4 mb-3 space-y-2.5 pb-3 border-b border-gray-100">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded w-4 h-4" defaultChecked />
                <span className="text-xs text-gray-700">Highest Rated</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded w-4 h-4" defaultChecked />
                <span className="text-xs text-gray-700">Near Me</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded w-4 h-4" />
                <span className="text-xs text-gray-700">Recently Added</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded w-4 h-4" />
                <span className="text-xs text-gray-700">Verified</span>
              </label>
            </div>
          )}

          {/* Saved Searches */}
          <ToggleSection title="Saved Searches" icon={Bookmark} id="searches" />
          {expandedSection === 'searches' && (
            <div className="ml-4 mb-3 space-y-2 pb-3 border-b border-gray-100">
              {savedSearches.length > 0 ? (
                <>
                  {savedSearches.map(search => (
                    <button
                      key={search.id}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-50 transition text-xs text-gray-600 hover:text-gray-900"
                    >
                      <div className="flex items-center space-x-2">
                        <SearchIcon className="w-3 h-3" />
                        <span>{search.name}</span>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <p className="text-xs text-gray-500">No saved searches yet</p>
              )}
              <button className="w-full mt-2 py-1.5 text-gray-600 hover:text-gray-900 rounded-md transition text-xs font-medium hover:bg-gray-50">
                + Save Current Search
              </button>
            </div>
          )}

          {/* Recommendations */}
          <ToggleSection title="Trending Now" icon={TrendingUp} id="recommendations" />
          {expandedSection === 'recommendations' && (
            <div className="ml-4 mb-3 space-y-2.5 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2 mb-0.5">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-medium text-gray-900">Premium Pottery</span>
                </div>
                <p className="text-xs text-gray-500">5 new artisans this week</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2 mb-0.5">
                  <MapPin className="w-3 h-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-900">Local Masters</span>
                </div>
                <p className="text-xs text-gray-500">Within 10km of you</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2 mb-0.5">
                  <Heart className="w-3 h-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-900">Your Favorites</span>
                </div>
                <p className="text-xs text-gray-500">{Math.floor(Math.random() * 15) + 5} saved</p>
              </div>
            </div>
          )}

          {/* Alerts */}
          <ToggleSection title="Notifications" icon={Bell} id="alerts" />
          {expandedSection === 'alerts' && (
            <div className="ml-4 mb-3 pb-3 border-b border-gray-100">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showNotifications}
                  onChange={(e) => setShowNotifications(e.target.checked)}
                  className="rounded w-4 h-4"
                />
                <span className="text-xs text-gray-700">New matching artisans</span>
              </label>
              <p className="text-xs text-gray-500 mt-1.5">Get notified when new artisans match your searches</p>
            </div>
          )}
        </>
      )}

      {/* Artisan-Only Features */}
      {isArtisan && (
        <>
          {/* Customer Insights */}
          <ToggleSection title="Customer Insights" icon={Users} id="insights" />
          {expandedSection === 'insights' && (
            <div className="ml-4 mb-3 space-y-2.5 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-gray-50 rounded-md">
                <div className="text-lg font-bold text-gray-900 mb-0.5">42</div>
                <p className="text-xs text-gray-500">Customers in your category</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-md">
                <div className="text-lg font-bold text-gray-900 mb-0.5">8.5km</div>
                <p className="text-xs text-gray-500">Average distance</p>
              </div>
              <button className="w-full py-1.5 text-gray-600 hover:text-gray-900 rounded-md transition text-xs font-medium hover:bg-gray-50">
                View Analytics →
              </button>
            </div>
          )}

          {/* Performance Metrics */}
          <ToggleSection title="Your Performance" icon={BarChart3} id="performance" />
          {expandedSection === 'performance' && (
            <div className="ml-4 mb-3 space-y-1.5 pb-3 border-b border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Profile Views</span>
                <span className="font-semibold text-gray-900">1,234</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Inquiries</span>
                <span className="font-semibold text-gray-900">23</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Response Rate</span>
                <span className="font-semibold text-green-600">94%</span>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-gray-100">
                <p className="text-xs text-gray-500">Last updated: 2 hours ago</p>
              </div>
            </div>
          )}

          {/* Smart Recommendations */}
          <ToggleSection title="Smart Matching" icon={TrendingUp} id="smart" />
          {expandedSection === 'smart' && (
            <div className="ml-4 mb-3 space-y-2.5 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-gray-900">Jewelry Lovers</span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">Best</span>
                </div>
                <p className="text-xs text-gray-500">123 customers interested</p>
              </div>
              <button className="w-full py-1.5 text-gray-600 hover:text-gray-900 rounded-md transition text-xs font-medium hover:bg-gray-50">
                See More Matches →
              </button>
            </div>
          )}
        </>
      )}

      {/* General Settings */}
      {user && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition text-xs">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="font-medium">Preferences</span>
            </div>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Guest Message */}
      {!user && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-xs text-gray-700">
            <strong>Sign up</strong> to save searches, get notifications, and connect with artisans.
          </p>
        </div>
      )}
    </aside>
  );
}
